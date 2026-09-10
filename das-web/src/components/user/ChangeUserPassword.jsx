import { Modal, Form } from "antd";
import PasswordField from "../PasswordField.jsx";

export default function ChangeUserPassword({ form, onCancel, onChange, onSubmit }) {
  const [antdForm] = Form.useForm();

  return (
    <Modal
      title="Đổi mật khẩu"
      open={true}
      onCancel={onCancel}
      onOk={(e) => {
        antdForm.validateFields().then(() => {
          onSubmit(e);
        });
      }}
      okText="Đổi mật khẩu"
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
        <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}>
          <PasswordField />
        </Form.Item>
        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, min: 8, message: 'Mật khẩu phải từ 8 ký tự trở lên' }]}>
          <PasswordField />
        </Form.Item>
      </Form>
    </Modal>
  );
}
