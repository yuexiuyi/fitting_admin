import { getPolicy, upload } from '../service/util.js';

import queryString from 'query-string';
/**
 * 获取URL参数
 */
export function parseQuery() {
    return queryString.parseUrl(window.location.href).query;
}

/**
 * 校验是否登录
 * @param permits
 */
export const checkLogin = (permits) =>
    (process.env.NODE_ENV === 'production' && !!permits) || process.env.NODE_ENV === 'development';

function getBlobByDataURI(dataURI, type) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: type });
}

export const uploadOss = async (src, ext) => {
    const blob = getBlobByDataURI(src);
    const res = await getPolicy();
    if (res.success) {
        let data = res.data;
        const newExt = ext ? ext : 'png';
        const form = new FormData();
        form.append('uid', data.uuid);
        form.append('host', data.host);
        form.append('dir', data.dir);
        form.append('name', `${data.uuid}.${newExt}`);
        form.append('key', `${data.dir}/${data.uuid}.${newExt}`);
        form.append('policy', data.policy);
        form.append('OSSAccessKeyId', data.accessId);
        form.append('signature', data.signature);
        form.append('fileName', `${data.uuid}.${newExt}`);
        form.append('file', blob);
        await upload(data.host, form, 'post');
        const url = `${data.host}/${data.dir}/${data.uuid}.${newExt}`;
        console.log(url, 'url');
        return url;
    }
};
