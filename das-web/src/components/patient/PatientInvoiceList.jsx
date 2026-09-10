import { ReceiptText } from "lucide-react";
import { List, Space, Flex, Typography, Card } from "antd";
import EmptyState from "../EmptyState.jsx";
import InvoiceCard from "./InvoiceCard.jsx";

const { Title } = Typography;

export default function PatientInvoiceList({
  invoices,
  loading,
  reviewByAppointment,
  reviewForms,
  submitReview,
  updateReviewForm
}) {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }} id="invoices">
      <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
        <ReceiptText style={{ color: "#10b981" }} size={24} />
        <Title level={4} style={{ margin: 0 }}>Hóa đơn của tôi</Title>
      </Flex>

      {loading ? (
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <EmptyState title="Đang tải hóa đơn" text="Hệ thống đang lấy dữ liệu mới nhất." />
        </Card>
      ) : invoices.length ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
          dataSource={invoices}
          renderItem={(invoice) => (
            <List.Item key={invoice._id}>
              <InvoiceCard
                invoice={invoice}
                review={reviewByAppointment.get(invoice.appointment?._id)}
                reviewForm={reviewForms[invoice.appointment?._id]}
                submitReview={submitReview}
                updateReviewForm={updateReviewForm}
              />
            </List.Item>
          )}
        />
      ) : (
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <EmptyState title="Chưa có hóa đơn" text="Hóa đơn sẽ xuất hiện sau khi lịch khám được tiếp nhận." />
        </Card>
      )}
    </Space>
  );
}
