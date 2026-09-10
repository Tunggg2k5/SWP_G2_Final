import { LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../redux/AuthContext.jsx";
import { getErrorMessage } from "../../utils/api.js";
import { Form, Input, Button, Alert, Typography, Flex, Card } from "antd";
import { validatePhone } from "../../utils/validation.js";

const { Title, Text } = Typography;

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
    <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: 12 }}>
      <Flex vertical align="center" style={{ textAlign: "center", marginBottom: 28 }}>
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <Activity color="#0284c7" size={32} />
          <span style={{ fontSize: 26, fontWeight: 800, color: "#0284c7" }}>SmileCare</span>
        </Flex>
        <Title level={3} style={{ margin: "0 0 4px", color: "#0f172a" }}>Đăng nhập</Title>
        <Text type="secondary">Chào mừng bạn quay lại hệ thống</Text>
      </Flex>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Số điện thoại là bắt buộc." }]} style={{ marginBottom: 16 }}>
          <Input prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />} type="tel" maxLength={13} placeholder="Nhập số điện thoại" size="large" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Mật khẩu là bắt buộc." }]} style={{ marginBottom: 16 }}>
          <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} minLength={8} maxLength={72} placeholder="Nhập mật khẩu" size="large" style={{ borderRadius: 8 }} />
        </Form.Item>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form.Item style={{ marginTop: 8, marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
            Đăng nhập
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Link to="/forgot-password" style={{ color: "#0284c7", fontWeight: 500, fontSize: 14 }}>
            Quên mật khẩu?
          </Link>
        </div>
      </Form>

      <div style={{ textAlign: "center", paddingTop: 16, borderTop: "1px solid #f1f5f9", fontSize: 14 }}>
        <Text type="secondary">Chưa có tài khoản? </Text>
        <Link to="/register" style={{ color: "#0284c7", fontWeight: 600 }}>
          Tạo tài khoản
        </Link>
      </div>
    </Card>
  );
}