import { FileText, ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../EmptyState.jsx";
import { formatDateTime } from "../../utils/format.js";

import { Select, Tabs, Card, Typography, Space, Flex, Row, Col, Tag } from "antd";

const { Title, Text } = Typography;

export default function PatientTreatmentRecords({ loading, records }) {
  const [recordId, setRecordId] = useState("");
  const selectedRecord = useMemo(() => records.find((record) => record._id === recordId) || records[0], [recordId, records]);
  const visits = useMemo(() => normalizeVisits(selectedRecord), [selectedRecord]);
  const latestVisitNumber = visits.length ? visits[visits.length - 1].visitNumber : 1;
  const [activeVisit, setActiveVisit] = useState(latestVisitNumber.toString());
  const visibleVisit = visits.find((visit) => visit.visitNumber.toString() === activeVisit) || visits[visits.length - 1];

  useEffect(() => {
    setActiveVisit(latestVisitNumber.toString());
  }, [latestVisitNumber, selectedRecord?._id]);

  function chooseRecord(nextRecordId) {
    const nextRecord = records.find((record) => record._id === nextRecordId);
    const nextVisits = normalizeVisits(nextRecord);
    setRecordId(nextRecordId);
    setActiveVisit(nextVisits.length ? nextVisits[nextVisits.length - 1].visitNumber.toString() : "1");
  }

  const visitItems = visits.map((visit) => ({
    key: visit.visitNumber.toString(),
    label: `Lần khám ${visit.visitNumber}`,
  }));

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }} id="records">
      <Flex align="center" gap={8}>
        <FileText style={{ color: "#10b981" }} size={24} />
        <Title level={4} style={{ margin: 0 }}>Hồ sơ điều trị</Title>
      </Flex>

      {loading ? (
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <EmptyState title="Đang tải hồ sơ" text="Hệ thống đang lấy dữ liệu mới nhất." />
        </Card>
      ) : records.length ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }} bodyStyle={{ padding: 12 }}>
            <Flex align="center" gap={12} wrap="wrap">
              <Flex align="center" gap={8} style={{ color: "#64748b" }}>
                <ClipboardList size={18} />
                <Text strong style={{ whiteSpace: "nowrap" }}>Chọn hồ sơ:</Text>
              </Flex>
              <Select
                style={{ flex: 1, minWidth: 200 }}
                value={selectedRecord?._id || undefined}
                onChange={chooseRecord}
                options={records.map((record) => ({
                  value: record._id,
                  label: `${recordServiceName(record)} - ${formatDateOnly(record.treatmentDate || record.createdAt)}`
                }))}
              />
            </Flex>
          </Card>

          {visits.length ? (
            <Card bordered={false} style={{ borderRadius: 16, overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "16px 16px 0 16px", borderBottom: "1px solid #f1f5f9" }}>
                <Tabs 
                  activeKey={activeVisit} 
                  onChange={(key) => setActiveVisit(key)} 
                  items={visitItems}
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div style={{ padding: 20 }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                  <Tag color="default" style={{ borderRadius: 16, padding: "4px 12px", fontSize: 13, border: "none", backgroundColor: "#f1f5f9", color: "#475569" }}>
                    Cập nhật: {formatDateOnly(visibleVisit?.updatedAt || selectedRecord.updatedAt)}
                  </Tag>
                </Flex>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <div style={{ paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                        <Flex align="center" gap={8}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
                          <Text strong style={{ textTransform: "uppercase", fontSize: 13, letterSpacing: 0.5 }}>Sinh hiệu</Text>
                        </Flex>
                      </div>
                      <Row gutter={[16, 16]}>
                        <Col span={12}><ReadOnlyField label="Huyết áp" value={visibleVisit?.vitalSigns?.bloodPressure} /></Col>
                        <Col span={12}><ReadOnlyField label="Nhịp tim" value={visibleVisit?.vitalSigns?.heartRate} /></Col>
                        <Col span={12}><ReadOnlyField label="SpO2" value={visibleVisit?.vitalSigns?.spo2} /></Col>
                        <Col span={12}><ReadOnlyField label="Nhiệt độ" value={visibleVisit?.vitalSigns?.temperature} /></Col>
                        <Col span={12}><ReadOnlyField label="Nhịp thở" value={visibleVisit?.vitalSigns?.respiratoryRate} /></Col>
                      </Row>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <div style={{ paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                        <Flex align="center" gap={8}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
                          <Text strong style={{ textTransform: "uppercase", fontSize: 13, letterSpacing: 0.5 }}>Chẩn đoán & Bệnh sử</Text>
                        </Flex>
                      </div>
                      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <ReadOnlyField label="Chẩn đoán" value={visibleVisit?.diagnosis} wide />
                        <ReadOnlyField label="Tiền sử bệnh án" value={visibleVisit?.medicalHistory} wide />
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <div style={{ marginTop: 24 }}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div style={{ paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                      <Flex align="center" gap={8}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                        <Text strong style={{ textTransform: "uppercase", fontSize: 13, letterSpacing: 0.5 }}>Tiến trình điều trị</Text>
                      </Flex>
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}><ReadOnlyField label="Điều trị đã thực hiện" value={visibleVisit?.treatmentResult} wide /></Col>
                      <Col xs={24} md={12}><ReadOnlyField label="Đơn thuốc" value={visibleVisit?.prescription} wide /></Col>
                      <Col xs={24} md={12}><ReadOnlyField label="Hướng dẫn sau điều trị" value={visibleVisit?.aftercareInstructions} wide /></Col>
                      <Col xs={24} md={12}><ReadOnlyField label="Điều trị dự kiến" value={visibleVisit?.treatmentPlan} wide /></Col>
                      <Col span={24}>
                        <ReadOnlyField label="Ghi chú điều trị" value={visibleVisit?.treatmentNote} wide />
                      </Col>
                    </Row>
                  </Space>
                </div>
              </div>
            </Card>
          ) : (
            <Card bordered={false} style={{ borderRadius: 16 }}>
              <EmptyState title="Chưa có lần điều trị" text="Hồ sơ này chưa có nội dung lần điều trị." />
            </Card>
          )}
        </Space>
      ) : (
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <EmptyState title="Chưa có hồ sơ điều trị" text="Hồ sơ sẽ hiển thị sau khi bác sĩ hoặc y tá tạo và cập nhật điều trị." />
        </Card>
      )}
    </Space>
  );
}

function ReadOnlyField({ label, value, wide = false }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #f1f5f9", width: wide ? "100%" : "auto" }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", whiteSpace: "pre-wrap" }}>
        {value || <span style={{ color: "#94a3b8", fontStyle: "italic", fontWeight: 400 }}>Chưa cập nhật</span>}
      </div>
    </div>
  );
}

function recordServiceName(record) {
  return record?.serviceSnapshot?.name || record?.initialInfo?.serviceName || record?.appointment?.service?.name || "Dịch vụ";
}

function formatDateOnly(value) {
  if (!value) return "-";
  return formatDateTime(value).split(" ")[0] || "-";
}

function normalizeVisits(record) {
  if (!record) return [];
  const visits = Array.isArray(record.visits) ? record.visits.filter(Boolean) : [];
  if (visits.length) {
    return visits
      .map((visit, index) => ({ ...visit, visitNumber: Number(visit.visitNumber || index + 1) }))
      .sort((first, second) => first.visitNumber - second.visitNumber);
  }
  const hasLegacyData = [
    record.vitalSigns,
    record.diagnosis,
    record.medicalHistory,
    record.treatmentResult,
    record.treatmentNote,
    record.treatmentPlan,
    record.prescription,
    record.aftercareInstructions
  ].some(Boolean);
  return hasLegacyData
    ? [{
      visitNumber: 1,
      vitalSigns: record.vitalSigns || {},
      diagnosis: record.diagnosis || "",
      medicalHistory: record.medicalHistory || "",
      treatmentResult: record.treatmentResult || "",
      treatmentNote: record.treatmentNote || "",
      treatmentPlan: record.treatmentPlan || "",
      prescription: record.prescription || "",
      aftercareInstructions: record.aftercareInstructions || "",
      updatedAt: record.updatedAt || record.treatmentDate
    }]
    : [];
}
