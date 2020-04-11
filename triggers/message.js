const S3 = require('aws-sdk/clients/s3')
const s3Client = new S3({
    accessKeyId: '', // todo private bucket
    secretAccessKey: '',
    region: 'ap-southeast-2'
})
const MessageEventService = require('./services/message-event-service')
const messageService = new MessageEventService({ s3Client })

exports.handler = async (event, context) => {
    try {
        await messageService.handle(event)
    } catch (e) {
        console.error('Message handler error', e)
    }
}