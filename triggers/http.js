const HttpEventService = require('./services/http-event-service')
const httpService = new HttpEventService()

exports.handler = async (event, context) => {
    try {
        await httpService.handle(event)
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