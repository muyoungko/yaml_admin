module.exports = async function customRoute(app) {
    app.get('/api/mychart/lock_history1', async (req, res) => {
        res.json({
            "options": {
                "chart": {
                    "id": "lock_history1"
                },
                "xaxis": {
                    "categories": [
                        "03/03",
                        "03/04",
                        "03/05",
                        "03/06",
                        "03/07",
                        "03/08",
                        "03/09",
                        "03/10",
                        "03/11",
                        "03/12",
                        "03/13",
                        "03/14",
                        "03/15",
                        "03/16"
                    ]
                },
                "colors": [
                    "#8B0000",
                    "#228B22"
                ]
            },
            "colors": [],
            "series": [
                {
                    "name": "EM002",
                    "data": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        1,
                        0,
                        1
                    ]
                },
                {
                    "name": "DC003",
                    "data": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ]
                }
            ]
        })
    })
}
