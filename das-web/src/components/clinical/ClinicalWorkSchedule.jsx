import { Stethoscope } from "lucide-react";
import { Tag, Card, Button, Popconfirm, DatePicker, Typography, Space, Row, Col } from "antd";
import dayjs from "dayjs";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, formatDateTime, todayInput } from "../../utils/format.js";

const { Title, Text } = Typography;

export default function ClinicalWorkSchedule({
  appointments,
  canEditAppointment,
  clinicalColumns,
  clinicalQueues,
  date,
  isLockedAppointment,
  loading,
  onDateChange,
  onSelectTreatment,
  onSetRoomStatus,
  onUpdateStatus,
  rooms,
  user
}) {
  const visibleRooms = rooms || [];

  return (
    <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
        <Stethoscope size={20} color="#0369a1" />
        <Title level={4} style={{ margin: 0, color: '#0369a1' }}>Lịch khám trong ngày</Title>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <Space wrap>
          {visibleRooms.length ? (
            visibleRooms.map((room) => {
              const roomInUse = room.status === "in_use" || appointments.some(
                (appointment) => appointment.status === "in_treatment" && (appointment.room?._id || appointment.room) === room._id
              );

              return (
                <Tag
                  key={room._id}
                  color={roomInUse ? "warning" : room.status === "available" ? "success" : "default"}
                  style={{ padding: '4px 12px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Text>{room.name} / {room.assignedDentist?.fullName || "Chưa gán bác sĩ"}</Text>
                  <StatusBadge value={roomInUse ? "in_use" : room.status} />
                  {user?.role === "nurse" && (
                    <Button
                      size="small"
                      type="default"
                      style={{ marginLeft: 8 }}
                      disabled={roomInUse}
                      title={roomInUse ? "Phòng đang có bệnh nhân đang khám nên không thể đổi trạng thái." : undefined}
                      onClick={() => onSetRoomStatus(room._id, room.status === "available" ? "unavailable" : "available")}
                    >
                      {roomInUse ? "Đang dùng" : room.status === "available" ? "Chưa sẵn sàng" : "Sẵn sàng"}
                    </Button>
                  )}
                </Tag>
              );
            })
          ) : (
            <Text type="secondary">Chưa có phòng được phân công</Text>
          )}
        </Space>

        <Space align="center">
          <Text strong>Ngày:</Text>
          <DatePicker 
            value={date ? dayjs(date) : null} 
            onChange={(d, dateString) => onDateChange(dateString)} 
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </Space>
      </div>

      {loading ? (
        <EmptyState title="Đang tải lịch khám" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : appointments.length && clinicalColumns.length ? (
        <Row gutter={[16, 16]}>
          {clinicalQueues.map(({ column, appointments: columnAppointments }) => (
            <Col xs={24} md={12} lg={8} key={column._id}>
              <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <Text strong style={{ display: 'block' }}>{column.fullName}</Text>
                <Text type="secondary">{column.roomName || "Đang trực"}</Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {columnAppointments.length ? (
                  columnAppointments.map((appointment) => {
                    const isTodayAppointment = clinicDateInput(appointment.startAt) === todayInput();
                    const canStartTreatment = isTodayAppointment && appointment.status === "checked_in";
                    const queueNumber = appointment.queueNumber ? String(appointment.queueNumber).padStart(3, "0") : "";

                    return (
                      <Card 
                        key={appointment._id} 
                        size="small" 
                        style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', opacity: isLockedAppointment(appointment) ? 0.6 : 1 }}
                      >
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            {queueNumber && <Tag color="blue" style={{ fontSize: 18, padding: '4px 8px' }}>STT {queueNumber}</Tag>}
                            <Text strong>{[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")}</Text>
                          </div>
                          <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>{appointment.service?.name || "Dịch vụ"} / {appointment.room?.name || "Phòng khám"}</Text>
                          <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>Giờ khám: {formatDateTime(appointment.startAt)}</Text>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <StatusBadge value={appointment.status} />
                        </div>

                        <Space wrap>
                          {canEditAppointment(user, appointment) && (
                            <>
                              {user?.role === "nurse" && appointment.status === "checked_in" && (
                                <Popconfirm
                                  title="Chuyển sang đang khám?"
                                  description="Bạn có chắc chắn muốn chuyển lịch này sang trạng thái đang khám?"
                                  onConfirm={() => onUpdateStatus(appointment, "in_treatment")}
                                  okText="Có"
                                  cancelText="Không"
                                  disabled={!canStartTreatment}
                                >
                                  <Button 
                                    type="primary" 
                                    disabled={!canStartTreatment}
                                    title={!canStartTreatment ? "Chỉ chuyển sang đang khám trong ngày diễn ra lịch khám." : undefined}
                                  >
                                    Đang khám
                                  </Button>
                                </Popconfirm>
                              )}
                              {user?.role === "nurse" && appointment.status === "in_treatment" && (
                                <Popconfirm
                                  title="Xác nhận hoàn tất?"
                                  description="Xác nhận hoàn tất lịch khám này?"
                                  onConfirm={() => onUpdateStatus(appointment, "completed")}
                                  okText="Có"
                                  cancelText="Không"
                                >
                                  <Button type="primary" style={{ backgroundColor: '#10b981' }}>
                                    Hoàn tất
                                  </Button>
                                </Popconfirm>
                              )}
                              <Button onClick={() => onSelectTreatment(appointment)}>
                                Hồ sơ điều trị
                              </Button>
                            </>
                          )}
                        </Space>
                      </Card>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 14, border: '2px dashed #e2e8f0', borderRadius: 12 }}>Chưa có bệnh nhân</div>
                )}
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState title="Chưa có lịch khám" text="Lịch được ghi nhận có mặt hoặc xếp trong ngày sẽ hiển thị tại đây." />
      )}
    </Card>
  );
}
