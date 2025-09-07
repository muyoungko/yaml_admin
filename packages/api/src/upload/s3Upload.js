const moment = require('moment')
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')


const upload = async (key, stream) => {
    if(!key){
        throw new Error('필수값이 없습니다')
    }
    //console.log('uploadExcel')
    return await s3.upload({
        Bucket: aws_bucket_private,
        Key: key,
        Body: stream,
        ACL: 'private',
        Expires: moment().add(10, 'minute').toISOString(),
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }).promise()
}

const getUrl = async (Key) => {
    //console.log('getSignedUrl')
    let r = await s3.getSignedUrl('getObject', {
        Bucket:aws_bucket_private,
        Key,
    })

    //console.log(r)
    return r
}

const getSecureUrl = async (Key) => {
    //console.log('getSignedUrl')
    let r = await s3.getSignedUrl('getObject', {
        Bucket:aws_bucket_private,
        Key,
    })

    //console.log(r)
    return r
}

module.exports = {
    upload,
    getUrl,
    getSecureUrl,
};