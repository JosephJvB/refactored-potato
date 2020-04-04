const { loadRemoteJson } = require('./lib/json')
const selectPhotos = require('./lib/select')
const sendMessage = require('./lib/sqs')

exports.handler = async (event, context) => {
    try {
        if(!event.queryStringParameters || !event.queryStringParameters.query) {
            return {
                statusCode:  400,
                body: JSON.stringify({
                    message: 'missing "query" from query parameters' 
                })
            }
        }
        const q = event.queryStringParameters.query
        const json = await loadRemoteJson(q)
        const urls = selectPhotos(json).map(p => p.links.download)
        await sendMessage({
            q,
            urls
        })
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'It can take up to 2 minutes to prepare your image, please wait',
                url: `https://jvb-milk-v2.s3-ap-southeast-2.amazonaws.com/recursive/${q}-montage.jpg`
            })
        }
    } catch (e) {
        console.error('HANDLER', e)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: e.message
            })
        }
    }
}