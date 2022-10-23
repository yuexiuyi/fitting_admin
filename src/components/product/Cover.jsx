import React, { useEffect, useState, useRef } from 'react';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Space, Upload, Modal, Table, message, Pagination } from 'antd';
import { getCover, deleteCover, addCover } from '../../service/product.js';
import { getPolicy } from '../../service/util.js';
import { uploadOss } from '../../utils/index.js';

const { confirm } = Modal;
const MAXUPLOADSIZE = 100 * 1000 * 1000;

const CollectionCreateForm = ({ modalState, materialInfo, visible, onCreate, onCancel }) => {
    const [img, setImg] = useState('');
    const [format, setFormat] = useState('');
    const [width, setWidth] = useState('');
    const [size, setSize] = useState('');
    const [height, setHeight] = useState('');
    const [fileList, setFileList] = useState([]); //已上传图片地址
    const uploadData = useRef({}); //上传数据
    const doneFile = useRef({});

    const verifier = () => {
        let result = true;
        if (!img) {
            message.error('上传图片不能为空');
            result = false;
        }
        return result;
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
            setImg(materialInfo.picture);
            setFileList([{ uid: materialInfo.key, url: materialInfo.picture }]);
        } else {
            setImg('');
            setFileList([]);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            title={modalState === 'add' ? '新增遮罩' : '修改遮罩'}
            okText="确定"
            cancelText="取消"
            onCancel={onCancel}
            onOk={() => {
                if (!verifier()) {
                    return;
                }
                onCreate({
                    id: materialInfo.key,
                    imgUrl: img,
                    size,
                    format,
                    width,
                    height,
                });
            }}
            width={1200}
        >
            <div className="content">
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

                                        const img = new Image();
                                        img.onload = async () => {
                                            const width = img.width;
                                            const height = img.height;
                                            setWidth(width);
                                            setHeight(height);
                                        };
                                        img.src = imgUrl;
                                        setSize(item.size);
                                        setFormat(ext);
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

const Cover = () => {
    const PAGESIZE = 10;
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalState, setModalState] = useState('add');
    const [materialInfo, setMaterialInfo] = useState(null);
    const [materialList, setMaterialList] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: PAGESIZE }); //查询列表翻页 参数
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGESIZE, total: 0 }); //翻页组件 参数
    const uploadBtn = useRef({});

    const columns = [
        {
            title: '序号',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: '图片',
            dataIndex: 'picture',
            key: 'picture',
            render: (text) => {
                return (
                    <img
                        className="pictureWrap"
                        src={text}
                        style={{ width: 75, height: 75 }}
                        alt=""
                    />
                );
            },
        },
        {
            title: '图片信息',
            dataIndex: 'imgInfo',
            key: 'imgInfo',
            render: (imgInfo) => (
                <div className="imgInfoBox">
                    <span>文件大小：{imgInfo.size}</span>
                    <span>文件宽高：{imgInfo.width + '*' + imgInfo.height}</span>
                    <span>文件格式：{imgInfo.format}</span>
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (item) => (
                <Space size="middle">
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

    const queryCover = async (param) => {
        let data = {
            source: 'SYS_UPLOAD',
            ...param,
            ...pageInfo,
        };

        const res = await getCover(data);
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
                            size: (item.size / 1024).toFixed(1) + 'KB',
                            format: item.format,
                            height: item.height,
                            width: item.width,
                            createTime: item.createTime,
                        },
                        picture: item.imgUrl,
                        tagList: item.tagList,
                    };
                    newList.push(temp);
                });
            }
            setPagination({ ...pagination, total });
            setMaterialList(newList);
        }
    };

    const deleteCovers = async (ids) => {
        const res = await deleteCover(ids.join(','));
        if (res.success) {
            message.success('删除成功');
            queryCover();
        }
    };

    const addCovers = async (param) => {
        param = [
            {
                name: '遮罩',
                ...param,
            },
        ];
        const res = await addCover(param);
        if (res.success) {
            setVisible(false);

            message.success('添加成功');
            queryCover();
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const showDeleteConfirm = (ids) => {
        confirm({
            title: '您确定删除此遮罩吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteCovers(ids);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const showAllDeleteConfirm = () => {
        confirm({
            title: '您确定删除选中遮罩吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteCovers(selectedRowKeys);
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

    useEffect(() => {
        queryCover();
    }, [pageInfo]);

    const uploadList = () => {
        const materialsList = [];
        const list = uploadBtn.current.files;
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const reader = new FileReader();
            reader.readAsDataURL(item);
            reader.onload = async function (e) {
                const dataUrl = this.result;
                const imgUrl = await uploadOss(dataUrl);
                const name = item.name.split('.')[0];
                const format = item.name.split('.')[1];
                const size = item.size;
                const img = new Image();
                img.src = imgUrl;
                img.onload = async () => {
                    const width = img.width;
                    const height = img.height;
                    materialsList[i] = {
                        source: 'SYS_UPLOAD',
                        imgUrl,
                        name,
                        enName: name,
                        size,
                        format,
                        width,
                        height,
                    };

                    const res = await addCover(materialsList[i]);
                    if (res.success) {
                        message.success(name + '添加成功');
                        queryCover();
                    }
                };
            };
        }
    };

    return (
        <div className="material">
            <div className="search">
                <div className="searchTag">
                    <div>
                        <input
                            className="uploadInput"
                            ref={uploadBtn}
                            type="file"
                            multiple
                            onChange={() => {
                                uploadList();
                            }}
                        />
                        <Button
                            type="primary"
                            onClick={() => {
                                setVisible(true);
                                setModalState('add');
                                setMaterialInfo(null);
                            }}
                        >
                            新增遮罩
                        </Button>
                        <CollectionCreateForm
                            modalState={modalState}
                            materialInfo={materialInfo ? materialInfo : {}}
                            visible={visible}
                            onCreate={addCovers}
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
export default Cover;
