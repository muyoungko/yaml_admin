import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK, PreviousLocationStorageKey } from 'react-admin';
import axios, { postFetcher, fetcher } from '../common/axios'
import { setAdminInContext } from '../AdminContext';

function getUrlParams(url) {
    var params = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) { params[key] = value; });
    return params;
}

const authProvider = {
    login: params => {
        const { username, password } = params;
        return postFetcher('/member/login', {}, {
            type: 'email',
            email: username,
            pass: password
        }).then(({ token, r, msg, ...admin }) => {
            if (!r)
                throw new Error(msg);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-access-token'] = token;
            setAdminInContext({ token });
            return { token, ...admin };
        })
    },
    checkError: error => {
        return Promise.resolve();
    },
    checkAuth: params => {
        localStorage.setItem(PreviousLocationStorageKey, window.location.href);

        const query = getUrlParams(window.location.href);
        let { token } = query;

        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            axios.defaults.headers.common['x-access-token'] = token;
            return fetcher(`/member/islogin?token=${encodeURIComponent(token)}`)
                .then(res => {
                    if (res.r) {
                        setAdminInContext({ token, ...res?.member });
                        return Promise.resolve();
                    } else {
                        return Promise.reject();
                    }
                })
        } else {
            return Promise.reject();
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        document.cookie = ''
        setAdminInContext({ token: null });
        return Promise.resolve();
    },
    getIdentity: () =>
        fetcher('/member/islogin').then(res => {
            if (res?.r && res?.member) {
                const m = res.member;
                return {
                    id: m.id || m.email,
                    fullName: m.name || m.email,
                    avatar: m.avatar, // 있으면
                };
            }
            return Promise.reject();
        }),
    handleCallback: () => {
        return Promise.resolve(/* ... */)
    },
    getPermissions: () => Promise.resolve(/* ... */),
};

export default authProvider;