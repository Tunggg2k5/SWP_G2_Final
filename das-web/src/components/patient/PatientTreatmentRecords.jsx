import { FileText, ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../EmptyState.jsx";
import { formatDateTime } from "../../utils/format.js";

import { Select, Tabs } from "antd";

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
    <section className="space-y-4" id="records">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <FileText className="text-primary-500" size={24} />
        <h2 className="text-xl font-bold">Hồ sơ điều trị</h2>
      </div>

      {loading ? (
        <div className="card-base p-8">
          <EmptyState title="Đang tải hồ sơ" text="Hệ thống đang lấy dữ liệu mới nhất." />
        </div>
      ) : records.length ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-500 w-full sm:w-auto">
              <ClipboardList size={18} />
              <span className="text-sm font-medium whitespace-nowrap">Chọn hồ sơ:</span>
            </div>
            <Select
              className="w-full"
              value={selectedRecord?._id || undefined}
              onChange={chooseRecord}
              options={records.map((record) => ({
                value: record._id,
                label: `${recordServiceName(record)} - ${formatDateOnly(record.treatmentDate || record.createdAt)}`
              }))}
            />
          </div>

          {visits.length ? (
            <div className="card-base overflow-hidden">
              <div className="px-4 pt-4 border-b border-slate-100 bg-slate-50/50">
                <Tabs 
                  activeKey={activeVisit} 
                  onChange={(key) => setActiveVisit(key)} 
                  items={visitItems}
                  className="mb-0"
                />
              </div>

              <div className="p-5 space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                    Cập nhật: {formatDateOnly(visibleVisit?.updatedAt || selectedRecord.updatedAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Sinh hiệu
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ReadOnlyField label="Huyết áp" value={visibleVisit?.vitalSigns?.bloodPressure} />
                      <ReadOnlyField label="Nhịp tim" value={visibleVisit?.vitalSigns?.heartRate} />
                      <ReadOnlyField label="SpO2" value={visibleVisit?.vitalSigns?.spo2} />
                      <ReadOnlyField label="Nhiệt độ" value={visibleVisit?.vitalSigns?.temperature} />
                      <ReadOnlyField label="Nhịp thở" value={visibleVisit?.vitalSigns?.respiratoryRate} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                      Chẩn đoán & Bệnh sử
                    </h4>
                    <div className="space-y-4">
                      <ReadOnlyField label="Chẩn đoán" value={visibleVisit?.diagnosis} wide />
                      <ReadOnlyField label="Tiền sử bệnh án" value={visibleVisit?.medicalHistory} wide />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Tiến trình điều trị
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField label="Điều trị đã thực hiện" value={visibleVisit?.treatmentResult} wide />
                    <ReadOnlyField label="Đơn thuốc" value={visibleVisit?.prescription} wide />
                    <ReadOnlyField label="Hướng dẫn sau điều trị" value={visibleVisit?.aftercareInstructions} wide />
                    <ReadOnlyField label="Điều trị dự kiến" value={visibleVisit?.treatmentPlan} wide />
                    <div className="md:col-span-2">
                      <ReadOnlyField label="Ghi chú điều trị" value={visibleVisit?.treatmentNote} wide />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-base p-8">
              <EmptyState title="Chưa có lần điều trị" text="Hồ sơ này chưa có nội dung lần điều trị." />
            </div>
          )}
        </div>
      ) : (
        <div className="card-base p-8">
          <EmptyState title="Chưa có hồ sơ điều trị" text="Hồ sơ sẽ hiển thị sau khi bác sĩ hoặc y tá tạo và cập nhật điều trị." />
        </div>
      )}
    </section>
  );
}

function ReadOnlyField({ label, value, wide = false }) {
  return (
    <div className={`bg-slate-50 p-3 rounded-lg border border-slate-100 ${wide ? "w-full" : ""}`}>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap">{value || <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>}</div>
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
