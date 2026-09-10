import { CalendarClock, Filter, X } from "lucide-react";
import { useMemo, useState } from "react";
import { List, Space, Flex, Typography, Card, Input, Button } from "antd";
import EmptyState from "../EmptyState.jsx";
import PatientAppointmentCard from "./PatientAppointmentCard.jsx";
import { clinicDateInput, compareAppointmentsNewestFirst } from "../../utils/format.js";

const { Title, Text } = Typography;

export default function PatientAppointmentList({
  appointments,
  appointmentHistory = [],
  canModifyAppointment,
  cancelAppointment,
  dentistOptions,
  historyOnly = false,
  loading,
  rescheduleAppointment,
  rescheduleForms,
  slotClosures = [],
  slotOptions,
  updateRescheduleForm
}) {
  const [filterDate, setFilterDate] = useState("");
  const source = historyOnly ? appointmentHistory : appointments;
  const visibleAppointments = useMemo(() => {
    return source
      .filter((appointment) => !filterDate || clinicDateInput(appointment.startAt) === filterDate)
      .sort(compareAppointmentsNewestFirst);
  }, [source, filterDate]);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }} id="appointments">
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Flex align="center" gap={8}>
          <CalendarClock style={{ color: "#10b981" }} size={24} />
          <Title level={4} style={{ margin: 0 }}>{historyOnly ? "Lịch sử lịch hẹn" : "Lịch hẹn của tôi"}</Title>
        </Flex>

        <Flex align="center" gap={8} style={{ backgroundColor: "#fff", padding: 6, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
          <Flex align="center" gap={8} style={{ padding: "0 8px", borderRight: "1px solid #f1f5f9", color: "#64748b" }}>
            <Filter size={16} />
            <Text strong style={{ fontSize: 13, display: "none" }}>Lọc ngày</Text>
          </Flex>
          <input
            type="date"
            style={{ border: "none", backgroundColor: "transparent", fontSize: 13, fontWeight: 500, color: "#334155", outline: "none", cursor: "pointer", padding: "0 8px" }}
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
          {filterDate && (
            <Button
              type="text"
              size="small"
              icon={<X size={16} />}
              onClick={() => setFilterDate("")}
              style={{ color: "#94a3b8" }}
              title="Xóa bộ lọc"
            />
          )}
        </Flex>
      </Flex>

      {loading ? (
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <EmptyState title="Đang tải lịch hẹn" text="Hệ thống đang lấy dữ liệu mới nhất." />
        </Card>
      ) : visibleAppointments.length ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          dataSource={visibleAppointments}
          renderItem={(appointment) => (
            <List.Item key={appointment._id}>
              <PatientAppointmentCard
                appointment={appointment}
                canModifyAppointment={canModifyAppointment}
                cancelAppointment={cancelAppointment}
                dentistOptions={dentistOptions}
                rescheduleAppointment={rescheduleAppointment}
                rescheduleForm={rescheduleForms[appointment._id]}
                slotClosures={slotClosures}
                slotOptions={slotOptions}
                updateRescheduleForm={updateRescheduleForm}
              />
            </List.Item>
          )}
        />
      ) : (
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <EmptyState
            title={historyOnly ? "Chưa có lịch sử lịch hẹn" : "Chưa có lịch hẹn"}
            text={filterDate ? "Không có lịch hẹn trong ngày đang lọc." : historyOnly ? "Các lịch đã hoàn tất, bị từ chối, hủy hoặc vắng mặt sẽ hiển thị tại đây." : "Bạn có thể đặt lịch mới tại màn Đặt lịch."}
          />
        </Card>
      )}
    </Space>
  );
}
