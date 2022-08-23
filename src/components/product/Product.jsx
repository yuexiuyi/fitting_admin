import React, { useState, useEffect } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, Space, Modal, Table, message, Pagination } from 'antd';
import {
    getProduct,
    deleteProduct,
    addProduct,
    updateProduct,
    tagProduct,
    offShelf,
    onShelf,
} from '../../service/product.js';
import SearchTags from '../searchTags/SearchTags.jsx';
import { getTagTree } from '../../service/tag.js';
import ProductModal from '../productModal/ProductModal.jsx';

const { confirm } = Modal;

const Product = () => {
    const PAGESIZE = 10;
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalState, setModalState] = useState('add');
    const [productInfo, setProductInfo] = useState(null);
    const [productList, setProductList] = useState([]);
    const [selTagCodeList, setSelTagCodeList] = useState([]); //标签参数
    const [tagTree, setTagTree] = useState(null); //标签参数
    const [tagCode, setTagCode] = useState(null); //标签参数
    const [searchValue, setSearchValue] = useState();
    const [size, setSize] = useState([]);
    const [fabric, setFabric] = useState(null);
    const [proTime, setProTime] = useState(null);

    const [pageInfo, setPageInfo] = useState({ page: 1, limit: PAGESIZE });
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGESIZE, total: 0 });

    const columns = [
        {
            title: '序号',
            dataIndex: 'key',
            key: 'key',
            width: 30,
            render: (text) => {
                return (
                    <div src={text} style={{ width: 30 }}>
                        {text}
                    </div>
                );
            },
        },
        {
            title: '中文名',
            dataIndex: 'name',
            key: 'name',
            width: 50,
            render: (text) => {
                return (
                    <div src={text} style={{ width: 50 }}>
                        {text}
                    </div>
                );
            },
        },

        {
            title: '英文名',
            dataIndex: 'enName',
            key: 'enName',
            width: 50,
            render: (text) => {
                return (
                    <div src={text} style={{ width: 50 }}>
                        {text}
                    </div>
                );
            },
        },
        {
            title: '类别',
            dataIndex: 'tagList',
            key: 'tagList',
            width: 120,
            render: (tagListItem) => {
                const oneItem = tagListItem && tagListItem[0] ? tagListItem[0] : { name: '' };
                const twoItem =
                    oneItem.name && oneItem.childTags && oneItem.childTags[0]
                        ? oneItem.childTags[0]
                        : { name: '' };

                const threeItem =
                    oneItem.name && twoItem.name && twoItem.childTags[0]
                        ? twoItem.childTags[0]
                        : { name: '' };

                return (
                    <div className="tagBox">
                        {oneItem.name} {twoItem.name} {threeItem.name}
                    </div>
                );
            },
        },
        {
            title: '图片',
            dataIndex: 'img',
            key: 'img',
            width: 100,
            render: (text) => {
                return text && <img src={text} style={{ width: 100, height: 100 }} />;
            },
        },
        {
            title: '面料',
            dataIndex: 'fabricList',
            key: 'fabricList',
            width: 70,
            render: (fabric) => {
                return <div style={{ width: 70 }}>{fabric.name}</div>;
            },
        },
        {
            title: '生产时间',
            dataIndex: 'proTime',
            key: 'proTime',
            width: 60,
            render: (proTime) => {
                return <div style={{ width: 60 }}>{proTime.name}</div>;
            },
        },
        {
            title: '价格',
            dataIndex: 'priceItem',
            key: 'priceItem',
            width: 150,
            render: (priceItem) => (
                <div className="priceItemBox">
                    <span>单价：{priceItem.price}</span>
                    {priceItem.list &&
                        priceItem.list.map((item, index) => {
                            return (
                                <span key={index}>
                                    {item.minCount}-{item.maxCount}
                                    {item.countUnit}：{item.price}
                                    {item.priceUnit}
                                </span>
                            );
                        })}
                </div>
            ),
        },
        {
            title: '重量',
            dataIndex: 'weight',
            key: 'weight',
            width: 50,
            render: (text) => {
                return (
                    <div src={text} style={{ width: 50 }}>
                        {text}KG
                    </div>
                );
            },
        },
        {
            title: '尺码',
            dataIndex: 'sizeList',
            key: 'sizeList',
            width: 100,
            render: (sizeList) => {
                return (
                    <div style={{ width: 100 }}>
                        {sizeList.map((item, index) => {
                            const space = index === sizeList.length - 1 ? '' : '/';
                            return item.name + space;
                        })}
                    </div>
                );
            },
        },
        {
            title: '颜色',
            dataIndex: 'color',
            key: 'color',
            width: 50,
            render: (colorItem) => (
                <div className="colorList">
                    {colorItem.map((item, index) => {
                        return (
                            <div key={index} style={{ backgroundColor: item }}>
                                {' '}
                            </div>
                        );
                    })}
                </div>
            ),
        },
        {
            title: 'MockUp解析状态',
            dataIndex: 'modelPsdState',
            key: 'modelPsdState',
            width: 100,
            render: (state) => (
                <div>
                    {state === 1 && '待解析'}
                    {state === 2 && '解析中'}
                    {state === 3 && '解析成功'}
                    {state === 4 && '解析失败'}
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (item) => (
                <div style={{ width: 225 }}>
                    <Space size="middle">
                        <Button
                            type="primary"
                            onClick={() => {
                                setVisible(true);
                                setProductInfo(item);
                                setModalState('edit');
                            }}
                        >
                            修改
                        </Button>
                        <Button
                            onClick={() => {
                                showDeleteConfirm([item.key]);
                            }}
                            type="primary"
                        >
                            删除
                        </Button>
                        <Button
                            onClick={() => {
                                item.onShelf ? offShelfPro([item.key]) : onShelfPro([item.key]);
                            }}
                            type="primary"
                        >
                            {item.onShelf ? '下架' : '上架'}
                        </Button>
                    </Space>
                </div>
            ),
        },
    ];

    const queryProduct = async (param) => {
        let data = {
            ...pageInfo,
            keyWord: searchValue,
            tagCodeList: selTagCodeList,
            ...param,
        };
        const res = await getProduct(data);
        if (res.success) {
            const { list, total } = res.data;
            const newList = [];
            if (list) {
                list.forEach((item) => {
                    let tagList = [];
                    let fabricList = {};
                    let sizeList = [];
                    let proTime = {};

                    item.tagList &&
                        item.tagList.map((tagItem) => {
                            if (tagItem.name == '类别') {
                                tagList = tagItem.childTags;
                            }
                            if (tagItem.name == '面料') {
                                fabricList = tagItem.childTags[0];
                            }
                            if (tagItem.name == '尺码') {
                                sizeList = tagItem.childTags;
                            }

                            if (tagItem.name == '生产时间') {
                                proTime = tagItem.childTags[0];
                            }
                        });

                    const temp = {
                        ...item,
                        key: item.id,
                        tagList,
                        priceItem: {
                            price: item.price,
                            list: item.wholesaleRuleList,
                        },
                        fabricList,
                        filePieceList: item.pieceImgList,
                        proTime,
                        color: item.colorList ? item.colorList : [],
                        sizeList,
                    };

                    newList.push(temp);
                });
            }

            setPagination({ ...pagination, total });
            setProductList(newList);
        }
    };

    const deleteProducts = async (ids) => {
        const res = await deleteProduct(ids.join(','));
        if (res.success) {
            message.success('删除成功');
            queryProduct();
        }
    };

    const addProducts = async (param) => {
        param = {
            ...param,
        };
        const res = await addProduct(param);
        if (res.success) {
            setVisible(false);
            if (param.pieceList) {
                param.pieceList.map((item) => {
                    item.productId = res.data;
                });
                await updateProduct({ ...param, id: res.data });
            }
            //打标签
            await tagProduct({
                tagCodeList: param.selTagCodeList,
                dataId: res.data,
            });
            message.success('添加成功');

            queryProduct();
        }
    };

    const updateProducts = async (param) => {
        param = {
            id: productInfo.key,
            ...param,
        };

        const res = await updateProduct(param);

        if (res.success) {
            //打标签
            await tagProduct({
                tagCodeList: param.selTagCodeList,
                dataId: productInfo.key,
            });
            message.success('修改成功');
            setVisible(false);
            queryProduct();
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const showDeleteConfirm = (ids) => {
        confirm({
            title: '您确定删除此产品吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteProducts(ids);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const showAllDeleteConfirm = () => {
        confirm({
            title: '您确定删除选中产品吗？',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteProducts(selectedRowKeys);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const onPageChange = (current) => {
        setPagination({ ...pagination, current });
        setPageInfo({ ...pageInfo, page: current });
    };

    const getSelTagCodeList = (selTagCodeList) => {
        const tag = selTagCodeList[selTagCodeList.length - 1]
            ? [selTagCodeList[selTagCodeList.length - 1]]
            : [];
        setSelTagCodeList(tag);
        queryProduct({ tagCodeList: tag });
    };

    //获取标签列表
    const getTagTrees = async () => {
        const res = await getTagTree('PRODUCT');
        if (res.success) {
            res.data.list.map((item) => {
                if (item.name === '类别') {
                    const tagTree = item.childTags;
                    const tagCode = item.code;
                    setTagTree(tagTree);
                    setTagCode(tagCode);
                }

                if (item.name === '尺码') {
                    setSize(item);
                }

                if (item.name === '面料') {
                    setFabric(item);
                }

                if (item.name === '生产时间') {
                    setProTime(item);
                }
            });
        }
    };

    const offShelfPro = async (ids) => {
        const res = await offShelf(ids.join(','));
        if (res.success) {
            queryProduct();
        }
    };

    const onShelfPro = async (ids) => {
        const res = await onShelf(ids.join(','));
        if (res.success) {
            queryProduct();
        }
    };

    useEffect(() => {
        getTagTrees();
    }, []);

    useEffect(() => {
        queryProduct();
    }, [pageInfo]);

    const onInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    return (
        <div className="product">
            <div className="search">
                <SearchTags tagTree={tagTree} getSelTagCodeList={getSelTagCodeList} />
                <div className="searchTag">
                    <div>
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
                                queryProduct();
                            }}
                        >
                            搜索
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                setVisible(true);
                                setModalState('add');
                                setProductInfo(null);
                            }}
                        >
                            新增产品
                        </Button>
                        <ProductModal
                            tagCode={tagCode}
                            tagTree={tagTree}
                            size={size}
                            fabric={fabric}
                            proTime={proTime}
                            modalState={modalState}
                            productInfo={productInfo ? productInfo : {}}
                            visible={visible}
                            onCreate={modalState === 'add' ? addProducts : updateProducts}
                            onCancel={() => {
                                setVisible(false);
                            }}
                        />
                        <Button onClick={showAllDeleteConfirm} type="primary">
                            批量删除
                        </Button>
                        <Button
                            onClick={() => {
                                onShelfPro(selectedRowKeys);
                            }}
                            type="primary"
                        >
                            批量上架
                        </Button>
                        <Button
                            onClick={() => {
                                offShelfPro(selectedRowKeys);
                            }}
                            type="primary"
                        >
                            批量下架
                        </Button>
                    </div>
                </div>
            </div>
            <div className="tableBox">
                <Table
                    bordered
                    rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
                    dataSource={productList}
                    columns={columns}
                    pagination={false}
                    scroll={{ x: 1500 }}
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
export default Product;
