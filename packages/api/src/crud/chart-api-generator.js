const { withConfig } = require('../login/auth.js');
const moment = require('moment-timezone');
const { makeMongoSortFromYml } = require('./crud-common.js');

/**

 * @param {*} app 
 * @param {*} db 
 * @param {*} yml 
 */
const generateChartApi = async (app, db, yml, api_prefix) => {
    const { front } = yml;
    const dashboard = front?.dashboard;
    if (!dashboard)
        return;

    const chartComponents = dashboard.filter(m => m.component === 'chart');
    if (chartComponents.length === 0)
        return;

    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });

    const createChartDataTypeDate = async (chart, {from_date, filter}) => {
        const r = {
            options: {
                chart: { id: chart.id },
                xaxis: { categories: [] }
            },
            colors: [],
            series: []
        }
        const { x, y, relation } = chart;
        if (y && Array.isArray(y.series)) {
            const definedColors = y.series.map(s => s && s.color).filter(Boolean);
            if (definedColors.length > 0) {
                r.options.colors = definedColors;
            }
        }

        const { field, entity : entity_x, format, gap, limit, desc, timezone } = x;
        const { entity : entity_y } = y;

        for (const s of y.series) {
            const { label } = s;
            const match = evaluateIfToMatch(s['if']);

            let lookup_list = []
            if (relation) {
                let x_chain = relation_chain_y_to_x.find(f=>f.entity === entity_x)
                let lookup = {
                    from: entity_y,
                    let: { root_x_key: `$${x_chain.match_from}` },
                    pipeline: [],
                      as: entity_y,
                }

                for(let i=0;i<relation_chain_y_to_x.length;i++) {
                    const m = relation_chain_y_to_x[i]
                    lookup.pipeline.push({
                        $lookup: {
                            from: m.entity,
                            localField: m.match_from,
                            foreignField: m.match,
                            as: m.entity
                        },
                    })
                    lookup.pipeline.push({ $unwind: `$${m.entity}` })
                }

                lookup.pipeline.push({ $match: { $expr: { $eq: [`$${x_chain.match}`, `$$root_x_key`] } } },)
                lookup.pipeline.push({ $count: 'n' })
                lookup_list.push({$lookup:lookup})
                lookup_list.push({
                    $unwind: {
                        path: `$${entity_y}`,
                        preserveNullAndEmptyArrays:true,
                    },
                })
            }

            let group_list = []
            group_list.push({
                $group: {
                    _id: {
                        $dateTrunc: {
                            date: `$${field}`,
                            unit: gap,
                            timezone: timezone
                        }
                    },
                    "count": { "$sum": 1 }
                }
            })

            let a = []
            if(filter && Object.keys(filter).length > 0) 
                a.push({ $match: filter })

            a.push(...[
                ...lookup_list,
                { $match: match},
                ...group_list,
                { $sort: { _id: -1 } },
            ])

            if(limit)
                a.push({ $limit: limit })

            //debug
            if(yml.debug)
                console.log('chart', chart.label, entity_x, JSON.stringify(a, null, 2))

            const list = await db.collection(entity_x).aggregate(a).toArray();

            list.map(m => {
                if (format)
                    return moment.tz(m._id, timezone).format(format);
                else
                    return m._id;
            });

            if(!from_date)
                from_date = moment().tz(timezone).format('YYYYMMDD');
            
            r.options.xaxis.categories = []
            let cmoment = moment.tz(from_date, timezone);
            for(let i=0; i<limit; i++) {
                r.options.xaxis.categories.push(cmoment.format(format));
                cmoment.add(-1, gap)
            }
            if(!desc)
                r.options.xaxis.categories.reverse();
            r.series.push({ name: label, data: r.options.xaxis.categories.map(m=>{
                return list.find(l=>moment.tz(l._id, timezone).format(format) === m)?.count || 0;
            })});
        }

        return r
    }

    const createChartDataTypeField = async (chart, {filter}) => {
        const r = {
            options: {
                chart: { id: chart.id },
                xaxis: { categories: [] }
            },
            colors: [],
            series: []
        }
        const { x, y, relation } = chart;
        if (y && Array.isArray(y.series)) {
            const definedColors = y.series.map(s => s && s.color).filter(Boolean);
            if (definedColors.length > 0) {
                r.options.colors = definedColors;
            }
        }

        const { field, entity : entity_x, format, gap, limit, desc, sort } = x;
        const { entity : entity_y } = y;

        for (const s of y.series) {
            const { label } = s;
            
            let lookup_list = []
            if (relation) {
                if(!relation.chain)
                    throw new Error('relation.chain is required');
                if(!relation.match)
                    throw new Error('relation.match is required');

                let lookup = {
                    from: entity_y,
                    let: { root_x_key: `$${relation.match.x}` },
                    pipeline: [],
                    as: entity_y,
                }

                for(let i=0;i<relation.chain.length;i++) {
                    const m = relation.chain[i]
                    lookup.pipeline.push({
                        $lookup: {
                            from: m.entity,
                            localField: m.match_from,
                            foreignField: m.match,
                            as: m.entity
                        },
                    })
                    lookup.pipeline.push({ $unwind: `$${m.entity}` })
                }

                if(s['if'])
                    lookup.pipeline.push({ $match: evaluateIfToMatch(s['if'])})

                lookup.pipeline.push({ $match: { $expr: { $eq: [`$${relation.match.with}`, `$$root_x_key`] } } },)
                lookup.pipeline.push({ $count: 'n' })
                lookup_list.push({$lookup:lookup})
                lookup_list.push({
                    $unwind: {
                        path: `$${entity_y}`,
                        preserveNullAndEmptyArrays:true,
                    },
                })
            }

            let group_sort_field = {}
            sort && sort.map(m=>{
                group_sort_field[m.name] = {
                    $max: `$${m.name}`
                  }
            })

            let group_list = []
            if(relation) {
                group_list.push({
                    $group: {
                        _id: `$${field}`,
                        "count": { "$sum": `$${entity_y}.n` },
                        ...group_sort_field
                    }
                })
            } else {
                group_list.push({
                    $group: {
                        _id: `$${field}`,
                        "count": { "$sum": 1 },
                        ...group_sort_field
                    }
                })
            }

            let a = []

            if(filter && Object.keys(filter).length > 0)
                a.push({ $match: filter })

            a.push(...lookup_list)
            a.push(...group_list)
            
            if(sort)
                a.push({ $sort: makeMongoSortFromYml(sort) })

            if(limit)
                a.push({ $limit: limit })

            //debug
            if(yml.debug)
                console.log('chart', chart.label, entity_x, JSON.stringify(a, null, 2))

            const list = await db.collection(entity_x).aggregate(a).toArray();

            r.options.xaxis.categories = list.map(m => m._id);
            r.series.push({ name: label, data: list.map(m => m.count) });
        }

        return r
    }

    for (const chart of chartComponents) {
        const { id } = chart;
        console.log('generateChartApi', chart.id)

        /**
         return sample {
            options: {
                chart: {
                    id: "basic-bar"
                },
                xaxis: {
                    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
                }
            },
            series: [
                {
                    name: "series-1",
                    data: [30, 40, 45, 50, 49, 60, 70, 91]
                },
                {
                    name: "series-2",
                    data: [30, 40, 45, 50, 49, 60, 70, 91]
                }
            ]
        }
        */
       /**
        * TODO : globalFilterDelegate not implemented
        */
        app.get(`${api_prefix}/api/chart/${id}`, auth.isAuthenticated, async (req, res) => {
            try {
                const { x } = chart;
                let r

                let filter = {};
                chart.filter?.forEach(s => {
                    let value = req.query[s.name];
                    if(value == 'null')
                        filter[s.name] = null;
                    else if(value == 'not null')
                        filter[s.name] = { $ne: null };
                    else if(s.type == 'integer')
                        filter[s.name] = parseInt(value);
                    else
                        filter[s.name] = value;
                });
                
                if (x.type == 'date') {
                    let {from_date} = req.query //YYYYMMDD
                    r = await createChartDataTypeDate(chart, {from_date, filter});
                } else if(x.type == 'field') {
                    r = await createChartDataTypeField(chart, {filter});
                } else {
                    throw new Error('x.type is not date or field');
                }

                res.json(r);
            } catch (e) {
                console.error(e);
                res.status(400).json({ r: false, msg: e.message });
            }
        })
    }
}
/**
 * 'lock==true' or 'lock!=true' to mongodb match format like {lock:true} , {lock:{$ne:true}}
 * @param {*} expression  
 * @returns 
 */
