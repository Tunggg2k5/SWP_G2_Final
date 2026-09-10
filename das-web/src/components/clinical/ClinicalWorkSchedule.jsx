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
    <Card className="shadow-sm">
      <div className="flex items-center gap-3 text-primary-700 mb-6 border-b border-slate-100 pb-4">
        <Stethoscope size={20} />
        <Title level={4} style={{ margin: 0 }} className="text-primary-700">Lịch khám trong ngày</Title>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
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
                  className="px-3 py-1 text-sm flex items-center gap-2"
                >
                  <Text>{room.name} / {room.assignedDentist?.fullName || "Chưa gán bác sĩ"}</Text>
                  <StatusBadge value={roomInUse ? "in_use" : room.status} />
                  {user?.role === "nurse" && (
                    <Button
                      size="small"
                      type="default"
                      className="ml-2"
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
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                <Text strong className="block">{column.fullName}</Text>
                <Text type="secondary">{column.roomName || "Đang trực"}</Text>
              </div>

              <div className="flex flex-col gap-3">
                {columnAppointments.length ? (
                  columnAppointments.map((appointment) => {
                    const isTodayAppointment = clinicDateInput(appointment.startAt) === todayInput();
                    const canStartTreatment = isTodayAppointment && appointment.status === "checked_in";
                    const queueNumber = appointment.queueNumber ? String(appointment.queueNumber).padStart(3, "0") : "";

                    return (
                      <Card 
                        key={appointment._id} 
                        size="small" 
                        className={`shadow-sm ${isLockedAppointment(appointment) ? "opacity-60" : ""}`}
                      >
                        <div className="mb-2">
                          <div className="flex items-center gap-3 mb-2">
                            {queueNumber && <Tag color="blue" className="text-lg py-1">STT {queueNumber}</Tag>}
                            <Text strong>{[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")}</Text>
                          </div>
                          <Text type="secondary" className="block text-sm">{appointment.service?.name || "Dịch vụ"} / {appointment.room?.name || "Phòng khám"}</Text>
                          <Text type="secondary" className="block text-sm">Giờ khám: {formatDateTime(appointment.startAt)}</Text>
                        </div>

                        <div className="mb-3">
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
                                  <Button type="primary" success="true" className="bg-emerald-500">
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
                  <div className="text-center p-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">Chưa có bệnh nhân</div>
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
