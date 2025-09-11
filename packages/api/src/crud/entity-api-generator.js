const { withConfig } = require('../login/auth.js');
const { genEntityIdWithKey } = require('../common/util.js');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const XLSX = require('xlsx');
const moment = require('moment');
const { withConfigLocal } = require('../upload/localUpload.js');
const { withConfigS3 } = require('../upload/s3Upload.js');

const generateCrud = async ({ app, db, entity_name, yml_entity, yml, options }) => {

    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });
    const api_host = yml["api-host"].uri;
    let isS3 = yml.upload.s3
    let host_image = isS3 ? yml.upload.s3.base_url : yml.upload.local.base_url
    const uploader = yml.upload.s3 ? withConfigS3({
        access_key_id: yml.upload.s3.access_key_id,
        secret_access_key: yml.upload.s3.secret_access_key,
        bucket: yml.upload.s3.bucket,
        region: yml.upload.s3.region,
        prefix: yml.upload.s3.prefix,
        bucket_private: yml.upload.s3.bucket_private,
        base_url: yml.upload.s3.base_url,
    }) : withConfigLocal({
        path: yml.upload.local.path,
        path_private: yml.upload.local.path_private,
        base_url: yml.upload.local.base_url,
        api_host,
    })

    let key_field = yml_entity.fields?.find(field => field.key)
    if (!key_field) {
        key_field = {
            name: '_id',
            type: 'objectId',
            key: true,
            autogenerate: true
        }
    }

    const generateKey = async () => {
        if (key_field.type == 'integer')
            return await genEntityIdWithKey(db, key_field.name)
        else if (key_field.type == 'string')
            return uuidv4()
        return null
    }

    const getKeyFromEntity = (entity) => {
        const keyValue = entity[key_field.name]
        if (key_field.type == 'objectId' && keyValue)
            return keyValue.toString()
        return keyValue
    }

    const parseKey = (key) => {
        if (key_field.type == 'integer')
            return parseInt(key)
        else if (key_field.type == 'string')
            return key
        else if (key_field.type == 'objectId')
            return ObjectId.isValid(key) ? new ObjectId(key) : key
        return key
    }

    const parseValueByType = (value, field) => {
        const { type, reference_entity, reference_field } = field
        if (type == 'reference') {
            const referenceEntity = yml.entity[reference_entity]
            const referenceField = referenceEntity.fields.find(f => f.name == reference_field)
            console.log('referenceField', referenceField)
            return parseValueByTypeCore(value, referenceField)
        } else {
            return parseValueByTypeCore(value, field)
        }
    }
    const parseValueByTypeCore = (value, field) => {
        const { type } = field
        if (type == 'integer')
            return parseInt(value)
        else if (type == 'string')
            return value
        else if (type == 'objectId')
            return ObjectId.isValid(value) ? new ObjectId(value) : value
        return value
    }

    const passwordEncrypt = (value) => {
        if (options?.password?.encrypt) {
            return options.password.encrypt(value)
        } else {
            return crypto.createHash('sha512').update(value).digest('hex')
        }
    }

    const addInfo = async (db, list) => {
        let passwordFields = yml_entity.fields.filter(f => f.type == 'password').map(f => f.name)
        list.forEach(m => {
            passwordFields.forEach(f => {
                delete m[f]
            })
        })

        let mediaFields = yml_entity.fields.filter(f => ['image', 'mp4', 'file'].includes(f.type))
        for(let m of list) {
            for(let field of mediaFields) {
                m[field.name] = await mediaToFront(m[field.name], field.private)
            }
        }
    }

    const mediaKeyToFullUrl = async (key, private) => {
        
        let url = key
        if(url && !url.startsWith('http'))
            url= host_image + '/' + url

        if(private) {
            url = await uploader.getUrlSecure(key, auth);
        }

        return url
    }

    const mediaToFront = async (media, private) => {
        if (media && typeof media == 'string') {
            media= { src: url }
            media.image_preview = await mediaKeyToFullUrl(url, private)
        } else if (media && typeof media == 'object') {
            let { image, video, src } = media
            let url = image || src
            media.image_preview = await mediaKeyToFullUrl(url, private)
            if (video) {
                media.video_preview = await mediaKeyToFullUrl(video, private)
            }
        }
        return media
    }
    

    //list
    app.get(`/${entity_name}`, auth.isAuthenticated, async (req, res) => {
        var s = {};
        var _sort = req.query._sort;
        var _order = req.query._order;
        if (_sort != null)
            s[_sort] = (_order == 'ASC' ? 1 : -1);

        var _end = req.query._end;
        var _start = req.query._start;
        var l = _end - _start;

        //검색 파라미터
        const f = {};
        yml_entity.fields?.forEach(field => {
            const q = req.query[field.name];
            if (q) {
                const search = yml_entity.crud?.search?.find(m => m.name == field.name)
                if (Array.isArray(q)) {
                    f[field.name] = { $in: q.map(v => parseValueByType(v, field)) };
                } else {
                    if (search?.exact != false || field.type == 'integer')
                        f[field.name] = parseValueByType(q, field)
                    else
                        f[field.name] = { $regex: ".*" + q + ".*" };
                }
            }
        })

        //console.log('f', f)

        var name = req.query.name;
        if (name == null && req.query.q)
            name = req.query.q;
        if (name != null)
            f['name'] = { $regex: ".*" + name + ".*" };
        f.remove = { $ne: true }

        //Custom f list Start

        //Custom f list End

        const projection = (key_field.name == '_id' ? {} : { _id: false })
        var count = await db.collection(entity_name).find(f).project(projection).sort(s).count();
        let list = await db.collection(entity_name).find(f).project(projection).sort(s).skip(parseInt(_start)).limit(l).toArray()
        list.map(m => {
            m.id = getKeyFromEntity(m)
        })
        //Custom list Start

        //Custom list End
        await addInfo(db, list)
        res.header('X-Total-Count', count);
        res.json(list);
    });


    const constructEntity = async (req, entityId) => {
        var entity = {};

        if (entityId)
            entity[key_field.name] = entityId

        yml_entity.fields.forEach(field => {
            if (!field.key)
                entity[field.name] = req.body[field.name]
        })
        entity['update_date'] = new Date()

        let passwordFields = yml_entity.fields.filter(f => f.type == 'password').map(f => f.name)
        passwordFields.forEach(f => {
            entity[f] = passwordEncrypt(req.body[f])
        })
        //Custom ConstructEntity Start

        //Custom ConstructEntity End

        return entity;
    };

    //create
    app.post(`/${entity_name}`, auth.isAuthenticated, async (req, res) => {
        let entityId
        if (key_field.autogenerate)
            entityId = await generateKey()
        else
            entityId = parseKey(req.body[key_field.name])

        if (entityId) {
            let f = {}
            f[key_field.name] = entityId
            let already = await db.collection(entity_name).findOne(f)
            if (already)
                return res.status(400).json({ status: 400, statusText: 'error', message: "duplicate key [" + entityId + "]" });
        }

        const entity = await constructEntity(req, entityId);
        entity['update_date'] = entity['create_date'] = new Date()
        entity['create_admin_id'] = req.user.id

        //Custom Create Start

        //Custom Create End

        var r = await db.collection(entity_name).insertOne(entity);
        //Custom Create Tail Start

        //Custom Create Tail End

        const generatedId = entityId || r.insertedId
        entity.id = (key_field.type == 'objectId') ? generatedId?.toString() : generatedId;

        res.json(entity);
    });


    //edit
    app.put(`/${entity_name}/:id`, auth.isAuthenticated, async (req, res) => {
        let entityId = parseKey(req.params.id)

        const entity = await constructEntity(req, entityId);
        entity['update_date'] = new Date()
        // Do not attempt to set the key field during update (immutable `_id` etc.)
        if (entity[key_field.name] !== undefined)
            delete entity[key_field.name]


        //Custom Create Start

        //Custom Create End

        let f = {}
        f[key_field.name] = entityId

        for(let field of yml_entity.fields) {
            if(['mp4', 'image', 'file'].includes(field.type)) {
                let a = entity[field.name]
                delete a.image_preview
                delete a.video_preview
            }
        }

        await db.collection(entity_name).updateOne(f, { $set: entity });

        //Custom Create Tail Start

        //Custom Create Tail End

        // Ensure React-Admin receives an `id` in the response
        entity.id = (key_field.type == 'objectId') ? entityId?.toString() : entityId

        res.json(entity);
    });

    //view
    app.get(`/${entity_name}/:id`, auth.isAuthenticated, async (req, res) => {
        let f = {}
        f[key_field.name] = parseKey(req.params.id)
        const m = await db.collection(entity_name).findOne(f);
        if (!m)
            return res.status(404).send('Not found');

        m.id = getKeyFromEntity(m)
        await addInfo(db, [m])

        res.json(m);
    })

    //delete
    app.delete(`/${entity_name}/:id`, auth.isAuthenticated, async function (req, res) {
        let f = {}
        f[key_field.name] = parseKey(req.params.id)
        const entity = await db.collection(entity_name).findOne(f);
        if (!entity)
            return res.status(404).send('Not found');

        entity.id = getKeyFromEntity(entity)

        let customDelete = false
        let softDelete = false
        //Custom Delete Api Start

        //Custom Delete Api End

        if (customDelete)
            ;
        else if (softDelete)
            await db.collection(entity_name).updateOne(f, { $set: { remove: true } });
        else
            await db.collection(entity_name).deleteOne(f);

        res.json(entity);
    });

    if (yml_entity.crud?.list?.export) {
        app.post(`/excel/${entity_name}/export`, auth.isAuthenticated, async (req, res) => {
            const filename = `${entity_name}_`
            const fields = yml_entity.crud.list.export.fields.map(field => ({
                label: field.name,
                value: field.name,
            }))
            //{ label: '상품', value: row => row.product_list?.map(m=>m.total_name).join(',') },

            let f = req.body.filter || {}
            const list = await db.collection(entity_name).find(f).project({
                _id: false,
            }).toArray();

            if (list.length == 0)
                return res.json({ r: false, msg: 'No Data' });

            await addInfo(db, list)

            const data = list.map(row => {
                let obj = {};
                fields.forEach(field => {
                    obj[field.label] = typeof field.value === 'function' ? field.value(row) : row[field.value];
                });
                return obj;
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            const currentTime = moment().format('YYYYMMDD_HHmmss');
            const key = `/excel/${filename}${currentTime}.xlsx`;
            await uploader.uploadSecure(key, excelBuffer);
            let url = await uploader.getUrlSecure(key, auth);
            return res.json({ r: true, url });
        })
    }

    if (yml_entity.crud?.list?.import) {
        app.post(`/excel/${entity_name}/import`, auth.isAuthenticated, async (req, res) => {
            const { base64 } = req.body
            const buf = Buffer.from(base64, 'base64');
            const workbook = XLSX.read(buf, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            let list = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            //엑셀 첫번째 행 타이틀 데이터 제거
            let header = list[0]
            list.shift();

            let upsert = yml_entity.crud.list.import.upsert || true

            const fields = yml_entity.crud.list.import.fields.map(m => m)
            fields.map(field => {
                let original = yml_entity.fields.find(f => f.name == field.name)
                field.type = original.type
            })

            let key_field = yml_entity.fields.find(f => f.key)
            let bulk = []
            list.map(m => {
                let f = {}

                let m_obj = {}
                header.map((h, index) => {
                    m_obj[h] = m[index]
                })

                f[key_field.name] = getKeyFromEntity(m_obj)
                if (!f[key_field.name])
                    return
                let entity = {}
                fields.forEach(field => {
                    if (field.type == 'integer')
                        entity[field.name] = parseInt(m_obj[field.name])
                    else if (field.type == 'password')
                        entity[field.name] = passwordEncrypt(m_obj[field.name] + '')
                    else
                        entity[field.name] = m_obj[field.name] + ''
                })

                bulk.push({
                    updateOne: {
                        filter: f,
                        update: { $set: entity },
                        upsert: upsert
                    }
                })
            })

            let result = await db.collection('delivery').bulkWrite(bulk);
            res.json({ r: true, msg: 'Import success - ' + result.upsertedCount + ' rows effected' });
        })
    }
}

const generateEntityApi = async ({ app, db, entity_name, entity, yml, options }) => {
    await generateCrud({ app, db, entity_name, yml_entity: entity, yml, options })
}

module.exports = {
    generateEntityApi
}