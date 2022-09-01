import React, { useEffect, useState } from 'react';
import { Table, Pagination, Button } from 'antd';
import { getDesignList } from '../../service/design.js';

const Design = () => {
    const PAGESIZE = 10;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); //选择的行号
    const [designList, setDesignList] = useState([]); //设计列表
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: PAGESIZE }); //查询列表翻页 参数
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGESIZE, total: 0 }); //翻页组件 参数
    const columns = [
        {
            title: '序号',
            dataIndex: 'key',
            key: 'key',
            width: 80,
        },
        {
            title: '产品ID',
            dataIndex: 'productId',
            key: 'productId',
            width: 80,
        },
        {
            title: '设计名称',
            dataIndex: 'designName',
            key: 'designName',
            width: 200,
        },
        {
            title: 'mockup',
            dataIndex: 'mockupImgList',
            key: 'mockupImgList',
            width: 800,
            render: (mockupImgList) => {
                return (
                    <div className="mockupWrap">
                        {mockupImgList.map((item, index) => {
                            return (
                                <img
                                    className="mockupImg"
                                    src={item.mockupImgUrl}
                                    key={index}
                                ></img>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: '生成状态',
            dataIndex: 'resultStatus',
            key: 'resultStatus',
            width: 200,
        },
        {
            title: '生成进度',
            dataIndex: 'mergeStatus',
            key: 'mergeStatus',
            width: 200,
        },
        {
            title: '操作',
            dataIndex: 'mergeImage',
            key: 'mergeImage',
            render: (_, line) => {
                return (
                    line.mergeImage && (
                        <>
                            <Button
                                onClick={() => {
                                    window.open(line.mergeImage);
                                }}
                            >
                                下载生产大图
                            </Button>
                            <Button
                                onClick={() => {
                                    let url;
                                    if (process.env.NODE_ENV === 'production') {
                                        url = `${window.location.protocol}//${window.location.hostname}:8089?id=${line.productId}&designId=${line.id}`;
                                    } else {
                                        url = `${window.location.protocol}//${window.location.hostname}:9000?id=${line.productId}&designId=${line.id}`;
                                    }
                                    window.open(url);
                                }}
                            >
                                编辑设计
                            </Button>
                        </>
                    )
                );
            },
        },
    ];

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    //查询背景图列表
    const queryDesignList = async () => {
        let data = {
            ...pageInfo,
        };

        const mergeStatus = {
            0: '程序中未捕获的错误',
            1: '成功',
            2: '某张图片下载失败，可从message中查看下载错误链接 ',
            3: 'PSD文件下载失败，可从message中查看下载错误链接',
            4: '没有任何一个PSD文件图层名和json配置信息中name字段相同，即所有json_data[“designInfoList”][X][“name”] X=0,1,2.. 在PSD中找不到对应图层',
            5: 'PSD文件解析失败(可能是PSD文件数据存在问题)  ',
            6: '生成PSD时出错(可能是图片太大爆内存了，需要修改imagemagick的配置文件来扩大内存限制，或者合成过程中的临时图片文件不存在导致的)',
            7: 'OSS上传时出错(估计和网络有关，或者OSS那边有关) ',
        };

        const resultStatus = {
            1: '待合成，待发送任务',
            2: '发送任务，调用失败',
            3: '合成中，已发送任务 ',
            4: '合成成功，已回调',
            5: '合成失败，已回调[“designInfoList”][X][“name”] X=0,1,2.. 在PSD中找不到对应图层',
        };
        const res = await getDesignList(data);
        if (res.success) {
            const { list, total } = res.data;
            const newList = [];
            if (list) {
                list.forEach((item, key) => {
                    const temp = {
                        ...item,
                        key: item.id,
                        mergeStatus: mergeStatus[item.mergeStatus],
                        resultStatus: resultStatus[item.resultStatus],
                    };
                    newList.push(temp);
                });
            }
            setPagination({ ...pagination, total });
            setDesignList(newList);
        }
    };

    //翻页
    const onPageChange = (current) => {
        setPagination({ ...pagination, current });
        setPageInfo({ ...pageInfo, page: current });
    };

    //监听场景类型（backgroundType），翻页信息（pageInfo），这两个变量更新自动刷新列表
    useEffect(() => {
        queryDesignList();
    }, [pageInfo]);

    return (
        <div className="design">
            <div className="tableBox">
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                    dataSource={designList}
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
export default Design;
