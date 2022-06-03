const BaseService = require('./base-service')

module.exports = class HttpEventService extends BaseService {
    constructor(props) {
        super('HttpEventService')
        this.httpClient = props.httpClient
        this.sqsClient = props.sqsClient
        this.sessionId = null
        this.query = null
        this.urls = []
    }

    cleanup () {
        this.sessionId = null
        this.query = null
        this.urls = []
    }

    queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/355151872526/recursive.fifo'

    async handle (event) {
        try {
            this.validate(event.queryStringParameters)
            await this.loadPhotosUrls()
            await this.queueMessage()
            this.cleanup()
        } catch (e) {
            this.logAndThrow(e)
        }
    }

    validate (queryParams) {
        const required = ['query', 'sessionId']
        const missing = required.filter(i => !queryParams[i])
        if(!queryParams || missing.length > 0) {
            const e = new Error(`missing "${missing.join(', ')}" from query parameters`)
            e.status = 400
            throw e
        }
        this.query = queryParams.query
        this.sessionId = queryParams.sessionId
    }

    async loadPhotosUrls () {
        const res = await this.httpClient.loadPhotos(this.query)
        this.urls = this.selectPhotos(res.data.results)
    }
    selectPhotos (data) {
        const urls = []
        let len = data.length
        while (urls.length < 25) {
            if(len < 0) {
                const e = new Error(`Failed to find 25 photos for query "${this.query}"`)
                e.status = 400
                throw e
            }
            const idx = Math.floor(Math.random() * len--)
            if(data[idx] && data[idx].links.download) {
                urls.push(data[idx].links.download)
                data.splice(idx, 1)
            }
        }
        return urls
    }

    queueMessage () {
        const body = {
            urls: this.urls,
            sessionId: this.sessionId,
            q: this.query
        }
        return new Promise((resolve, reject) => {
            return this.sqsClient.sendMessage({
                MessageBody: JSON.stringify(body),
                QueueUrl: this.queueUrl,
                MessageGroupId: this.sessionId,
            }, (err, data) => {
                if(err) {
                    console.error('QUEUE ERROR', err)
                    return reject(err)
                }
                console.log('queue add success', data)
                resolve(data.MessageId)
            })
        })
    }
}