const DB = require('aws-sdk/clients/dynamodb')

module.exports = class Doc {
    constructor (uuid) {
        this.client = new DB({
            accessKeyId: '',
            secretAccessKey: '',
            region: 'ap-southeast-2'
        })
        this.uuid = uuid
    }
    blocked = []
    getParams = {
        TableName: 'recursive-message-lock',
        Key: { partitionKey: { S: 'LOCK' } }
    }
    get updateParams () {
        return {
            TableName: 'recursive-message-lock',
            Item: {
                partitionKey: { S: 'LOCK' },
                blocked: { L: this.blocked.map(i => ({S: i})) }
            }
        }
    }

    async checkBlocked () {
        await this.getBlockedIds()
        return this.blocked.includes(this.uuid)
    }

    async block () {
        this.blocked.push(this.uuid)
        await this.saveDoc()
    }
    async unBlock () {
        await this.getBlockedIds()
        this.blocked = this.blocked.filter(i => i != this.uuid)
        await this.saveDoc()
    }

    getBlockedIds () {
        return new Promise((resolve, reject) => {
            this.client.getItem(this.getParams, (err, data) => {
                if(err) {
                    console.error('dynamo get error:', err)
                    reject(err)
                }
                this.blocked = data.Item.blocked.L.map(i => i.S)
                resolve(true)
            })
        })
    }
    saveDoc () {
        return new Promise((resolve, reject) => {
            this.client.putItem(this.updateParams, (err, data) => {
                if(err) {
                    console.error('dynamo put error:', err)
                    reject(err)
                }
                resolve(true)
            })
        })
    }
}