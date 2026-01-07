const {withConfig} = require('../login/auth.js');

module.exports = async function (app, db, yml, prefix) {
    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"], passwordEncoding: yml.login["password-encoding"] });

    app.get(prefix + '/member/login',
        auth.authenticate,
        function (req, res) {
            res.json({ r: true, token: req.token, member: req.user });
        }
    );

    app.get(prefix + '/member/islogin',
        auth.isAuthenticated,
        async function (req, res) {
            res.json({ r: true, member: req.user });
        }
    );

    app.post(prefix + '/member/login',
        auth.authenticate,
        function (req, res) {
            res.json({ r: true, token: req.token, member: req.user });
        }
    );

    app.get(prefix + '/member/logout', async (req, res) => {
        req.logout();
        res.json({ r: true });
    });

    app.get(prefix + '/member/test', async (req, res) => {
        res.json({ r: true });
    });

};
