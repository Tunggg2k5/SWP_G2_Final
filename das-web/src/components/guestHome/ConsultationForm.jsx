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
    <section className="py-20 bg-gradient-to-br from-primary-700 to-teal-600 relative" id="consultation">
      <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 text-white">
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CalendarDays size={16} />
            Đặt lịch tư vấn
          </span>
          <Title level={2} className="!text-white mb-4">Đăng Ký Nhận Tư Vấn Miễn Phí</Title>
          <Text className="!text-blue-100 text-lg block">Để lại thông tin, chúng tôi sẽ liên hệ tư vấn trong vòng 24h.</Text>
        </div>

        <div className="max-w-lg mx-auto">
          <Form
            form={form}
            className="card-base p-8 rounded-2xl shadow-xl bg-white"
            onFinish={submitConsultation}
            layout="vertical"
            initialValues={{ gender: "male" }}
          >
            <Form.Item name="gender" className="mb-6">
              <Radio.Group className="flex w-full gap-2 bg-slate-100 p-1 rounded-xl" optionType="button" buttonStyle="solid">
                {salutationOptions.map(opt => (
                  <Radio.Button key={opt.value} value={opt.value} className="flex-1 text-center rounded-lg border-none shadow-none text-slate-500 bg-transparent before:hidden">
                    {opt.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item label={<span className="font-semibold text-slate-700">Họ và tên *</span>} name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
              <Input size="large" placeholder="Nguyễn Văn A" maxLength={120} />
            </Form.Item>

            <Form.Item label={<span className="font-semibold text-slate-700">Số điện thoại *</span>} name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
              <Input size="large" type="tel" placeholder="0912 345 678" maxLength={13} />
            </Form.Item>

            <Form.Item label={<span className="font-semibold text-slate-700">Dịch vụ quan tâm</span>} name="service">
              <Select size="large" placeholder="-- Chọn dịch vụ --">
                <Option value="">-- Chọn dịch vụ --</Option>
                {services.map((service) => (
                  <Option value={service._id} key={service._id}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" className="w-full h-12 rounded-xl flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-primary-600 to-teal-500 border-none hover:shadow-lg" loading={loading} icon={<Send size={20} />}>
            Gửi đăng ký tư vấn miễn phí
            </Button>
          </Form>
        </div>
      </div>
    </section>
  );
}
