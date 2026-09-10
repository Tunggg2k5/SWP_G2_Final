import { ReceiptText } from "lucide-react";
import { List } from "antd";
import EmptyState from "../EmptyState.jsx";
import InvoiceCard from "./InvoiceCard.jsx";

export default function PatientInvoiceList({
  invoices,
  loading,
  reviewByAppointment,
  reviewForms,
  submitReview,
  updateReviewForm
}) {
  return (
    <section className="space-y-4" id="invoices">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <ReceiptText className="text-primary-500" size={24} />
        <h2 className="text-xl font-bold">Hóa đơn của tôi</h2>
      </div>

      {loading ? (
        <div className="card-base p-8">
          <EmptyState title="Đang tải hóa đơn" text="Hệ thống đang lấy dữ liệu mới nhất." />
        </div>
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
        <div className="card-base p-8">
          <EmptyState title="Chưa có hóa đơn" text="Hóa đơn sẽ xuất hiện sau khi lịch khám được tiếp nhận." />
        </div>
      )}
    </section>
  );
}
