import { StarOutlined } from "@ant-design/icons";
import { Card, List, Rate, Select, Switch, Space, Typography, Flex } from "antd";
import { useMemo, useState } from "react";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime } from "../../utils/format.js";

const { Text } = Typography;

const reviewStatusFilters = [
  { value: "all", label: "Tất cả" },
  { value: "visible", label: "Đang hiển thị" },
  { value: "hidden", label: "Đã ẩn" }
];

export default function AdminReviewList({ loading, onToggleVisibility, reviews }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredReviews = useMemo(() => {
    if (statusFilter === "visible") return reviews.filter((review) => !review.isHidden);
    if (statusFilter === "hidden") return reviews.filter((review) => review.isHidden);
    return reviews;
  }, [reviews, statusFilter]);

  return (
    <Card 
      title={
        <Space>
          <StarOutlined style={{ color: "#f59e0b" }} /> 
          <span>Đánh giá & xếp hạng</span>
        </Space>
      } 
      style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      extra={
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={reviewStatusFilters}
          style={{ width: 140 }}
        />
      }
    >
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={filteredReviews}
        pagination={{ pageSize: 10 }}
        renderItem={(review) => (
          <List.Item
            key={review._id}
            extra={
              <Space direction="vertical" align="end">
                <StatusBadge value={review.isHidden ? "hidden" : "visible"} />
                <Space>
                  <Text type="secondary" style={{ fontSize: 14 }}>Hiển thị</Text>
                  <Switch 
                    checked={!review.isHidden} 
                    onChange={(checked) => onToggleVisibility(review, !checked)} 
                  />
                </Space>
              </Space>
            }
          >
            <List.Item.Meta
              title={<Rate disabled defaultValue={Number(review.rating || review.ratingService || 5)} style={{ fontSize: 16 }} />}
              description={<Text italic style={{ color: "#334155" }}>"{review.comment || "Không có nhận xét chi tiết."}"</Text>}
            />
            <Flex wrap="wrap" gap="middle" style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 14 }}><strong style={{ color: "#334155" }}>Bệnh nhân:</strong> {review.patient?.fullName || "Bệnh nhân"}</Text>
              <Text type="secondary" style={{ fontSize: 14 }}><strong style={{ color: "#334155" }}>Dịch vụ:</strong> {review.service?.name || "Chưa có dịch vụ"}</Text>
              <Text type="secondary" style={{ fontSize: 14 }}><strong style={{ color: "#334155" }}>Bác sĩ:</strong> {review.dentist?.fullName || "Chưa có bác sĩ"}</Text>
              <Text type="secondary" style={{ fontSize: 14 }}><strong style={{ color: "#334155" }}>Ngày:</strong> {formatDateTime(review.updatedAt)}</Text>
            </Flex>
          </List.Item>
        )}
      />
    </Card>
  );
}
