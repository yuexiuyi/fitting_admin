export interface IFMenuBase {
    key: string;
    title: string;
    icon?: string;
    component?: string;
    query?: string;
    requireAuth?: string;
    route?: string;
    /** 是否登录校验，true不进行校验（访客） */
    login?: boolean;
}

export interface IFMenu extends IFMenuBase {
    subs?: IFMenu[];
}

const menus: {
    menus: IFMenu[];
    others: IFMenu[] | [];
    [index: string]: any;
} = {
    menus: [
        // 菜单相关路由
        // { key: '/app/dashboard/index', title: '首页', icon: 'mobile', component: 'Dashboard' },
        { key: '/app/guide/index', title: '打印指南', icon: 'mobile', component: 'Guide' },
        { key: '/app/design/index', title: '设计列表', icon: 'mobile', component: 'Design' },
        { key: '/app/background/index', title: '背景图', icon: 'mobile', component: 'Background' },
        {
            key: '/app/Material',
            title: '素材',
            icon: 'mobile',
            subs: [
                { key: '/app/Material/Material', title: '素材管理', component: 'Material' },
                {
                    key: '/app/Material/MaterialIcons',
                    title: '标签管理',
                    component: 'MaterialIcons',
                },
            ],
        },
        {
            key: '/app/Product',
            title: '产品',
            icon: 'mobile',
            subs: [
                { key: '/app/Product/Product', title: '产品管理', component: 'Product' },
                { key: '/app/Product/ProductIcons', title: '标签管理', component: 'ProductIcons' },
                {
                    key: '/app/Product/Cover',
                    title: '遮罩管理',
                    component: 'Cover',
                },
            ],
        },
    ],
    others: [], // 非菜单相关路由
};

export default menus;
