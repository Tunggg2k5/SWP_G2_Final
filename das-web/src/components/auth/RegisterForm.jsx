import { HomeOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../redux/AuthContext.jsx";
import { getErrorMessage } from "../../utils/api.js";
import { Form, Input, Button, Radio, Alert } from "antd";
import { validatePhone, validateEmail, validatePassword } from "../../utils/validation.js";

const genderOptions = [
  { value: "unknown", label: "Chưa chọn" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" }
];

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setError("");
    setMessage("");

    let validationError = validatePhone(values.phone);
    if (!validationError && values.email) {
      validationError = validateEmail(values.email);
    }
    if (!validationError && values.gender === undefined) {
      validationError = "Giới tính là bắt buộc.";
    }
    if (!validationError) {
      validationError = validatePassword(values.password);
    }
    if (!validationError && values.confirmPassword !== values.password) {
      validationError = "Mật khẩu nhập lại không khớp.";
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await register(values);
      setMessage(res.message || "Đăng ký thành công. Vui lòng đăng nhập.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Activity className="text-primary-600" size={28} />
          <span className="text-2xl font-extrabold text-gradient">SmileCare</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h2>
        <p className="text-slate-500">Đăng ký tài khoản bệnh nhân mới</p>
      </div>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false} className="space-y-4" initialValues={{ gender: "unknown" }}>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Số điện thoại là bắt buộc.' }]} className="mb-2">
            <Input prefix={<PhoneOutlined className="text-slate-400" />} type="tel" maxLength={13} placeholder="Nhập số điện thoại" size="large" />
        </Form.Item>

        <Form.Item label="Email" name="email" className="mb-2">
            <Input prefix={<MailOutlined className="text-slate-400" />} type="email" maxLength={120} placeholder="Nhập email" size="large" />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]} className="mb-2">
            <Radio.Group options={genderOptions} optionType="button" buttonStyle="solid" />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address" className="mb-2">
            <Input prefix={<HomeOutlined className="text-slate-400" />} maxLength={255} placeholder="Nhập địa chỉ" size="large" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Mật khẩu là bắt buộc.' }]} className="mb-0">
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} minLength={8} maxLength={72} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item label="Nhập lại" name="confirmPassword" rules={[{ required: true, message: 'Xác nhận mật khẩu là bắt buộc.' }]} className="mb-0">
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} minLength={8} maxLength={72} placeholder="Xác nhận" size="large" />
          </Form.Item>
        </div>

        {error && <Alert message={error} type="error" showIcon />}
        {message && <Alert message={message} type="success" showIcon />}

        <Form.Item className="mt-4 mb-0">
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="btn-gradient border-none h-12 text-base rounded-xl font-semibold shadow-md transition-all duration-200 hover:shadow-lg">
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
