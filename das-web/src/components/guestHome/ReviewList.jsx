import { Star } from "lucide-react";
import { Typography } from "antd";
import EmptyState from "../EmptyState.jsx";
import ReviewCard from "./ReviewCard.jsx";

const { Title } = Typography;

export default function ReviewList({ reviews }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star size={16} fill="currentColor" />
            Khách hàng nói gì
          </span>
          <Title level={2} className="text-slate-900">Đánh Giá Từ Khách Hàng SmileCare</Title>
        </div>

        {reviews.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((item) => (
              <ReviewCard review={item} key={item._id} />
            ))}
          </div>
        ) : (
          <div className="card-base p-8 text-center max-w-2xl mx-auto">
            <EmptyState
              title="Chưa có đánh giá"
              text="Đánh giá của khách hàng sẽ hiển thị tại đây sau khi bệnh nhân gửi từ hệ thống."
            />
          </div>
        )}
      </div>
    </section>
  );
}
