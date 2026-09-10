import { MailOutlined, KeyOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../utils/api.js";
import { validateEmail, validatePassword } from "../../utils/validation.js";
import { usePublicBootstrap } from "../../utils/usePublicBootstrap.js";
import { Form, Input, Button, Steps, Alert, Typography, Card, Flex } from "antd";

const { Title, Text } = Typography;

export default function ForgotPasswordForm() {
  const { clinic, loading: clinicLoading } = usePublicBootstrap();
  const receptionistPhone = clinic.receptionist?.phone || clinic.receptionistPhone || "";
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestOtp(values) {
    setError("");
    setMessage("");

    const validationError = validateEmail(values.email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: values.email });
      setMessage(res.data.message || "Nếu email tồn tại, hệ thống sẽ gửi mã OTP đặt lại mật khẩu.");
      setCurrentStep(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(values) {
    setError("");
    setMessage("");

    let validationError = validateEmail(values.email);
    if (!validationError && (!values.verificationCode || !values.verificationCode.trim())) {
      validationError = "Mã OTP là bắt buộc.";
    }
    if (!validationError) {
      validationError = validatePassword(values.newPassword);
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: values.email,
        verificationCode: values.verificationCode,
        newPassword: values.newPassword
      });
      setMessage(res.data.message || "Đã đặt lại mật khẩu.");
      form.resetFields(["verificationCode", "newPassword"]);
      setCurrentStep(0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: 12 }}>
      <Flex vertical align="center" style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={3} style={{ margin: "0 0 4px", color: "#0f172a" }}>Quên mật khẩu</Title>
        <Text type="secondary">Khôi phục quyền truy cập tài khoản</Text>
      </Flex>

      <Steps
        current={currentStep}
        items={[
          { title: "Gửi email" },
          { title: "Đặt lại MK" }
        ]}
        style={{ marginBottom: 24 }}
      />

      <div style={{ marginBottom: 20 }}>
        <Alert
          message={
            <div>
              <p style={{ margin: "0 0 8px" }}>Nhập email đã cập nhật trong tài khoản để nhận mã OTP. Nếu bạn chưa cập nhật email, vui lòng liên hệ lễ tân để nhận mật khẩu mới.</p>
              {clinicLoading ? (
                <div style={{ color: "#0284c7", fontSize: 12, fontWeight: 500 }}>Đang tải số điện thoại lễ tân...</div>
              ) : receptionistPhone ? (
                <a href={`tel:${receptionistPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#0284c7", textDecoration: "none" }}>
                  <PhoneOutlined />
                  <span>Liên hệ lễ tân: {receptionistPhone}</span>
                </a>
              ) : (
                <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 500 }}>Chưa có số điện thoại lễ tân trong hệ thống.</div>
              )}
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={currentStep === 0 ? requestOtp : resetPassword} 
        requiredMark={false}
      >
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email là bắt buộc." }]} style={{ marginBottom: 16 }}>
          <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} type="email" placeholder="Nhập email của bạn" size="large" readOnly={currentStep === 1} style={{ borderRadius: 8 }} />
        </Form.Item>

        {currentStep === 1 && (
          <>
            <Form.Item label="Mã OTP" name="verificationCode" rules={[{ required: true, message: "Mã OTP là bắt buộc." }]} style={{ marginBottom: 16 }}>
              <Input prefix={<KeyOutlined style={{ color: "#94a3b8" }} />} maxLength={12} placeholder="Nhập mã 6 số" size="large" style={{ letterSpacing: 4, fontFamily: "monospace", borderRadius: 8 }} />
            </Form.Item>

            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: "Mật khẩu mới là bắt buộc." }]} style={{ marginBottom: 16 }}>
              <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} minLength={8} maxLength={72} placeholder="Nhập mật khẩu mới" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
          </>
        )}

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 16 }} />}

        <Flex vertical gap={12} style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
            {currentStep === 0 ? "Gửi mã OTP" : "Đặt lại mật khẩu"}
          </Button>
          {currentStep === 1 && (
            <Button onClick={() => setCurrentStep(0)} size="large" block style={{ height: 48, borderRadius: 8, fontWeight: 500 }}>
              Quay lại / Gửi lại OTP
            </Button>
          )}
        </Flex>
      </Form>

      <div style={{ textAlign: "center", paddingTop: 16, borderTop: "1px solid #f1f5f9", marginTop: 20, fontSize: 14 }}>
        <Text type="secondary">Đã nhớ mật khẩu? </Text>
        <Link to="/login" style={{ color: "#0284c7", fontWeight: 600 }}>
          Đăng nhập
        </Link>
      </div>
    </Card>
  );
}
