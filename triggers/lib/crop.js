const axios = require('axios')
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')

module.exports = crop

function crop ({url, chunk, img}) {
    return new Promise(async (resolve, reject) => {
        const buffer = await download(url)
        const size = await getSize(buffer)

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

        const tmpPath = `/tmp/chunk_${chunk}--img_${img}.jpg`
        return gm(buffer)
        .resize(reX, reY)
        .crop(150, 150, cropX, cropY)
        .toBuffer((err, buffer) => {
            if(err) {
                console.error(err)
                reject(err)
            }
            fs.writeFileSync(tmpPath, buffer)
            console.log('write finished', tmpPath)
            resolve(tmpPath)
        })
        
    })
}
async function download (url) {
    try {
        const res = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer',
        })
        return res.data
    } catch (e) {
        console.log('ERROR @ download', e)
        throw e
    }
}
function getSize(buffer) {
    return new Promise((resolve, reject) => {
        gm(buffer)
        .size((err, size) => {
            if(err) {
                console.log('size error', err)
                reject(err)
            }
            resolve(size)
        })
    })
}