function evaluateIfToMatch(expression) {
    if (!expression || typeof expression !== 'string') return {};
    const exp = expression.trim();

    // Support shorthand truthy checks: "flag" => { flag: true }, "!flag" => { flag: { $ne: true } }
    if (!/[=!<>]/.test(exp)) {
        if (exp.startsWith('!')) {
            const field = exp.substring(1).trim();
            if (!field) return {};
            return { [field]: { $ne: true } };
        }
        return { [exp]: true };
    }

    const match = exp.match(/^(.+?)(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (!match) return {};

    const field = match[1].trim();
    const op = match[2];
    const rightRaw = match[3].trim();

    const parseLiteral = (raw) => {
        if (raw === undefined || raw === null) return raw;
        let v = raw.trim();

        // strip quotes if wrapped
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) {
            return v.substring(1, v.length - 1);
        }
        if (v.toLowerCase() === 'true') return true;
        if (v.toLowerCase() === 'false') return false;
        if (v.toLowerCase() === 'null') return null;

        // Array or object JSON
        if (v.startsWith('[') || v.startsWith('{')) {
            try {
                // allow single-quoted json by converting to double quotes conservatively
                const normalized = v.replace(/'([^']*)'/g, '"$1"');
                return JSON.parse(normalized);
            } catch (e) {
                // fallthrough
            }
        }

        // number
        const num = Number(v);
        if (!Number.isNaN(num) && v !== '') return num;

        // ISO date
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
        if (isoDateRegex.test(v)) {
            const d = new Date(v);
            if (!isNaN(d.getTime())) return d;
        }

        return v;
    };

    const value = parseLiteral(rightRaw);

    switch (op) {
        case '==':
            if (Array.isArray(value)) return { [field]: { $in: value } };
            return { [field]: value };
        case '!=':
            if (Array.isArray(value)) return { [field]: { $nin: value } };
            return { [field]: { $ne: value } };
        case '>':
            return { [field]: { $gt: value } };
        case '>=':
            return { [field]: { $gte: value } };
        case '<':
            return { [field]: { $lt: value } };
        case '<=':
            return { [field]: { $lte: value } };
        default:
            return {};
    }
}

function getPath(obj, path) {
    return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

module.exports = {
    generateChartApi
}