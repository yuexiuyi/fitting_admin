import React, { useEffect, useState } from 'react';
import { getTagTree } from '../../service/tag.js';

const SearchTags = ({ tagTree, getSelTagCodeList, editTagCodeList }) => {
    const [firstTypeList, setFirstTypeList] = useState([]);
    const [secondTypeObj, setSecondTypeObj] = useState(null);
    const [thirdTypeObj, setThirdTypeObj] = useState(null);
    const [tagCodeList, setTagCodeList] = useState([]);
    const [hasChild, setHasChild] = useState(true);

    const firstOptionsChange = (selIndex) => {
        const newList = JSON.parse(JSON.stringify(firstTypeList));

        let list = [];
        newList.forEach((item, index) => {
            item.select = selIndex === index;
            if (selIndex === index && item.code) {
                list = [item.code];
            }
        });

        const childTags = newList[selIndex].childTags;
        if (childTags && childTags.length > 1 && childTags[0].name !== '所有') {
            childTags.unshift({ name: '所有', select: true });
        }

        setTagCodeList(list);
        setHasChild(!!childTags && tagCodeList[0]);
        setFirstTypeList(newList);
        setSecondTypeObj(newList[selIndex]);
        setThirdTypeObj(null);
    };

    const secondOptionChange = (selIndex) => {
        const newList = JSON.parse(JSON.stringify(secondTypeObj.childTags));
        let list = [];
        newList.forEach((item, index) => {
            item.select = selIndex === index;
            if (selIndex === index && item.code) {
                list = [tagCodeList[0], item.code];
            }
        });

        const childTags = newList[selIndex].childTags;
        if (childTags && childTags.length > 1 && childTags[0].name !== '所有') {
            childTags.unshift({ name: '所有', select: true });
        }

        setTagCodeList(list);
        setHasChild(!!childTags && tagCodeList[1]);
        setSecondTypeObj({
            ...secondTypeObj,
            childTags: newList,
        });
        setThirdTypeObj(newList[selIndex]);
        console.log(tagCodeList, '222222');
    };

    const thirdOptionChange = (selIndex) => {
        const newList = JSON.parse(JSON.stringify(thirdTypeObj.childTags));
        let list = [];
        newList.forEach((item, index) => {
            item.select = selIndex === index;
            if (selIndex === index && item.code) {
                list = [tagCodeList[0], tagCodeList[1], item.code];
            }
        });

        setTagCodeList(list);
        setHasChild(!tagCodeList[2]);
        setTagCodeList(list);
        setThirdTypeObj({ ...thirdTypeObj, childTags: newList });
        console.log(tagCodeList, '33333');
    };

    const handleScroll = (e) => {
        const delta = Math.max(-1, Math.min(1, e.nativeEvent.wheelDelta || -e.nativeEvent.detail));
        e.currentTarget.scrollLeft -= delta * 30;
        e.preventDefault();
        document.body.style.overflow = 'hidden';
    };

    //获取标签列表
    const initTagTrees = async () => {
        if (tagTree) {
            const tagList = tagTree;
            console.log(editTagCodeList, 'xxxxx');

            if (tagList && tagList.length > 1 && tagList[0].name !== '所有') {
                tagList.unshift({ name: '所有', select: true });
            }
            setFirstTypeList(tagList);
            if (editTagCodeList && editTagCodeList[0]) {
                tagList.forEach((item) => {
                    item.select = item.code === editTagCodeList[0];
                    if (editTagCodeList[1] && item.code === editTagCodeList[0]) {
                        item.childTags.forEach((item2) => {
                            item2.select = item2.code === editTagCodeList[1];
                            if (editTagCodeList[2] && item2.code === editTagCodeList[1]) {
                                item2.childTags.forEach((item3) => {
                                    item3.select = item3.code === editTagCodeList[2];
                                });
                                item2.childTags.unshift({ name: '所有' });
                                setThirdTypeObj(item2);
                            }
                        });
                        item.childTags.unshift({ name: '所有' });
                        setSecondTypeObj(item);
                    }
                });
                setFirstTypeList(tagList);
            }
        }
    };

    useEffect(() => {
        getSelTagCodeList(tagCodeList, hasChild);
    }, [tagCodeList, hasChild]);

    useEffect(() => {
        initTagTrees();
    }, [editTagCodeList, tagTree]);

    return (
        <>
            <div className="tagWrap">
                <div className="label">标签：</div>
                <div className="firstTagWrap" onWheel={(e) => handleScroll(e)}>
                    {firstTypeList.map((item, index) => (
                        <span
                            key={index}
                            className={`firstTagItem ${item.select ? 'selFirstTagItem' : ''}`}
                            onClick={() => {
                                firstOptionsChange(index);
                            }}
                        >
                            {item.name}
                        </span>
                    ))}
                </div>
            </div>
            {secondTypeObj && secondTypeObj.childTags && secondTypeObj.childTags.length !== 0 && (
                <div className="tagWrap">
                    <div className="label"></div>
                    <div className="firstTagWrap">
                        {secondTypeObj.childTags.map((item, index) => (
                            <span
                                key={index}
                                className={`firstTagItem ${item.select ? 'selFirstTagItem' : ''}`}
                                onClick={() => {
                                    secondOptionChange(index);
                                }}
                            >
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {thirdTypeObj && thirdTypeObj.childTags && thirdTypeObj.childTags.length !== 0 && (
                <div className="tagWrap">
                    <div className="label"></div>
                    <div className="firstTagWrap">
                        {thirdTypeObj.childTags.map((item, index) => (
                            <span
                                key={index}
                                className={`firstTagItem ${item.select ? 'selFirstTagItem' : ''}`}
                                onClick={() => {
                                    thirdOptionChange(index);
                                }}
                            >
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
export default SearchTags;
