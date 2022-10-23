import { get, post, Delete } from './tools';
import * as config from './config';

const deleteProduct = (ids) => {
    return Delete({
        url: `${config.API}/product/delete?ids=${ids}`,
    });
};
const addProduct = (data) => {
    return post({
        url: `${config.API}/product/save`,
        data,
    });
};

const updateProduct = (data) => {
    return post({
        url: `${config.API}/product/update`,
        data,
    });
};

const getProduct = (data) => {
    return post({
        url: `${config.API}/product/list`,
        data,
    });
};

const tagProduct = (data) => {
    return post({
        url: `${config.API}/product/tag`,
        data,
    });
};

const onShelf = (dataId) => {
    return get({
        url: `${config.API}/product/onShelf?productIds=${dataId}`,
    });
};

const offShelf = (dataId) => {
    return get({
        url: `${config.API}/product/offShelf?productIds=${dataId}`,
    });
};

const getCover = (data) => {
    return post({
        url: `${config.API}/maskLayer/list`,
        data,
    });
};

const deleteCover = (ids) => {
    return Delete({
        url: `${config.API}/maskLayer/delete?ids=${ids}`,
    });
};

const updateCover = (data) => {
    return post({
        url: `${config.API}/maskLayer/update`,
        data,
    });
};

const addCover = (data) => {
    return post({
        url: `${config.API}/maskLayer/save`,
        data,
    });
};

export {
    getProduct,
    deleteProduct,
    addProduct,
    updateProduct,
    tagProduct,
    offShelf,
    onShelf,
    getCover,
    deleteCover,
    updateCover,
    addCover,
};
