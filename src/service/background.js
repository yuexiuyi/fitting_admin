import { get, post, Delete } from './tools';
import * as config from './config';

const addBackground = (data) => {
    return post({
        url: `${config.API}/scene/save`,
        data,
    });
};

const updateBackground = (data) => {
    return post({
        url: `${config.API}/scene/update`,
        data,
    });
};

const getBackgroundTree = (data) => {
    return post({
        url: `${config.API}/scene/list`,
        data,
    });
};

const deleteBackground = (ids) => {
    return Delete({
        url: `${config.API}/scene/delete?ids=${ids}`,
    });
};

export { getBackgroundTree, deleteBackground, addBackground, updateBackground };
