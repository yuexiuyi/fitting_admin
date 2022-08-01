/**
 * Created by hao.cheng on 2017/4/16.
 */
import React from 'react';
import { Button, Form, Input } from 'antd';
import { PwaInstaller } from '../widget';
import { RouteComponentProps } from 'react-router';
import { FormProps } from 'antd/lib/form';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const FormItem = Form.Item;
type LoginProps = {
    setAlitaState: (param: any) => void;
    auth: any;
} & RouteComponentProps &
    FormProps;

const Login = (props: LoginProps) => {
    const handleSubmit = (values: any) => {
        console.log(props);
        props.history.push('/app/background/index');
    };

    return (
        <div className="login">
            <div className="login-form">
                <div className="login-logo">
                    <span>React Admin</span>
                    <PwaInstaller />
                </div>
                <Form onFinish={handleSubmit} style={{ maxWidth: '300px' }}>
                    <FormItem
                        name="userName"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input
                            prefix={<UserOutlined size={13} />}
                            placeholder="管理员输入admin, 游客输入guest"
                        />
                    </FormItem>
                    <FormItem name="password" rules={[{ required: true, message: '请输入密码!' }]}>
                        <Input
                            prefix={<LockOutlined size={13} />}
                            type="password"
                            placeholder="管理员输入admin, 游客输入guest"
                        />
                    </FormItem>
                    <FormItem>
                        <span className="login-form-forgot" style={{ float: 'right' }}>
                            忘记密码
                        </span>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{ width: '100%' }}
                        >
                            登录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    );
};

export default Login;
