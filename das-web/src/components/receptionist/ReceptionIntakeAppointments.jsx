import { ClipboardList } from "lucide-react";
import { Button, Select, DatePicker, List, Card, Popconfirm, Flex, Space, Typography, Row, Col, Input } from "antd";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, filterOpenSlotsForDate, formatDateTime, formatSlotWithDate, getAppointmentSlot, todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";
import ReceptionAppointmentFilters from "./ReceptionAppointmentFilters.jsx";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ReceptionIntakeAppointments({
  appointmentSearch,
  appointments,
  date,
  loading,
  onRejectAppointment,
  manualSchedules,
  rooms,
  scheduleReceptionAppointment,
  setAppointmentSearch,
  setDate,
  slots = [],
  slotClosures = [],
  slotOptions,
  updateManualSchedule
}) {
  return (
    <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
      <Flex align="center" gap="small">
        <ClipboardList size={20} color="#1890ff" />
        <Title level={4} style={{ margin: 0 }}>Lịch hẹn chờ xác nhận</Title>
      </Flex>

      <ReceptionAppointmentFilters
        date={date}
        setDate={setDate}
        appointmentSearch={appointmentSearch}
        setAppointmentSearch={setAppointmentSearch}
        showDate
      />

      <List
        loading={loading}
        dataSource={appointments}
        locale={{ emptyText: <EmptyState title="Không có lịch hẹn" text="Lịch hẹn mới sẽ xuất hiện tại đây khi có dữ liệu trong hệ thống." /> }}
        renderItem={(appointment) => {
          const appointmentDate = clinicDateInput(appointment.startAt);
          const defaultDate = appointmentDate && appointmentDate >= todayInput() ? appointmentDate : todayInput();
          const manualForm = manualSchedules[appointment._id] || {
            date: defaultDate,
            time: appointment.startAt ? getAppointmentSlot(appointment.startAt, slotOptions).value : slotOptions[0]?.value || "",
            roomId: appointment.room?._id || rooms[0]?._id || ""
          };
          const rowSlotOptions = filterOpenSlotsForDate(slots, slotClosures, manualForm.date);
          const manualTime = rowSlotOptions.some((slot) => slot.value === manualForm.time) ? manualForm.time : rowSlotOptions[0]?.value || "";
          const selectedSlot = rowSlotOptions.find((slot) => slot.value === manualTime) || rowSlotOptions[0];
          const arrivalTime = isArrivalTimeInsideSlot(manualForm.arrivalTime, selectedSlot)
            ? manualForm.arrivalTime
            : selectedSlot?.value || "";

          return (
            <List.Item style={{ padding: 0, border: 'none', marginBottom: 16, display: 'block' }}>
              <Card style={{ width: '100%' }} styles={{ body: { padding: 20 } }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={16}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="small">
                        <div>
                          <Title level={5} style={{ margin: 0 }}>{appointment.patient?.fullName || "Bệnh nhân"}</Title>
                          <Text type="secondary">{appointment.patient?.phone || "Chưa có SĐT"}</Text>
                        </div>
                        <StatusBadge value={appointment.status} />
                      </Flex>
                      
                      <div style={{ backgroundColor: '#fafafa', padding: 12, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                        <Row gutter={[8, 8]}>
                          <Col span={24}>
                            <Text strong>{appointment.service?.name || "Dịch vụ nha khoa"}</Text>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Khung giờ khách chọn: {formatSlotWithDate(appointment.startAt, appointment.slot?.startTime ? appointment.slot : slotOptions)}</Text>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Khách gửi lúc: {formatDateTime(appointment.createdAt)}</Text>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Bác sĩ: {appointment.dentist?.fullName || "Lễ tân sắp xếp"}</Text>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Kênh: {appointment.channel === "online" ? "Online" : "Tại quầy"}</Text>
                          </Col>
                        </Row>
                      </div>

                      {appointment.patientNote && (
                        <div style={{ backgroundColor: '#fffbe6', padding: 8, borderRadius: 4 }}>
                          <Text style={{ color: '#d48806', fontSize: 13 }}>Ghi chú: {appointment.patientNote}</Text>
                        </div>
                      )}
                    </Space>
                  </Col>

                  <Col xs={24} md={8}>
                    <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <DatePicker
                              value={manualForm.date ? dayjs(manualForm.date) : null}
                              onChange={(d, dateString) => {
                                const nextDate = dateString;
                                const nextSlotOptions = filterOpenSlotsForDate(slots, slotClosures, nextDate);
                                const nextSlot = nextSlotOptions[0];
                                updateManualSchedule(appointment, {
                                  date: nextDate,
                                  time: nextSlot?.value || "",
                                  arrivalTime: nextSlot?.value || ""
                                });
                              }}
                              format="YYYY-MM-DD"
                              minDate={dayjs(todayInput())}
                              maxDate={dayjs(maxBookingDate())}
                              allowClear={false}
                              style={{ width: '100%' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Select
                              value={manualTime}
                              onChange={(val) => {
                                const nextSlot = rowSlotOptions.find((slot) => slot.value === val);
                                updateManualSchedule(appointment, {
                                  time: val,
                                  arrivalTime: nextSlot?.value || ""
                                });
                              }}
                              style={{ width: '100%' }}
                              options={rowSlotOptions.length ? rowSlotOptions.map(s => ({ value: s.value, label: s.label })) : [{ value: "", label: "Đã đóng" }]}
                            />
                          </Col>
                          <Col span={12}>
                            <Flex align="center" gap={4}>
                              <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Giờ đến:</Text>
                              <Input
                                type="time"
                                step="60"
                                min={selectedSlot?.value || ""}
                                max={selectedSlot?.endTime ? previousMinuteTime(selectedSlot.endTime) : ""}
                                value={arrivalTime}
                                onChange={(event) => updateManualSchedule(appointment, { arrivalTime: event.target.value })}
                                disabled={!selectedSlot}
                                title={selectedSlot ? `Chọn từ ${selectedSlot.value} đến trước ${selectedSlot.endTime}` : "Chọn khung giờ trước"}
                                style={{ width: '100%', padding: '4px 8px' }}
                              />
                            </Flex>
                          </Col>
                          <Col span={12}>
                            <Select
                              value={manualForm.roomId}
                              onChange={(val) => updateManualSchedule(appointment, { roomId: val })}
                              style={{ width: '100%' }}
                              options={rooms.filter(r => r.assignedDentist?._id).map(r => ({ value: r._id, label: r.assignedDentist.fullName }))}
                            />
                          </Col>
                        </Row>

                        <div style={{ paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                          <Flex gap="small">
                            <Popconfirm
                              title="Xác nhận từ chối lịch hẹn này?"
                              onConfirm={() => onRejectAppointment(appointment)}
                              okText="Đồng ý"
                              cancelText="Hủy"
                            >
                              <Button danger style={{ flex: 1 }}>
                                Từ chối
                              </Button>
                            </Popconfirm>
                            <Popconfirm
                              title="Xác nhận lịch khám?"
                              onConfirm={() => scheduleReceptionAppointment(appointment)}
                              okText="Đồng ý"
                              cancelText="Hủy"
                            >
                              <Button type="primary" style={{ flex: 1 }}>
                                Xác nhận
                              </Button>
                            </Popconfirm>
                          </Flex>
                        </div>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          );
        }}
      />
    </Space>
  );
}

function isArrivalTimeInsideSlot(arrivalTime, slot) {
  if (!arrivalTime || !slot?.value || !slot?.endTime) return false;
  return arrivalTime >= slot.value && arrivalTime < slot.endTime;
}

function previousMinuteTime(value) {
  const [hour, minute] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "";
  const total = Math.max(hour * 60 + minute - 1, 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
