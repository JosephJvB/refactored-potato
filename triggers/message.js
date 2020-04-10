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
        console.error('Message handler error', e)
    }
}