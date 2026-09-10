import { Rate } from "antd";

export default function RatingInput({ value, onChange }) {
  const ratingValue = Number(value) || 0;

  return (
    <Rate value={ratingValue} onChange={onChange} />
  );
}
