const {withConfig} = require('../login/auth.js');

module.exports = async function (app, db, yml, api_prefix) {
    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"],
        passwordEncoding: yml.login["password-encoding"],
        master_email: yml.login["master-email"],
        master_password: yml.login["master-password"],
        expires: yml.login["expires"],
        authority: yml.login["authority"],
        'id-password': yml.login["id-password"]
     });

    app.get(api_prefix + '/member/login',
        auth.authenticate,
        function (req, res) {
            const { authority, ...member } = req.user;
            res.json({ r: true, token: req.token, expires: req.expires, authority, member });
        }
    );

    app.get(api_prefix + '/member/islogin',
        auth.isAuthenticated,
        async function (req, res) {
            const { authority, ...member } = req.user;
            res.json({ r: true, authority, member });
        }
    );

    app.post(api_prefix + '/member/login',
        auth.authenticate,
        function (req, res) {
            const { authority, ...member } = req.user;
            res.json({ r: true, token: req.token, expires: req.expires, authority, member });
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
