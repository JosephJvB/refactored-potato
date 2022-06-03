const axios = require('axios')

module.exports = class HttpClient {
    photoApiUrl = 'https://api.unsplash.com//search/photos'
    clientId = '5hGHo5piKDNaPTSRv-cSM8wdpMmlrUu7ylKY4abeK7g'
    ec2Url = 'http://ec2-3-88-131-151.compute-1.amazonaws.com:3000'
    constructor() {}
    loadPhotos(query) {
        return axios({
            method: 'get',
            url: this.photoApiUrl,
            params: {
                client_id: this.clientId,
                page: 1,
                query,
                per_page: 25
            }
        })
    }
    download(url) {
        return axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer',
        })
    }
  async pingProgress (sessionId, percent, query) {
    if(!sessionId) return
    return axios({
        method: 'post',
        url: `${this.ec2Url}/progress`,
        data: {
            percent,
            sessionId,
            q: query
        }
    })
    }
    async pingLoaded (sessionId, s3Url, query) {
        if(!sessionId) return
        return axios({
            method: 'post',
            url: `${this.ec2Url}/loaded`,
            data: {
                url: s3Url,
                sessionId,
                q: query
            }
        })
    }
}