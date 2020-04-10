const axios = require('axios')
const SQS = require('aws-sdk/clients/sqs')
const BaseService = require('./base-service')

module.exports = class HttpEventService extends BaseService {
    constructor(event) {
        super('HttpEventService')
        this.event = event
        this.sqsClient = new SQS({
            region: 'ap-southeast-2'
        })
        this.query = null
        this.urls = []
    }

    photoApiUrl = 'https://api.unsplash.com//search/photos'
    clientId = '5hGHo5piKDNaPTSRv-cSM8wdpMmlrUu7ylKY4abeK7g'
    queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/355151872526/recursive.fifo'

    async handle () {
        try {
            this.validate(this.event.queryStringParameters)
            await this.loadPhotosUrls()
            await this.queueMessage()
        } catch (e) {
            this.logAndThrow(e)
        }
    }

    validate (queryParams) {
        if(!queryParams || !queryParams.query) {
            const e = new Error('missing "query" from query parameters')
            e.status = 400
            throw e
        }
        this.query = queryParams.query
    }

    async loadPhotosUrls () {
        const res = await axios({
            method: 'get',
            url: this.photoApiUrl,
            params: {
                client_id: this.clientId,
                page: 1,
                query: this.query,
                per_page: 25
            }
        })
        this.urls = this.selectPhotos(res.data.results)
    }
    selectPhotos (data) {
        const urls = []
        let len = data.length
        while (urls.length < 25) {
            if(len < 0) {
                const e = new Error(`Failed to find 25 photos for query "${this.query}"`)
                e.status = 400
                throw e
            }
            const idx = Math.floor(Math.random() * len--)
            if(data[idx] && data[idx].links.download) {
                urls.push(data[idx].links.download)
                data.splice(idx, 1)
            }
        }
        return urls
    }

    queueMessage () {
        const body = {
            urls: this.urls,
            sessionId: this.event.queryStringParameters.sessionId,
            q: this.query
        }
        return new Promise((resolve, reject) => {
            return this.sqsClient.sendMessage({
                MessageBody: JSON.stringify(body),
                QueueUrl: this.queueUrl,
                MessageGroupId: body.sessionId,
            }, (err, data) => {
                if(err) {
                    console.error('QUEUE ERROR', err)
                    return reject(err)
                }
                console.log('queue add success', data)
                resolve(data.MessageId)
            })
        })
    }
}