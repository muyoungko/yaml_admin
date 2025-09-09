const { withConfig } = require('../login/auth.js');
const { PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { genEntityIdWithKey } = require('../common/util.js');
const { S3Client } = require('@aws-sdk/client-s3')
const fs = require('fs')

const getContentType = (ext) => {
    let contentType = 'image/jpeg'
    if(ext == 'mp4') 
        contentType = 'video/mp4'
    else if(ext == 'mov')
        contentType = 'video/quicktime'
    else if(ext == 'png') 
        contentType = 'image/png'
    return contentType
}


const generateS3UploadApi = async ({ app, db, yml, options }) => {
    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });
    const { region, access_key_id, secret_access_key, bucket, bucket_private } = yml.upload.s3;
    const getS3 = () => {
        let s3 = new S3Client({
            region: region,
            credentials: {
                accessKeyId: access_key_id,
                secretAccessKey: secret_access_key
            }
        })
        return s3
    }
    
    app.get('/api/media/url/put/:ext', auth.isAuthenticated, async function(req, res){
        let s3 = getS3()
        let {member_no} = req.user;
        let fileName = await genEntityIdWithKey(db, 'file');
        let ext = req.params.ext;

        let contentType = getContentType(ext)
        let key = `media/${member_no}/${fileName}.${ext}`
        const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({Bucket: aws_bucket_image,
            ContentType: contentType,
            Key: key}), { expiresIn: 300 }); 

        let r = {upload_url:uploadUrl, key, fileName:`${fileName}.${ext}`, member_no, contentType}
        console.log(r)
        res.json(r);
    });

    app.get('/api/media/url/secure/put/:ext', auth.isAuthenticated, async function(req, res){
        let s3 = getS3()
        let {member_no} = req.user;
        let fileName = await genEntityIdWithKey(db, 'file');
        let ext = req.params.ext;

        let contentType = getContentType(ext)
        let key = `media/${member_no}/${fileName}.${ext}`
        const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({Bucket: aws_bucket_private,
            ContentType: contentType,   
            Key: key}), { expiresIn: 300 }); 

        let r = {upload_url:uploadUrl, key, fileName:`${fileName}.${ext}`, member_no, contentType}
        
        res.json(r);
    });

    // request uploadId
    app.get('/api/media/url/secure/init/:ext', auth.isAuthenticated, async function (req, res) {
        let s3 = getS3();
        let member_no = req.user.member_no || req.user.id;
        let fileName = await genEntityIdWithKey(db, 'file');
        let ext = req.params.ext;
        
        let key = `media/${member_no}/${fileName}.${ext}`;
        let contentType = getContentType(ext);

        const createMultipartUpload = await s3.send(new CreateMultipartUploadCommand({
            Bucket: aws_bucket_private,
            Key: key,
            ContentType: contentType
        }));

        res.json({ uploadId: createMultipartUpload.UploadId, key, contentType });
    });

    // request presigned url
    app.post('/api/media/url/secure/part', auth.isAuthenticated, async function (req, res) {
        let s3 = getS3();
        let { key, uploadId, partNumber } = req.body;

        const command = new UploadPartCommand({
            Bucket: aws_bucket_private,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300*10 });

        res.json({ uploadUrl });
    });

    // merge file
    app.post('/api/media/url/secure/complete', auth.isAuthenticated, async function (req, res) {
        let s3 = getS3();
        let { key, uploadId, parts } = req.body;

        parts.sort((a, b) => a.PartNumber - b.PartNumber);

        await s3.send(new CompleteMultipartUploadCommand({
            Bucket: aws_bucket_private,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: parts }
        }));

        res.json({ key });
    });

    // 청크파일 삭제
    app.post('/api/media/url/secure/abort', auth.isAuthenticated, async (req, res) => {
        try {
            const { key, uploadId } = req.body;
            const s3 = getS3();

            await s3.send(new AbortMultipartUploadCommand({
                Bucket: aws_bucket_private,
                Key: key,
                UploadId: uploadId
            }));

            res.json({ r: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ r: false });
        }
    });

    app.post('/api/media/url/put', auth.isAuthenticated, async function(req, res) {
        let s3 = getS3()
        let {member_no} = req.user
        const {ext_list} = req.body
        
        let r = {list:[], r:true}
        for(let ext of ext_list) {
            let fileName = await genEntityIdWithKey(db, 'file')
            let key = `media/${member_no}/${fileName}.${ext}`
            let contentType = getContentType(ext)
            const upload_url = await getSignedUrl(s3, new PutObjectCommand({Bucket: aws_bucket_image,
                ContentType: contentType,
                Key: key}), { expiresIn: 300 }); 
            
            r.list.push({upload_url, key, fileName:`${fileName}.${ext}`, member_no, contentType})
        }
        
        res.json(r);
    })

    app.post('/api/media/url/secure/put', auth.isAuthenticated, async function(req, res) {
        let s3 = getS3()
        let {member_no} = req.user
        const {ext_list} = req.body

        let r = {list:[], r:true}
        for(let ext of ext_list) {
            let fileName = await genEntityIdWithKey(db, 'file')
            let key = `media/${member_no}/${fileName}.${ext}`
            let contentType = getContentType(ext)
            const upload_url = await getSignedUrl(s3, new PutObjectCommand({Bucket: aws_bucket_private,
                ContentType: contentType,
                Key: key}), { expiresIn: 300 }); 

            r.list.push({upload_url, key, fileName:`${fileName}.${ext}`, member_no, contentType})
        }
        
        res.json(r);
    })
}

const generateLocalUploadApi = async ({ app, db, yml, options }) => {
    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });
    const { path, path_private } = yml.upload.local;

    // Accept raw binary for local upload and stream to disk
    app.put('/api/local/media/upload', auth.isAuthenticated, async function(req, res) {
        let member_no = req.user.member_no || req.user.id;
        let {ext, name} = req.query
        let fileName = await genEntityIdWithKey(db, 'file')
        let key = `media/${member_no}/${fileName}.${ext}`

        // Ensure directory exists
        const fullPath = `${path}/${key}`;
        fs.mkdirSync(require('path').dirname(fullPath), { recursive: true });

        const writeStream = fs.createWriteStream(fullPath);
        req.pipe(writeStream);
        writeStream.on('finish', () => {
            res.json({ r: true, key })
        });
        writeStream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ r: false, msg:err.message })
        });
    })

    app.put('/api/local/media/upload/secure', auth.isAuthenticated, async function(req, res) {
        let member_no = req.user.member_no || req.user.id;
        let {ext, name} = req.query

        let fileName = await genEntityIdWithKey(db, 'file')
        let key = `media/${member_no}/${fileName}.${ext}`

        try {
            // Ensure directory exists
            const fullPath = `${path_private}/${key}`;
            fs.mkdirSync(require('path').dirname(fullPath), { recursive: true });

            const writeStream = fs.createWriteStream(fullPath);
            req.pipe(writeStream);
            writeStream.on('finish', () => {
                res.json({ r: true, key })
            });
            writeStream.on('error', (err) => {
                console.error(err);
                res.status(500).json({ r: false, msg:err.message })
            });
        } catch (e) {
            console.error(e)
            res.status(500).json({ r:false })
        }
    })
}

const generateUploadApi = async ({ app, db, yml, options }) => {
    if(yml.upload.s3) {
        await generateS3UploadApi({ app, db, yml, options })
    } 

    if(yml.upload.local) {
        await generateLocalUploadApi({ app, db, yml, options })
    }
    
}

module.exports = {
    generateUploadApi
}