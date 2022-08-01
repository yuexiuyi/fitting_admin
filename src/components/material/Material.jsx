import React, { useEffect, useState, useRef } from 'react';
import { PlusOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Input, Space, Upload, Modal, Table, message, Pagination, Tag } from 'antd';
import {
    deleteMaterial,
    addMaterial,
    updateMaterial,
    getMaterial,
    tagMaterial,
} from '../../service/material.js';
import { getPolicy } from '../../service/util.js';
import SearchTags from '../searchTags/SearchTags';
import { getTagTree } from '../../service/tag.js';

const { confirm } = Modal;

const MAXUPLOADSIZE = 100 * 1000 * 1000;

const CollectionCreateForm = ({
    modalState,
    materialInfo,
    visible,
    onCreate,
    onCancel,
    tagTree,
}) => {
    const [name, setName] = useState('');
    const [enName, setEnName] = useState('');
    const [img, setImg] = useState('');
    const [selTagCodeList, setSelTagCodeList] = useState([]); //保存标签参数
    const [editTagCodeList, setEditTagCodeList] = useState([]); //保存标签参数
    const [hasChild, setHasChild] = useState(true); //保存标签参数
    const [fileList, setFileList] = useState([]); //已上传图片地址
    const uploadData = useRef({}); //上传数据
    const doneFile = useRef({});

    const verifier = () => {
        let result = true;
        if (!name) {
            message.error('中文名不能为空');
            result = false;
        }
        if (!enName) {
            message.error('英文名不能为空');
            result = false;
        }
        // if (!type) {
        //     message.error('类型不能为空');
        //     result = false;
        // }
        if (!img) {
            message.error('上传图片不能为空');
            result = false;
        }
        return result;
    };

    const getSelTagCodeList = (selTagCodeList, hasChild) => {
        setSelTagCodeList(selTagCodeList);
        setHasChild(hasChild);
    };

    // 获取阿里云密钥信息
    const getOssPolify = async (file) => {
        const res = await getPolicy();
        let data = {};
        if (res.success) {
            data = res.data;
            const ext = file.type.split('/')[1];
            Object.assign(uploadData.current, {
                uid: data.uuid,
                host: data.host,
                dir: data.dir,
                name: `${data.uuid}.${ext}`,
                key: `${data.dir}/${data.uuid}.${ext}`,
                policy: data.policy,
                OSSAccessKeyId: data.accessId,
                signature: data.signature,
                fileName: `${data.uuid}.${ext}`,
            });
        }
        return data.host;
    };

    //监听修改弹框显示状态 visible的时候，初始化参数
    useEffect(() => {
        if (visible && modalState === 'edit') {
            let codeList = [];
            materialInfo.tag.forEach((item) => {
                item.childTags.forEach((item2) => {
                    item2.childTags.forEach((item3) => {
                        codeList = [item.code, item2.code, item3.code];
                    });
                });
            });
            setName(materialInfo.name);
            setEnName(materialInfo.enName);
            setImg(materialInfo.picture);
            setEditTagCodeList(codeList);
            setFileList([{ uid: materialInfo.key, url: materialInfo.picture }]);
        } else {
            setName('');
            setEnName('');
            setImg('');
            setEditTagCodeList([]);
            setFileList([]);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            title={modalState === 'add' ? '新增素材' : '修改素材'}
            okText="确定"
            cancelText="取消"
            onCancel={onCancel}
            onOk={() => {
                if (!verifier()) {
                    return;
                }
                onCreate({
                    name,
                    enName,
                    id: materialInfo.key,
                    tagCodeList: editTagCodeList,
                    source: 'SYS_UPLOAD',
                    imgUrl: img,
                });
            }}
            width={1200}
        >
            <div className="content">
                <div className="materialInfoItem">
                    <span>中文名：</span>
                    <Input
                        value={name}
                        style={{ width: 200 }}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </div>
                <div className="materialInfoItem">
                    <span>英文名：</span>
                    <Input
                        value={enName}
                        style={{ width: 200 }}
                        onChange={(e) => {
                            setEnName(e.target.value);
                        }}
                    />
                </div>
                <div className="materialInfoItem">
                    <SearchTags
                        tagTree={tagTree}
                        getSelTagCodeList={getSelTagCodeList}
                        editTagCodeList={editTagCodeList}
                    />
                </div>
                <div className="materialInfoItem">
                    <span>上传图片：</span>
                    <Upload
                        action={getOssPolify}
                        listType="picture-card"
                        data={uploadData.current}
                        multiple={false}
                        fileList={fileList}
                        beforeUpload={(file) => {
                            doneFile.current = {};
                            setFileList([{ uid: '-1', url: '', status: 'uploading' }]);
                            return file.size < MAXUPLOADSIZE;
                        }}
                        onChange={async ({ fileList }) => {
                            fileList.forEach((item, index) => {
                                if (item.status === 'done') {
                                    if (!doneFile.current[item.uid]) {
                                        doneFile.current[item.uid] = item;
                                        const { host, dir, uid } = uploadData.current;
                                        const ext = item.type.split('/')[1]; // 后缀
                                        const imgUrl = `${host}/${dir}/${uid}.${ext}`;
                                        setImg(imgUrl);
                                        setFileList([{ uid: '-1', url: imgUrl, status: 'done' }]);
                                    }
                                } else if (doneFile.current[item.uid]) {
                                    fileList[index] = doneFile.current[item.uid];
                                }
                            });
                        }}
                    >
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Upload>
                </div>
            </div>
        </Modal>
    );
};

const Material = () => {
    const PAGESIZE = 10;
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalState, setModalState] = useState('add');
    const [materialInfo, setMaterialInfo] = useState(null);
    const [materialList, setMaterialList] = useState([]);
    const [searchValue, setSearchValue] = useState();
    const [selTagCodeList, setSelTagCodeList] = useState([]); //标签参数
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: PAGESIZE }); //查询列表翻页 参数
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGESIZE, total: 0 }); //翻页组件 参数
    const [tagTree, setTagTree] = useState(null); //标签参数

    const columns = [
        {
            title: '序号',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: '中文名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '英文名',
            dataIndex: 'enName',
            key: 'enName',
        },
        {
            title: '图片信息',
            dataIndex: 'imgInfo',
            key: 'imgInfo',
            render: (imgInfo) => (
                <div className="imgInfoBox">
                    <span>文件大小：{imgInfo.size}</span>
                    <span>文件格式：{imgInfo.format}</span>
                    <span>DPI：{imgInfo.dpi}</span>
                    <span>创建时间：{imgInfo.createTime}</span>
                </div>
            ),
        },
        {
            title: '图片',
            dataIndex: 'picture',
            key: 'picture',
            render: (text) => {
                return <img src={text} style={{ width: 75, height: 75 }} />;
            },
        },
        {
            title: '标签',
            dataIndex: 'tag',
            key: 'tag',
            render: (tagItem) => (
                <div>
                    {tagItem !== null &&
                        tagItem.map((item, index) => {
                            return (
                                <div key={index}>
                                    <div>{item.name}</div>
                                    {item.childTags !== null &&
                                        item.childTags.map((item2, index2) => {
                                            return (
                                                <div key={index2}>
                                                    {item2.name}
                                                    {item2.childTags !== null &&
                                                        item2.childTags.map((item3, index3) => {
                                                            return (
                                                                <div key={index3}>{item3.name}</div>
                                                            );
                                                        })}
                                                </div>
                                            );
                                        })}
                                </div>
                            );
                        })}
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (item) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => {
                            setVisible(true);
                            setMaterialInfo(item);
                            setModalState('edit');
                        }}
                    >
                        修改
                    </Button>
                    /
                    <Button
                        onClick={() => {
                            showDeleteConfirm([item.key]);
                        }}
                        type="primary"
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    const queryMaterials = async (param) => {
        let data = {
            source: 'SYS_UPLOAD',
            keyWord: searchValue,
            tagCodeList: selTagCodeList,
            ...param,
            ...pageInfo,
        };

        const res = await getMaterial(data);
        if (res.success) {
            const { list, total } = res.data;
            const newList = [];
            if (list) {
                list.forEach((item) => {
                    const temp = {
                        key: item.id,
                        name: item.name,
                        enName: item.enName,
                        imgInfo: {
                            size: item.size,
                            format: item.format,
                            dpi: item.dpi,
                            createTime: item.createTime,
                        },
                        picture: item.imgUrl,
                        tag: item.tagList,
                    };
                    newList.push(temp);
                });
            }
            setPagination({ ...pagination, total });
            setMaterialList(newList);
        }
    };

    const deleteMaterials = async (ids) => {
        const res = await deleteMaterial(ids.join(','));
        if (res.success) {
            message.success('删除成功');
            queryMaterials();
        }
    };

    const addMaterials = async (param) => {
        param = {
            ...param,
        };
        const res = await addMaterial(param);
        if (res.success) {
            setVisible(false);
            //打标签
            await tagMaterial({
                tagCodeList: param.selTagCodeList,
                dataId: res.data,
            });

            message.success('添加成功');
            queryMaterials();
        }
    };

    const updateMaterials = async (param) => {
        param = [
            {
                ...param,
            },
        ];
        const res = await updateMaterial(param);

        if (res.success) {
            await tagMaterial({
                tagCodeList: selTagCodeList,
                dataId: res.data,
            });
            message.success('修改成功');
            setVisible(false);
            queryMaterials();
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const showDeleteConfirm = (ids) => {
        confirm({
            title: '您确定删除此背景图吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteMaterials(ids);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const showAllDeleteConfirm = () => {
        confirm({
            title: '您确定删除所有背景图吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteMaterials(selectedRowKeys);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    //翻页
    const onPageChange = (current) => {
        setPagination({ ...pagination, current });
        setPageInfo({ ...pageInfo, page: current });
    };

    const onInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    const getSelTagCodeList = (selTagCodeList) => {
        const tag = selTagCodeList[selTagCodeList.length - 1]
            ? [selTagCodeList[selTagCodeList.length - 1]]
            : [];
        setSelTagCodeList(tag);
        queryMaterials({ tagCodeList: tag });
    };

    //获取标签列表
    const getTagTrees = async () => {
        const res = await getTagTree('MATERIAL');
        if (res.success) {
            const tagList = res.data.list;
            tagList.unshift({ name: '所有', select: true });
            setTagTree(tagList);
        }
    };

    useEffect(() => {
        getTagTrees();
    }, []);

    useEffect(() => {
        queryMaterials();
    }, [pageInfo]);

    return (
        <div className="material">
            <div className="search">
                <SearchTags
                    tagTree={tagTree}
                    getSelTagCodeList={getSelTagCodeList}
                    type="material"
                />
                <div className="searchTag">
                    <div className="leftHead">
                        <span className="label">名称：</span>
                        <Input
                            className="tagInputBox"
                            style={{ width: 200 }}
                            onChange={(value) => {
                                onInputChange(value);
                            }}
                        />
                    </div>
                    <div>
                        <Button
                            type="primary"
                            onClick={() => {
                                queryMaterials();
                            }}
                        >
                            搜索
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                setVisible(true);
                                setModalState('add');
                                setMaterialInfo(null);
                            }}
                        >
                            新增素材
                        </Button>
                        <CollectionCreateForm
                            tagTree={tagTree}
                            modalState={modalState}
                            materialInfo={materialInfo ? materialInfo : {}}
                            visible={visible}
                            onCreate={modalState === 'add' ? addMaterials : updateMaterials}
                            onCancel={() => {
                                setVisible(false);
                            }}
                        />
                        <Button onClick={showAllDeleteConfirm} type="primary">
                            批量删除
                        </Button>
                    </div>
                </div>
            </div>
            <div className="tableBox">
                <Table
                    rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
                    dataSource={materialList}
                    columns={columns}
                    pagination={false}
                />
                <div className="pageBox">
                    <Pagination
                        onChange={onPageChange}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                    />
                </div>
            </div>
        </div>
    );
};
export default Material;
