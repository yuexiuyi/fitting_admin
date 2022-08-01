import { get, post, Delete } from './tools';
import * as config from './config';

const getTagTree = (type) => {
    return get({
        url: `${config.API}/tag/getTree?type=${type}`,
    });
};

const addTag = (data) => {
    return post({
        url: `${config.API}/tag/create`,
        data,
    });
};

const deleteTag = (ids) => {
    return Delete({
        url: `${config.API}/tag/delete?ids=${ids}`,
    });
};

const updateTag = (data) => {
    return post({
        url: `${config.API}/tag/update`,
        data,
    });
};

export { getTagTree, addTag, deleteTag, updateTag };
