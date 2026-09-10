import { BarChartOutlined, DollarOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Input, Row, Statistic, Table, Tag, Typography, Space, Flex } from "antd";
import dayjs from "dayjs";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import AdminMetric from "./AdminMetric.jsx";

const { Text } = Typography;

export default function AdminReportPanel({
  onLoadPatientStatistics,
  onLoadRevenueReport,
  onReportFiltersChange,
  patientStatistics,
  reportFilters,
  revenueReport,
  stats
}) {
  function loadAll() {
    onLoadRevenueReport();
    onLoadPatientStatistics();
  }

  const invoiceColumns = [
    {
      title: "Thời điểm",
      dataIndex: "date",
      key: "date",
      render: (_, record) => formatDateTime(record.paidAt || record.invoiceDate || record.createdAt)
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "paid" ? "success" : status === "partial" ? "warning" : "error"}>
          {status === "paid" ? "Đã thanh toán" : status === "partial" ? "Đang trả theo tháng" : "Chưa thanh toán"}
        </Tag>
      )
    },
    {
      title: "Số tiền",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (total) => <strong style={{ color: "#0f172a" }}>{formatMoney(total || 0)}</strong>
    }
  ];

  const invoices = [
    ...(revenueReport?.paidInvoices || []),
    ...(revenueReport?.partialInvoices || []),
    ...(revenueReport?.unpaidInvoices || [])
  ];

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <AdminMetric icon={DollarOutlined} label="Doanh thu" value={formatMoney(stats?.revenue || 0)} />
        </Col>
        <Col xs={24} md={8}>
          <AdminMetric icon={UsergroupAddOutlined} label="Bệnh nhân mới" value={patientStatistics?.newPatients ?? stats?.newPatientCount ?? 0} />
        </Col>
        <Col xs={24} md={8}>
          <AdminMetric icon={UsergroupAddOutlined} label="Bệnh nhân quay lại" value={patientStatistics?.returningPatients ?? stats?.returningPatientCount ?? 0} />
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <BarChartOutlined style={{ color: "#2563eb" }} /> 
            <span>Thống kê</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <Flex wrap="wrap" gap="middle" align="flex-end">
          <Space direction="vertical" style={{ flex: 1, minWidth: 200 }}>
            <Text strong style={{ color: "#334155" }}>Từ ngày</Text>
            <Input type="date" value={reportFilters.startDate} onChange={(event) => onReportFiltersChange({ startDate: event.target.value })} />
          </Space>
          <Space direction="vertical" style={{ flex: 1, minWidth: 200 }}>
            <Text strong style={{ color: "#334155" }}>Đến ngày</Text>
            <Input type="date" value={reportFilters.endDate} onChange={(event) => onReportFiltersChange({ endDate: event.target.value })} />
          </Space>
          <Button type="primary" onClick={loadAll} style={{ height: 32 }}>
            Xem thống kê
          </Button>
        </Flex>
      </Card>

      {patientStatistics && (
        <Card 
          title={
            <Space>
              <UsergroupAddOutlined style={{ color: "#2563eb" }} /> 
              <span>Thống kê bệnh nhân</span>
            </Space>
          } 
          style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card type="inner" style={{ backgroundColor: "#f8fafc" }}>
                <Statistic title="Bệnh nhân mới" value={patientStatistics.newPatients} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card type="inner" style={{ backgroundColor: "#f8fafc" }}>
                <Statistic title="Bệnh nhân quay lại" value={patientStatistics.returningPatients} />
              </Card>
            </Col>
            {(patientStatistics.appointmentCounts || []).map((item) => (
              <Col xs={12} md={6} key={item._id || "unknown"}>
                <Card type="inner" style={{ backgroundColor: "#f8fafc" }}>
                  <Statistic title={`Lịch hẹn ${item._id || "khác"}`} value={item.count} />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {revenueReport && (
        <Card 
          title={
            <Space>
              <DollarOutlined style={{ color: "#2563eb" }} /> 
              <span>Hóa đơn trong kỳ</span>
            </Space>
          } 
          style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          <Table
            dataSource={invoices}
            columns={invoiceColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        </Card>
      )}
    </Space>
  );
}
