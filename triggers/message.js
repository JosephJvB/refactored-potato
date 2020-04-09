const axios = require('axios')
const fs = require('fs')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')
const toS3 = require('./lib/s3')
const Doc = require('./lib/dynamo-model')

let socketId // send updates to request socket

exports.handler = async (event, context) => {
    try {
        const data = JSON.parse(event.Records[0].body)
        socketId = data.socketId

        // init block - process every message just once
        const uuid = `${data.q}-${socketId}`
        console.log(uuid)
        const doc = new Doc(uuid)
        const isBlocked = await doc.checkBlocked()
        if(isBlocked) {
            console.warn('EXIT EARLY, DUPLICATE MESSAGE:', uuid)
            return
        }
        await doc.block()

        // process images recursive
        const paths = await downloadCropSaveRecursive(data.urls)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${uuid}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        await loaded(s3Url)

        // release message block
        await doc.unBlock()
    } catch (e) {
        console.error('ERROR', e)
    }
}

async function downloadCropSaveRecursive (urls, paths = [], id = 0) {
    const u = urls[id]
    if(!u) {
        console.log('done')
        return paths
    }
    console.log(id, ':', u)
    const p = `/tmp/${id}.jpg`
    const fullBuff = await progress(download(u), `DL-${id}`)
    const cropBuff = await progress(crop(fullBuff), `CP-${id}`)
    fs.writeFileSync(p, cropBuff)
    paths.push(p)
    return downloadCropSaveRecursive(urls, paths, id+1)
}

async function progress (func, pid) {
    const arr = [func]
    if(socketId) arr.push(axios({
        method: 'post',
        url: `${process.env.ec2_url}/progress`,
        data: {
            processId: pid,
            socketId
        }
    }))
    const [res, _] = await Promise.all(arr)
    return res
}
async function loaded (url) {
    if(!socketId) return
    return axios({
        method: 'post',
        url: `${process.env.ec2_url}/loaded`,
        data: {
            url,
            socketId
        }
    })
}