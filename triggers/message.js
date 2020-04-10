const MessageEventService = require('./services/message-event-service')

// lazy global vars for helper functions below
let sessionId
let query

exports.handler = async (event, context) => {
    try {
        const messageService = new MessageEventService(event)
        await messageService.handle()
    } catch (e) {
        console.error('Message handler error', e)
    }
}