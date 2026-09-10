import { Select, Button, Table, Flex, Space, Typography } from "antd";
import { CalendarPlus, PhoneCall } from "lucide-react";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime } from "../../utils/format.js";

const { Title, Text } = Typography;

const genderLabels = {
  male: "Anh",
  female: "Chị",
  other: "Khác",
  unknown: "Chưa chọn"
};

export default function ConsultationRequestList({
  consultations,
  loading,
  onBookConsultation,
  onStatusFilterChange,
  onUpdateConsultationStatus,
  statusFilter = "waiting"
}) {
  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, item) => (
        <Flex vertical gap="small">
          <Text strong>{genderLabels[item.gender] || "Chưa chọn"} {item.fullName} - {item.phone}</Text>
          <Text type="secondary">Dịch vụ quan tâm: {item.service?.name || "Chưa chọn"}</Text>
          <Text type="secondary">Thời gian đặt tư vấn: {formatDateTime(item.createdAt)}</Text>
          {item.contactedAt && <Text type="secondary">Đã tư vấn lúc: {formatDateTime(item.contactedAt)}</Text>}
        </Flex>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, item) => (
        <Flex align="center" gap="small" wrap="wrap">
          <StatusBadge value={item.status || "waiting"} />
          <Select
            value={item.status || "waiting"}
            onChange={(val) => onUpdateConsultationStatus?.(item, val)}
            disabled={(item.status || "waiting") === "contacted"}
            style={{ minWidth: 120 }}
            options={[
              { value: "waiting", label: "Chờ tư vấn" },
              { value: "contacted", label: "Đã tư vấn" }
            ]}
          />
          {(item.status || "waiting") === "waiting" && (
            <Button
              type="primary"
              icon={<CalendarPlus size={16} />}
              onClick={() => onBookConsultation?.(item)}
            >
              Đặt lịch
            </Button>
          )}
        </Flex>
      )
    }
  ];

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Flex align="center" gap="small" style={{ marginBottom: 16 }}>
        <PhoneCall size={20} color="#1890ff" />
        <Title level={4} style={{ margin: 0 }}>Yêu cầu tư vấn</Title>
      </Flex>

      <Flex align="center" gap="middle" style={{ marginBottom: 16 }}>
        <Flex align="center" gap="small">
          <Text strong>Trạng thái</Text>
          <Select
            value={statusFilter}
            onChange={(val) => onStatusFilterChange?.(val)}
            style={{ minWidth: 120 }}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "waiting", label: "Chờ tư vấn" },
              { value: "contacted", label: "Đã tư vấn" }
            ]}
          />
        </Flex>
      </Flex>

      <Table
        dataSource={consultations}
        columns={columns}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: <EmptyState title="Không có yêu cầu tư vấn" text="Không có dữ liệu phù hợp với bộ lọc hiện tại." /> }}
        pagination={{ pageSize: 10 }}
      />
    </Space>
  );
}
