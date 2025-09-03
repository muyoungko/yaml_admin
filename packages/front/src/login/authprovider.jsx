import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK, PreviousLocationStorageKey } from 'react-admin';
import { postFetcher } from '../common/axios'

function getUrlParams(url) {
    var params = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
}

const authProvider = {
    login: params => {
        const { username, password } = params;
        let p = postFetcher('/member/login', {}, {
            type: 'email',
            email: username,
            pass: password
        }).then(({ token, r , msg}) => {
            console.log("setItem - " + token);
            if(!r)
                throw new Error(msg);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-access-token'] = token;
        }).catch(e=>{
            console.log('e', e)
        });
    },
    checkError: error => {
        return Promise.resolve();
    },
    checkAuth: params => {
        
        localStorage.setItem(PreviousLocationStorageKey, window.location.href);

        const query = getUrlParams(window.location.href);
        let { token } = query;
        
        const cookie = document.cookie.split(';').find(f=>f.trim().startsWith('token'))
        if(cookie) {
            token = cookie.split('=')[1]
            localStorage.setItem('token', token);
        }

        if(token){
            console.log('--------------token check--------------')
            return client.request_get(`/member/islogin?token=${encodeURIComponent(token)}`)
            .then(res => {
                if(res.r){
                    localStorage.setItem('token', token);
                    localStorage.setItem('member', JSON.stringify(res.member));
                    return Promise.resolve();
                } else {
                    return Promise.reject();
                }
            })
        } else {
            if(window.location.href.endsWith('/join'))
                return Promise.resolve()
            else if(localStorage.getItem('token'))
                return Promise.resolve()
            else 
                return Promise.reject();
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        document.cookie = ''
        return Promise.resolve();
    },
    getIdentity: () => Promise.resolve(/* ... */),
    handleCallback: () => {
        return Promise.resolve(/* ... */)
    },
    getPermissions: () => Promise.resolve(/* ... */),
};

export default authProvider;