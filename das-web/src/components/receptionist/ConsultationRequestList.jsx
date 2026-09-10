import { Select, Button, Table } from "antd";
import { CalendarPlus, PhoneCall } from "lucide-react";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime } from "../../utils/format.js";

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
        <div className="flex flex-col space-y-1">
          <strong className="text-slate-800 font-semibold">{genderLabels[item.gender] || "Chưa chọn"} {item.fullName} - {item.phone}</strong>
          <span className="text-sm text-slate-600">Dịch vụ quan tâm: {item.service?.name || "Chưa chọn"}</span>
          <span className="text-sm text-slate-500">Thời gian đặt tư vấn: {formatDateTime(item.createdAt)}</span>
          {item.contactedAt && <span className="text-sm text-slate-500">Đã tư vấn lúc: {formatDateTime(item.contactedAt)}</span>}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, item) => (
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge value={item.status || "waiting"} />
          <Select
            value={item.status || "waiting"}
            onChange={(val) => onUpdateConsultationStatus?.(item, val)}
            disabled={(item.status || "waiting") === "contacted"}
            className="min-w-[120px]"
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
              className="bg-primary-600 hover:bg-primary-500"
            >
              Đặt lịch
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <PhoneCall size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-slate-800">Yêu cầu tư vấn</h2>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Trạng thái</span>
          <Select
            value={statusFilter}
            onChange={(val) => onStatusFilterChange?.(val)}
            className="min-w-[120px]"
            options={[
              { value: "all", label: "Tất cả" },
              { value: "waiting", label: "Chờ tư vấn" },
              { value: "contacted", label: "Đã tư vấn" }
            ]}
          />
        </div>
      </div>

      <Table
        dataSource={consultations}
        columns={columns}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: <EmptyState title="Không có yêu cầu tư vấn" text="Không có dữ liệu phù hợp với bộ lọc hiện tại." /> }}
        pagination={{ pageSize: 10 }}
      />
    </section>
  );
}
