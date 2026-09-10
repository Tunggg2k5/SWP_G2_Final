import { Progress, Table, Card, Typography, Flex, Space, Row, Col, Divider } from "antd";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import ReviewForm from "./ReviewForm.jsx";

const { Title, Text } = Typography;

const paymentMethodLabels = {
  cash: "Tiền mặt",
  bank_transfer: "Chuyển khoản",
  card: "Thẻ"
};

const paymentPlanLabels = {
  one_time: "Trả một lần",
  monthly: "Trả theo tháng"
};

export default function InvoiceCard({
  invoice,
  review,
  reviewForm,
  submitReview,
  updateReviewForm
}) {
  const total = Number(invoice.total || 0);
  const paidAmount = Number(invoice.paidAmount || 0);
  const discountPercent = Number(invoice.discountPercent || 0);
  const discountAmount = Number(invoice.discountAmount || 0);
  const items = (invoice.items || []).length
    ? invoice.items
    : [{ name: invoice.appointment?.service?.name || "Dịch vụ nha khoa", amount: total }];
  const appointmentId = invoice.appointment?._id;
  const canReview = appointmentId && invoice.appointment?.status === "completed";
  const currentReviewForm = reviewForm || {
    rating: Number(review?.rating || 5),
    comment: review?.comment || ""
  };

  const progressPercent = Math.min(100, Math.max(0, (paidAmount / total) * 100)) || 0;

  const itemColumns = [
    {
      title: "Dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (val, record) => <Text strong>{formatMoney(Number(val || record.price || 0))}</Text>
    }
  ];

  return (
    <Card 
      bordered={false} 
      style={{ borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", height: "100%" }}
      bodyStyle={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <div>
          <Title level={5} style={{ margin: 0 }}>{invoice.appointment?.service?.name || "Hóa đơn dịch vụ"}</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Tạo ngày: {formatDateTime(invoice.invoiceDate || invoice.createdAt)}</Text>
        </div>
        <StatusBadge value={invoice.status} />
      </Flex>

      <div style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 12 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Đã thanh toán</Text>
          <Text strong style={{ fontSize: 13 }}>{formatMoney(paidAmount)} / {formatMoney(total)}</Text>
        </Flex>
        <Progress 
          percent={Math.round(progressPercent)} 
          showInfo={false} 
          strokeColor={progressPercent === 100 ? "#10b981" : "#f59e0b"} 
          size="small"
        />

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
          <Row gutter={[16, 8]}>
            <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}>Hình thức:</Text></Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Text strong style={{ fontSize: 13 }}>
                {paymentPlanLabels[invoice.paymentPlan] || paymentPlanLabels.one_time}
                {invoice.paymentPlan === "monthly" ? ` (${invoice.installmentMonths} kỳ)` : ""}
              </Text>
            </Col>
            {(discountPercent > 0 || discountAmount > 0) && (
              <>
                <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}>Giảm giá:</Text></Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Text strong style={{ fontSize: 13, color: "#10b981" }}>
                    {discountPercent > 0 ? `${discountPercent}%` : ""}
                    {discountAmount > 0 ? ` (-${formatMoney(discountAmount)})` : ""}
                  </Text>
                </Col>
              </>
            )}
          </Row>
        </div>
      </div>

      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Text strong style={{ fontSize: 13 }}>Chi tiết dịch vụ</Text>
        <Table 
          dataSource={items} 
          columns={itemColumns} 
          rowKey={(record, idx) => record._id || idx}
          pagination={false}
          size="small"
        />
      </Space>

      {(invoice.payments || []).length > 0 && (
        <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 12, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
          <Text strong style={{ fontSize: 13 }}>Lịch sử thanh toán</Text>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {invoice.payments.map((payment, index) => (
              <Flex key={payment._id || `${invoice._id}-payment-${index}`} justify="space-between" align="center" style={{ padding: "8px 12px", border: "1px solid #f1f5f9", borderRadius: 8 }}>
                <Flex vertical>
                  <Text strong style={{ fontSize: 13 }}>Lần {payment.installmentNumber || index + 1} ({paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod})</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(payment.paymentDate || payment.createdAt)}</Text>
                </Flex>
                <Text strong style={{ color: "#10b981" }}>+{formatMoney(Number(payment.amount || 0))}</Text>
              </Flex>
            ))}
          </Space>
        </Space>
      )}

      {canReview && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>{review ? "Đánh giá của bạn" : "Gửi đánh giá dịch vụ"}</Text>
          <ReviewForm
            form={currentReviewForm}
            onChange={(next) => updateReviewForm(appointmentId, next)}
            onSubmit={(event) => submitReview(event, appointmentId)}
            submitLabel={review ? "Cập nhật đánh giá" : "Gửi đánh giá"}
          />
        </div>
      )}
    </Card>
  );
}
