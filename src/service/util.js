import { get, post, Delete } from './tools';
import * as config from './config';
import axios from 'axios';

const getPolicy = () => {
    return get({
        url: `${config.API}/oss/getPolicy`,
    });
};

const upload = (url, params, requestType = 'post') => {
    // 创建axios实例
    const service = axios.create({
        baseURL: url, // api base_url
        withCredentials: false,
        timeout: 10000, // 请求超时时间,
        headers: {
            //关键
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
    });

    return new Promise((resolve, reject) => {
        service[requestType](url, params).then(
            (res) => {
                resolve(res);
            },
            (res) => {
                resolve(res);
            }
        );
    });
};

export { getPolicy, upload };
