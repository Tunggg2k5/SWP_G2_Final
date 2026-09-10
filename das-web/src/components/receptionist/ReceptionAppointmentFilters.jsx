import { DatePicker, Input, Flex, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export default function ReceptionAppointmentFilters({
  appointmentSearch,
  date,
  setAppointmentSearch,
  setDate,
  showDate = true
}) {
  return (
    <Flex wrap="wrap" gap="middle" align="center">
      {showDate && (
        <Flex align="center" gap="small">
          <Text strong>Ngày</Text>
          <DatePicker
            value={date ? dayjs(date) : null}
            onChange={(d, dateString) => setDate(dateString)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </Flex>
      )}
      <Flex align="center" gap="small" style={{ flexGrow: 1, maxWidth: 448 }}>
        <Text strong>Tìm nhanh</Text>
        <Input
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={appointmentSearch}
          onChange={(e) => setAppointmentSearch(e.target.value)}
          placeholder="Tên, SĐT, dịch vụ hoặc bác sĩ"
          style={{ width: '100%' }}
        />
      </Flex>
    </Flex>
  );
}
