import { Modal, Form, Input, Select, Flex } from "antd";

const genderOptions = [
  { value: "unknown", label: "Chưa chọn" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" }
];

export default function EditUserProfile({ form, onCancel, onChange, onSubmit }) {
  const [antdForm] = Form.useForm();

  return (
    <Modal
      title="Thông tin cá nhân"
      open={true}
      onCancel={onCancel}
      onOk={(e) => {
        antdForm.validateFields().then(() => {
          onSubmit(e);
        });
      }}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ style: { backgroundColor: '#10b981', border: 'none' } }}
      destroyOnClose
    >
      <Form
        form={antdForm}
        layout="vertical"
        initialValues={form}
        onValuesChange={(_, allValues) => onChange({ ...form, ...allValues })}
        style={{ marginTop: 16 }}
      >
        <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
          <Input type="tel" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
          <Input type="email" />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item label="Giới tính" name="gender" style={{ flex: 1 }}>
            <Select options={genderOptions} />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address" style={{ flex: 1 }}>
            <Input maxLength={255} />
          </Form.Item>
        </Flex>

        <Form.Item label="Ghi chú hồ sơ" name="bio">
          <Input.TextArea rows={3} maxLength={1000} style={{ resize: 'none' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
