const MessageEventService = require('./services/message-event-service')
const messageService = new MessageEventService()

exports.handler = async (event, context) => {
    try {
        await messageService.handle(event)
    } catch (e) {
        console.error('Message handler error', e)
    }
}