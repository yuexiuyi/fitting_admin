import React, { useEffect, useState, useRef } from 'react';
import { message, Upload } from 'antd';
import { getPrintGuide, updatePrintGuide } from '../../service/guide.js';
import { getPolicy } from '../../service/util.js';
import { PlusOutlined } from '@ant-design/icons';
const MAXUPLOADSIZE = 100 * 1000 * 1000;

const Guide = () => {
    const uploadData = useRef({}); //上传数据
    const doneFile = useRef({});
    const [id, setId] = useState(); //已上传图片地址
    const [fileList, setFileList] = useState([]); //已上传图片地址
    const [img, setImg] = useState(''); //已上传图片地址

    const queryPrintGuide = async () => {
        const res = await getPrintGuide({});
        console.log(res);
        if (res.success) {
            const item = res.data.list[0];
            if (item) {
                setId(item.id);
                setFileList([{ uid: '-1', url: item.img, status: 'done' }]);
            }
        }
    };

    const uPrintGuide = async (img) => {
        const params = {
            id,
            img,
        };
        const res = await updatePrintGuide(params);
        if (res.success) {
            message.success('修改成功');
        }
    };

    useEffect(() => {
        queryPrintGuide();
    }, []);

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

    return (
        <div className="guide">
            <span>打印指南图片：</span>
            <Upload
                style={{ marginBottom: 20 }}
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
                                uPrintGuide(imgUrl);
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
    );
};
export default Guide;
