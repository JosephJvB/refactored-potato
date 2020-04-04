const axios = require('axios')

module.exports = download

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