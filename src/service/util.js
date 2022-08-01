import { get, post, Delete } from './tools';
import * as config from './config';

const getPolicy = () => {
    return get({
        url: `${config.API}/oss/getPolicy`,
    });
};

export { getPolicy };
