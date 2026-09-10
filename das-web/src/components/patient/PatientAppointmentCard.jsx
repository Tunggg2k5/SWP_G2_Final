import { useState } from "react";
import { Card, Flex, Space, Typography, Row, Col, Button, Select, Input } from "antd";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, filterOpenSlotsForDate, formatDateTime, formatSlotWithDate, getAppointmentSlot, todayInput } from "../../utils/format.js";
import RescheduleAppointmentModal from "./RescheduleAppointmentModal.jsx";
import { Calendar, Clock, User, FileText } from "lucide-react";

const { Title, Text } = Typography;

const cancelReasons = [
  "Bận việc cá nhân",
  "Muốn đổi sang thời gian khác",
  "Đã hết triệu chứng",
  "Đặt nhầm lịch",
  "Lý do khác"
];

const arrangedStatuses = new Set(["scheduled", "confirmed", "checked_in", "in_treatment", "completed"]);

export default function PatientAppointmentCard({
  appointment,
  canModifyAppointment,
  cancelAppointment,
  dentistOptions,
  rescheduleAppointment,
  rescheduleForm,
  slotClosures = [],
  slotOptions = [],
  updateRescheduleForm
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [customCancelReason, setCustomCancelReason] = useState("");
  const canModify = canModifyAppointment(appointment);
  const currentRescheduleForm = rescheduleForm || {
    date: clinicDateInput(appointment.startAt) || todayInput(),
    time: "",
    dentistId: appointment.dentist?._id || dentistOptions[0]?._id || ""
  };
  const currentSlotOptions = filterOpenSlotsForDate(slotOptions, slotClosures, currentRescheduleForm.date);
  const effectiveRescheduleForm = {
    ...currentRescheduleForm,
    time: currentRescheduleForm.time || getAppointmentSlot(appointment.startAt, currentSlotOptions)?.value || currentSlotOptions[0]?.value || ""
  };
  const isArranged = arrangedStatuses.has(appointment.status);
  const scheduleText = isArranged
    ? `Giờ đến: ${formatDateTime(appointment.checkedInAt || appointment.startAt)}`
    : `Khung giờ đã đặt: ${formatSlotWithDate(appointment.startAt, appointment.slot?.startTime ? appointment.slot : slotOptions)}`;

  function openRescheduleForm() {
    updateRescheduleForm(appointment, {});
    setCancelOpen(false);
    setRescheduleOpen(true);
  }

  async function submitReschedule() {
    const success = await rescheduleAppointment(appointment);
    if (success) setRescheduleOpen(false);
  }

  async function submitCancel() {
    const reason = cancelReason === "Lý do khác" ? customCancelReason : cancelReason;
    await cancelAppointment(appointment, reason);
    setCancelOpen(false);
  }

  return (
    <Card 
      bordered={false} 
      style={{ borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", height: "100%" }}
      bodyStyle={{ display: "flex", flexDirection: "column", gap: 16 }}
      key={appointment._id}
    >
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12} style={{ paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>{appointment.service?.name}</Title>
          <Flex align="center" gap={6} style={{ marginTop: 4, color: "#10b981" }}>
            {isArranged ? <Clock size={16} /> : <Calendar size={16} />}
            <Text strong style={{ fontSize: 13, color: "#10b981" }}>{scheduleText}</Text>
          </Flex>
        </div>
        <StatusBadge value={appointment.status} />
      </Flex>

      <div style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <Flex gap={8} align="flex-start">
              <User size={16} style={{ color: "#94a3b8", marginTop: 2 }} />
              <Flex vertical>
                <Text type="secondary" style={{ fontSize: 12 }}>Bác sĩ phụ trách</Text>
                <Text strong style={{ fontSize: 13 }}>{appointment.dentist?.fullName || "Lễ tân sắp xếp"}</Text>
              </Flex>
            </Flex>
          </Col>

          {appointment.patientNote && (
            <Col xs={24} sm={12}>
              <Flex gap={8} align="flex-start">
                <FileText size={16} style={{ color: "#94a3b8", marginTop: 2 }} />
                <Flex vertical>
                  <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú của bạn</Text>
                  <Text strong style={{ fontSize: 13 }}>{appointment.patientNote}</Text>
                </Flex>
              </Flex>
            </Col>
          )}

          {appointment.status === "cancelled" && appointment.cancellationReason && (
            <Col span={24}>
              <Flex gap={8} align="flex-start">
                <FileText size={16} style={{ color: "#fb7185", marginTop: 2 }} />
                <Flex vertical>
                  <Text strong style={{ fontSize: 12, color: "#f43f5e" }}>Lý do hủy</Text>
                  <Text style={{ fontSize: 13, color: "#1e293b" }}>{appointment.cancellationReason}</Text>
                </Flex>
              </Flex>
            </Col>
          )}
        </Row>
      </div>

      <Flex vertical align="flex-end" style={{ paddingTop: 8 }}>
        {canModify ? (
          <Flex vertical style={{ width: "100%" }} align="flex-end">
            <Space wrap>
              <Button 
                danger 
                type="text" 
                style={{ backgroundColor: "#fff1f2", color: "#e11d48", fontWeight: 500, borderRadius: 12 }}
                onClick={() => {
                  setCancelOpen((value) => !value);
                  setRescheduleOpen(false);
                }}
              >
                Hủy lịch
              </Button>
              {!rescheduleOpen && (
                <Button 
                  type="primary" 
                  style={{ borderRadius: 12 }}
                  onClick={openRescheduleForm}
                >
                  Đổi lịch
                </Button>
              )}
            </Space>

            {cancelOpen && (
              <div style={{ width: "100%", marginTop: 12, padding: 16, backgroundColor: "#fff1f2", border: "1px solid #ffe4e6", borderRadius: 12 }}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong style={{ fontSize: 13, color: "#881337" }}>Xác nhận hủy lịch</Text>
                  <Select 
                    style={{ width: "100%" }} 
                    value={cancelReason} 
                    onChange={setCancelReason}
                    options={cancelReasons.map(r => ({ value: r, label: r }))}
                  />
                  {cancelReason === "Lý do khác" && (
                    <Input
                      style={{ width: "100%" }}
                      value={customCancelReason}
                      onChange={(event) => setCustomCancelReason(event.target.value)}
                      placeholder="Nhập lý do hủy"
                      maxLength={1000}
                    />
                  )}
                  <Flex justify="flex-end" gap={8} style={{ paddingTop: 8 }}>
                    <Button type="text" onClick={() => setCancelOpen(false)} style={{ color: "#475569" }}>
                      Đóng
                    </Button>
                    <Button danger type="primary" onClick={submitCancel}>
                      Xác nhận hủy
                    </Button>
                  </Flex>
                </Space>
              </div>
            )}
          </Flex>
        ) : (
          <Text style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: 16 }}>
            Lịch này không thể thay đổi thêm.
          </Text>
        )}
      </Flex>

      {rescheduleOpen && (
        <RescheduleAppointmentModal
          dentistOptions={dentistOptions}
          form={effectiveRescheduleForm}
          onCancel={() => setRescheduleOpen(false)}
          onChange={(next) => updateRescheduleForm(appointment, next)}
          onSubmit={submitReschedule}
          slotOptions={currentSlotOptions}
        />
      )}
    </Card>
  );
}
