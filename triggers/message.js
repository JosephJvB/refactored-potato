const axios = require('axios')
const fs = require('fs')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')
const toS3 = require('./lib/s3')
const redis = require('./lib/redis')

let socketId // send updates to request socket

exports.handler = async (event, context) => {
    try {
        const data = JSON.parse(event.Records[0].body)
        socketId = data.socketId
        const uuid = `${data.q}-${socketId}`
        console.log(uuid)
        console.log('before redis')
        const exists = await redis.exists(uuid)
        console.log('after redis redis')
        if(exists) return console.warn('EXIT EARLY, DUPLICATE MESSAGE:', uuid)
        await redis.set(uuid, '1')
        const paths = await downloadCropSaveRecursive(data.urls)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${data.q}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        await loaded(s3Url)
        await redis.del(uuid)
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