import { post } from './tools';
import * as config from './config';

const getPrintGuide = (data) => {
    return post({
        url: `${config.API}/printGuide/list`,
        data,
    });
};

const updatePrintGuide = (data) => {
    return post({
        url: `${config.API}/printGuide/update`,
        data,
    });
};

export { getPrintGuide, updatePrintGuide };
