const { withConfig } = require('../login/auth.js');
const moment = require('moment-timezone');

/**

 * @param {*} app 
 * @param {*} db 
 * @param {*} yml 
 */
const generateChartApi = async (app, db, yml) => {
    const { front } = yml;
    const dashboard = front?.dashboard;
    if (!dashboard)
        return;

    const chartComponents = dashboard.filter(m => m.component === 'chart');
    if (chartComponents.length === 0)
        return;

    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });
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
        app.get(`/api/chart/${id}`, auth.isAuthenticated, async (req, res) => {
            try {
                const r = {
                    options: {
                        chart: { id: chart.id },
                        xaxis: { categories: [] }
                    },
                    colors:['#F44336', '#E91E63', '#9C27B0'],
                    series: []
                }
                const { entity, x, y } = chart;

                // apply series colors from yml if provided
                if (y && Array.isArray(y.series)) {
                    const definedColors = y.series.map(s => s && s.color).filter(Boolean);
                    if (definedColors.length > 0) {
                        r.options.colors = definedColors;
                    }
                }
                if (x.type == 'date') {
                    /* component sample
                      - component: chart
                        id: lock_history1
                        label: '잠금 현황'
                        type: line
                        x:
                            label: '날짜'
                            type: date
                            entity: lock_history
                            field: reg_date
                            format: 'MM/DD'
                            gap: day
                            limit: 7
                            timezone: Asia/Seoul
                            desc: false
                        y:
                            entity: lock_history
                            field: reg_date
                            series:
                            - label: '잠금'
                                if: lock==true
                                color: '#ff0000' #red
                            - label: '해제'
                                if: lock!=true
                                color: '#00ff00' #green
                    */
                    const { field, entity, format, gap, limit, desc, timezone } = x;

                    for(const s of y.series) {
                        const { label } = s;
                        const match = evaluateIfToMatch(s['if']);
                        let a = [
                            {
                                $match: match
                            },
                            {
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
                            },
                            { $sort: { _id: -1 } },
                            { $limit: limit }
                        ]

                        const list = await db.collection(entity).aggregate(a).toArray();
                        r.options.xaxis.categories = list.map(m => {
                            if(format)
                                return moment.tz(m._id, timezone).format(format);
                            else
                                return m._id;
                        });
                        r.series.push({ name: label, data: list.map(m => m.count) });
                    }
                } else if (x.type == 'field') {
                    
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