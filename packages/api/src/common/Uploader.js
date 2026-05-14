const { withConfigLocal } = require('../upload/localUpload.js');
const { withConfigS3 } = require('../upload/s3Upload.js');

class Uploader {
    constructor(uploader) {
        this._uploader = uploader;
    }

    async getSecureUrl(key, auth) {
        return await this._uploader.getUrlSecure(key, auth);
    }

    async upload(key, stream) {
        return await this._uploader.upload(key, stream);
    }

    async uploadSecure(key, stream) {
        return await this._uploader.uploadSecure(key, stream);
    }

    async getUrl(key) {
        return await this._uploader.getUrl(key);
    }

    static init(yml) {
        const api_host = yml['api-host']?.uri;
        const raw = yml.upload.s3
            ? withConfigS3({
                access_key_id: yml.upload.s3.access_key_id,
                secret_access_key: yml.upload.s3.secret_access_key,
                bucket: yml.upload.s3.bucket,
                region: yml.upload.s3.region,
                prefix: yml.upload.s3.prefix,
                bucket_private: yml.upload.s3.bucket_private,
                base_url: yml.upload.s3.base_url,
            })
            : withConfigLocal({
                path: yml.upload.local.path,
                path_private: yml.upload.local.path_private,
                base_url: yml.upload.local.base_url,
                api_host,
            });
        Uploader._instance = new Uploader(raw);
        return Uploader._instance;
    }

    static getInstance() {
        if (!Uploader._instance) throw new Error('Uploader is not initialized. Call Uploader.init(yml) first.');
        return Uploader._instance;
    }
}

Uploader._instance = null;

module.exports = { Uploader };
