const SQS = require('aws-sdk/clients/sqs')
const sqsClient = new SQS({
    region: 'ap-southeast-2'
})

module.exports = sendMessage

function sendMessage (body) {
    const q = body.q.replace(/ /gi, '')
    return new Promise((resolve, reject) => {
        return sqsClient.sendMessage({
            MessageBody: JSON.stringify(body),
            QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/355151872526/recursive.fifo',
            MessageGroupId: uuid(),
        }, (err, data) => {
            if(err) {
                console.log('QUEUE ERROR', err)
                return reject(err)
            }
            console.log('queue add success', data)
            resolve(data.MessageId)
        })
    })
}

function uuid () {
    const all = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'
    let s = ''
    while(s.length < 25) {
        const i = Math.floor(Math.random() * all.length)
        s += all[i]
    }
    return s
}