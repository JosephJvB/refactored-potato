const DB = require('aws-sdk/clients/dynamodb')
const dbClient = new DB({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'ap-southeast-2'
})

module.exports = class Doc {
    constructor () {}
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

    isBlocked (id) {
        return this.blocked.includes(id)
    }
    block (id) {
        this.blocked.push(id)
    }
    unBlock (id) {
        this.blocked = this.blocked.filter(i => i != id)
    }
    getItem () {
        return new Promise((resolve, reject) => {
            dbClient.getItem(this.getParams, (err, data) => {
                if(err) {
                    console.error('dynamo get error:', err)
                    reject(err)
                }
                console.log('GOT ITEM', data)
                this.blocked = data.Item.blocked.L.map(i => i.S)
                resolve(this)
            })
        })
    }
    save () {
        return new Promise((resolve, reject) => {
            dbClient.putItem(this.updateParams, (err, data) => {
                if(err) {
                    console.error('dynamo put error:', err)
                    reject(err)
                }
                resolve(true)
            })
        })
    }
}