const {withConfig} = require('../login/auth.js');

module.exports = async function (app, db, yml, delegate) {
    const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });

    app.get('/member/login',
        auth.authenticate,
        function (req, res) {
            res.json({ r: true, token: req.token, member: req.user });
        }
    );

    app.get('/member/islogin',
        auth.isAuthenticated,
        async function (req, res) {
            res.json({ r: true, member: req.user });
        }
    );

    app.post('/member/login',
        auth.authenticate,
        function (req, res) {
            res.json({ r: true, token: req.token, member: req.user });
        }
    );

    app.get('/member/logout', async (req, res) => {
        req.logout();
        res.json({ r: true });
    });

};
