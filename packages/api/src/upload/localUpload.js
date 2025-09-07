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

const withConfigLocal = ({path, path_private, base_url, api_host}) => {

    const upload = async (key, stream) => {
        return await fs.writeFileSync(path + '/' + key, stream)
    }

    const uploadSecure = async (key, stream) => {
        return await fs.writeFileSync(path_private + '/' + key, stream)
    }

    const getUrlSecure = async (Key) => { 
        let r = `${api_host}/local-secure-download?key=${Key}`
        console.log('getUrlSecure', r)
        return r
    }

    return {
        upload,
        uploadSecure,
        getUrl: async (key) => {
            return await getUrl(key)
        },
        getUrlSecure,
    }
}

module.exports = {
    withConfigLocal
};