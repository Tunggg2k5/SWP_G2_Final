import { StarOutlined } from "@ant-design/icons";
import { Card, List, Rate, Select, Switch, Space, Tag } from "antd";
import { useMemo, useState } from "react";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime } from "../../utils/format.js";

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
      title={<><StarOutlined className="text-amber-500 mr-2" /> Đánh giá & xếp hạng</>} 
      className="shadow-sm"
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
            className="hover:bg-slate-50 transition-colors"
            extra={
              <Space direction="vertical" align="end">
                <StatusBadge value={review.isHidden ? "hidden" : "visible"} />
                <Space>
                  <span className="text-sm text-slate-500">Hiển thị</span>
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
              description={<span className="text-slate-700 italic">"{review.comment || "Không có nhận xét chi tiết."}"</span>}
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
              <span><strong className="text-slate-700">Bệnh nhân:</strong> {review.patient?.fullName || "Bệnh nhân"}</span>
              <span><strong className="text-slate-700">Dịch vụ:</strong> {review.service?.name || "Chưa có dịch vụ"}</span>
              <span><strong className="text-slate-700">Bác sĩ:</strong> {review.dentist?.fullName || "Chưa có bác sĩ"}</span>
              <span><strong className="text-slate-700">Ngày:</strong> {formatDateTime(review.updatedAt)}</span>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
