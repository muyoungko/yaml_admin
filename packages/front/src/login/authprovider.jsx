import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK, PreviousLocationStorageKey } from 'react-admin';
import client from '../common/client'

function getUrlParams(url) {
    var params = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
}

const authProvider = {
    login: params => {
        const { username, password } = params;
        console.log('login', username, password)
        client.request_get('/member/login', {
            type: 'email',
            email: username,
            pass: password
        })
        .then(({ token, r , msg}) => {
            console.log("setItem - " + token);
            if(!r)
                throw new Error(msg);
            localStorage.setItem('token', token);
        });
        // const request = new Request(api_host+'/member/login?type=email&email='+username+'&pass='+password, {
        //     method: 'GET',
        //     headers: new Headers({ 'Content-Type': 'application/json' }),
        // })
        // return fetch(request)
        //     .then(response => {
        //         if (response.status < 200 || response.status >= 300) {
        //             throw new Error(response.statusText);
        //         }
        //         return response.json();
        //     })
        //     .then(({ token, r , msg}) => {
        //         console.log("setItem - " + token);
        //         if(!r)
        //             throw new Error(msg);
        //         localStorage.setItem('token', token);
        //         localStorage.setItem('username', 'admin');
        //     });
    },
    checkError: error => {
        return Promise.resolve();
    },
    checkAuth: params => {
        
        localStorage.setItem(PreviousLocationStorageKey, window.location.href);

        const query = getUrlParams(window.location.href);
        const { token } = query;
        
        const cookie = document.cookie.split(';').find(f=>f.trim().startsWith('token'))
        if(cookie) {
            const token = cookie.split('=')[1]
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