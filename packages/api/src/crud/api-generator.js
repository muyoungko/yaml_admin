const { withConfig } = require('../login/auth.js');
const { genEntityIdWithKey } = require('../common/util.js');
const { v4 : uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');

const generateCrud = async ({ app, db, entity_name, yml_entity, yml }) => {

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
        var f = {};
        var id = req.query.id;
        if (id) {
            if (Array.isArray(id))
                f['id'] = { $in: id.map(m => parseInt(m)) };
            else
                f['id'] = parseInt(id);
        }

        // ${
        //     entity.property.filter(f=>f.search && f.type != 'divider').map(m=>{
        //         if(m.type == 'bool') {
        //             return `
        //             if (req.query.${m.name})
        //                 f['${m.name}'] = req.query.${m.name} == 'true'
        //             `
        //         } else if(m.type == 'text') {
        //             return `
        //             if (req.query.${m.name})
        //                 f['${m.name}'] = { $regex: ".*" + req.query.${m.name} + ".*" }
        //             `    
        //         } else if(m.type == 'reference') {
        //             //reference의 키는 integer인지 string인지 모른다. 그리고 member_no같이 string으로 취급되어야할 integer도 있다
        //             return `
        //             if (req.query.${m.name})
        //                 f['${m.name}'] = isNaN(Number(req.query.${m.name}))|| parseInt(req.query.${m.name}) > 1569340492095?req.query.${m.name}:parseInt(req.query.${m.name})
        //             `    
        //         } else if(m.type == 'date') {
        //             return `
        //             if (req.query.date) {
        //                 if(req.query.date.replace(/-/g, '').length == 8) {
        //                     //해당 날짜의 시작Date와 끝Date로 검색
        //                     f['date'] = {
        //                         $gte: moment(req.query.date).startOf('day').toDate(),
        //                         $lte: moment(req.query.date).endOf('day').toDate()
        //                     }
        //                 }
        //             }
        //             `
        //         } else {
        //             return `
        //             if (req.query.${m.name})
        //                 f['${m.name}'] = req.query.${m.name}
        //             `    
        //         } 

        //     }).join('\n')
        // }

        var name = req.query.name;
        if (name == null && req.query.q)
            name = req.query.q;
        if (name != null)
            f['name'] = { $regex: ".*" + name + ".*" };
        f.remove = { $ne: true }

        //Custom f list Start

        //Custom f list End

        var count = await db.collection(entity_name).find(f).project({ _id: false }).sort(s).count();
        console.log('list', entity_name, f)
        let list = await db.collection(entity_name).find(f).project({ _id: false }).sort(s).skip(parseInt(_start)).limit(l).toArray()
        list.map(m => {
            m.id = m[key_field.name]
        })
        //Custom list Start

        //Custom list End
        //await addInfo(db, list)
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
        
        //Custom ConstructEntity Start

        //Custom ConstructEntity End

        return entity;
    };

    //create
    app.post(`/${entity_name}`, auth.isAuthenticated, async (req, res) => {
        let entityId
        if (key_field.autogenerate)
            entityId = await generateKey()        
        
        if(entityId) {
            let f = {}
            f[key_field.name] = entityId
            let already = await db.collection(entity_name).findOne(f)
            if (already)
                return res.status(400).json({ status: 400, statusText: 'error', message: "duplicate key [" + entity_id + "]" });
        }

        const entity = await constructEntity(req, entityId);
        entity['update_date'] = entity['create_date'] = new Date()
        entity['create_admin_id'] = req.user.id

        //Custom Create Start
        
        //Custom Create End

        var r = await db.collection(entity_name).insertOne(entity);
        //Custom Create Tail Start
        
        //Custom Create Tail End

        res.json(entity);
    });
}

const generateEntityApi = async ({ app, db, entity_name, entity, yml }) => {
    const { fields } = entity;

    await generateCrud({ app, db, entity_name, yml_entity: entity, yml })
}

module.exports = {
    generateEntityApi
}