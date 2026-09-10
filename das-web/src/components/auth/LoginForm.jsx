import { LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../redux/AuthContext.jsx";
import { getErrorMessage } from "../../utils/api.js";
import { Form, Input, Button, Alert } from "antd";
import { validatePhone } from "../../utils/validation.js";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setError("");
    const validationError = validatePhone(values.phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await login(values.phone, values.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2 mb-6">
          <Activity className="text-primary-600" size={32} />
          <span className="text-3xl font-extrabold text-gradient">SmileCare</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
        <p className="text-slate-500">Chào mừng bạn quay lại hệ thống</p>
      </div>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false} className="space-y-4">
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Số điện thoại là bắt buộc.' }]} className="mb-2">
            <Input prefix={<PhoneOutlined className="text-slate-400" />} type="tel" maxLength={13} placeholder="Nhập số điện thoại" size="large" />
        </Form.Item>

        <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Mật khẩu là bắt buộc.' }]} className="mb-2">
            <Input.Password prefix={<LockOutlined className="text-slate-400" />} minLength={8} maxLength={72} placeholder="Nhập mật khẩu" size="large" />
        </Form.Item>

        {error && <Alert message={error} type="error" showIcon />}

        <Form.Item className="mt-2 mb-0">
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="btn-gradient border-none h-12 text-base rounded-xl font-semibold shadow-md transition-all duration-200 hover:shadow-lg">
            Đăng nhập
          </Button>
        </Form.Item>

        <div className="text-center mt-4">
          <Link className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors" to="/forgot-password">
            Quên mật khẩu?
          </Link>
        </div>
      </Form>

      <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100 mt-6">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Tạo tài khoản
        </Link>
      </p>
    </div>
  );
}
