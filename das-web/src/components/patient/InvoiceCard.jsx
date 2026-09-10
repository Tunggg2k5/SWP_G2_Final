import { Progress, Table } from "antd";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import ReviewForm from "./ReviewForm.jsx";

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
      render: (text) => <span className="text-slate-600">{text}</span>
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (val, record) => <span className="font-medium">{formatMoney(Number(val || record.price || 0))}</span>
    }
  ];

  return (
    <div className="card-base card-hover p-5 space-y-4" key={invoice._id}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">{invoice.appointment?.service?.name || "Hóa đơn dịch vụ"}</h3>
          <p className="text-sm text-slate-500 mt-1">Tạo ngày: {formatDateTime(invoice.invoiceDate || invoice.createdAt)}</p>
        </div>
        <StatusBadge value={invoice.status} />
      </div>

      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center text-sm font-medium mb-1">
          <span className="text-slate-600">Đã thanh toán</span>
          <span className="text-slate-900">{formatMoney(paidAmount)} / {formatMoney(total)}</span>
        </div>
        <Progress 
          percent={Math.round(progressPercent)} 
          showInfo={false} 
          strokeColor={progressPercent === 100 ? "#10b981" : "#f59e0b"} 
          size="small"
        />

        <div className="grid grid-cols-2 gap-y-2 text-sm pt-2 border-t border-slate-200 mt-2">
          <div className="text-slate-500">Hình thức:</div>
          <div className="font-medium text-right text-slate-700">
            {paymentPlanLabels[invoice.paymentPlan] || paymentPlanLabels.one_time}
            {invoice.paymentPlan === "monthly" ? ` (${invoice.installmentMonths} kỳ)` : ""}
          </div>
          {(discountPercent > 0 || discountAmount > 0) && (
            <>
              <div className="text-slate-500">Giảm giá:</div>
              <div className="font-medium text-right text-emerald-600">
                {discountPercent > 0 ? `${discountPercent}%` : ""}
                {discountAmount > 0 ? ` (-${formatMoney(discountAmount)})` : ""}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">Chi tiết dịch vụ</h4>
        <Table 
          dataSource={items} 
          columns={itemColumns} 
          rowKey={(record, idx) => record._id || idx}
          pagination={false}
          size="small"
        />
      </div>

      {(invoice.payments || []).length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700">Lịch sử thanh toán</h4>
          <div className="space-y-2">
            {invoice.payments.map((payment, index) => (
              <div key={payment._id || `${invoice._id}-payment-${index}`} className="flex justify-between items-center text-sm p-2 bg-white border border-slate-100 rounded-md">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">Lần {payment.installmentNumber || index + 1} ({paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod})</span>
                  <span className="text-xs text-slate-400">{formatDateTime(payment.paymentDate || payment.createdAt)}</span>
                </div>
                <span className="font-bold text-emerald-600">+{formatMoney(Number(payment.amount || 0))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {canReview && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <h4 className="font-semibold text-slate-900 mb-2">{review ? "Đánh giá của bạn" : "Gửi đánh giá dịch vụ"}</h4>
          <ReviewForm
            form={currentReviewForm}
            onChange={(next) => updateReviewForm(appointmentId, next)}
            onSubmit={(event) => submitReview(event, appointmentId)}
            submitLabel={review ? "Cập nhật đánh giá" : "Gửi đánh giá"}
          />
        </div>
      )}
    </div>
  );
}
