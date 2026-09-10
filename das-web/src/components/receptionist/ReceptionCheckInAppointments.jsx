import { ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, Input, Table, Radio, Button, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";

const paymentMethodLabels = {
  cash: "Tiền mặt",
  bank_transfer: "Chuyển khoản",
  card: "Thẻ"
};

const installmentOptions = [3, 6, 9];
const discountOptions = [0, 5, 10, 20, 30];
const MONTHLY_PAYMENT_MIN_TOTAL = 5000000;

function getInvoicePlan(invoicePlans, appointmentId) {
  return invoicePlans[appointmentId] || { paymentPlan: "one_time", installmentMonths: 3, discountPercent: 0 };
}

function calculateInstallmentAmount(total, installmentMonths) {
  return Math.ceil(Number(total || 0) / Math.max(Number(installmentMonths || 1), 1));
}

function calculateDiscountedTotal(total, discountPercent) {
  const subtotal = Number(total || 0);
  const discount = Math.round(subtotal * Number(discountPercent || 0) / 100);
  return Math.max(subtotal - discount, 0);
}

function getNextPaymentInfo(invoice, total, paidAmount) {
  const remaining = Math.max(total - paidAmount, 0);
  const paymentPlan = invoice?.paymentPlan === "monthly" ? "monthly" : "one_time";
  const installmentMonths = paymentPlan === "monthly" ? Number(invoice?.installmentMonths || 1) : 1;
  const installmentNumber = (invoice?.payments || []).length + 1;
  const installmentAmount = Number(invoice?.installmentAmount || calculateInstallmentAmount(total, installmentMonths));
  const isFinalPayment =
    paymentPlan !== "monthly" ||
    installmentNumber >= installmentMonths ||
    remaining <= installmentAmount;

  return {
    installmentNumber,
    amount: remaining <= 0 ? 0 : isFinalPayment ? remaining : Math.min(installmentAmount, remaining)
  };
}

export default function ReceptionCheckInAppointments({
  checkInAppointments,
  generateInvoice,
  invoicePlans = {},
  loading,
  onDeleteEmptyInvoice,
  paymentMethods,
  processPayment,
  setPaymentMethods,
  updateInvoicePlan
}) {
  const [invoiceFilter, setInvoiceFilter] = useState("unpaid");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const filteredAppointments = useMemo(() => {
    const keyword = invoiceSearch.trim().toLowerCase();
    return checkInAppointments.filter((appointment) => {
      const invoiceStatus = appointment.invoice?.status || "unpaid";
      const matchesStatus = invoiceFilter === "all" || invoiceStatus === invoiceFilter;
      const matchesKeyword =
        !keyword ||
        [appointment.patient?.fullName, appointment.patient?.phone, appointment.service?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [checkInAppointments, invoiceFilter, invoiceSearch]);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ReceiptText size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-slate-800">Hóa đơn và thanh toán</h2>
      </div>
      <p className="text-sm text-slate-500">Các lịch đã hoàn tất sẽ xuất hiện ở đây để lễ tân tạo hóa đơn và ghi nhận thanh toán.</p>

      <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Trạng thái thanh toán</span>
          <Select
            value={invoiceFilter}
            onChange={setInvoiceFilter}
            options={[
              { value: "unpaid", label: "Chưa trả" },
              { value: "partial", label: "Đang trả theo tháng" },
              { value: "paid", label: "Đã trả đủ" },
              { value: "all", label: "Tất cả" }
            ]}
          />
        </div>
        <div className="flex items-center gap-2 grow max-w-md">
          <span className="text-sm font-medium text-slate-700">Tìm bệnh nhân</span>
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            placeholder="Tên hoặc SĐT"
          />
        </div>
      </div>

      {loading ? (
        <EmptyState title="Đang tải hóa đơn" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : filteredAppointments.length ? (
        <div className="space-y-6">
          {filteredAppointments.map((appointment) => {
            const invoice = appointment.invoice;
            const invoicePlan = getInvoicePlan(invoicePlans, appointment._id);
            const rawTotal = Number(invoice?.subtotal || appointment.performedTotal || invoice?.total || 0);
            const total = Number(invoice?.total || calculateDiscountedTotal(rawTotal, invoicePlan.discountPercent));
            const paidAmount = Number(invoice?.paidAmount || 0);
            const remaining = Math.max(total - paidAmount, 0);
            const items = invoice?.items?.length ? invoice.items : [...(appointment.performedServices || []), ...(appointment.extraCosts || [])];
            const canUseMonthlyPlan = total >= MONTHLY_PAYMENT_MIN_TOTAL;
            const selectedPaymentPlan = canUseMonthlyPlan ? invoicePlan.paymentPlan : "one_time";
            const plannedInstallmentAmount = calculateInstallmentAmount(total, invoicePlan.installmentMonths);
            const nextPayment = getNextPaymentInfo(invoice, total, paidAmount);
            const hasServiceItems = (appointment.performedServices || []).length > 0 || (appointment.extraCosts || []).length > 0;
            const canDeleteEmptyInvoice = !invoice && total <= 0 && !hasServiceItems;
            
            return (
              <Card className="shadow-sm relative overflow-hidden" styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' } }} key={appointment._id}>
                {canDeleteEmptyInvoice && (
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    className="absolute top-4 right-4"
                    onClick={() => onDeleteEmptyInvoice(appointment)}
                    title="Xóa dòng chưa có dịch vụ phát sinh"
                  >
                    Xóa
                  </Button>
                )}

                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{appointment.patient?.fullName || "Bệnh nhân"}</h4>
                        <p className="text-slate-500 text-sm">{appointment.patient?.phone || "Chưa có SĐT"}</p>
                      </div>
                      <StatusBadge value={appointment.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <strong className="block text-slate-800 mb-1">Thông tin dịch vụ</strong>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>{appointment.service?.name || "Dịch vụ"}</p>
                          <p>Bác sĩ: {appointment.dentist?.fullName || "-"}</p>
                          <p>Tạo hóa đơn: {invoice ? formatDateTime(invoice.invoiceDate || invoice.createdAt) : "Chưa tạo"}</p>
                        </div>
                      </div>
                      <div>
                        <strong className="block text-slate-800 mb-1">Tiến độ thanh toán</strong>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">Đã trả:</span>
                            <span className="font-bold text-emerald-600">{formatMoney(paidAmount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">Tổng cộng:</span>
                            <span className="font-bold text-slate-800">{formatMoney(total)}</span>
                          </div>
                          {invoice && <StatusBadge value={invoice.status} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <Table 
                    dataSource={items}
                    pagination={false}
                    rowKey={(record, index) => `${appointment._id}-item-${index}`}
                    columns={[
                      { title: 'Chi tiết dịch vụ / Phát sinh', dataIndex: 'name', key: 'name' },
                      { 
                        title: 'Thành tiền', 
                        key: 'amount', 
                        align: 'right',
                        render: (_, item) => <span className="font-medium text-slate-700">{formatMoney(Number(item.amount || item.price || 0))}</span> 
                      }
                    ]}
                    locale={{ emptyText: <span className="italic text-slate-500">Chưa có dịch vụ phát sinh</span> }}
                  />
                </div>

                {invoice?.payments?.length ? (
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h5 className="font-semibold text-emerald-800 mb-2 text-sm">Lịch sử thanh toán</h5>
                    <div className="space-y-2">
                      {invoice.payments.map((payment, index) => (
                        <div className="flex justify-between items-center text-sm" key={payment._id || `${invoice._id}-payment-${index}`}>
                          <span className="text-emerald-700">Lần {payment.installmentNumber || index + 1}: {formatDateTime(payment.paymentDate || payment.createdAt)} ({paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod})</span>
                          <span className="font-bold text-emerald-700">+{formatMoney(Number(payment.amount || 0))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-6">
                  {!invoice ? (
                    <>
                      <div className="space-y-4">
                        <div>
                          <span className="block text-sm font-semibold text-slate-700 mb-2">Giảm giá</span>
                          <Select 
                            value={invoicePlan.discountPercent}
                            onChange={(val) => updateInvoicePlan(appointment._id, { discountPercent: val })}
                            options={discountOptions.map(p => ({ value: p, label: `${p}%` }))}
                            className="w-32"
                          />
                        </div>

                        <div>
                          <span className="block text-sm font-semibold text-slate-700 mb-2">Hình thức thanh toán</span>
                          <Radio.Group 
                            value={selectedPaymentPlan}
                            onChange={(e) => updateInvoicePlan(appointment._id, { paymentPlan: e.target.value })}
                            className="flex flex-col sm:flex-row gap-3 w-full"
                          >
                            <Radio.Button value="one_time" className="h-auto p-4 flex-1 text-center">
                              <span className="block font-semibold text-slate-800">Trả một lần</span>
                              <span className="text-sm text-slate-500 block">Thanh toán toàn bộ {formatMoney(total)}</span>
                            </Radio.Button>
                            {canUseMonthlyPlan && (
                              <Radio.Button value="monthly" className="h-auto p-4 flex-1 text-center">
                                <span className="block font-semibold text-slate-800">Trả góp theo tháng</span>
                                <span className="text-sm text-slate-500 block">Áp dụng cho hóa đơn từ 5tr</span>
                              </Radio.Button>
                            )}
                          </Radio.Group>
                        </div>

                        {selectedPaymentPlan === "monthly" && (
                          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <span className="block text-sm font-semibold text-slate-700 mb-3">Kỳ hạn trả góp</span>
                            <Radio.Group 
                              value={invoicePlan.installmentMonths}
                              onChange={(e) => updateInvoicePlan(appointment._id, { installmentMonths: e.target.value })}
                              className="w-full flex gap-3"
                            >
                              {installmentOptions.map(month => (
                                <Radio.Button value={month} key={month} className="flex-1 text-center">
                                  {month} tháng
                                </Radio.Button>
                              ))}
                            </Radio.Group>
                            <div className="mt-3 bg-primary-50 text-primary-700 p-3 rounded-lg text-sm flex items-center justify-between">
                              <span>Thanh toán mỗi kỳ:</span>
                              <strong className="text-base">{formatMoney(plannedInstallmentAmount)}/tháng</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      {total > 0 ? (
                        <Button
                          type="primary"
                          size="large"
                          className="w-full bg-primary-600 hover:bg-primary-500"
                          onClick={() => generateInvoice(appointment)}
                        >
                          Tạo hóa đơn {formatMoney(total)}
                        </Button>
                      ) : (
                        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-center font-medium border border-amber-100">
                          Chưa có dịch vụ phát sinh để tạo hóa đơn
                        </div>
                      )}
                    </>
                  ) : remaining > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-primary-50 text-primary-800 p-4 rounded-xl border border-primary-100 flex items-center justify-between">
                        <div>
                          <span className="block text-sm text-primary-600 mb-1">Cần thu lần {nextPayment.installmentNumber}</span>
                          <strong className="text-2xl">{formatMoney(nextPayment.amount)}</strong>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs text-primary-600 mb-1">Còn lại sau khi thu</span>
                          <span className="font-semibold">{formatMoney(remaining - nextPayment.amount)}</span>
                        </div>
                      </div>

                      <div>
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Phương thức thanh toán</span>
                        <Radio.Group 
                          value={paymentMethods[appointment._id] || "cash"}
                          onChange={(e) => setPaymentMethods((current) => ({ ...current, [appointment._id]: e.target.value }))}
                          className="flex flex-wrap sm:flex-nowrap gap-3 w-full"
                        >
                          <Radio.Button value="cash" className="flex-1 h-auto py-3 text-center rounded-lg">
                            <span className="font-semibold block">Tiền mặt</span>
                          </Radio.Button>
                          <Radio.Button value="bank_transfer" className="flex-1 h-auto py-3 text-center rounded-lg">
                            <span className="font-semibold block">Chuyển khoản</span>
                          </Radio.Button>
                          <Radio.Button value="card" className="flex-1 h-auto py-3 text-center rounded-lg">
                            <span className="font-semibold block">Thẻ</span>
                          </Radio.Button>
                        </Radio.Group>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        className="w-full bg-primary-600 hover:bg-primary-500 shadow-md hover:shadow-lg"
                        onClick={() => processPayment(appointment)}
                      >
                        Ghi nhận thanh toán {formatMoney(nextPayment.amount)}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-center font-bold border border-emerald-200 text-lg flex items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">✓</div>
                      Đã thanh toán đủ
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Chưa có hóa đơn phù hợp" text="Mặc định màn này hiển thị các hóa đơn chưa trả." />
      )}
    </section>
  );
}
