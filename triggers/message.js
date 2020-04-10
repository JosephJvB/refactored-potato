const axios = require('axios')
const fs = require('fs')
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

        const chunked = chunkArray(data.urls)
        const paths = await downloadCropSaveRecursive(chunked)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${data.q}-${sessionId}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        await loaded(s3Url)

    } catch (e) {
        console.error('ERROR', e)
    }
}

function chunkArray (arr) {
    const size = 5
    const chunked = []
    for (let i = 0; i < arr.length; i+=size) chunked.push(arr.slice(i, i+size))
    return chunked
}

async function downloadCropSaveRecursive (urlsChunked, paths = [], cid = 0) {
    const chunk = urlsChunked[cid]
    if(!chunk) {
        console.log('done')
        return paths
    }
    console.log('processing chunk num:', cid)
    const nextPaths = Promise.all(chunk.map(async (u, i) => crop({
        url: u,
        img: i,
        chunk: cid
    })))
    await progress((cid+1)*20)
    paths = [...paths, ...nextPaths]
    return downloadCropSaveRecursive(urlsChunked, paths, cid+1)
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