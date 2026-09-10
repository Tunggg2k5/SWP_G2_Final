import { CalendarSearch, CalendarClock } from "lucide-react";
import { Select, DatePicker, Radio, Card, Typography, Flex, Row, Col, Space, Input, Button } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function AppointmentBookingForm({
  bootstrapLoading,
  date,
  dentistId,
  dentistOptions,
  embedded,
  maxDate,
  minDate,
  note,
  onChange,
  onSubmit,
  serviceId,
  services,
  slotOptions,
  submitting,
  time,
  user
}) {
  return (
    <Card 
      bordered={false}
      style={{ width: "100%", maxWidth: 672, margin: "0 auto", borderRadius: 16, borderTop: "4px solid #10b981", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      bodyStyle={{ padding: "24px 32px" }}
    >
      <Flex align="flex-start" gap={16} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ backgroundColor: "#ecfdf5", padding: 12, borderRadius: 16, color: "#10b981" }}>
          <CalendarSearch size={32} />
        </div>
        <div>
          <Title level={3} style={{ margin: 0 }}>Đặt lịch khám</Title>
          <Text type="secondary" style={{ marginTop: 4, display: "block" }}>Miễn phí chụp phim, tư vấn và thăm khám khi đặt hẹn trước.</Text>
        </div>
      </Flex>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Flex vertical gap={6}>
              <Text strong style={{ fontSize: 13, color: "#334155" }}>Họ và tên</Text>
              <Input value={user?.fullName || ""} disabled style={{ backgroundColor: "#f8fafc", color: "#475569" }} />
            </Flex>
          </Col>

          <Col xs={24} md={12}>
            <Flex vertical gap={6}>
              <Text strong style={{ fontSize: 13, color: "#334155" }}>Số điện thoại</Text>
              <Input value={user?.phone || ""} disabled style={{ backgroundColor: "#f8fafc", color: "#475569" }} />
            </Flex>
          </Col>
        </Row>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Flex vertical gap={6}>
              <Text strong style={{ fontSize: 13, color: "#334155" }}>Dịch vụ quan tâm <span style={{ color: "#f43f5e" }}>*</span></Text>
              <Select 
                value={serviceId} 
                onChange={(value) => onChange({ serviceId: value })} 
                disabled={bootstrapLoading}
                options={services.map(s => ({ value: s._id, label: s.name }))}
              />
            </Flex>
          </Col>

          <Col xs={24} md={12}>
            <Flex vertical gap={6}>
              <Text strong style={{ fontSize: 13, color: "#334155" }}>Bác sĩ</Text>
              <Select 
                value={dentistId} 
                onChange={(value) => onChange({ dentistId: value })} 
                disabled={bootstrapLoading}
                options={[
                  { value: "random", label: "Để nha khoa sắp xếp" },
                  ...dentistOptions.map(d => ({ value: d._id, label: d.fullName }))
                ]}
              />
            </Flex>
          </Col>
        </Row>

        <div style={{ backgroundColor: "#f8fafc", padding: 20, borderRadius: 16, border: "1px solid #f1f5f9" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Flex align="center" gap={8} style={{ color: "#1e293b", fontWeight: 600 }}>
              <CalendarClock size={20} style={{ color: "#10b981" }} />
              <div style={{ fontSize: 16 }}>Thời gian khám</div>
            </Flex>

            <Flex vertical gap={6}>
              <Text strong style={{ fontSize: 13, color: "#334155" }}>Ngày khám <span style={{ color: "#f43f5e" }}>*</span></Text>
              <DatePicker 
                value={date ? dayjs(date) : null} 
                onChange={(d, ds) => onChange({ date: ds })}
                disabledDate={(current) => current && (current < dayjs(minDate) || current > dayjs(maxDate))}
                format="YYYY-MM-DD"
                allowClear={false}
                style={{ width: "100%" }}
              />
            </Flex>

            <Flex vertical gap={10}>
              <Text strong style={{ fontSize: 13, color: "#334155" }}>Khung giờ <span style={{ color: "#f43f5e" }}>*</span></Text>
              <div>
                {slotOptions.length ? (
                  <Radio.Group
                    value={time}
                    onChange={(e) => onChange({ time: e.target.value })}
                    style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
                  >
                    {slotOptions.map((option) => (
                      <Radio.Button 
                        key={option.value} 
                        value={option.value}
                        style={{ textAlign: "center", borderRadius: 12, padding: "0 16px" }}
                      >
                        {option.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                ) : (
                  <div style={{ textAlign: "center", padding: 16, fontSize: 13, color: "#64748b", backgroundColor: "#fff", border: "1px dashed #e2e8f0", borderRadius: 12 }}>
                    Chưa có khung giờ đang mở cho ngày này
                  </div>
                )}
              </div>
            </Flex>
          </Space>
        </div>

        <Flex vertical gap={6}>
          <Text strong style={{ fontSize: 13, color: "#334155" }}>Ghi chú thêm</Text>
          <Input.TextArea
            value={note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Triệu chứng bạn đang gặp phải hoặc yêu cầu thêm..."
            maxLength={1000}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Flex>

        <div style={{ paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            disabled={bootstrapLoading || !slotOptions.length}
            style={{ height: 48, fontSize: 16, borderRadius: 12, backgroundColor: "#10b981", borderColor: "#10b981" }}
          >
            Xác nhận đặt lịch
          </Button>
        </div>
      </form>
    </Card>
  );
}

