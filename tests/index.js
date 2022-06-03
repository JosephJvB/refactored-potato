const fs = require('fs')
const path = require('path')

const HttpService = require('../triggers/services/http-event-service')
const MessageService = require('../triggers/services/message-event-service')
const mocks = require('./mocks')

const args = process.argv.slice(2)
const query = args[0] || 'test'
const sessionId = 'testsessionid'

run()

async function run () {
    try {
        const sqsClient = new mocks.SQS()
        const s3Client = new mocks.S3()
        const httpClient = new mocks.Http()

        const httpEvent = { queryStringParameters: { query, sessionId } }
        const httpService = new HttpService({ sqsClient, httpClient })
        await httpService.handle(httpEvent)

        const body = fs.readFileSync(sqsClient.path, 'utf8')
        const messageEvent = { Records: [{ body }]}
        const messageService = new MessageService({ httpClient, s3Client, basePath: path.join(__dirname, 'temp') })
        await messageService.handle(messageEvent)
        console.log('montage saved @', messageService.basePath + '/TESTMONTAGE.jpg')
    } catch (e) {
        console.error('TEST ERROR', e)
    }
}