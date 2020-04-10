const axios = require('axios')
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const BaseService = require('./base-service')

module.exports = class MessageEventService extends BaseService {
    constructor() {
        super('MessageEventService')
        this.s3Client = new S3({
            accessKeyId: '', // todo private bucket
            secretAccessKey: '',
            region: 'ap-southeast-2'
        })
        this.sessionId = null
        this.query = null
        this.imageUrlsChunked = []
        this.batchIdx = 0
        this.tempPaths = []
        this.s3Url = null
    }

    cleanup () {
        console.log('deleting temp files x', this.tempPaths.length)
        for(const p of this.tempPaths) if(fs.existsSync(p)) fs.unlinkSync(p)
        this.sessionId = null
        this.query = null
        this.imageUrlsChunked = []
        this.batchIdx = 0
        this.tempPaths = []
        this.s3Url = null
    }

    size = 5 // can actually try with batched messages now Im using fifo
    ec2Url = 'http://ec2-3-88-131-151.compute-1.amazonaws.com:3000'

    async handle (event) {
        try {
            this.parseEvent(event)
            await this.processImagesRecursive()
            await this.saveMontage()
            await this.pingLoaded()
            this.cleanup()
        } catch (e) {
            this.logAndThrow(e)
        }
    }

    parseEvent (event) {
        const data = JSON.parse(event.Records[0].body)
        if(!data.urls || data.urls.length !== 25) {
            throw new Error(`Invalid message body, expect data.urls.length = 25 received ${data.urls.length}`)
        }
        this.sessionId = data.sessionId
        this.query = data.q
        const chunked = []
        for (let i = 0; i < data.urls.length; i+=this.size) chunked.push(data.urls.slice(i, i+this.size))
        this.imageUrlsChunked = chunked
    }

    async processImagesRecursive () {
        const batch = this.imageUrlsChunked[this.batchIdx]
        if(!batch) {
            console.log('recurse done')
            return
        }
        console.log('processing batch num:', this.batchIdx)
        const croppedPromises = batch.map(async (url, i) => {
            return this.processSingle({
                url,
                img: i
            })
        })
        await Promise.all(croppedPromises)
        await this.pingProgress()
        this.batchIdx++
        return this.processImagesRecursive()
    }

    async processSingle ({url, img}) {
        return new Promise(async (resolve, reject) => {
            const buffer = await this.download(url)
            const size = await this.getSize(buffer)
    
            let reX, reY, cropX, cropY
            if(size.width > size.height) {
                reX = size.width * (150 / size.height)
                reY = 150
                cropX = Math.abs(150 - reX)
                cropY = 0
            } else {
                reX = 150
                reY = size.height * (150 / size.width)
                cropX = 0
                cropY = Math.abs(150 - reY)
            }
    
            const tempPath = `/tmp/batch_${this.batchIdx}--img_${img}.jpg`
            return gm(buffer)
            .resize(reX, reY)
            .crop(150, 150, cropX, cropY)
            .toBuffer((err, buffer) => {
                if(err) {
                    console.error('error @ crop gm.toBuffer()', err)
                    reject(err)
                }
                fs.writeFileSync(tempPath, buffer)
                this.tempPaths.push(tempPath)
                console.log('write finished', tempPath)
                resolve()
            })
        })
    }

    async download (url) {
        const res = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer',
        })
        return res.data
    }
    getSize(buffer) {
        return new Promise((resolve, reject) => {
            gm(buffer)
            .size((err, size) => {
                if(err) {
                    console.log('error @ getSize gm.size()', err)
                    reject(err)
                }
                resolve(size)
            })
        })
    }

    async saveMontage () {
        return new Promise((resolve, reject) => {
            const g = gm()
            for(const p of this.tempPaths) {
                g.montage(p)
                .geometry('+5+5')
            }
    
            return g.toBuffer(async (err, buffer) => {
                if(err) {
                    console.error('error @ montage gm.toBuffer()', err)
                    reject(err)
                }
                await this.saveBucketItem(buffer)
                resolve()
            })
        })
    }

    async saveBucketItem (buffer) {
        return new Promise((resolve, reject) => {
            return this.s3Client.upload({
                Bucket: 'jvb-milk-v2',
                Key: `recursive/${this.query}-${this.sessionId}.jpg`,
                Body: buffer,
                ContentType: 'image/jpg',
                ACL: 'public-read',
                ContentEncoding: 'base64',
            }, (err, data) => {
                if(err) {
                    console.log('error @ s3.upload()', err)
                    return reject(err)
                }
                console.log('s3upload', data)
                this.s3Url = data.Location
                resolve()
            })
        })
    }

    async pingProgress () {
        const percent = (this.batchIdx+1)*20
        if(!this.sessionId) return
        return axios({
            method: 'post',
            url: `${this.ec2Url}/progress`,
            data: {
                percent,
                sessionId: this.sessionId,
                q: this.query
            }
        })
    }
    async pingLoaded () {
        if(!this.sessionId) return
        return axios({
            method: 'post',
            url: `${this.ec2Url}/loaded`,
            data: {
                url: this.s3Url,
                sessionId: this.sessionId,
                q: this.query
            }
        })
    }
}