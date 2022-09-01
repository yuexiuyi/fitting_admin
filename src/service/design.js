import { post } from './tools';
import * as config from './config';

const getDesignList = (data) => {
    return post({
        url: `${config.API}/design/list`,
        data,
    });
};

export { getDesignList };
