import { HomeOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../redux/AuthContext.jsx";
import { getErrorMessage } from "../../utils/api.js";
import { Form, Input, Button, Radio, Alert, Typography, Flex, Card, Row, Col } from "antd";
import { validatePhone, validateEmail, validatePassword } from "../../utils/validation.js";

const { Title, Text } = Typography;

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
    <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: 12 }}>
      <Flex vertical align="center" style={{ textAlign: "center", marginBottom: 24 }}>
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <Activity color="#0284c7" size={28} />
          <span style={{ fontSize: 24, fontWeight: 800, color: "#0284c7" }}>SmileCare</span>
        </Flex>
        <Title level={3} style={{ margin: "0 0 4px", color: "#0f172a" }}>Tạo tài khoản</Title>
        <Text type="secondary">Đăng ký tài khoản bệnh nhân mới</Text>
      </Flex>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ gender: "unknown" }}>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Số điện thoại là bắt buộc." }]} style={{ marginBottom: 14 }}>
          <Input prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />} type="tel" maxLength={13} placeholder="Nhập số điện thoại" size="large" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Email" name="email" style={{ marginBottom: 14 }}>
          <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} type="email" maxLength={120} placeholder="Nhập email" size="large" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: "Vui lòng chọn giới tính" }]} style={{ marginBottom: 14 }}>
          <Radio.Group options={genderOptions} optionType="button" buttonStyle="solid" />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address" style={{ marginBottom: 14 }}>
          <Input prefix={<HomeOutlined style={{ color: "#94a3b8" }} />} maxLength={255} placeholder="Nhập địa chỉ" size="large" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Mật khẩu là bắt buộc." }]} style={{ marginBottom: 14 }}>
              <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} minLength={8} maxLength={72} placeholder="Mật khẩu" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Nhập lại" name="confirmPassword" rules={[{ required: true, message: "Xác nhận mật khẩu là bắt buộc." }]} style={{ marginBottom: 14 }}>
              <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} minLength={8} maxLength={72} placeholder="Xác nhận" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
        </Row>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 16 }} />}

        <Form.Item style={{ marginTop: 8, marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", paddingTop: 16, borderTop: "1px solid #f1f5f9", fontSize: 14 }}>
        <Text type="secondary">Đã có tài khoản? </Text>
        <Link to="/login" style={{ color: "#0284c7", fontWeight: 600 }}>
          Đăng nhập
        </Link>
      </div>
    </Card>
  );
}
