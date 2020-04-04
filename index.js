const fs = require('fs')
const path = require('path')

const { loadRemoteJson } = require('./lib/json')
const selectPhotos = require('./lib/select')
const download = require('./lib/download')
const crop = require('./lib/crop')
const montage = require('./lib/montage')

async function downloadCropSaveRecursive (urls, paths = [], id = 0) {
    const p = path.join(__dirname, 'cropped', `${process.env.q}-${id}.jpg`)
    const u = urls[id]
    if(!u) {
        console.log('done')
        return paths
    }
    if(!fs.existsSync(p)) {
        console.log(id, ':', u)
        const fullBuff = await download(u)
        const cropBuff = await crop(fullBuff)
        fs.writeFileSync(p, cropBuff)
    } else {
        console.log('skip', id)
    }
    paths.push(p)
    return downloadCropSaveRecursive(urls, paths, id+1)
}

async function run (q = 'pasta') {
    process.env.q = q
    const json = await loadRemoteJson(q)
    const photos = selectPhotos(json).map(p => p.links.download)
    const paths = await downloadCropSaveRecursive(photos)
    const final = await montage(paths)
    console.log(final)
}
const a = process.argv.slice(2)
run(a[0])