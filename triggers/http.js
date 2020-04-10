const HttpEventService = require('./services/http-event-service')

exports.handler = async (event, context) => {
    try {
        const httpService = new HttpEventService(event)
        await httpService.handle()
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'It can take up to 2 minutes to prepare your image, please wait'
            })
        }
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