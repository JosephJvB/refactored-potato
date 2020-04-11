const fs = require('fs')
const path = require('path')

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
    }
}
