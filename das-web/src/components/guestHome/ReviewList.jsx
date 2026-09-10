import { Star } from "lucide-react";
import { Typography, Row, Col, Tag, Flex } from "antd";
import EmptyState from "../EmptyState.jsx";
import ReviewCard from "./ReviewCard.jsx";

const { Title } = Typography;

export default function ReviewList({ reviews }) {
  return (
    <section style={{ padding: "80px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex vertical align="center" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Tag color="gold" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <Star size={16} fill="currentColor" />
            Khách hàng nói gì
          </Tag>
          <Title level={2} style={{ color: "#0f172a", margin: 0 }}>Đánh Giá Từ Khách Hàng SmileCare</Title>
        </Flex>

        {reviews.length ? (
          <Row gutter={[24, 24]}>
            {reviews.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item._id}>
                <ReviewCard review={item} />
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, textAlign: "center", maxWidth: 600, margin: "0 auto", border: "1px solid #f1f5f9" }}>
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
