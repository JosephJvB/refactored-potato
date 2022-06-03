const fs = require('fs')
const path = require('path')
const axios = require('axios')

module.exports = {
    SQS: class MockSQS {
        constructor() {
            this.path = path.join(__dirname, 'temp', 'urls.json')
        }
        sendMessage(obj, cb) {
            fs.writeFileSync(this.path, obj.MessageBody)
            return cb(null, {
                MessageId: 'TEST ID RESPONSE'
            })
        }
    },
    S3: class MockS3 {
        constructor() {
            this.path = path.join(__dirname, 'temp', 'TESTMONTAGE.jpg')
        }
        upload(obj, cb) {
            fs.writeFileSync(this.path, obj.Body)
            return cb(null, {
                Location: 'TEST LOCATION URL RESPONSE'
            })
        }
    },
    Http: class MockHttp {
        photoApiUrl = 'https://api.unsplash.com//search/photos'
        clientId = '5hGHo5piKDNaPTSRv-cSM8wdpMmlrUu7ylKY4abeK7g'
        constructor() {}
        download(url) {
            return axios({
                method: 'get',
                url: url,
                responseType: 'arraybuffer',
            })
        }
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
        async pingProgress (sessionId, percent, query) {
            if(!sessionId) return
            return
        }
        async pingLoaded (sessionId, s3Url, query) {
            if(!sessionId) return
            return 
        }
    }
}
