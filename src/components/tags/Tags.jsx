import React, { useEffect, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, Space, Modal, Table, message } from 'antd';
import { getTagTree, addTag, updateTag, deleteTag } from '../../service/tag';

const { Search } = Input;
const { confirm } = Modal;

const CollectionCreateForm = ({
    modalState,
    tagItemInfo,
    parentTag,
    visible,
    onCreate,
    onCancel,
}) => {
    const [name, setName] = useState('');
    const [enName, setEnName] = useState('');

    let title;
    if (modalState === 'add') {
        title = '新增标签';
    } else {
        title = '修改标签';
    }

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
        return result;
    };

    useEffect(() => {
        setName(tagItemInfo.name);
        setEnName(tagItemInfo.enName);
    }, [visible]);

    return (
        <Modal
            visible={visible}
            title={title}
            okText="确定"
            cancelText="取消"
            centered
            keyboard={true}
            onCancel={onCancel}
            onOk={() => {
                if (!verifier()) {
                    return;
                }
                const param = { name, enName, id: tagItemInfo.key };
                if (parentTag) {
                    param.parentId = parentTag.key;
                } else {
                    param.parentId = 0;
                }
                onCreate(param);
            }}
            width={800}
        >
            <div>
                {parentTag && (
                    <div className="addMaterialTag">
                        <span>父级:</span>
                        {parentTag.name}
                    </div>
                )}
                <div className="addMaterialTag">
                    <span>中文名:</span>
                    <Input
                        value={name}
                        style={{ width: 200 }}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </div>
                <div className="addMaterialTag">
                    <span>英文名:</span>
                    <Input
                        value={enName}
                        style={{ width: 200 }}
                        onChange={(e) => {
                            setEnName(e.target.value);
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
};

const Tags = ({ type }) => {
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalState, setModalState] = useState('add');
    const [tagItemInfo, setTagItemsInfo] = useState(null);
    const [parentTag, setParentTag] = useState(null);
    const [tagList, setTagList] = useState([]);

    const addTags = async (param) => {
        param = {
            ...param,
            orderNum: 1,
            type: type === 'product' ? 'PRODUCT' : 'MATERIAL',
        };
        const res = await addTag(param);

        if (res.success) {
            message.success('添加成功');
            setVisible(false);
            queryTag();
        }
    };

    const updateTags = async (param) => {
        param = [
            {
                ...param,
                orderNum: 1,
                type: type === 'product' ? 'PRODUCT' : 'MATERIAL',
            },
        ];

        const res = await updateTag(param);

        if (res.success) {
            message.success('修改成功');
            setVisible(false);
            queryTag();
        }
    };
    const queryTag = async () => {
        const res = await getTagTree(type === 'product' ? 'PRODUCT' : 'MATERIAL');
        if (res.success) {
            const { list } = res.data;
            const newList = [];
            list.forEach((item) => {
                const temp = {
                    key: item.id,
                    name: item.name,
                    enName: item.enName,
                    level: item.level,
                };
                if (item.childTags) {
                    const childTags = [];
                    item.childTags.forEach((item2) => {
                        const temp2 = {
                            key: item2.id,
                            name: item2.name,
                            enName: item2.enName,
                            level: item2.level,
                        };
                        if (item2.childTags) {
                            const childTags = [];
                            item2.childTags.forEach((item3) => {
                                const temp3 = {
                                    key: item3.id,
                                    name: item3.name,
                                    enName: item3.enName,
                                    level: item3.level,
                                };
                                if (item3.childTags) {
                                    const childTags = [];
                                    item3.childTags.forEach((item4) => {
                                        const temp4 = {
                                            key: item4.id,
                                            name: item4.name,
                                            enName: item4.enName,
                                            level: item4.level,
                                        };
                                        childTags.push(temp4);
                                    });
                                    temp3.childTags = childTags;
                                }
                                childTags.push(temp3);
                            });
                            temp2.childTags = childTags;
                        }
                        childTags.push(temp2);
                    });
                    temp.childTags = childTags;
                }
                newList.push(temp);
            });

            setTagList(newList);
        }
    };

    const deleteTags = async (ids) => {
        const res = await deleteTag(ids.join(','));
        if (res.success) {
            message.success('删除成功');
            queryTag();
        }
    };

    useEffect(() => {
        queryTag();
    }, []);

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const showDeleteConfirm = (ids) => {
        confirm({
            title: '您确定删除此标签吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteTags(ids);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };
    const showAllDeleteConfirm = () => {
        confirm({
            title: '您确定删除选中标签吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteTags(selectedRowKeys);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

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
            title: '操作',
            key: 'action',
            render: (item) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => {
                            setVisible(true);
                            setTagItemsInfo(item);
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
                    {item.level !== 3 && (
                        <>
                            /
                            <Button
                                type="primary"
                                onClick={() => {
                                    setVisible(true);
                                    setModalState('add');
                                    setParentTag(item);
                                    setTagItemsInfo(null);
                                }}
                            >
                                新增子标签
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const renderFourth = (item) => {
        return (
            <Table
                rowSelection={rowSelection}
                dataSource={item.childTags}
                columns={columns}
                pagination={false}
            />
        );
    };

    const renderThird = (item) => {
        return (
            <Table
                rowSelection={rowSelection}
                dataSource={item.childTags}
                columns={columns}
                pagination={false}
                expandable={{
                    expandedRowRender: type === 'product' ? renderFourth : false,
                }}
            />
        );
    };

    const renderSecond = (item) => {
        return (
            <Table
                rowSelection={rowSelection}
                dataSource={item.childTags}
                columns={columns}
                expandable={{
                    expandedRowRender: renderThird,
                }}
                pagination={false}
            />
        );
    };

    return (
        <div className="createTags">
            <div className="createFirstTags">
                <Button
                    type="primary"
                    onClick={() => {
                        setVisible(true);
                        setModalState('add');
                        setTagItemsInfo(null);
                        setParentTag(null);
                    }}
                >
                    新增一级标签
                </Button>
                <CollectionCreateForm
                    type={type}
                    modalState={modalState}
                    parentTag={parentTag}
                    tagItemInfo={tagItemInfo ? tagItemInfo : {}}
                    visible={visible}
                    onCreate={modalState === 'add' ? addTags : updateTags}
                    onCancel={() => {
                        setVisible(false);
                    }}
                />
                <Button
                    onClick={() => {
                        showAllDeleteConfirm();
                    }}
                    type="primary"
                >
                    批量删除
                </Button>
            </div>
            <div className="tableBox">
                <Table
                    rowSelection={rowSelection}
                    dataSource={tagList}
                    columns={columns}
                    pagination={{
                        defaultPageSize: 100,
                    }}
                    expandable={{
                        expandedRowRender: renderSecond,
                    }}
                />
            </div>
        </div>
    );
};
export default Tags;
