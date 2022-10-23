import React, { useState, useEffect, useRef } from 'react';
import {
    DownOutlined,
    PlusOutlined,
    UploadOutlined,
    CloseCircleOutlined,
    StarOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { Button, Input, Space, Upload, Modal, Dropdown, message, Menu, Checkbox } from 'antd';
import { getPolicy } from '../../service/util.js';
import SearchTags from '../searchTags/SearchTags.jsx';
import { SketchPicker } from 'react-color';
import { uploadOss } from '../../utils/index.js';

const MAXUPLOADSIZE = 100 * 1000 * 1000;

const ProductModal = ({
    modalState,
    productInfo,
    visible,
    onCreate,
    onCancel,
    tagCode,
    tagTree,
    size,
    fabric,
    proTime,
}) => {
    const [name, setName] = useState(''); //中文名
    const [enName, setEnName] = useState(''); //英文名
    const [weight, setWeight] = useState(''); //重量
    const [mode, setMode] = useState(false); //重量

    const [selFabric, setSelFabric] = useState({}); //选中面料
    const [selProTime, setSelProTime] = useState(''); //选中生产文件

    const [selColor, setSelColor] = useState(''); //当前选中颜色
    const [selColorList, setSelColorList] = useState([]); //选中颜色列表
    const [colorVisible, setColorVisible] = useState(false); //颜色选择框展示

    const [selSizeList, setSelSizeList] = useState([]); //选中尺码列表
    const [sizeVisible, setSizeVisible] = useState(false); //尺码选择框展示

    const [price, setPrice] = useState(''); //单价
    const [lessPrice, setLessPrice] = useState(''); //1-9价格
    const [mediumPrice, setMediumPrice] = useState(''); //10-49价格
    const [morePrice, setMorePrice] = useState(''); //50+价格

    const [editTagCodeList, setEditTagCodeList] = useState([]); //修改模式标签参数
    const [selTagCodeList, setSelTagCodeList] = useState([]); //选择标签参数
    const [hasChild, setHasChild] = useState(true); //当前选中标签 ，是否存在子标签

    const [imgList, setImgList] = useState([]); //主图Upload组件参数
    const uploadImg = useRef({}); //主图上传数据

    const [hoverImgList, setHoverImgList] = useState([]); //样图Upload组件参数
    const uploadHoverImg = useRef({}); //样图上传数据

    const [frontImgList, setFrontImgList] = useState([]); //样图Upload组件参数
    const uploadFrontImg = useRef({}); //样图上传数据

    const [backImgList, setBackImgList] = useState([]); //样图Upload组件参数
    const uploadBackImg = useRef({}); //样图上传数据

    const [file2DList, setFile2DList] = useState([]); //2D psd Upload组件参数
    const uploadFile2DList = useRef({}); //2D psd 上传数据

    const [file3DList, setFile3DList] = useState([]); //3DUpload组件参数
    const uploadFile3DList = useRef({}); //上传数据

    const [fileProList, setFileProList] = useState([]); //生产文件Upload组件参数
    const [count, setCount] = useState(0); //生产文件Upload组件参数

    const [filePieceList, setFilePieceList] = useState([]); //切片Upload组件参数
    const uploadFilePieceList = useRef({}); //上传数据
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

        if (hasChild) {
            message.error('请选择标签');
            result = false;
        }

        if (!price) {
            message.error('单价不能为空');
            result = false;
        }

        if (!weight) {
            message.error('重量不能为空');
            result = false;
        }

        if (!lessPrice) {
            message.error('1-9件价格不能为空');
            result = false;
        }

        if (!mediumPrice) {
            message.error('10-49件价格不能为空');
            result = false;
        }

        if (!morePrice) {
            message.error('50+件价格不能为空');
            result = false;
        }
        if (!imgList[0] || !imgList[0].url) {
            message.error('封面不能为空');
            result = false;
        }

        if (!hoverImgList[0] || !hoverImgList[0].url) {
            message.error('样图不能为空');
            result = false;
        }

        if (mode) {
            if (!frontImgList[0] || !frontImgList[0].url) {
                message.error('正面不能为空');
                result = false;
            }

            if (!backImgList[0] || !backImgList[0].url) {
                message.error('反面不能为空');
                result = false;
            }
        } else {
            if (!filePieceList[0] || !filePieceList[0].url) {
                message.error('切片不能为空');
                result = false;
            }

            if (!file3DList[0] || !file3DList[0].url) {
                message.error('3D模特不能为空');
                result = false;
            }

            if (!file2DList[0] || !file2DList[0].url) {
                message.error('2D模特不能为空');
                result = false;
            }

            if (selColorList.length === 0) {
                message.error('颜色不能为空');
                result = false;
            }

            if (!fileProList || !fileProList.length) {
                message.error('生产文件不能为空');
                result = false;
            }

            fileProList.forEach((item) => {
                if (!item || !item.url) {
                    message.error('生产文件不能为空');
                    result = false;
                }
            });
        }

        return result;
    };

    const getSelTagCodeList = (selTagCodeList, hasChild) => {
        setSelTagCodeList(selTagCodeList);
        setHasChild(hasChild);
    };

    // 获取阿里云密钥信息
    const getOssPolify = async ({ file, uploadImg }) => {
        const res = await getPolicy();
        let data = {};
        if (res.success) {
            data = res.data;
            const ext = file.type.split('/')[1];
            Object.assign(uploadImg.current, {
                uid: data.uuid,
                host: data.host,
                dir: data.dir,
                name: `${file.name}`,
                key: `${data.dir}/${data.uuid}.${ext}`,
                policy: data.policy,
                OSSAccessKeyId: data.accessId,
                signature: data.signature,
                fileName: `${data.uuid}.${ext}`,
            });
        }
        return data.host;
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </div>
    );

    useEffect(() => {
        if (modalState === 'edit') {
            if (productInfo.priceItem) {
                setPrice(productInfo.priceItem.price);
                if (productInfo.priceItem.list) {
                    const lessPrice = [
                        productInfo.priceItem.list.map((item) => {
                            return item.price;
                        }),
                    ];
                    const lessPrice1 = lessPrice[0];
                    setLessPrice(lessPrice1[0]);
                    setMediumPrice(lessPrice1[1]);
                    setMorePrice(lessPrice1[2]);
                }
            }

            if (productInfo.tagList) {
                const oneItem =
                    productInfo.tagList && productInfo.tagList[0]
                        ? productInfo.tagList[0]
                        : { code: '' };
                const twoItem =
                    oneItem.code && oneItem.childTags && oneItem.childTags[0]
                        ? oneItem.childTags[0]
                        : { code: '' };
                const threeItem =
                    oneItem.code && twoItem.code && twoItem.childTags[0]
                        ? twoItem.childTags[0]
                        : { code: '' };

                const codeList = [oneItem.code, twoItem.code, threeItem.code];

                setEditTagCodeList(codeList);
            }
            if (productInfo.img) {
                setImgList([{ uid: productInfo.key, url: productInfo.img }]);
            }

            if (productInfo.hoverImg) {
                setHoverImgList([{ uid: productInfo.key, url: productInfo.hoverImg }]);
            }

            if (productInfo.modelPsdImg) {
                setFile2DList([{ uid: productInfo.key, url: productInfo.modelPsdImg }]);
            }

            if (productInfo.model3dImg) {
                setFile3DList([{ uid: productInfo.key, url: productInfo.model3dImg }]);
            }

            if (productInfo.prodPsdImg) {
                setFileProList(productInfo.prodPsdImg);
            }

            if (productInfo.clothPsdImg) {
                setFilePieceList([{ uid: productInfo.key, url: productInfo.clothPsdImg }]);
            }

            if (productInfo.backImg) {
                setBackImgList([{ uid: productInfo.key, url: productInfo.backImg }]);
            }

            if (productInfo.frontImg) {
                setFrontImgList([{ uid: productInfo.key, url: productInfo.frontImg }]);
            }

            setName(productInfo.name);
            setEnName(productInfo.enName);
            setSelSizeList(productInfo.sizeList);
            setSelFabric(productInfo.fabricList);
            setSelProTime(productInfo.proTime);
            setWeight(productInfo.weight);
            setMode(productInfo.mode);
            setSelColorList(productInfo.color);
        } else {
            setName('');
            setEnName('');
            setSelSizeList([]);
            setSelFabric({});
            setSelProTime('');
            setWeight('');
            setPrice('');
            setLessPrice('');
            setMediumPrice('');
            setMorePrice('');
            setSelColorList([]);
            setEditTagCodeList([]);
            setMode(false);
            setImgList([]);
            setBackImgList([]);
            setFrontImgList([]);
            setHoverImgList([]);
            setFile2DList([]);
            setFile3DList([]);
            setFileProList([]);
        }
    }, [visible, size, fabric, proTime]);

    const inputStyle = { width: 240 };
    const inputPieceStyle = { width: 240, height: 24, marginRight: 10 };

    const onFabricChange = (e) => {
        setSelFabric({
            code: e.key,
            name: e.item.props.label,
        });
    };

    const fabricMenu = () => {
        return (
            <Menu onClick={onFabricChange}>
                {fabric.childTags.map((item) => {
                    return (
                        <Menu.Item label={item.name} key={item.code}>
                            {item.name}
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    };

    const onProTimeChange = (e) => {
        setSelProTime({
            code: e.key,
            name: e.item.props.label,
        });
    };

    const proTimeMenu = () => {
        return (
            <Menu onClick={onProTimeChange}>
                {proTime.childTags.map((item) => {
                    return (
                        <Menu.Item label={item.name} key={item.code}>
                            {item.name}
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    };

    const onSizeChange = (selSizeList) => {
        setSelSizeList(selSizeList);
    };

    const sizeMenu = () => {
        return (
            <div className="sizeBox">
                <Checkbox.Group onChange={onSizeChange}>
                    {size.childTags.map((item, index) => {
                        return (
                            <Checkbox value={item} key={index}>
                                {item.name}
                            </Checkbox>
                        );
                    })}
                </Checkbox.Group>
            </div>
        );
    };

    const colorPick = () => {
        return (
            <div className="colorPickBox">
                <SketchPicker
                    color={selColor}
                    onChangeComplete={(data) => {
                        setSelColor(data.hex);
                    }}
                />
            </div>
        );
    };

    const deleteColorItem = (index) => {
        const list = JSON.parse(JSON.stringify(selColorList));
        list.splice(index, 1);
        setSelColorList(list);
    };

    const renderColor = () => {
        return (
            <div className="productInfoRow">
                <div className="productInfoItem colorWrap">
                    <span className="colorLabel">颜色：</span>
                    <div className="colorBox">
                        <div className="colorList">
                            {selColorList.length > 0 &&
                                selColorList.map((item, index) => {
                                    return (
                                        <div
                                            className="colorItem"
                                            style={{
                                                backgroundColor: item,
                                            }}
                                            onClick={() => {
                                                deleteColorItem(index);
                                            }}
                                            key={index}
                                        ></div>
                                    );
                                })}
                        </div>
                        <div className="colorPickerWrap">
                            {colorVisible && colorPick()}
                            <Button
                                style={{ width: 220 }}
                                onClick={() => {
                                    setColorVisible(!colorVisible);
                                    if (colorVisible) {
                                        setSelColorList([...selColorList, selColor]);
                                    }
                                }}
                            >
                                {colorVisible ? '确认添加' : '点击添加颜色'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPrice = () => {
        return (
            <>
                <div className="productInfoRow">
                    <div className="productInfoItem">
                        <span>单价：</span>
                        <Input
                            value={price}
                            style={inputStyle}
                            onChange={(e) => {
                                setPrice(e.target.value);
                            }}
                        />
                    </div>
                    <div className="productInfoItem">
                        <span>1-9件：</span>
                        <Input
                            value={lessPrice}
                            style={inputStyle}
                            onChange={(e) => {
                                setLessPrice(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="productInfoRow">
                    <div className="productInfoItem">
                        <span>10-49件：</span>
                        <Input
                            value={mediumPrice}
                            style={inputStyle}
                            onChange={(e) => {
                                setMediumPrice(e.target.value);
                            }}
                        />
                    </div>
                    <div className="productInfoItem">
                        <span>50+件：</span>
                        <Input
                            value={morePrice}
                            style={inputStyle}
                            onChange={(e) => {
                                setMorePrice(e.target.value);
                            }}
                        />
                    </div>
                </div>
            </>
        );
    };

    const renderName = () => {
        return (
            <>
                <div className="productInfoRow">
                    <div className="productInfoItem">
                        <span>中文名：</span>
                        <Input
                            value={name}
                            style={inputStyle}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                        />
                    </div>
                    <div className="productInfoItem">
                        <span>英文名：</span>
                        <Input
                            value={enName}
                            style={inputStyle}
                            onChange={(e) => {
                                setEnName(e.target.value);
                            }}
                        />
                    </div>
                </div>
            </>
        );
    };

    const renderTag = () => {
        return (
            <div className="productTagInfo">
                <SearchTags
                    tagTree={tagTree}
                    getSelTagCodeList={getSelTagCodeList}
                    editTagCodeList={editTagCodeList}
                />
            </div>
        );
    };

    const renderFabric = () => {
        return (
            <div className="productInfoItem">
                <span>面料：</span>
                <Dropdown overlay={fabricMenu} trigger="click">
                    <Button style={inputStyle}>
                        <Space>
                            {selFabric.name ? selFabric.name : '选择面料'}
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
        );
    };

    const renderProTime = () => {
        return (
            <div className="productInfoItem">
                <span>生产时间：</span>
                <Dropdown overlay={proTimeMenu} trigger="click">
                    <Button style={inputStyle}>
                        <Space>
                            {selProTime.name ? selProTime.name : '选择生产时间'}
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
        );
    };

    const renderWeight = () => {
        return (
            <div className="productInfoItem">
                <span>重量：</span>
                <Input
                    value={weight}
                    style={inputStyle}
                    onChange={(e) => {
                        setWeight(e.target.value);
                    }}
                />
            </div>
        );
    };

    const renderSize = () => {
        return (
            <div className="productInfoItem">
                <span>尺码：</span>
                <Dropdown overlay={sizeMenu} visible={sizeVisible}>
                    <Button
                        style={inputStyle}
                        onClick={() => {
                            setSizeVisible(!sizeVisible);
                        }}
                    >
                        <Space>
                            {selSizeList.length > 0 && !sizeVisible && (
                                <div className="selSizeBox">
                                    {selSizeList.map((item, index) => {
                                        return <span key={index}>{item.name} </span>;
                                    })}
                                </div>
                            )}
                            {selSizeList.length === 0 && !sizeVisible && '选择尺码'}
                            {sizeVisible && '点击收起'}
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
        );
    };
    const onTypeChange = (e) => {
        setMode(e.target.checked);
    };

    const renderType = () => {
        return (
            <div className="productInfoType">
                <span className="label">局部印：</span>
                <div style={{ width: 340 }}>
                    <Checkbox checked={mode} onChange={onTypeChange} />
                </div>
            </div>
        );
    };
    const onOK = () => {
        if (!verifier()) {
            return;
        }
        let list = [tagCode, ...selTagCodeList];
        if (size.code && selSizeList.length > 0) {
            const sList = [size.code];
            selSizeList.map((item) => {
                sList.push(item.code);
            });
            list = list.concat(sList);
        }

        if ((fabric.code, selFabric.code)) {
            const fList = [fabric.code, selFabric.code];
            list = list.concat(fList);
        }

        if ((proTime.code, selProTime.code)) {
            const pList = [proTime.code, selProTime.code];
            list = list.concat(pList);
        }

        setSizeVisible(false);

        onCreate({
            selTagCodeList: list,
            name,
            enName,
            price: Number(price),
            weight: Number(weight),
            id: productInfo.key,
            wholesaleRuleList: [
                {
                    minCount: 1,
                    maxCount: 9,
                    countUnit: '件',
                    price: Number(lessPrice),
                    priceUnit: '元',
                },
                {
                    minCount: 10,
                    maxCount: 49,
                    countUnit: '件',
                    price: Number(mediumPrice),
                    priceUnit: '元',
                },
                {
                    minCount: 50,
                    countUnit: '件',
                    price: Number(morePrice),
                    priceUnit: '元',
                },
            ],
            img: imgList[0] ? imgList[0].url : '',
            hoverImg: hoverImgList[0] ? hoverImgList[0].url : '',
            frontImg: frontImgList[0] ? frontImgList[0].url : '',
            backImg: backImgList[0] ? backImgList[0].url : '',
            prodPsdImg: fileProList,
            clothPsdImg: filePieceList[0] ? filePieceList[0].url : '',
            modelPsdImg: file2DList[0] ? file2DList[0].url : '',
            model3dImg: file3DList[0] ? file3DList[0].url : '',
            colorList: selColorList,
            mode: mode ? 1 : 0,
        });
    };

    const onFileChange = ({ fileList, imgList, setImgList, uploadData }) => {
        fileList.forEach((item) => {
            doneFile.current[fileList[0].uid] = fileList[0];
            const { host, dir, uid, name } = uploadData.current;
            const ext = fileList[0].type.split('/')[1]; // 后缀
            const imgUrl = `${host}/${dir}/${uid}.${ext}`;
            if (item.name === name) {
                item.url = imgUrl;
                setImgList(fileList);
            }
        });
    };

    const beforeFileUpload = ({ fileList, setImgList }) => {
        doneFile.current = {};
        let size = true;

        fileList.map((file) => {
            file.url = '';
            file.status = 'uploading';
            if (file.size < MAXUPLOADSIZE) {
                size = false;
            }
        });

        setImgList(fileList);

        return size;
    };

    const changePieceName = (value, index) => {
        const list = JSON.parse(JSON.stringify(filePieceList));
        list[index].zhName = value;
        setFilePieceList(list);
    };

    const changePieceEnName = (value, index) => {
        const list = JSON.parse(JSON.stringify(filePieceList));
        list[index].enName = value;
        setFilePieceList(list);
    };

    const uploadList = (index, size) => {
        const proList = [...fileProList];
        proList[index] = {
            size,
        };
        setFileProList(proList);

        const item = document.getElementById('uploadPro' + index).files[0];
        const reader = new FileReader();
        reader.readAsDataURL(item);
        reader.onload = async function (e) {
            const ext = item.name.split('.')[1];
            const url = await uploadOss(this.result, ext);
            document.getElementById('uploadPro' + index).url = url;

            setCount(count + 1);
        };
    };

    useEffect(() => {
        const proList = [...fileProList];
        selSizeList.forEach((_, index) => {
            const url = document.getElementById('uploadPro' + index).url;
            if (url) {
                proList[index].url = url;
            }
        });

        setFileProList(proList);
    }, [count]);

    return (
        <Modal
            visible={visible}
            title={modalState === 'add' ? '新增产品' : '修改产品'}
            okText="确定"
            cancelText="取消"
            onCancel={onCancel}
            onOk={() => {
                onOK();
            }}
            width={1200}
        >
            <div className="content">
                {renderName()}
                <div className="productInfoRow">
                    {renderFabric()}
                    {renderProTime()}
                </div>
                <div className="productInfoRow">
                    {renderWeight()}
                    {renderSize()}
                </div>
                {renderPrice()}
                {renderTag()}
                {renderColor()}
                <div className="productInfoRow">{renderType()}</div>
                <div className="productInfoRow">
                    <div className="productInfoItem">
                        <span>上传封面：</span>
                        <Upload
                            showUploadList={{
                                showRemoveIcon: true,
                                removeIcon: <CloseCircleOutlined />,
                            }}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg });
                            }}
                            listType="picture-card"
                            multiple={false}
                            fileList={imgList}
                            data={uploadImg.current}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList,
                                    setImgList,
                                    uploadData: uploadImg,
                                });
                            }}
                        >
                            {imgList && imgList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </div>
                    <div className="productInfoItem">
                        <span>上传样图：</span>
                        <Upload
                            showUploadList={{
                                showRemoveIcon: true,
                                removeIcon: <CloseCircleOutlined />,
                            }}
                            listType="picture-card"
                            multiple={false}
                            fileList={hoverImgList}
                            data={uploadHoverImg.current}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg: uploadHoverImg });
                            }}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList: setHoverImgList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList: hoverImgList,
                                    setImgList: setHoverImgList,
                                    uploadData: uploadHoverImg,
                                });
                            }}
                        >
                            {hoverImgList && hoverImgList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </div>
                </div>
                <div className="productInfoRow" style={{ display: !mode ? 'none' : 'flex' }}>
                    <div className="productInfoItem">
                        <span>上传正面：</span>
                        <Upload
                            showUploadList={{
                                showRemoveIcon: true,
                                removeIcon: <CloseCircleOutlined />,
                            }}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg: uploadFrontImg });
                            }}
                            listType="picture-card"
                            multiple={false}
                            fileList={frontImgList}
                            data={uploadFrontImg.current}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList: setFrontImgList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList: frontImgList,
                                    setImgList: setFrontImgList,
                                    uploadData: uploadFrontImg,
                                });
                            }}
                        >
                            {frontImgList && frontImgList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </div>
                    <div className="productInfoItem">
                        <span>上传反面：</span>
                        <Upload
                            showUploadList={{
                                showRemoveIcon: true,
                                removeIcon: <CloseCircleOutlined />,
                            }}
                            listType="picture-card"
                            multiple={false}
                            fileList={backImgList}
                            data={uploadBackImg.current}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg: uploadBackImg });
                            }}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList: setBackImgList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList: backImgList,
                                    setImgList: setBackImgList,
                                    uploadData: uploadBackImg,
                                });
                            }}
                        >
                            {backImgList && backImgList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </div>
                </div>

                <div className="productInfoRow" style={{ display: mode ? 'none' : 'flex' }}>
                    <div className="productInfoItem uploadFile">
                        <span>上传2D模特：</span>
                        <Upload
                            showUploadList={{
                                showDownloadIcon: true,
                                downloadIcon: 'Download',
                                showRemoveIcon: true,
                                removeIcon: (
                                    <StarOutlined
                                        onClick={(e) => console.log(e, 'custom removeIcon event')}
                                    />
                                ),
                            }}
                            multiple={false}
                            fileList={file2DList}
                            data={uploadFile2DList.current}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg: uploadFile2DList });
                            }}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList: setFile2DList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList: file2DList,
                                    setImgList: setFile2DList,
                                    uploadData: uploadFile2DList,
                                });
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Upload Directory</Button>
                        </Upload>
                    </div>
                    <div className="productInfoItem uploadFile">
                        <span>上传3D模特：</span>
                        <Upload
                            showUploadList={{
                                showRemoveIcon: true,
                                removeIcon: <CloseCircleOutlined />,
                            }}
                            multiple={false}
                            fileList={file3DList}
                            data={uploadFile3DList.current}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg: uploadFile3DList });
                            }}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList: setFile3DList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList: file3DList,
                                    setImgList: setFile3DList,
                                    uploadData: uploadFile3DList,
                                });
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Upload Directory</Button>
                        </Upload>
                    </div>
                </div>
                <div className="productInfoRow" style={{ display: mode ? 'none' : 'flex' }}>
                    <div className="productInfoItem uploadFile">
                        <span>上传生产文件：</span>
                        <div className="productFile">
                            {selSizeList.map((item, index) => {
                                return (
                                    <div className="productFileItem" key={index}>
                                        <span className="productFileLabel">{item.name}：</span>
                                        <Button
                                            style={{
                                                marginRight: 4,
                                            }}
                                            onClick={() => {
                                                document
                                                    .getElementById('uploadPro' + index)
                                                    .click();
                                            }}
                                        >
                                            <UploadOutlined />
                                            上传
                                        </Button>
                                        {fileProList[index] && (
                                            <Button
                                                style={{
                                                    width: 105,
                                                }}
                                                disabled={fileProList[index].url ? false : true}
                                                onClick={() => {
                                                    if (fileProList[index].url) {
                                                        window.open(fileProList[index].url);
                                                    }
                                                }}
                                            >
                                                {fileProList[index].url ? (
                                                    `${item.name}生产文件`
                                                ) : (
                                                    <>
                                                        <LoadingOutlined />
                                                        {` 上传中`}
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        <input
                                            id={'uploadPro' + index}
                                            className="uploadInput"
                                            type="file"
                                            onChange={() => {
                                                uploadList(index, item.name);
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="productInfoRow" style={{ display: mode ? 'none' : 'flex' }}>
                    <div className="productInfoItem uploadFile">
                        <span>上传切片：</span>
                        <Upload
                            showUploadList={{
                                showDownloadIcon: true,
                                downloadIcon: 'Download',
                                showRemoveIcon: true,
                                removeIcon: (
                                    <StarOutlined
                                        onClick={(e) => console.log(e, 'custom removeIcon event')}
                                    />
                                ),
                            }}
                            multiple={false}
                            fileList={filePieceList}
                            data={uploadFilePieceList.current}
                            action={async (file) => {
                                return getOssPolify({ file, uploadImg: uploadFilePieceList });
                            }}
                            beforeUpload={(_, fileList) => {
                                beforeFileUpload({ fileList, setImgList: setFilePieceList });
                            }}
                            onChange={({ fileList }) => {
                                onFileChange({
                                    fileList,
                                    imgList: filePieceList,
                                    setImgList: setFilePieceList,
                                    uploadData: uploadFilePieceList,
                                });
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Upload Directory</Button>
                        </Upload>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
export default ProductModal;
