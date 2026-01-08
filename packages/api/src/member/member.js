const {withConfig} = require('../login/auth.js');

module.exports = async function (app, db, yml, api_prefix) {
    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"], 
        passwordEncoding: yml.login["password-encoding"],
        master_email: yml.login["master-email"],
        master_password: yml.login["master-password"]
     });

    app.get(api_prefix + '/member/login',
        auth.authenticate,
        function (req, res) {
            res.json({ r: true, token: req.token, member: req.user });
        }
    );

    app.get(api_prefix + '/member/islogin',
        auth.isAuthenticated,
        async function (req, res) {
            res.json({ r: true, member: req.user });
        }
    );

    app.post(api_prefix + '/member/login',
        auth.authenticate,
        function (req, res) {
            res.json({ r: true, token: req.token, member: req.user });
        }
    );

    app.get(api_prefix + '/member/logout', async (req, res) => {
        req.logout();
        res.json({ r: true });
    });

    app.get(api_prefix + '/member/test', async (req, res) => {
        res.json({ r: true });
    });

};
