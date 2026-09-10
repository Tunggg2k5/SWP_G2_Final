import { BarChartOutlined, DollarOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Input, Row, Statistic, Table, Tag } from "antd";
import dayjs from "dayjs";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import AdminMetric from "./AdminMetric.jsx";

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
      render: (total) => <strong className="text-slate-900">{formatMoney(total || 0)}</strong>
    }
  ];

  const invoices = [
    ...(revenueReport?.paidInvoices || []),
    ...(revenueReport?.partialInvoices || []),
    ...(revenueReport?.unpaidInvoices || [])
  ];

  return (
    <div className="space-y-6">
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

      <Card title={<><BarChartOutlined className="text-primary-600 mr-2" /> Thống kê</>} className="shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-slate-700">Từ ngày</span>
            <Input type="date" value={reportFilters.startDate} onChange={(event) => onReportFiltersChange({ startDate: event.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-slate-700">Đến ngày</span>
            <Input type="date" value={reportFilters.endDate} onChange={(event) => onReportFiltersChange({ endDate: event.target.value })} />
          </div>
          <Button type="primary" onClick={loadAll} style={{ height: "42px" }}>
            Xem thống kê
          </Button>
        </div>
      </Card>

      {patientStatistics && (
        <Card title={<><UsergroupAddOutlined className="text-primary-600 mr-2" /> Thống kê bệnh nhân</>} className="shadow-sm">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card type="inner" className="bg-slate-50">
                <Statistic title="Bệnh nhân mới" value={patientStatistics.newPatients} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card type="inner" className="bg-slate-50">
                <Statistic title="Bệnh nhân quay lại" value={patientStatistics.returningPatients} />
              </Card>
            </Col>
            {(patientStatistics.appointmentCounts || []).map((item) => (
              <Col xs={12} md={6} key={item._id || "unknown"}>
                <Card type="inner" className="bg-slate-50">
                  <Statistic title={`Lịch hẹn ${item._id || "khác"}`} value={item.count} />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {revenueReport && (
        <Card title={<><DollarOutlined className="text-primary-600 mr-2" /> Hóa đơn trong kỳ</>} className="shadow-sm">
          <Table
            dataSource={invoices}
            columns={invoiceColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        </Card>
      )}
    </div>
  );
}
