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
          style={{ width: '100%' }}
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
    <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
        <ReceiptText size={20} color="#0369a1" />
        <Title level={4} style={{ margin: 0, color: '#0369a1' }}>Dịch vụ đã thực hiện</Title>
      </div>

      <Form layout="vertical" onFinish={(e) => onSubmit({ preventDefault: () => {} })}>
        <Form.Item label="Lịch khám">
          <Select 
            showSearch
            style={{ width: '100%' }}
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
          <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #e0f2fe', marginBottom: 24 }}>
            <strong style={{ color: '#075985', fontSize: 18 }}>{[selectedAppointment.patient?.fullName || "Bệnh nhân", selectedAppointment.patient?.phone].filter(Boolean).join(" - ")}</strong>
            <span style={{ color: '#0284c7', fontSize: 14 }}>{selectedAppointment.service?.name} / {selectedAppointment.room?.name}</span>
            <div><StatusBadge value={selectedAppointment.status} /></div>
          </div>
        ) : (
          <EmptyState title="Chọn lịch khám" text="Dịch vụ đã thực hiện chỉ hiển thị sau khi y tá chọn một lịch khám cụ thể." />
        )}

        {isLockedForCharges && (
          <div style={{ padding: 16, backgroundColor: '#fffbeb', color: '#92400e', borderRadius: 12, border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            <strong style={{ fontWeight: 600 }}>Chưa được chọn dịch vụ</strong>
            <span style={{ fontSize: 14 }}>Y tá chỉ xác nhận dịch vụ khi lịch khám đang ở trạng thái Đang khám.</span>
          </div>
        )}

        {selectedAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
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
          <div style={{ marginBottom: 24 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
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
                      style={{ width: '100%' }}
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
          <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, border: '1px solid #e0f2fe', display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <strong style={{ fontSize: 20, color: '#075985' }}>Tổng tiền: {formatMoney(total)}</strong>
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
