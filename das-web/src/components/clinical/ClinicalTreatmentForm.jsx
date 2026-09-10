import { useState } from "react";
import { ClipboardPenLine, Plus, Search, Trash2 } from "lucide-react";
import { Card, Input, Button, Tabs, Descriptions, Space, Form, Select, DatePicker, Typography, Row, Col } from "antd";
import dayjs from "dayjs";
import StatusBadge from "../StatusBadge.jsx";
import { formatDateOnly, todayInput } from "../../utils/format.js";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ClinicalTreatmentForm({
  createForm,
  form,
  onChange,
  onCreateChange,
  onCreateRecord,
  onDeleteRecord,
  onSearch,
  onSearchPhoneChange,
  onStartCreateRecord,
  onSelectRecord,
  onSubmit,
  searchedPatient,
  searchPhone,
  searchResults = [],
  selectedRecord,
  services = [],
  treatmentVisits = [],
  user
}) {
  const isNurse = user?.role === "nurse";
  const [visitCount, setVisitCount] = useState(5);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const activeNurseVisit = treatmentVisits.find((visit) => visit.visitNumber === Number(form.visitNumber));
  const visibleVisitCount = Math.max(visitCount, treatmentVisits.length + 1, 5);
  const nextAllowedVisit = treatmentVisits.length + 1;
  const displayedSearchResults = selectedRecord
    ? searchResults.filter((record) => record._id === selectedRecord._id)
    : searchResults;

  function addVisitPage() {
    setVisitCount((current) => current + 1);
  }

  function chooseVisit(visitNumber) {
    onChange("visitNumber", visitNumber);
  }

  return (
    <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
        <ClipboardPenLine size={20} color="#0369a1" />
        <Title level={4} style={{ margin: 0, color: '#0369a1' }}>Hồ sơ điều trị</Title>
      </div>

      {isNurse ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <form
            style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(searchPhone);
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Tìm theo SĐT</Text>
              <Input
                prefix={<Search size={17} color="#94a3b8" />}
                value={searchPhone}
                onChange={(event) => onSearchPhoneChange(event.target.value)}
                placeholder="Nhập số điện thoại bệnh nhân"
                size="large"
              />
            </div>
            <Button size="large" type="default" htmlType="submit">
              Tìm hồ sơ
            </Button>
            <Button
              size="large"
              type="primary"
              ghost
              icon={<Plus size={16} />}
              onClick={() => {
                onStartCreateRecord?.();
                setShowCreateForm((current) => !current);
              }}
            >
              Tạo hồ sơ điều trị
            </Button>
          </form>

          {showCreateForm && (
            <Card style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
              <Form layout="vertical" onFinish={(values) => onCreateRecord({ preventDefault: () => {} })}>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Số điện thoại" required>
                      <Input value={createForm.phone} onChange={(e) => onCreateChange("phone", e.target.value)} required />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Dịch vụ" required>
                      <Select value={createForm.serviceId} onChange={(value) => onCreateChange("serviceId", value)} required>
                        <Select.Option value="">Chọn dịch vụ</Select.Option>
                        {services.map((service) => (
                          <Select.Option key={service._id} value={service._id}>{service.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Ngày" required>
                      <Input type="date" min={todayInput()} value={createForm.treatmentDate} onChange={(e) => onCreateChange("treatmentDate", e.target.value)} required />
                    </Form.Item>
                  </Col>
                </Row>
                <Button type="primary" htmlType="submit" block>Tạo hồ sơ</Button>
              </Form>
            </Card>
          )}

          {searchedPatient && (
            <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #e0f2fe' }}>
              <strong style={{ color: '#075985' }}>{patientLabel(searchedPatient)}</strong>
              <span style={{ fontSize: 14, color: '#0284c7' }}>{searchResults.length ? `${searchResults.length} hồ sơ điều trị` : "Chưa có hồ sơ điều trị"}</span>
            </div>
          )}

          {displayedSearchResults.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayedSearchResults.map((record) => {
                const canDelete = canDeleteTreatmentRecord(record);
                return (
                  <Card 
                    key={record._id} 
                    size="small" 
                    style={{ transition: 'border-color 0.3s, background-color 0.3s', borderColor: selectedRecord?._id === record._id ? '#0ea5e9' : '#e2e8f0', backgroundColor: selectedRecord?._id === record._id ? '#f0f9ff' : '#ffffff' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <strong style={{ color: '#1e293b' }}>{record.serviceSnapshot?.name || record.appointment?.service?.name || "Hồ sơ điều trị"}</strong>
                        <span style={{ color: '#475569', fontSize: 14 }}>{patientLabel(record.patient)}</span>
                        <small style={{ color: '#64748b' }}>Ngày bắt đầu điều trị: {formatDateOnly(record.treatmentDate || record.createdAt)}</small>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusBadge value={record.status || "active"} />
                        <Button type="default" onClick={() => onSelectRecord(record)}>
                          Cập nhật
                        </Button>
                        <Button
                          danger
                          icon={<Trash2 size={15} />}
                          disabled={!canDelete}
                          onClick={() => canDelete && onDeleteRecord(record)}
                          title={canDelete ? "Xóa hồ sơ điều trị" : "Chỉ xóa được hồ sơ chưa có thông tin điều trị"}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : searchedPatient ? (
            <div style={{ padding: 24, backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ color: '#334155' }}>Không có hồ sơ điều trị</strong>
              <span style={{ fontSize: 14, color: '#64748b' }}>Bệnh nhân này chưa có hồ sơ. Bấm tạo hồ sơ điều trị để bắt đầu lần 1.</span>
            </div>
          ) : null}

          {selectedRecord ? (
            <TreatmentEditor
              activeVisit={activeNurseVisit}
              addVisitPage={addVisitPage}
              form={form}
              isDentist={false}
              nextAllowedVisit={nextAllowedVisit}
              onChange={onChange}
              onSubmit={onSubmit}
              visibleVisitCount={visibleVisitCount}
              chooseVisit={chooseVisit}
            />
          ) : (
            <div style={{ padding: 24, backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ color: '#334155' }}>Chọn hồ sơ điều trị</strong>
              <span style={{ fontSize: 14, color: '#64748b' }}>Tìm theo số điện thoại rồi bấm cập nhật ở hồ sơ cần chỉnh.</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <form
            style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(searchPhone);
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Tìm theo SĐT</Text>
              <Input
                prefix={<Search size={17} color="#94a3b8" />}
                value={searchPhone}
                onChange={(event) => onSearchPhoneChange(event.target.value)}
                placeholder="Nhập số điện thoại bệnh nhân"
                size="large"
              />
            </div>
            <Button size="large" type="default" htmlType="submit">
              Tìm hồ sơ
            </Button>
          </form>

          {searchedPatient && (
            <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #e0f2fe' }}>
              <strong style={{ color: '#075985' }}>{patientLabel(searchedPatient)}</strong>
              <span style={{ fontSize: 14, color: '#0284c7' }}>{searchResults.length ? `${searchResults.length} hồ sơ điều trị` : "Chưa có hồ sơ điều trị"}</span>
            </div>
          )}

          {displayedSearchResults.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayedSearchResults.map((record) => (
                <Card 
                  key={record._id} 
                  size="small" 
                  style={{ transition: 'border-color 0.3s, background-color 0.3s', borderColor: selectedRecord?._id === record._id ? '#0ea5e9' : '#e2e8f0', backgroundColor: selectedRecord?._id === record._id ? '#f0f9ff' : '#ffffff' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <strong style={{ color: '#1e293b' }}>{record.serviceSnapshot?.name || record.appointment?.service?.name || "Hồ sơ điều trị"}</strong>
                      <span style={{ color: '#475569', fontSize: 14 }}>{patientLabel(record.patient)}</span>
                      <small style={{ color: '#64748b' }}>Ngày bắt đầu điều trị: {formatDateOnly(record.treatmentDate || record.createdAt)}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusBadge value={record.status || "active"} />
                      <Button type="default" onClick={() => onSelectRecord(record)}>
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : searchedPatient ? (
            <div style={{ padding: 24, backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ color: '#334155' }}>Không có hồ sơ điều trị</strong>
              <span style={{ fontSize: 14, color: '#64748b' }}>Không tìm thấy hồ sơ điều trị phù hợp với bệnh nhân này.</span>
            </div>
          ) : null}

          {selectedRecord ? (
            <TreatmentEditor
              activeVisit={activeNurseVisit}
              addVisitPage={addVisitPage}
              form={form}
              isDentist={true}
              nextAllowedVisit={Math.max(treatmentVisits.length, 1)}
              onChange={onChange}
              onSubmit={onSubmit}
              visibleVisitCount={Math.max(treatmentVisits.length, 1)}
              chooseVisit={chooseVisit}
            />
          ) : (
            <div style={{ padding: 24, backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ color: '#334155' }}>Chọn hồ sơ điều trị</strong>
              <span style={{ fontSize: 14, color: '#64748b' }}>Tìm theo số điện thoại rồi bấm xem chi tiết ở hồ sơ cần xem.</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function TreatmentEditor({
  activeVisit,
  addVisitPage,
  chooseVisit,
  form,
  isDentist,
  nextAllowedVisit,
  onChange,
  onSubmit,
  visibleVisitCount
}) {
  const isLockedVisit = Boolean(activeVisit);
  const isReadOnly = isDentist || isLockedVisit;

  const tabItems = Array.from({ length: visibleVisitCount }, (_, index) => {
    const visitNumber = index + 1;
    const disabled = visitNumber > nextAllowedVisit;
    return {
      key: visitNumber.toString(),
      label: `Lần ${visitNumber}`,
      disabled
    };
  });

  const renderField = (label, fieldKey, isTextArea = false) => {
    return (
      <Col xs={24} md={isTextArea ? 24 : 8}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <Text type="secondary">{label}</Text>
          {isReadOnly ? (
            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, color: '#334155', minHeight: 42, border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap' }}>
              {form[fieldKey] || <Text type="secondary" italic>Trống</Text>}
            </div>
          ) : isTextArea ? (
            <TextArea rows={3} value={form[fieldKey] || ""} onChange={(event) => onChange(fieldKey, event.target.value)} />
          ) : (
            <Input value={form[fieldKey] || ""} onChange={(event) => onChange(fieldKey, event.target.value)} />
          )}
        </div>
      </Col>
    );
  };

  return (
    <Form layout="vertical" onFinish={onSubmit} style={{ paddingTop: 16 }}>
      <Tabs 
        activeKey={form.visitNumber.toString()} 
        onChange={(key) => chooseVisit(Number(key))}
        items={tabItems}
        tabBarExtraContent={!isDentist ? <Button type="text" onClick={addVisitPage} icon={<Plus size={16} />} /> : null}
      />

      <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #e0f2fe', marginBottom: 16 }}>
        <strong style={{ color: '#075985' }}>Lần {form.visitNumber}</strong>
        <span style={{ fontSize: 14, color: '#0284c7' }}>{activeVisit?.updatedAt ? `Cập nhật: ${formatDateOnly(activeVisit.updatedAt)}` : "Chưa cập nhật"}</span>
      </div>

      {isLockedVisit && !isDentist && (
        <div style={{ padding: 16, backgroundColor: '#fffbeb', color: '#92400e', borderRadius: 12, border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          <strong style={{ fontWeight: 600 }}>Lần điều trị này đã được lưu</strong>
          <span style={{ fontSize: 14 }}>Không thể cập nhật lại lần cũ. Hãy chọn lần kế tiếp để nhập thông tin mới.</span>
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <Text type="secondary">Ngày lần điều trị</Text>
            {isReadOnly ? (
              <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, color: '#334155', minHeight: 42, border: '1px solid #f1f5f9' }}>
                {form.visitDate || <Text type="secondary" italic>Trống</Text>}
              </div>
            ) : (
              <Input type="date" value={form.visitDate} onChange={(event) => onChange("visitDate", event.target.value)} />
            )}
          </div>
        </Col>

        {renderField("Huyết áp", "bloodPressure")}
        {renderField("Nhịp tim", "heartRate")}
        {renderField("SpO2", "spo2")}
        {renderField("Nhiệt độ", "temperature")}
        {renderField("Nhịp thở", "respiratoryRate")}

        {renderField("Tiền sử bệnh án", "medicalHistory", true)}
        {renderField("Chẩn đoán", "diagnosis", true)}
        {renderField("Điều trị đã thực hiện", "treatmentResult", true)}
        {renderField("Đơn thuốc", "prescription", true)}
        {renderField("Điều trị dự kiến", "treatmentPlan", true)}
        {renderField("Hướng dẫn sau điều trị", "aftercareInstructions", true)}
        {renderField("Ghi chú điều trị", "treatmentNote", true)}
      </Row>

      {!isDentist && !isLockedVisit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16 }}>
          <Button type="primary" htmlType="submit" size="large">Lưu hồ sơ điều trị</Button>
        </div>
      )}
    </Form>
  );
}

function patientLabel(patient) {
  return [patient?.fullName || "Bệnh nhân", patient?.phone].filter(Boolean).join(" - ");
}

const treatmentContentFields = [
  "vitalSigns",
  "diagnosis",
  "medicalHistory",
  "treatmentResult",
  "treatmentNote",
  "treatmentPlan",
  "prescription",
  "aftercareInstructions",
  "estimatedCost"
];

function hasTreatmentValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some(hasTreatmentValue);
  if (typeof value === "object") return Object.values(value).some(hasTreatmentValue);
  return Boolean(value);
}

function canDeleteTreatmentRecord(record) {
  if (!record) return false;
  const hasLegacyContent = treatmentContentFields.some((field) => hasTreatmentValue(record[field]));
  const hasVisitContent = (record.visits || []).some((visit) =>
    treatmentContentFields.some((field) => hasTreatmentValue(visit?.[field]))
  );
  return !hasLegacyContent && !hasVisitContent;
}
