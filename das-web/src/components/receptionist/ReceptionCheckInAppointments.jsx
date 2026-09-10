import { ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, Input, Table, Radio, Button, Card, Flex, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, CheckCircleFilled } from "@ant-design/icons";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";

const { Title, Text } = Typography;

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
    <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Flex align="center" gap="small">
          <ReceiptText size={20} color="#1890ff" />
          <Title level={4} style={{ margin: 0 }}>Hóa đơn và thanh toán</Title>
        </Flex>
        <Text type="secondary">Các lịch đã hoàn tất sẽ xuất hiện ở đây để lễ tân tạo hóa đơn và ghi nhận thanh toán.</Text>
      </Space>

      <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
        <Flex wrap="wrap" align="center" gap="middle">
          <Flex align="center" gap="small">
            <Text strong>Trạng thái thanh toán</Text>
            <Select
              value={invoiceFilter}
              onChange={setInvoiceFilter}
              options={[
                { value: "unpaid", label: "Chưa trả" },
                { value: "partial", label: "Đang trả theo tháng" },
                { value: "paid", label: "Đã trả đủ" },
                { value: "all", label: "Tất cả" }
              ]}
              style={{ width: 150 }}
            />
          </Flex>
          <Flex align="center" gap="small" style={{ flexGrow: 1, maxWidth: 448 }}>
            <Text strong>Tìm bệnh nhân</Text>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              placeholder="Tên hoặc SĐT"
              style={{ width: '100%' }}
            />
          </Flex>
        </Flex>
      </div>

      {loading ? (
        <EmptyState title="Đang tải hóa đơn" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : filteredAppointments.length ? (
        <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
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
              <Card 
                key={appointment._id}
                style={{ overflow: 'hidden', position: 'relative' }}
                styles={{ body: { padding: 24 } }}
              >
                {canDeleteEmptyInvoice && (
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                    onClick={() => onDeleteEmptyInvoice(appointment)}
                    title="Xóa dòng chưa có dịch vụ phát sinh"
                  >
                    Xóa
                  </Button>
                )}

                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Flex justify="space-between" align="flex-start" wrap="wrap" gap="small">
                      <div>
                        <Title level={5} style={{ margin: 0, paddingRight: 60 }}>{appointment.patient?.fullName || "Bệnh nhân"}</Title>
                        <Text type="secondary">{appointment.patient?.phone || "Chưa có SĐT"}</Text>
                      </div>
                      <StatusBadge value={appointment.status} />
                    </Flex>
                  </Col>

                  <Col span={24}>
                    <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>Thông tin dịch vụ</Text>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary">{appointment.service?.name || "Dịch vụ"}</Text>
                            <Text type="secondary">Bác sĩ: {appointment.dentist?.fullName || "-"}</Text>
                            <Text type="secondary">Tạo hóa đơn: {invoice ? formatDateTime(invoice.invoiceDate || invoice.createdAt) : "Chưa tạo"}</Text>
                          </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>Tiến độ thanh toán</Text>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Flex align="center" gap="small">
                              <Text type="secondary">Đã trả:</Text>
                              <Text strong style={{ color: '#52c41a' }}>{formatMoney(paidAmount)}</Text>
                            </Flex>
                            <Flex align="center" gap="small">
                              <Text type="secondary">Tổng cộng:</Text>
                              <Text strong>{formatMoney(total)}</Text>
                            </Flex>
                            {invoice && <StatusBadge value={invoice.status} />}
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={{ borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
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
                            render: (_, item) => <Text strong>{formatMoney(Number(item.amount || item.price || 0))}</Text>
                          }
                        ]}
                        locale={{ emptyText: <Text type="secondary" italic>Chưa có dịch vụ phát sinh</Text> }}
                      />
                    </div>
                  </Col>

                  {invoice?.payments?.length ? (
                    <Col span={24}>
                      <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                        <Text strong style={{ color: '#389e0d', display: 'block', marginBottom: 8 }}>Lịch sử thanh toán</Text>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {invoice.payments.map((payment, index) => (
                            <Flex justify="space-between" align="center" key={payment._id || `${invoice._id}-payment-${index}`}>
                              <Text style={{ color: '#389e0d' }}>Lần {payment.installmentNumber || index + 1}: {formatDateTime(payment.paymentDate || payment.createdAt)} ({paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod})</Text>
                              <Text strong style={{ color: '#389e0d' }}>+{formatMoney(Number(payment.amount || 0))}</Text>
                            </Flex>
                          ))}
                        </Space>
                      </div>
                    </Col>
                  ) : null}

                  <Col span={24}>
                    <div style={{ backgroundColor: '#fafafa', padding: 20, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                      {!invoice ? (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Giảm giá</Text>
                            <Select 
                              value={invoicePlan.discountPercent}
                              onChange={(val) => updateInvoicePlan(appointment._id, { discountPercent: val })}
                              options={discountOptions.map(p => ({ value: p, label: `${p}%` }))}
                              style={{ width: 120 }}
                            />
                          </div>

                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Hình thức thanh toán</Text>
                            <Radio.Group 
                              value={selectedPaymentPlan}
                              onChange={(e) => updateInvoicePlan(appointment._id, { paymentPlan: e.target.value })}
                              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                            >
                              <Radio.Button value="one_time" style={{ height: 'auto', padding: 16, flex: 1, textAlign: 'center' }}>
                                <Text strong style={{ display: 'block' }}>Trả một lần</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>Thanh toán toàn bộ {formatMoney(total)}</Text>
                              </Radio.Button>
                              {canUseMonthlyPlan && (
                                <Radio.Button value="monthly" style={{ height: 'auto', padding: 16, flex: 1, textAlign: 'center' }}>
                                  <Text strong style={{ display: 'block' }}>Trả góp theo tháng</Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Áp dụng cho hóa đơn từ 5tr</Text>
                                </Radio.Button>
                              )}
                            </Radio.Group>
                          </div>

                          {selectedPaymentPlan === "monthly" && (
                            <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0', marginTop: 12 }}>
                              <Text strong style={{ display: 'block', marginBottom: 12 }}>Kỳ hạn trả góp</Text>
                              <Radio.Group 
                                value={invoicePlan.installmentMonths}
                                onChange={(e) => updateInvoicePlan(appointment._id, { installmentMonths: e.target.value })}
                                style={{ display: 'flex', gap: 12, width: '100%' }}
                              >
                                {installmentOptions.map(month => (
                                  <Radio.Button value={month} key={month} style={{ flex: 1, textAlign: 'center' }}>
                                    {month} tháng
                                  </Radio.Button>
                                ))}
                              </Radio.Group>
                              <div style={{ marginTop: 16, backgroundColor: '#e6f4ff', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#1677ff' }}>Thanh toán mỗi kỳ:</Text>
                                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>{formatMoney(plannedInstallmentAmount)}/tháng</Text>
                              </div>
                            </div>
                          )}

                          {total > 0 ? (
                            <Button
                              type="primary"
                              size="large"
                              style={{ width: '100%', marginTop: 8 }}
                              onClick={() => generateInvoice(appointment)}
                            >
                              Tạo hóa đơn {formatMoney(total)}
                            </Button>
                          ) : (
                            <div style={{ backgroundColor: '#fffbe6', color: '#d48806', padding: 16, borderRadius: 8, textAlign: 'center', fontWeight: 'bold', border: '1px solid #ffe58f' }}>
                              Chưa có dịch vụ phát sinh để tạo hóa đơn
                            </div>
                          )}
                        </Space>
                      ) : remaining > 0 ? (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div style={{ backgroundColor: '#e6f4ff', padding: 16, borderRadius: 8, border: '1px solid #91caff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text style={{ color: '#1677ff', display: 'block', marginBottom: 4 }}>Cần thu lần {nextPayment.installmentNumber}</Text>
                              <Title level={3} style={{ margin: 0, color: '#0958d9' }}>{formatMoney(nextPayment.amount)}</Title>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Text style={{ color: '#1677ff', fontSize: 12, display: 'block', marginBottom: 4 }}>Còn lại sau khi thu</Text>
                              <Text strong>{formatMoney(remaining - nextPayment.amount)}</Text>
                            </div>
                          </div>

                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Phương thức thanh toán</Text>
                            <Radio.Group 
                              value={paymentMethods[appointment._id] || "cash"}
                              onChange={(e) => setPaymentMethods((current) => ({ ...current, [appointment._id]: e.target.value }))}
                              style={{ display: 'flex', gap: 12, width: '100%', flexWrap: 'wrap' }}
                            >
                              <Radio.Button value="cash" style={{ flex: 1, height: 'auto', padding: 12, textAlign: 'center', borderRadius: 8 }}>
                                <Text strong>Tiền mặt</Text>
                              </Radio.Button>
                              <Radio.Button value="bank_transfer" style={{ flex: 1, height: 'auto', padding: 12, textAlign: 'center', borderRadius: 8 }}>
                                <Text strong>Chuyển khoản</Text>
                              </Radio.Button>
                              <Radio.Button value="card" style={{ flex: 1, height: 'auto', padding: 12, textAlign: 'center', borderRadius: 8 }}>
                                <Text strong>Thẻ</Text>
                              </Radio.Button>
                            </Radio.Group>
                          </div>

                          <Button
                            type="primary"
                            size="large"
                            style={{ width: '100%' }}
                            onClick={() => processPayment(appointment)}
                          >
                            Ghi nhận thanh toán {formatMoney(nextPayment.amount)}
                          </Button>
                        </Space>
                      ) : (
                        <div style={{ backgroundColor: '#f6ffed', color: '#389e0d', padding: 16, borderRadius: 8, textAlign: 'center', fontWeight: 'bold', border: '1px solid #b7eb8f', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <CheckCircleFilled />
                          Đã thanh toán đủ
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      ) : (
        <EmptyState title="Chưa có hóa đơn phù hợp" text="Mặc định màn này hiển thị các hóa đơn chưa trả." />
      )}
    </Space>
  );
}
