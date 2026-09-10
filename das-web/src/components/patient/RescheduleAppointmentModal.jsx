import { Modal, Select, Radio, DatePicker, Flex, Space, Typography } from "antd";
import dayjs from "dayjs";
import { todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

const { Text } = Typography;

export default function RescheduleAppointmentModal({
  dentistOptions,
  form,
  onCancel,
  onChange,
  onSubmit,
  slotOptions
}) {
  return (
    <Modal
      title="Đổi lịch khám"
      open={true}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="Xác nhận đổi"
      cancelText="Đóng"
      okButtonProps={{ disabled: !slotOptions.length }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Flex vertical gap={6}>
          <Text strong>Ngày khám mới</Text>
          <DatePicker
            value={form.date ? dayjs(form.date) : null}
            onChange={(date, dateString) => onChange({ date: dateString })}
            disabledDate={(current) => {
              return current && (current < dayjs(todayInput()) || current > dayjs(maxBookingDate()));
            }}
            format="YYYY-MM-DD"
            allowClear={false}
            style={{ width: "100%" }}
          />
        </Flex>

        <Flex vertical gap={6}>
          <Text strong>Bác sĩ</Text>
          <Select
            value={form.dentistId}
            onChange={(value) => onChange({ dentistId: value })}
            options={[
              { value: "reception", label: "Lễ tân sắp xếp" },
              ...dentistOptions.map((dentist) => ({ value: dentist._id, label: dentist.fullName }))
            ]}
            style={{ width: "100%" }}
          />
        </Flex>

        <Flex vertical gap={6}>
          <Text strong>Khung giờ</Text>
          <div style={{ marginTop: 4 }}>
            {slotOptions.length ? (
              <Radio.Group 
                value={form.time} 
                onChange={(e) => onChange({ time: e.target.value })}
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
              >
                {slotOptions.map((option) => (
                  <Radio.Button 
                    key={option.value} 
                    value={option.value}
                    style={{ textAlign: "center", borderRadius: 8 }}
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0", color: "#6b7280", backgroundColor: "#f9fafb", borderRadius: 8 }}>
                Chưa có khung giờ đang mở
              </div>
            )}
          </div>
        </Flex>
      </Space>
    </Modal>
  );
}
