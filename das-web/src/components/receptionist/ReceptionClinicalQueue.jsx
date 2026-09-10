import { CalendarDays, DoorOpen } from "lucide-react";
import { useState } from "react";
import { Card, Button, DatePicker, Select, Popconfirm, Flex, Space, Typography, Row, Col, Input } from "antd";
import dayjs from "dayjs";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, filterOpenSlotsForDate, formatTime, getAppointmentSlot, todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

const { Title, Text } = Typography;

export default function ReceptionClinicalQueue({
  allSlotOptions = [],
  date,
  dentistColumns,
  isLockedScheduleAppointment,
  loading,
  manualSchedules = {},
  onCheckInAppointment,
  onMarkNoShow,
  onToggleSlot,
  queueSlots,
  rooms,
  scheduleReceptionAppointment,
  services,
  setDate,
  slots = [],
  slotClosures = [],
  updateManualSchedule
}) {
  const [editingAppointmentId, setEditingAppointmentId] = useState("");

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
      <Flex align="center" gap="small">
        <CalendarDays size={20} color="#1890ff" />
        <Title level={4} style={{ margin: 0 }}>Lịch khám theo thứ tự có mặt</Title>
      </Flex>

      <Row gutter={[16, 16]}>
        {rooms.map((room) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={room._id}>
            <Card styles={{ body: { padding: 16 } }}>
              <Flex align="flex-start" gap="small">
                <DoorOpen size={24} color="#1890ff" style={{ marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block' }}>{room.name}</Text>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>{room.assignedDentist?.fullName || "Chưa có bác sĩ phụ trách"}</Text>
                  <StatusBadge value={room.status} />
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
        <Flex align="center" gap="small">
          <Text strong>Ngày</Text>
          <DatePicker
            value={date ? dayjs(date) : null}
            onChange={(d, dateString) => setDate(dateString)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </Flex>
      </div>

      <Flex wrap="wrap" gap="small">
        {allSlotOptions.map((slot) => (
          <Flex align="center" gap="small" style={{ backgroundColor: '#fff', padding: '6px 12px', borderRadius: 8, border: '1px solid #f0f0f0' }} key={slot._id || slot.slotId}>
            <Text strong>{slot.label}</Text>
            <StatusBadge value={slot.isClosed ? "closed" : "active"} />
            <Popconfirm
              title={slot.isClosed ? `Mở lại ${slot.label} trong ngày ${date}?` : `Đóng ${slot.label} trong ngày ${date}?`}
              onConfirm={() => onToggleSlot?.(slot)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button size="small" type={slot.isClosed ? "default" : "dashed"} danger={!slot.isClosed} style={slot.isClosed ? { color: '#52c41a', borderColor: '#b7eb8f', backgroundColor: '#f6ffed' } : {}}>
                {slot.isClosed ? "Mở giờ" : "Đóng giờ"}
              </Button>
            </Popconfirm>
          </Flex>
        ))}
      </Flex>

      {loading ? (
        <EmptyState title="Đang tải lịch khám" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : dentistColumns.length ? (
        <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
          <div style={{ minWidth: 'max-content', border: '1px solid #f0f0f0', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `130px repeat(${dentistColumns.length}, minmax(300px, 1fr))`, borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
              <Flex align="center" justify="center" style={{ padding: 16, borderRight: '1px solid #f0f0f0' }}>
                <Text strong>Khung giờ</Text>
              </Flex>
              {dentistColumns.map((dentist) => (
                <div style={{ padding: 16, textAlign: 'center', borderRight: '1px solid #f0f0f0' }} key={dentist._id}>
                  <Text strong style={{ display: 'block' }}>{dentist.fullName}</Text>
                  <Text type="secondary">{dentist.roomName || "Chưa gán phòng"}</Text>
                </div>
              ))}
            </div>

            {queueSlots.map(({ slot, dentistQueues }) => (
              <div
                style={{ display: 'grid', gridTemplateColumns: `130px repeat(${dentistColumns.length}, minmax(300px, 1fr))`, borderBottom: '1px solid #f0f0f0' }}
                key={slot.slotId}
              >
                <Flex vertical align="center" justify="center" style={{ padding: 16, borderRight: '1px solid #f0f0f0', backgroundColor: 'rgba(250, 250, 250, 0.5)' }}>
                  <div style={{ color: '#0958d9', backgroundColor: '#e6f4ff', padding: '4px 12px', borderRadius: 8, textAlign: 'center', marginBottom: 4, fontWeight: 'bold' }}>
                    {slot.slotName}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{slot.timeLabel}</Text>
                </Flex>
                {dentistQueues.map(({ dentist, appointments }) => (
                  <div style={{ padding: 12, borderRight: '1px solid #f0f0f0', backgroundColor: 'rgba(250, 250, 250, 0.3)' }} key={`${slot.slotId}-${dentist._id}`}>
                    {appointments.length ? (
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {appointments.map((appointment) => {
                          const locked = isLockedScheduleAppointment(appointment);
                          const appointmentDate = clinicDateInput(appointment.startAt);
                          const today = todayInput();
                          const isTodayAppointment = appointmentDate === today;
                          const isFutureAppointment = appointmentDate > today;
                          const isPastAppointment = appointmentDate < today;
                          const canCheckIn = !locked && isTodayAppointment && ["scheduled", "confirmed"].includes(appointment.status);
                          const canMarkNoShow = !locked && isTodayAppointment && ["scheduled", "confirmed"].includes(appointment.status);
                          const canEditSchedule = appointment.status === "scheduled";
                          const isEditingSchedule = editingAppointmentId === appointment._id;
                          const queueNumber = appointment.queueNumber;
                          const manualForm = manualSchedules[appointment._id] || defaultManualSchedule(appointment, rooms, services, slots, slotClosures);
                          const rowSlotOptions = filterOpenSlotsForDate(slots, slotClosures, manualForm.date);
                          const manualTime = rowSlotOptions.some((slotOption) => slotOption.value === manualForm.time) ? manualForm.time : rowSlotOptions[0]?.value || "";
                          const selectedSlot = rowSlotOptions.find((slotOption) => slotOption.value === manualTime) || rowSlotOptions[0];
                          const arrivalTime = isArrivalTimeInsideSlot(manualForm.arrivalTime, selectedSlot) ? manualForm.arrivalTime : selectedSlot?.value || "";

                          return (
                            <Card style={{ opacity: locked ? 0.6 : 1, backgroundColor: locked ? '#fafafa' : '#fff' }} styles={{ body: { padding: 12 } }} key={appointment._id}>
                              <div style={{ marginBottom: 12 }}>
                                <Flex align="flex-start" gap="small" style={{ marginBottom: 8 }}>
                                  {queueNumber && <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1677ff', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>STT {queueNumber}</div>}
                                  <Text strong style={{ fontSize: 13 }}>{[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")}</Text>
                                </Flex>
                                <Space direction="vertical" size={2} style={{ marginBottom: 8 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>{appointment.service?.name || "Dịch vụ"} / {appointment.room?.name || "Phòng"}</Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Giờ khám: {formatTime(appointment.startAt)}</Text>
                                  {appointment.checkedInAt && <Text type="secondary" style={{ fontSize: 12 }}>Có mặt: {formatTime(appointment.checkedInAt)}</Text>}
                                </Space>
                                <div style={{ marginBottom: 4 }}>
                                  <StatusBadge value={appointment.status} />
                                </div>
                                {locked && <Text type="danger" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>Lịch đã hủy hoặc bị từ chối, không thể đổi trạng thái.</Text>}
                                {isFutureAppointment && ["scheduled", "confirmed"].includes(appointment.status) && (
                                  <Text style={{ color: '#d48806', fontSize: 12, marginTop: 8, display: 'block' }}>Chỉ ghi nhận có mặt trong ngày diễn ra lịch khám.</Text>
                                )}
                                {isPastAppointment && ["scheduled", "confirmed"].includes(appointment.status) && (
                                  <Text type="danger" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>Lịch khám đã qua ngày nên không thể cập nhật có mặt hoặc vắng mặt.</Text>
                                )}
                              </div>

                              <div style={{ paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  {canEditSchedule && (
                                    <Button
                                      size="small"
                                      style={{ width: '100%' }}
                                      onClick={() => setEditingAppointmentId(isEditingSchedule ? "" : appointment._id)}
                                    >
                                      {isEditingSchedule ? "Đóng đổi lịch" : "Đổi lịch"}
                                    </Button>
                                  )}
                                  <Flex gap="small">
                                    <Popconfirm
                                      title="Xác nhận bệnh nhân đã có mặt tại quầy?"
                                      onConfirm={() => onCheckInAppointment(appointment)}
                                      disabled={!canCheckIn}
                                      okText="Đồng ý"
                                      cancelText="Hủy"
                                    >
                                      <Button size="small" type="primary" disabled={!canCheckIn} style={{ flex: 1, backgroundColor: canCheckIn ? '#52c41a' : undefined }}>
                                        Có mặt
                                      </Button>
                                    </Popconfirm>
                                    <Popconfirm
                                      title="Xác nhận bệnh nhân vắng mặt trong lịch khám này?"
                                      onConfirm={() => onMarkNoShow(appointment)}
                                      disabled={!canMarkNoShow}
                                      okText="Đồng ý"
                                      cancelText="Hủy"
                                    >
                                      <Button size="small" danger disabled={!canMarkNoShow} style={{ flex: 1 }}>
                                        Vắng mặt
                                      </Button>
                                    </Popconfirm>
                                  </Flex>
                                </Space>
                              </div>

                              {canEditSchedule && isEditingSchedule && (
                                <div style={{ marginTop: 12, padding: 12, backgroundColor: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <div>
                                      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ngày khám</Text>
                                      <DatePicker
                                        value={manualForm.date ? dayjs(manualForm.date) : null}
                                        onChange={(d, dateString) => {
                                          const nextDate = dateString;
                                          const nextSlotOptions = filterOpenSlotsForDate(slots, slotClosures, nextDate);
                                          const nextSlot = nextSlotOptions[0];
                                          updateManualSchedule?.(appointment, {
                                            date: nextDate,
                                            time: nextSlot?.value || "",
                                            arrivalTime: nextSlot?.value || ""
                                          });
                                        }}
                                        format="YYYY-MM-DD"
                                        minDate={dayjs(todayInput())}
                                        maxDate={dayjs(maxBookingDate())}
                                        allowClear={false}
                                        style={{ width: '100%', fontSize: 12 }}
                                        size="small"
                                      />
                                    </div>
                                    <div>
                                      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dịch vụ</Text>
                                      <Select
                                        value={manualForm.serviceId}
                                        onChange={(val) => updateManualSchedule?.(appointment, { serviceId: val })}
                                        style={{ width: '100%', fontSize: 12 }}
                                        size="small"
                                        options={services.map(s => ({ value: s._id, label: s.name }))}
                                      />
                                    </div>
                                    <Flex gap="small">
                                      <div style={{ flex: 1 }}>
                                        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Slot</Text>
                                        <Select
                                          value={manualTime}
                                          onChange={(val) => {
                                            const nextSlot = rowSlotOptions.find((slotOption) => slotOption.value === val);
                                            updateManualSchedule?.(appointment, {
                                              time: val,
                                              arrivalTime: nextSlot?.value || ""
                                            });
                                          }}
                                          style={{ width: '100%', fontSize: 12 }}
                                          size="small"
                                          options={rowSlotOptions.length ? rowSlotOptions.map(s => ({ value: s.value, label: s.label })) : [{ value: "", label: "Đã đóng" }]}
                                        />
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Giờ đến</Text>
                                        <Input
                                          type="time"
                                          step="60"
                                          min={selectedSlot?.value || ""}
                                          max={selectedSlot?.endTime ? previousMinuteTime(selectedSlot.endTime) : ""}
                                          value={arrivalTime}
                                          onChange={(event) => updateManualSchedule?.(appointment, { arrivalTime: event.target.value })}
                                          disabled={!selectedSlot}
                                          style={{ width: '100%', height: 24, fontSize: 12 }}
                                        />
                                      </div>
                                    </Flex>
                                    <div>
                                      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bác sĩ</Text>
                                      <Select
                                        value={manualForm.roomId}
                                        onChange={(val) => updateManualSchedule?.(appointment, { roomId: val })}
                                        style={{ width: '100%', fontSize: 12 }}
                                        size="small"
                                        options={rooms.filter(r => r.assignedDentist?._id).map(r => ({ value: r._id, label: r.assignedDentist.fullName }))}
                                      />
                                    </div>
                                    <Popconfirm
                                      title="Xác nhận đổi lịch?"
                                      onConfirm={() => {
                                        scheduleReceptionAppointment?.(appointment);
                                        setEditingAppointmentId("");
                                      }}
                                      okText="Đồng ý"
                                      cancelText="Hủy"
                                    >
                                      <Button type="primary" size="small" style={{ width: '100%', marginTop: 8 }}>
                                        Cập nhật lịch
                                      </Button>
                                    </Popconfirm>
                                  </Space>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </Space>
                    ) : (
                      <Flex align="center" justify="center" style={{ height: '100%', minHeight: 60, border: '2px dashed #f0f0f0', borderRadius: 8 }}>
                        <Text type="secondary" style={{ fontSize: 14 }}>Trống</Text>
                      </Flex>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="Chưa có bác sĩ trong hàng đợi" text="Bảng này sẽ hiển thị khi có bác sĩ hoặc phòng khám được gán trong dữ liệu hệ thống." />
      )}
    </Space>
  );
}

function defaultManualSchedule(appointment, rooms, services, slots = [], slotClosures = []) {
  const startAt = appointment.startAt ? new Date(appointment.startAt) : new Date();
  const appointmentDate = Number.isNaN(startAt.getTime()) ? "" : clinicDateInput(startAt);
  const date = appointmentDate && appointmentDate >= todayInput() ? appointmentDate : todayInput();
  const slotOptions = filterOpenSlotsForDate(slots, slotClosures, date);
  const currentSlotValue = Number.isNaN(startAt.getTime()) ? "" : getAppointmentSlot(startAt, slotOptions).value;
  const slot = slotOptions.find((option) => option.value === currentSlotValue) || slotOptions[0];

  return {
    date,
    serviceId: appointment.service?._id || services[0]?._id || "",
    time: Number.isNaN(startAt.getTime())
      ? slotOptions[0]?.value || ""
      : slotOptions.some((option) => option.value === currentSlotValue)
        ? currentSlotValue
        : slotOptions[0]?.value || currentSlotValue,
    arrivalTime: isArrivalTimeInsideSlot(currentSlotValue, slot) ? currentSlotValue : slot?.value || "",
    roomId: appointment.room?._id || rooms[0]?._id || ""
  };
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
