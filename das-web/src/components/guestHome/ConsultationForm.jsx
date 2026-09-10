import { CalendarDays, Send } from "lucide-react";
import { useState } from "react";
import { Form, Input, Select, Button, Radio, Typography } from "antd";
import { api, getErrorMessage } from "../../utils/api.js";
import { firstError, validateName, validatePhone } from "../../utils/validation.js";

const { Title, Text } = Typography;
const { Option } = Select;

const salutationOptions = [
  { label: "Anh", value: "male" },
  { label: "Chị", value: "female" },
  { label: "Khác", value: "other" }
];

export default function ConsultationForm({ onError, onMessage, services }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function submitConsultation(values) {
    onMessage("");
    onError("");

    const validationError = firstError(validateName(values.fullName), validatePhone(values.phone));
    if (validationError) {
      onError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post("/consultations", {
        fullName: values.fullName,
        phone: values.phone,
        gender: values.gender,
        service: values.service || undefined
      });

      form.resetFields();
      onMessage("Đã ghi nhận yêu cầu tư vấn. Lễ tân sẽ liên hệ để xác nhận lịch.");
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: "80px 20px", background: "linear-gradient(135deg, #0284c7, #0d9488)", position: "relative" }} id="consultation">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px", color: "#fff" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <CalendarDays size={16} />
            Đặt lịch tư vấn
          </div>
          <Title level={2} style={{ color: "#fff", marginBottom: 12 }}>Đăng Ký Nhận Tư Vấn Miễn Phí</Title>
          <Text style={{ color: "#e0f2fe", fontSize: 16, display: "block" }}>Để lại thông tin, chúng tôi sẽ liên hệ tư vấn trong vòng 24h.</Text>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <Form
              form={form}
              onFinish={submitConsultation}
              layout="vertical"
              initialValues={{ gender: "male" }}
            >
              <Form.Item name="gender" style={{ marginBottom: 20 }}>
                <Radio.Group style={{ width: "100%", display: "flex" }} optionType="button" buttonStyle="solid">
                  {salutationOptions.map(opt => (
                    <Radio.Button key={opt.value} value={opt.value} style={{ flex: 1, textAlign: "center" }}>
                      {opt.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Họ và tên *" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
                <Input size="large" placeholder="Nguyễn Văn A" maxLength={120} />
              </Form.Item>

              <Form.Item label="Số điện thoại *" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                <Input size="large" type="tel" placeholder="0912 345 678" maxLength={13} />
              </Form.Item>

              <Form.Item label="Dịch vụ quan tâm" name="service">
                <Select size="large" placeholder="-- Chọn dịch vụ --">
                  <Option value="">-- Chọn dịch vụ --</Option>
                  {services.map((service) => (
                    <Option value={service._id} key={service._id}>
                      {service.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<Send size={18} />}
                style={{ height: 48, borderRadius: 8, marginTop: 8, fontWeight: 600 }}
              >
                Gửi đăng ký tư vấn miễn phí
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
