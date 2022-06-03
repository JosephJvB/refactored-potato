const SQS = require('aws-sdk/clients/sqs')
const HttpClient = require('./clients/httpClient')
const sqsClient = new SQS({
    region: 'ap-southeast-2'
})
const httpClient = new HttpClient()
const httpService = require('./services/http-event-service')
const service = new httpService({ sqsClient, httpClient }) // dependency injection!

exports.handler = async (event, context) => {
    try {
        await service.handle(event)
        return { statusCode: 200 }
    } catch (e) {
        console.error('ERROR @ HTTP-HANDLER', e)
        return {
            statusCode: e.status || 500,
            body: JSON.stringify({
                message: e.message || 'Unknown server error'
            })
        }
    }
}