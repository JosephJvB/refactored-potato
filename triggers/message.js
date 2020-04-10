const axios = require('axios')
const fs = require('fs')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')
const toS3 = require('./lib/s3')

// lazy global vars for helper functions below
let sessionId
let query

exports.handler = async (event, context) => {
    try {
        const data = JSON.parse(event.Records[0].body)
        sessionId = data.sessionId
        query = data.q

        const paths = await downloadCropSaveRecursive(data.urls)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${data.q}-${sessionId}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        await loaded(s3Url)

    } catch (e) {
        console.error('ERROR', e)
    }
}

async function downloadCropSaveRecursive (urls, paths = [], id = 1) {
    const u = urls[id]
    if(!u) {
        console.log('done')
        return paths
    }
    console.log(id, ':', u)
    const p = `/tmp/${id}.jpg`
    const fullBuff = await progress(download(u), id*4-2)
    const cropBuff = await progress(crop(fullBuff), id*4)
    fs.writeFileSync(p, cropBuff)
    paths.push(p)
    return downloadCropSaveRecursive(urls, paths, id+1)
}

async function progress (func, percent) {
    const arr = [func]
    if(sessionId) arr.push(axios({
        method: 'post',
        url: `${process.env.ec2_url}/progress`,
        data: {
            percent,
            sessionId,
            q: query
        }
    }))
    const [res, _] = await Promise.all(arr)
    return res
}
async function loaded (url) {
    if(!sessionId) return
    return axios({
        method: 'post',
        url: `${process.env.ec2_url}/loaded`,
        data: {
            url,
            sessionId,
            q: query
        }
    })
}