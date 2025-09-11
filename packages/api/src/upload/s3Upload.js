const moment = require('moment')
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const whatIsContentType = (ext) => {
    let contentType = 'image/jpeg'
    if(ext == 'mp4') 
        contentType = 'video/mp4'
    else if(ext == 'mov')
        contentType = 'video/quicktime'
    else if(ext == 'png') 
        contentType = 'image/png'
    else if(ext == 'xlsx') 
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    else if(ext == 'zip') 
        contentType = 'application/zip'
    else if(ext == 'pdf') 
        contentType = 'application/pdf'
    else if(ext == 'docx') 
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    else if(ext == 'doc') 
        contentType = 'application/msword'
    else if(ext == 'txt') 
        contentType = 'text/plain'
    else if(ext == 'csv') 
        contentType = 'text/csv'
    else if(ext == 'xls') 
        contentType = 'application/vnd.ms-excel'
    else if(ext == 'pptx') 
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    else if(ext == 'ppt') 
        contentType = 'application/vnd.ms-powerpoint'
    else if(ext == 'mp3') 
        contentType = 'audio/mpeg'
    else if(ext == 'mov') 
        contentType = 'video/quicktime'
    else if(ext == 'hwp') 
        contentType = 'application/vnd.ms-htmlhelp'
    return contentType
}


const withConfigS3 = ({ access_key_id, secret_access_key, region, prefix, bucket, bucket_private, base_url }) => {
    const s3 = new S3Client({
        region: region,
        credentials: {
            accessKeyId: access_key_id,
            secretAccessKey: secret_access_key
        }
    })

    const upload = async (key, stream) => {
        return await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: stream,
            ACL: 'public-read',
            ContentType: whatIsContentType(key.split('.').pop()),
        }))
    }

    const uploadSecure = async (Key, stream) => {
        console.log('uploadSecure', prefix, Key)
        return await s3.send(new PutObjectCommand({
            Bucket: bucket_private,
            Key: `${prefix}/${Key}`,
            Body: stream,
            ACL: 'private',
            Expires: moment().add(10, 'minute').toDate(),
            ContentType: whatIsContentType(Key.split('.').pop()),
        }))
    }
    
    const getUrl = async (Key) => {
        return `${base_url}/${prefix}/${Key}`
    }
    
    const getUrlSecure = async (Key) => {
        const command = new GetObjectCommand({
            Bucket: bucket_private,
            Key: `${prefix}/${Key}`,
        })
        const r = await getSignedUrl(s3, command, { expiresIn: 600 })
        return r
    }

    return {
        upload,
        uploadSecure,
        getUrl,
        getUrlSecure,
    }
}



module.exports = {
    withConfigS3,
    whatIsContentType,
};