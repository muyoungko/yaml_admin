const moment = require('moment')
const fs = require('fs')

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

const withConfigLocal = ({path, path_private, base_url, base_url_private}) => {

    const upload = async (key, stream) => {
        return await fs.writeFileSync(path + '/' + key, stream)
    }

    const uploadSecure = async (key, stream) => {
        return await fs.writeFileSync(path_private + '/' + key, stream)
    }

    return {
        upload,
        uploadSecure,
        getUrl: async (key) => {
            return await getUrl(key)
        },
        getUrlSecure: async (key) => {
            return await getSecureUrl(key)
        }
    }
}

module.exports = {
    withConfigLocal
};