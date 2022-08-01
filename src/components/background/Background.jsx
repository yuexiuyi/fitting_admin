import React, { useEffect, useState, useRef } from 'react';
import { DownOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
    Button,
    Input,
    Space,
    Radio,
    Upload,
    Modal,
    Table,
    Dropdown,
    Menu,
    message,
    Pagination,
} from 'antd';
import {
    getBackgroundTree,
    deleteBackground,
    addBackground,
    updateBackground,
} from '../../service/background.js';
import { getPolicy } from '../../service/util.js';

const { confirm } = Modal;

const MAXUPLOADSIZE = 100 * 1000 * 1000;

const CollectionCreateForm = ({ modalState, backgroundInfo, visible, onCreate, onCancel }) => {
    const [name, setName] = useState(''); //中文名
    const [enName, setEnName] = useState(''); //英文名
    const [type, setType] = useState(''); //场景
    const [img, setImg] = useState(''); //已上传图片地址
    const [fileList, setFileList] = useState([]); //已上传图片地址
    const uploadData = useRef({}); //上传数据
    const doneFile = useRef({});

    //校验
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
        if (!type) {
            message.error('类型不能为空');
            result = false;
        }
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
            setName(backgroundInfo.name);
            setEnName(backgroundInfo.enName);
            setType(backgroundInfo.scene === '室内' ? 'Indoor' : 'Outdoor');
            setFileList([{ uid: backgroundInfo.key, url: backgroundInfo.picture }]);
            setImg(backgroundInfo.picture);
        } else {
            setName('');
            setEnName('');
            setType('');
            setFileList([]);
            setImg('');
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            title={modalState === 'add' ? '新增背景图' : '修改背景图'}
            okText="确定"
            cancelText="取消"
            onCancel={onCancel}
            onOk={() => {
                if (!verifier()) {
                    return;
                }
                onCreate({ name, enName, type, id: backgroundInfo.key, img });
            }}
            width={800}
        >
            <div className="addImgBox">
                <div className="addName">
                    <div>中文名:</div>
                    <Input
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </div>
                <div className="addName">
                    <div>英文名:</div>
                    <Input
                        value={enName}
                        onChange={(e) => {
                            setEnName(e.target.value);
                        }}
                    />
                </div>
                <div className="addScene">
                    <div>场景: </div>
                    <Radio.Group
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                        }}
                    >
                        <Radio value="Indoor">室内</Radio>
                        <Radio value="Outdoor">室外</Radio>
                    </Radio.Group>
                </div>
                <div className="addImg">
                    <div>上传图片:</div>
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

const Background = () => {
    const PAGESIZE = 10;
    const [visible, setVisible] = useState(false); //新增/修改弹窗显示
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); //选择的行号
    const [backgroundType, setBackgroundType] = useState('全部'); //场景类别
    const [modalState, setModalState] = useState('add'); //弹框类型 add新增 edit修改
    const [backgroundInfo, setBackgroundInfo] = useState(null); //传入到修改弹框 背景图参数
    const [backgroundList, setBackgroundList] = useState([]); //背景图列表
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: PAGESIZE }); //查询列表翻页 参数
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGESIZE, total: 0 }); //翻页组件 参数
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
            title: '图片',
            dataIndex: 'picture',
            key: 'picture',
            render: (text) => {
                return <img src={text} style={{ width: 75, height: 75 }} />;
            },
        },
        {
            title: '场景',
            dataIndex: 'scene',
            key: 'scene',
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
                            setBackgroundInfo(item);
                            console.log(item);
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

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    //查询背景图列表
    const queryBackgroundTree = async () => {
        let data;

        if (backgroundType === '全部') {
            data = {
                ...pageInfo,
            };
        } else {
            data = {
                type: backgroundType === '室内' ? 'Indoor' : 'Outdoor',
                ...pageInfo,
            };
        }
        const res = await getBackgroundTree(data);
        if (res.success) {
            const { list, total } = res.data;
            const newList = [];
            if (list) {
                list.forEach((item) => {
                    const temp = {
                        key: item.id,
                        name: item.name,
                        enName: item.enName,
                        picture: item.img,
                        scene: item.type === 'Indoor' ? '室内' : '室外',
                    };
                    newList.push(temp);
                });
            }
            setPagination({ ...pagination, total });
            setBackgroundList(newList);
        }
    };

    //删除背景图
    const deleteBackgrounds = async (ids) => {
        const res = await deleteBackground(ids.join(','));
        if (res.success) {
            message.success('删除成功');
            setBackgroundType('全部');
            queryBackgroundTree();
        }
    };

    //添加背景图
    const addBackgrounds = async (param) => {
        param = {
            ...param,
        };
        console.log(param);
        const res = await addBackground(param);
        if (res.success) {
            message.success('添加成功');
            setVisible(false);
            setBackgroundType('全部');
            queryBackgroundTree();
        }
    };

    //修改背景图
    const updateBackgrounds = async (param) => {
        param = [
            {
                ...param,
            },
        ];

        const res = await updateBackground(param);

        if (res.success) {
            message.success('修改成功');
            setVisible(false);
            queryBackgroundTree();
        }
    };

    //删除单个确认弹框
    const showDeleteConfirm = (ids) => {
        confirm({
            title: '您确定删除此背景图吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteBackgrounds(ids);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    //删除所有确认弹框
    const showAllDeleteConfirm = () => {
        confirm({
            title: '您确定删除所有背景图吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteBackgrounds(selectedRowKeys);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    //筛选场景
    const handleMenuClick = (e) => {
        setBackgroundType(e.key);
        setPageInfo({ ...pageInfo, page: 1 });
        setPagination({ ...pagination, current: 1 });
    };

    //翻页
    const onPageChange = (current) => {
        setPagination({ ...pagination, current });
        setPageInfo({ ...pageInfo, page: current });
    };

    //监听场景类型（backgroundType），翻页信息（pageInfo），这两个变量更新自动刷新列表
    useEffect(() => {
        queryBackgroundTree();
    }, [backgroundType, pageInfo]);

    const renderMenu = () => {
        return (
            <Menu onClick={handleMenuClick}>
                <Menu.Item key="全部">全部</Menu.Item>
                <Menu.Item key="室内">室内</Menu.Item>
                <Menu.Item key="室外">室外</Menu.Item>
            </Menu>
        );
    };

    return (
        <div className="background">
            <div className="searchHead">
                <div>
                    <span className="type">场景:</span>
                    <Dropdown overlay={renderMenu}>
                        <Button>
                            <Space>
                                {backgroundType}
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
                <div>
                    <Button
                        type="primary"
                        onClick={() => {
                            setVisible(true);
                            setModalState('add');
                            setBackgroundInfo(null);
                        }}
                    >
                        新增背景图
                    </Button>
                    <CollectionCreateForm
                        modalState={modalState}
                        backgroundInfo={backgroundInfo ? backgroundInfo : {}}
                        visible={visible}
                        onCreate={modalState === 'add' ? addBackgrounds : updateBackgrounds}
                        onCancel={() => {
                            setVisible(false);
                        }}
                    />
                    <Button onClick={showAllDeleteConfirm} type="primary">
                        批量删除
                    </Button>
                </div>
            </div>
            <div className="tableBox">
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                    dataSource={backgroundList}
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
export default Background;
