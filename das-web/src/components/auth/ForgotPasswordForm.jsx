import { MailOutlined, KeyOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../utils/api.js";
import { validateEmail, validatePassword } from "../../utils/validation.js";
import { usePublicBootstrap } from "../../utils/usePublicBootstrap.js";
import { Form, Input, Button, Steps, Alert } from "antd";

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
    <div className="max-w-sm w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Quên mật khẩu</h2>
        <p className="text-slate-500">Khôi phục quyền truy cập tài khoản</p>
      </div>

      <Steps
        current={currentStep}
        items={[
          { title: "Gửi email" },
          { title: "Đặt lại MK" }
        ]}
        className="mb-6"
      />

      <div className="space-y-4">
        <Alert
          message={
            <div className="flex flex-col gap-2">
              <p>Nhập email đã cập nhật trong tài khoản để nhận mã OTP. Nếu bạn chưa cập nhật email, vui lòng liên hệ lễ tân để nhận mật khẩu mới.</p>
              {clinicLoading ? (
                <div className="text-blue-600/80 font-medium text-xs">Đang tải số điện thoại lễ tân...</div>
              ) : receptionistPhone ? (
                <a href={`tel:${receptionistPhone}`} className="inline-flex items-center gap-2 font-semibold hover:text-blue-800 transition-colors bg-white/60 p-2 rounded-md w-max border border-blue-200">
                  <PhoneOutlined />
                  <span>Liên hệ lễ tân: {receptionistPhone}</span>
                </a>
              ) : (
                <div className="text-rose-600 font-medium text-xs">Chưa có số điện thoại lễ tân trong hệ thống.</div>
              )}
            </div>
          }
          type="info"
          className="bg-blue-50 border-blue-100"
        />
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={currentStep === 0 ? requestOtp : resetPassword} 
        requiredMark={false} 
        className="space-y-4"
      >
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email là bắt buộc.' }]} className="mb-2">
          <Input prefix={<MailOutlined className="text-slate-400" />} type="email" placeholder="Nhập email của bạn" size="large" readOnly={currentStep === 1} className={currentStep === 1 ? "bg-slate-50 text-slate-500" : ""} />
        </Form.Item>

        {currentStep === 1 && (
          <>
            <Form.Item label="Mã OTP" name="verificationCode" rules={[{ required: true, message: 'Mã OTP là bắt buộc.' }]} className="mb-2">
              <Input prefix={<KeyOutlined className="text-slate-400" />} maxLength={12} placeholder="Nhập mã 6 số" size="large" className="tracking-widest font-mono" />
            </Form.Item>

            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Mật khẩu mới là bắt buộc.' }]} className="mb-2">
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} minLength={8} maxLength={72} placeholder="Nhập mật khẩu mới" size="large" />
            </Form.Item>
          </>
        )}

        {error && <Alert message={error} type="error" showIcon />}
        {message && <Alert message={message} type="success" showIcon />}

        <div className="space-y-3 pt-2">
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="btn-gradient border-none h-12 text-base rounded-xl font-semibold shadow-md transition-all duration-200 hover:shadow-lg">
            {currentStep === 0 ? "Gửi mã OTP" : "Đặt lại mật khẩu"}
          </Button>
          {currentStep === 1 && (
            <Button onClick={() => setCurrentStep(0)} size="large" block className="h-12 text-base text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl font-medium transition-colors border border-slate-200">
              Quay lại / Gửi lại OTP
            </Button>
          )}
        </div>
      </Form>

      <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
        Đã nhớ mật khẩu?{" "}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
