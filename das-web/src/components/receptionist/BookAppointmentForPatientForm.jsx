import { Select, Input, Button, Card, DatePicker, Flex, Space, Typography, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { CalendarPlus } from "lucide-react";
import dayjs from "dayjs";
import { todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

const { Title, Text } = Typography;

export default function BookAppointmentForPatientForm({
  booking,
  checkedPatient,
  date,
  genderOptions,
  newPatient,
  onBookingChange,
  onCheckPatient,
  onDateChange,
  onNewPatientChange,
  onPatientSearchChange,
  onSubmit,
  patientLookupStatus,
  patientSearch,
  services,
  slotOptions
}) {
  const hasAccount = patientLookupStatus === "found" && checkedPatient;
  const needsNewAccount = patientLookupStatus === "not_found";
  const canShowPatientInfo = hasAccount || needsNewAccount;

  return (
    <Card style={{ maxWidth: 672, margin: '0 auto' }}>
      <Flex align="center" gap="middle" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e6f4ff', color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CalendarPlus size={20} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>Đặt lịch hộ bệnh nhân</Title>
          <Text type="secondary">Nhập số điện thoại và kiểm tra tài khoản trước khi đặt lịch.</Text>
        </div>
      </Flex>

      <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
        <Flex gap="middle" align="flex-end">
          <Space direction="vertical" style={{ flex: 1 }}>
            <Text strong>Số điện thoại</Text>
            <Input
              type="tel"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={patientSearch}
              onChange={(event) => onPatientSearchChange(event.target.value)}
              placeholder="Nhập số điện thoại bệnh nhân"
              size="large"
            />
          </Space>
          <Button
            type="primary"
            size="large"
            onClick={onCheckPatient}
          >
            Kiểm tra tài khoản
          </Button>
        </Flex>

        {canShowPatientInfo && (
          <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Họ tên</Text>
                  <Input
                    value={hasAccount ? checkedPatient.fullName || "" : newPatient.fullName}
                    onChange={(event) => onNewPatientChange({ fullName: event.target.value })}
                    readOnly={hasAccount}
                    required
                  />
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Số điện thoại</Text>
                  <Input
                    type="tel"
                    value={hasAccount ? checkedPatient.phone || "" : newPatient.phone}
                    readOnly
                    required
                    style={hasAccount ? { backgroundColor: '#f5f5f5' } : undefined}
                  />
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Email</Text>
                  <Input
                    type="email"
                    value={hasAccount ? checkedPatient.email || "" : newPatient.email || ""}
                    onChange={(event) => onNewPatientChange({ email: event.target.value })}
                    readOnly={hasAccount}
                  />
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Giới tính</Text>
                  <Select
                    value={hasAccount ? checkedPatient.gender || "unknown" : newPatient.gender}
                    onChange={(val) => onNewPatientChange({ gender: val })}
                    disabled={hasAccount}
                    options={genderOptions}
                    style={{ width: '100%' }}
                  />
                </Space>
              </Col>
            </Row>
          </div>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Dịch vụ</Text>
              <Select
                value={booking.serviceId}
                onChange={(val) => onBookingChange({ serviceId: val })}
                options={services.map(s => ({ value: s._id, label: s.name }))}
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Ngày</Text>
              <DatePicker
                value={date ? dayjs(date) : null}
                onChange={(d, ds) => onDateChange(ds)}
                format="YYYY-MM-DD"
                minDate={dayjs(todayInput())}
                maxDate={dayjs(maxBookingDate())}
                style={{ width: '100%' }}
                allowClear={false}
              />
            </Space>
          </Col>
          <Col xs={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Khung giờ khám</Text>
              <Select
                value={booking.time}
                onChange={(val) => onBookingChange({ time: val })}
                options={slotOptions.length ? slotOptions : [{ value: "", label: "Chưa có khung giờ đang mở" }]}
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col xs={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Ghi chú</Text>
              <Input
                value={booking.note}
                onChange={(event) => onBookingChange({ note: event.target.value })}
                maxLength={1000}
              />
            </Space>
          </Col>
        </Row>

        <Button
          type="primary"
          onClick={onSubmit}
          size="large"
          style={{ width: '100%', marginTop: 16 }}
          disabled={!slotOptions.length}
        >
          Đặt lịch hộ
        </Button>
      </Space>
    </Card>
  );
}
