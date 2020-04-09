const axios = require('axios')
const fs = require('fs')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')
const toS3 = require('./lib/s3')
const dynamo = require('./lib/dynamodb')

let socketId // send updates to request socket

exports.handler = async (event, context) => {
    try {
        const data = JSON.parse(event.Records[0].body)
        socketId = data.socketId
        const uuid = `${data.q}-${socketId}`
        console.log(uuid)
        const lockDoc = await dynamo.get()
        if(lockDoc.blocked.includes(uuid)) {
            console.warn('EXIT EARLY, DUPLICATE MESSAGE:', uuid)
            return
        }
        lockDoc.blocked.push(uuid)
        await dynamo.update(lockDoc.blocked)
        const paths = await downloadCropSaveRecursive(data.urls)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${data.q}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        await loaded(s3Url)
        const doc2 = await dynamo.get()
        const blocked2 = doc2.blocked.filter(id => id != uuid)
        await dynamo.update(blocked2)
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