const axios = require('axios')
const fs = require('fs')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')
const toS3 = require('./lib/s3')

exports.handler = async (event, context) => {
    try {
        const data = JSON.parse(event.Records[0].body)
        const paths = await downloadCropSaveRecursive(data.urls)
        const finalBuffer = await montage(paths)
        const s3Url = await toS3(finalBuffer, `${data.q}-montage.jpg`)
        console.log('DONE DONE DONE', s3Url)
        if(data.socketId) {
            const url = 'https://morning-ravine-56883.herokuapp.com/loaded'
            await axios({
                method: 'post',
                url,
                data: {
                    url: s3Url,
                    socketId: data.socketId
                }
            })
        }
    } catch (e) {
        console.error('ERROR', e)
    }
}

async function downloadCropSaveRecursive (urls, paths = [], id = 0) {
    const p = `/tmp/${id}.jpg`
    const u = urls[id]
    if(!u) {
        console.log('done')
        return paths
    }
    console.log(id, ':', u)
    const fullBuff = await download(u)
    const cropBuff = await crop(fullBuff)
    fs.writeFileSync(p, cropBuff)
    paths.push(p)
    return downloadCropSaveRecursive(urls, paths, id+1)
}