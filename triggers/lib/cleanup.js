const fs = require('fs')

module.exports = cleanup


async function cleanup (cropped, montage) {
    const toDelete = [...cropped, montage]
    await Promise.all(toDelete.map(f => deleteFileAsync(f)))
}

function deleteFileAsync (filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(`unlink error @ ${filePath}`, err)
                reject(err)
            }
            resolve()
        })
    })
}