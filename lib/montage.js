const fs = require('fs')
const path = require('path')
const gm = require('gm').subClass({imageMagick: true})

module.exports = montage

function montage (imgPaths) {
    return new Promise((resolve, reject) => {
        const g = gm()
        for(const i of imgPaths) {
            g.montage(i)
            .geometry('+5+5')
        }

        const p = path.join(__dirname, '../done.jpg')
        return g.write(p, (err) => {
            if(err) {
                console.error(err)
                reject(err)
            }
            resolve(p)
        })
    })
}