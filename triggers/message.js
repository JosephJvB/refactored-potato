const S3 = require('aws-sdk/clients/s3')
const HttpClient = require('./clients/httpClient')
const s3Client = new S3({
    accessKeyId: '', // todo private bucket
    secretAccessKey: '',
    region: 'ap-southeast-2'
})
const httpClient = new HttpClient()
const MessageEventService = require('./services/message-event-service')
const messageService = new MessageEventService({ s3Client, httpClient })

exports.handler = async (event, context) => {
    try {
        await messageService.handle(event)
    } catch (e) {
        console.error('Message handler error', e)
    }
}