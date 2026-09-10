import { Input, Button, Form } from "antd";
import RatingInput from "./RatingInput.jsx";

export default function ReviewForm({ form, onChange, onSubmit, submitLabel = "Gửi đánh giá" }) {
  return (
    <Form className="space-y-4 mt-3" onFinish={onSubmit} layout="vertical">
      <Form.Item label="Đánh giá của bạn">
        <RatingInput value={form.rating} onChange={(rating) => onChange({ rating })} />
      </Form.Item>
      <Form.Item>
        <Input.TextArea
          value={form.comment}
          onChange={(event) => onChange({ comment: event.target.value })}
          placeholder="Chia sẻ thêm về trải nghiệm của bạn (tùy chọn)"
          maxLength={1000}
          autoSize={{ minRows: 4 }}
        />
      </Form.Item>
      <div className="flex justify-end">
        <Button type="primary" htmlType="submit">
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}
