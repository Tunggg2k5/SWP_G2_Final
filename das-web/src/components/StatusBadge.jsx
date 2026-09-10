import { Tag } from "antd";

const labels = {
  pending: "Chờ xác nhận",
  scheduled: "Chưa diễn ra",
  confirmed: "Đã xác nhận",
  waitlisted: "Hàng đợi",
  rejected: "Đã từ chối",
  called: "Đã gọi",
  checked_in: "Có mặt",
  in_treatment: "Đang khám",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  no_show: "Vắng mặt",
  waiting: "Chờ tư vấn",
  contacted: "Đã tư vấn",
  booked: "Đã đặt lịch",
  expired: "Quá hạn",
  new: "Mới",
  closed: "Đóng",
  active: "Hoạt động",
  inactive: "Ngưng",
  visible: "Đang hiện",
  hidden: "Đã ẩn",
  locked: "Khóa",
  available: "Sẵn sàng",
  in_use: "Đang dùng",
  cleaning: "Vệ sinh",
  maintenance: "Bảo trì",
  unavailable: "Chưa sẵn sàng",
  paid: "Đã trả",
  unpaid: "Chưa trả",
  partial: "Đang trả theo tháng",
  pending_checkin: "Thanh toán khi đến",
  not_required: "Không yêu cầu",
  refunded: "Đã hoàn tiền",
  off: "Nghỉ",
  draft: "Nháp"
};

const tagColors = {
  pending: "warning",
  scheduled: "processing",
  confirmed: "processing",
  waitlisted: "warning",
  rejected: "error",
  called: "cyan",
  checked_in: "cyan",
  in_treatment: "purple",
  completed: "success",
  cancelled: "error",
  no_show: "error",
  waiting: "warning",
  contacted: "success",
  booked: "processing",
  expired: "default",
  new: "cyan",
  closed: "default",
  active: "success",
  inactive: "default",
  visible: "success",
  hidden: "default",
  locked: "error",
  available: "success",
  in_use: "purple",
  cleaning: "warning",
  maintenance: "orange",
  unavailable: "default",
  paid: "success",
  unpaid: "orange",
  partial: "warning",
  pending_checkin: "warning",
  not_required: "default",
  refunded: "cyan",
  off: "default",
  draft: "default"
};

export default function StatusBadge({ value }) {
  const color = tagColors[value] || "default";
  return (
    <Tag color={color} style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 9999, margin: 0, border: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      {labels[value] || value || "-"}
    </Tag>
  );
}
