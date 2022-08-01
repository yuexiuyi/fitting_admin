import { get, post, Delete } from './tools';
import * as config from './config';

//获取单个素材标签
const getMaterialItemTag = (dataId) => {
    return get({
        url: `${config.API}/material/getTree?dataId=${dataId}`,
    });
};

//素材打标签
const tagMaterial = (data) => {
    return post({
        url: `${config.API}/material/tag`,
        data,
    });
};

//删除素材
const deleteMaterial = (ids) => {
    return Delete({
        url: `${config.API}/material/delete?ids=${ids}`,
    });
};

//创造素材
const addMaterial = (data) => {
    return post({
        url: `${config.API}/material/save`,
        data,
    });
};

//修改素材
const updateMaterial = (data) => {
    return post({
        url: `${config.API}/material/update`,
        data,
    });
};

//获取素材列表
const getMaterial = (data) => {
    return post({
        url: `${config.API}/material/list`,
        data,
    });
};

export {
    getMaterialItemTag,
    deleteMaterial,
    addMaterial,
    updateMaterial,
    getMaterial,
    tagMaterial,
};
