const { withConfig } = require('../login/auth.js');
const { genEntityIdWithKey } = require('../common/util.js');
const { v4 : uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

const generateCrud = async ({ app, db, entity_name, yml_entity, yml, options }) => {

    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });
    
    let key_field = yml_entity.fields?.find(field => field.key)
    if(!key_field) {
        key_field = {
            name: '_id',
            type: 'objectId',
            key: true,
            autogenerate: true
        }
    }

    const generateKey = async () => {
        if(key_field.type == 'integer')
            return await genEntityIdWithKey(db, key_field.name)
        else if(key_field.type == 'string')
            return uuidv4()
        return null
    }

    const getKeyFromEntity = (entity) => {
        const keyValue = entity[key_field.name]
        if(key_field.type == 'objectId' && keyValue)
            return keyValue.toString()
        return keyValue
    }

    const parseKey = (key) => {
        if(key_field.type == 'integer')
            return parseInt(key)
        else if(key_field.type == 'string')
            return key
        else if(key_field.type == 'objectId')
            return ObjectId.isValid(key) ? new ObjectId(key) : key
        return key
    }

    const parseValueByType = (value, field) => {
        const {type, reference_entity, reference_field} = field
        if(type == 'reference') {
            const referenceEntity = yml.entity[reference_entity]
            const referenceField = referenceEntity.fields.find(f => f.name == reference_field)
            return parseValueByTypeCore(value, referenceField)
        } else {
            return parseValueByTypeCore(value, field)
        }
    }
    const parseValueByTypeCore = (value, field) => {
        const {type} = field
        if(type == 'integer')
            return parseInt(value)
        else if(type == 'string')
            return value
        else if(type == 'objectId')
            return ObjectId.isValid(value) ? new ObjectId(value) : value
        return value
    }
    
    const addInfo = async (db, list) => {
        let passwordFields = yml_entity.fields.filter(f=>f.type == 'password').map(f=>f.name)
        list.forEach(m => {
            passwordFields.forEach(f => {
                delete m[f]
            })
        })
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
        yml_entity.crud?.list?.search?.forEach(m=>{
            const field = yml_entity.fields.find(f=>f.name == m.name)
            const q = req.query[m.name];
            if(q) {
                if (Array.isArray(q)) {
                    f[field.name] = { $in: q.map(v => parseValueByType(v, field)) };
                } else {
                    if(m.exact != false)
                        f[field.name] = parseValueByType(q, field)
                    else
                        f[field.name] = { $regex: ".*" + q + ".*" };
                }
            }
        })

        console.log('f', f)

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
        
        if(entityId)
            entity[key_field.name] = entityId

        yml_entity.fields.forEach(field => {
            if(!field.key)
                entity[field.name] = req.body[field.name]
        })
        entity['update_date'] = new Date()
        
        let passwordFields = yml_entity.fields.filter(f=>f.type == 'password').map(f=>f.name)
        passwordFields.forEach(f => {
            if(options?.password?.encrypt) {
                entity[f] = options.password.encrypt(req.body[f])
            } else {
                entity[f] = crypto.createHash('sha512').update(req.body[f]).digest('hex')
            }
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
        
        if(entityId) {
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
        if(entity[key_field.name] !== undefined)
            delete entity[key_field.name]
        

        //Custom Create Start
        
        //Custom Create End

        let f = {}
        f[key_field.name] = entityId
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
        if(!m) 
            return res.status(404).send('Not found');

        m.id = getKeyFromEntity(m)
        await addInfo(db, [m])

        res.json(m);
    })

    //delete
    app.delete(`/${entity_name}/:id`, auth.isAuthenticated, async function (req, res) {
        let f = {}
        f[key_field.name] = parseKey(req.params.id)
        const entity= await db.collection(entity_name).findOne(f);
        if(!entity) 
            return res.status(404).send('Not found');

        entity.id = getKeyFromEntity(entity)

        let customDelete = false
        let softDelete = false
        //Custom Delete Api Start

        //Custom Delete Api End
        
        if(customDelete)
            ;
        else if(softDelete)
            await db.collection(entity_name).updateOne(f, {$set:{remove:true}});
        else 
            await db.collection(entity_name).deleteOne(f);

        res.json(entity);
    });
}

const generateEntityApi = async ({ app, db, entity_name, entity, yml, options }) => {
    const { fields } = entity;

    await generateCrud({ app, db, entity_name, yml_entity: entity, yml, options })
}

module.exports = {
    generateEntityApi
}