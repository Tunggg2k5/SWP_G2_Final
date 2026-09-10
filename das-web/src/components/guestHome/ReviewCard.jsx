import { Card, Typography, Avatar, Rate, Flex } from "antd";

const { Text } = Typography;

export default function ReviewCard({ review }) {
  return (
    <Card 
      key={review._id} 
      style={{ height: "100%", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      styles={{ body: { display: "flex", flexDirection: "column", height: "100%", padding: 24 } }}
    >
      <div style={{ marginBottom: 16 }}>
        <Rate disabled defaultValue={review.rating} style={{ fontSize: 16 }} />
      </div>

      <Text italic style={{ color: "#475569", lineHeight: 1.6, marginBottom: 24, flexGrow: 1, display: "block" }}>
        "{review.text}"
      </Text>

      <Flex align="center" gap={12} style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
        <Avatar size={42} style={{ backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: 700 }}>
          {review.name?.[0]?.toUpperCase() || "K"}
        </Avatar>
        <div style={{ overflow: "hidden" }}>
          <Text strong style={{ display: "block", color: "#1e293b" }}>{review.name}</Text>
          <Text type="secondary" style={{ fontSize: 13, display: "block" }}>{review.service}</Text>
        </div>
      </Flex>
    </Card>
  );
}
