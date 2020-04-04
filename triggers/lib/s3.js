const S3 = require('aws-sdk/clients/s3')
const s3Client = new S3({
    accessKeyId: '', // todo private bucket
    secretAccessKey: '',
    region: 'ap-southeast-2'
})

module.exports = toS3

function toS3 (buffer, key) {
    return new Promise((resolve, reject) => {
        return s3Client.upload({
            Bucket: 'jvb-milk-v2',
            Key: `recursive/${key}`,
            Body: buffer,
            ContentType: 'image/jpg',
            ACL: 'public-read',
            ContentEncoding: 'base64',
        }, (err, data) => {
            if(err) {
                console.log('ERROR: s3upload', err)
                return reject(err)
            }
            console.log('s3upload', data)
            resolve(data.Location)
        })
    })
}