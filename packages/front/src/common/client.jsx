import { useAdminContext } from '../AdminContext';

const request_get = async (path) => {
    const yml = useAdminContext();
    console.log('request_get', yml)
    var token = getLoginToken();
    var header = { 'Content-Type': 'application/json'};
    if(token)
        header['x-access-token'] = token;

    const request = new Request(`${api_host}${path}`, {
        method: 'GET',
        headers: new Headers(header),
    })
    return fetch(request)
        .then(response => {
            if (response.status < 200 || response.status >= 300) {
                ;//throw new Error(response.statusText);
            }
            return response.json();
        });
}

const request = async (path, method, data) => {
    var token = getLoginToken();
    var header = { 'Content-Type': 'application/json'};
    if(token)
        header['x-access-token'] = token;

    const request = new Request(`${api_host}${path}`, {
        method: method,
        headers: new Headers(header),
        body: data?JSON.stringify(data):null,
    })
    return fetch(request)
        .then(response => {
            if (response.status < 200 || response.status >= 300) {
                ;//throw new Error(response.statusText);
            }
            return response.json();
        });
}

const request_post = async (path, param) => {
    var token = getLoginToken();
    var header = { 'Content-Type': 'application/json'};
    if(token)
        header['x-access-token'] = token;
    const request = new Request(`${api_host}${path}`, {
        method: 'POST',
        headers: new Headers(header),
        body: JSON.stringify(param),
    })
    return fetch(request)
        .then(response => {
            if (response.status < 200 || response.status >= 300) {
                ;//throw new Error(response.statusText);
            }
            return response.json();
        });

}

export const getLoginToken = () => {
    var token = localStorage.getItem('token');
    if(!token){
        token = getCookie('token');
        if(token){
            localStorage.setItem('token', token);
        }
    }

    return token;
}


export const getCookie = (name) => {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

export default {
    request_get,
    request,
    request_post,
};