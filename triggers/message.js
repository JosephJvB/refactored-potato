const axios = require('axios')
const fs = require('fs')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')
const toS3 = require('./lib/s3')

let socketId // send updates to request socket

exports.handler = async (event, context) => {
    try {
        const data = JSON.parse(event.Records[0].body)
        socketId = data.socketId
        const paths = await downloadCropSaveRecursive(data.urls)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${data.q}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        await loaded(s3Url)
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
    const fullBuff = await download(u)
    const cropBuff = await crop(fullBuff)
    // const [fullBuff, _1] = await Promise.all([
    //     download(u),
    //     progress(`download-${id}`)
    // ])
    // const [cropBuff, _2] = await Promise.all([
    //     crop(fullBuff),
    //     progress(`crop-${id}`)
    // ])
    fs.writeFileSync(p, cropBuff)
    paths.push(p)
    const [result, _3] = await Promise.all([
        downloadCropSaveRecursive(urls, paths, id+1),
        progress(`finish-${id}`)
    ])
    return result
}

async function progress (id) {
    if(!socketId) return
    return axios({
        method: 'post',
        url: `${process.env.ec2_url}/progress`,
        data: {
            imageId: id,
            socketId
        }
    })
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