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
    <Card className="shadow-sm">
      <div className="flex items-center gap-3 text-primary-700 mb-6 border-b border-slate-100 pb-4">
        <ClipboardPenLine size={20} />
        <Title level={4} style={{ margin: 0 }} className="text-primary-700">Hồ sơ điều trị</Title>
      </div>

      {isNurse ? (
        <div className="space-y-6">
          <form
            className="flex flex-col sm:flex-row gap-4 items-end"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(searchPhone);
            }}
          >
            <div className="flex-1">
              <Text strong className="block mb-1">Tìm theo SĐT</Text>
              <Input
                prefix={<Search size={17} className="text-slate-400" />}
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
            <Card className="bg-slate-50/50">
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
            <div className="bg-primary-50 p-4 rounded-xl flex flex-col gap-1 border border-primary-100">
              <strong className="text-primary-800">{patientLabel(searchedPatient)}</strong>
              <span className="text-sm text-primary-600">{searchResults.length ? `${searchResults.length} hồ sơ điều trị` : "Chưa có hồ sơ điều trị"}</span>
            </div>
          )}

          {displayedSearchResults.length ? (
            <div className="flex flex-col gap-3">
              {displayedSearchResults.map((record) => {
                const canDelete = canDeleteTreatmentRecord(record);
                return (
                  <Card 
                    key={record._id} 
                    size="small" 
                    className={`transition-colors ${selectedRecord?._id === record._id ? "border-primary-500 bg-primary-50" : "hover:border-primary-200"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <strong className="text-slate-800">{record.serviceSnapshot?.name || record.appointment?.service?.name || "Hồ sơ điều trị"}</strong>
                        <span className="text-slate-600 text-sm">{patientLabel(record.patient)}</span>
                        <small className="text-slate-500">Ngày bắt đầu điều trị: {formatDateOnly(record.treatmentDate || record.createdAt)}</small>
                      </div>
                      <div className="flex items-center gap-2">
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
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col gap-1">
              <strong className="text-slate-700">Không có hồ sơ điều trị</strong>
              <span className="text-sm text-slate-500">Bệnh nhân này chưa có hồ sơ. Bấm tạo hồ sơ điều trị để bắt đầu lần 1.</span>
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
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col gap-1">
              <strong className="text-slate-700">Chọn hồ sơ điều trị</strong>
              <span className="text-sm text-slate-500">Tìm theo số điện thoại rồi bấm cập nhật ở hồ sơ cần chỉnh.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <form
            className="flex flex-col sm:flex-row gap-4 items-end"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(searchPhone);
            }}
          >
            <div className="flex-1">
              <Text strong className="block mb-1">Tìm theo SĐT</Text>
              <Input
                prefix={<Search size={17} className="text-slate-400" />}
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
            <div className="bg-primary-50 p-4 rounded-xl flex flex-col gap-1 border border-primary-100">
              <strong className="text-primary-800">{patientLabel(searchedPatient)}</strong>
              <span className="text-sm text-primary-600">{searchResults.length ? `${searchResults.length} hồ sơ điều trị` : "Chưa có hồ sơ điều trị"}</span>
            </div>
          )}

          {displayedSearchResults.length ? (
            <div className="flex flex-col gap-3">
              {displayedSearchResults.map((record) => (
                <Card 
                  key={record._id} 
                  size="small" 
                  className={`transition-colors ${selectedRecord?._id === record._id ? "border-primary-500 bg-primary-50" : "hover:border-primary-200"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <strong className="text-slate-800">{record.serviceSnapshot?.name || record.appointment?.service?.name || "Hồ sơ điều trị"}</strong>
                      <span className="text-slate-600 text-sm">{patientLabel(record.patient)}</span>
                      <small className="text-slate-500">Ngày bắt đầu điều trị: {formatDateOnly(record.treatmentDate || record.createdAt)}</small>
                    </div>
                    <div className="flex items-center gap-2">
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
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col gap-1">
              <strong className="text-slate-700">Không có hồ sơ điều trị</strong>
              <span className="text-sm text-slate-500">Không tìm thấy hồ sơ điều trị phù hợp với bệnh nhân này.</span>
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
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col gap-1">
              <strong className="text-slate-700">Chọn hồ sơ điều trị</strong>
              <span className="text-sm text-slate-500">Tìm theo số điện thoại rồi bấm xem chi tiết ở hồ sơ cần xem.</span>
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
        <div className="flex flex-col gap-1.5 mb-4">
          <Text type="secondary">{label}</Text>
          {isReadOnly ? (
            <div className="bg-slate-50 p-3 rounded-lg text-slate-700 min-h-[42px] border border-slate-100 whitespace-pre-wrap">
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
    <Form layout="vertical" onFinish={onSubmit} className="pt-4">
      <Tabs 
        activeKey={form.visitNumber.toString()} 
        onChange={(key) => chooseVisit(Number(key))}
        items={tabItems}
        tabBarExtraContent={!isDentist ? <Button type="text" onClick={addVisitPage} icon={<Plus size={16} />} /> : null}
      />

      <div className="bg-primary-50 p-4 rounded-xl flex flex-col gap-1 border border-primary-100 mb-4">
        <strong className="text-primary-800">Lần {form.visitNumber}</strong>
        <span className="text-sm text-primary-600">{activeVisit?.updatedAt ? `Cập nhật: ${formatDateOnly(activeVisit.updatedAt)}` : "Chưa cập nhật"}</span>
      </div>

      {isLockedVisit && !isDentist && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex flex-col gap-1 mb-4">
          <strong className="font-semibold">Lần điều trị này đã được lưu</strong>
          <span className="text-sm">Không thể cập nhật lại lần cũ. Hãy chọn lần kế tiếp để nhập thông tin mới.</span>
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <div className="flex flex-col gap-1.5 mb-4">
            <Text type="secondary">Ngày lần điều trị</Text>
            {isReadOnly ? (
              <div className="bg-slate-50 p-3 rounded-lg text-slate-700 min-h-[42px] border border-slate-100">
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
        <div className="flex justify-end pt-4">
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
