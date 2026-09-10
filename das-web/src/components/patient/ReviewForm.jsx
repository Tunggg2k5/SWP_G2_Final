import { Input, Button, Form, Flex } from "antd";
import RatingInput from "./RatingInput.jsx";

export default function ReviewForm({ form, onChange, onSubmit, submitLabel = "Gửi đánh giá" }) {
  return (
    <Form onFinish={onSubmit} layout="vertical" style={{ marginTop: 12 }}>
      <Form.Item label="Đánh giá của bạn" style={{ marginBottom: 16 }}>
        <RatingInput value={form.rating} onChange={(rating) => onChange({ rating })} />
      </Form.Item>
      <Form.Item style={{ marginBottom: 16 }}>
        <Input.TextArea
          value={form.comment}
          onChange={(event) => onChange({ comment: event.target.value })}
          placeholder="Chia sẻ thêm về trải nghiệm của bạn (tùy chọn)"
          maxLength={1000}
          autoSize={{ minRows: 4 }}
        />
      </Form.Item>
      <Flex justify="flex-end">
        <Button type="primary" htmlType="submit">
          {submitLabel}
        </Button>
      </Flex>
    </Form>
  );
}
