import React from 'react';
import ReactDOM from 'react-dom';
import { AlitaProvider, setConfig } from 'redux-alita';
import umbrella from 'umbrella-storage';
import Page from './Page';
import * as serviceWorker from './serviceWorker';
import * as apis from './service';
// import { AppContainer } from 'react-hot-loader';
import './style/lib/animate.css';
import './style/index.less';
import './style/background.less';
import './style/material.less';
import './style/product.less';
import './style/tags.less';
import './style/materialIcons.less';
import './style/antd/index.less';

setConfig(apis);
umbrella.config('REACT-ADMIN');
// const render = Component => { // 增加react-hot-loader保持状态刷新操作，如果不需要可去掉并把下面注释的打开
//     ReactDOM.render(
//         <AppContainer>
//             <Provider store={store}>
//                 <Component store={store} />
//             </Provider>
//         </AppContainer>
//         ,
//         document.getElementById('root')
//     );
// };

// render(Page);

// Webpack Hot Module Replacement API
// if (module.hot) {
//     // 隐藏You cannot change <Router routes>; it will be ignored 错误提示
//     // react-hot-loader 使用在react-router 3.x上引起的提示，react-router 4.x不存在
//     // 详情可参照https://github.com/gaearon/react-hot-loader/issues/298
//     const orgError = console.error; // eslint-disable-line no-console
//     console.error = (...args) => { // eslint-disable-line no-console
//         if (args && args.length === 1 && typeof args[0] === 'string' && args[0].indexOf('You cannot change <Router routes>;') > -1) {
//             // React route changed
//         } else {
//             // Log the error as normally
//             orgError.apply(console, args);
//         }
//     };
//     module.hot.accept('./Page', () => {
//         render(Page);
//     })
// }

ReactDOM.render(
    // <AppContainer>
    <AlitaProvider>
        <Page />
    </AlitaProvider>,
    // </AppContainer>
    document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
serviceWorker.register();
