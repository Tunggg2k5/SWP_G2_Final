import { ReceiptText, Search, Trash2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, Select, Typography, Button, Table, Space, InputNumber, Input, Form, Row, Col } from "antd";
import EmptyState from "../../EmptyState.jsx";
import StatusBadge from "../../StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../../utils/format.js";

const { Title, Text } = Typography;

export default function ClinicalPerformedServices({
  appointments,
  form,
  onAddExtraCost,
  onChange,
  onExtraCostChange,
  onRemoveExtraCost,
  onSubmit,
  onToggleService,
  selectedAppointment,
  services
}) {
  const selectedServices = form.services || {};
  const selectedRows = Object.entries(selectedServices)
    .filter(([, item]) => item.selected)
    .map(([serviceId, item]) => ({ serviceId, ...item }));
  const extraCosts = form.extraCosts || [];
  const canEditCharges = selectedAppointment?.status === "in_treatment";
  const isLockedForCharges = Boolean(selectedAppointment) && !canEditCharges;

  const total = useMemo(() => {
    const serviceTotal = selectedRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const extraTotal = extraCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return serviceTotal + extraTotal;
  }, [extraCosts, selectedRows]);

  const serviceColumns = [
    {
      title: "Dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 200,
      render: (amount, record) => (
        <InputNumber
          className="w-full"
          disabled={!canEditCharges}
          min={0}
          step={1000}
          value={amount ?? 0}
          onChange={(value) => onToggleService({ _id: record.serviceId, name: record.name }, true, value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
        />
      )
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={16} />}
          disabled={!canEditCharges}
          onClick={() => onToggleService({ _id: record.serviceId, name: record.name }, false)}
        />
      )
    }
  ];

  return (
    <Card className="shadow-sm">
      <div className="flex items-center gap-3 text-primary-700 mb-6 border-b border-slate-100 pb-4">
        <ReceiptText size={20} />
        <Title level={4} style={{ margin: 0 }} className="text-primary-700">Dịch vụ đã thực hiện</Title>
      </div>

      <Form layout="vertical" onFinish={(e) => onSubmit({ preventDefault: () => {} })}>
        <Form.Item label="Lịch khám">
          <Select 
            showSearch
            className="w-full" 
            size="large"
            value={form.appointmentId || undefined} 
            onChange={(value) => onChange("appointmentId", value)}
            placeholder="Chọn lịch khám"
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={appointments.map((appointment) => ({
              value: appointment._id,
              label: `${[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")} - ${appointment.service?.name || "Dịch vụ"} - ${formatDateTime(appointment.startAt)}`
            }))}
          />
        </Form.Item>

        {selectedAppointment ? (
          <div className="bg-primary-50 p-4 rounded-xl flex flex-col gap-2 border border-primary-100 mb-6">
            <strong className="text-primary-800 text-lg">{[selectedAppointment.patient?.fullName || "Bệnh nhân", selectedAppointment.patient?.phone].filter(Boolean).join(" - ")}</strong>
            <span className="text-primary-600 text-sm">{selectedAppointment.service?.name} / {selectedAppointment.room?.name}</span>
            <div><StatusBadge value={selectedAppointment.status} /></div>
          </div>
        ) : (
          <EmptyState title="Chọn lịch khám" text="Dịch vụ đã thực hiện chỉ hiển thị sau khi y tá chọn một lịch khám cụ thể." />
        )}

        {isLockedForCharges && (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex flex-col gap-1 mb-6">
            <strong className="font-semibold">Chưa được chọn dịch vụ</strong>
            <span className="text-sm">Y tá chỉ xác nhận dịch vụ khi lịch khám đang ở trạng thái Đang khám.</span>
          </div>
        )}

        {selectedAppointment && (
          <div className="flex flex-col gap-4 mb-6">
            <Form.Item label="Thêm dịch vụ">
              <Select
                showSearch
                disabled={!canEditCharges}
                placeholder="Nhập tên dịch vụ cần thêm"
                size="large"
                value={null}
                onChange={(serviceId) => {
                  const service = services.find((s) => s._id === serviceId);
                  if (service) {
                    onToggleService(service, true, parseDefaultAmount(service.price));
                  }
                }}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={services
                  .filter((service) => !selectedServices[service._id]?.selected)
                  .map((service) => ({
                    value: service._id,
                    label: service.name
                  }))
                }
              />
            </Form.Item>
          </div>
        )}

        {selectedAppointment && (
          <div className="mb-6">
            <Table
              dataSource={selectedRows}
              columns={serviceColumns}
              rowKey="serviceId"
              pagination={false}
              bordered
              locale={{ emptyText: 'Chưa chọn dịch vụ. Có thể xác nhận hoàn tất nếu không phát sinh dịch vụ.' }}
            />
          </div>
        )}

        {selectedAppointment && (
          <div className="space-y-4 mb-6">
            {extraCosts.map((item, index) => (
              <Row gutter={16} key={`extra-${index}`} align="bottom">
                <Col flex="auto">
                  <Form.Item label="Chi phí khác" style={{ marginBottom: 0 }}>
                    <Input
                      disabled={!canEditCharges}
                      value={item.name}
                      onChange={(event) => onExtraCostChange(index, "name", event.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col flex="200px">
                  <Form.Item label="Số tiền" style={{ marginBottom: 0 }}>
                    <InputNumber
                      className="w-full"
                      disabled={!canEditCharges}
                      min={0}
                      step={1000}
                      value={item.amount}
                      onChange={(value) => onExtraCostChange(index, "amount", value)}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col flex="60px">
                  <Button 
                    danger 
                    disabled={!canEditCharges} 
                    onClick={() => onRemoveExtraCost(index)}
                  >
                    Xóa
                  </Button>
                </Col>
              </Row>
            ))}
            <Button 
              type="dashed" 
              icon={<Plus size={16} />} 
              disabled={!canEditCharges} 
              onClick={onAddExtraCost}
              block
            >
              Thêm chi phí khác
            </Button>
          </div>
        )}

        {selectedAppointment && (
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex justify-end mb-6">
            <strong className="text-xl text-primary-800">Tổng tiền: {formatMoney(total)}</strong>
          </div>
        )}

        {selectedAppointment && (
          <div>
            <Button type="primary" htmlType="submit" size="large" block disabled={!canEditCharges}>
              Xác nhận hoàn tất
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
}

function parseDefaultAmount(value) {
  const numberText = String(value || "").match(/\d[\d.]*/)?.[0]?.replace(/\./g, "") || "0";
  const amount = Number(numberText);
  return Number.isFinite(amount) ? amount : 0;
}
