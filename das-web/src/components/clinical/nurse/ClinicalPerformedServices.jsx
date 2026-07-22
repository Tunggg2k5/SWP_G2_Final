import { ReceiptText, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../../EmptyState.jsx";
import StatusBadge from "../../StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../../utils/format.js";

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
  const [serviceSearch, setServiceSearch] = useState("");
  const selectedServices = form.services || {};
  const selectedRows = Object.entries(selectedServices)
    .filter(([, item]) => item.selected)
    .map(([serviceId, item]) => ({ serviceId, ...item }));
  const extraCosts = form.extraCosts || [];
  const canEditCharges = selectedAppointment?.status === "in_treatment";
  const isLockedForCharges = Boolean(selectedAppointment) && !canEditCharges;

  const filteredServices = useMemo(() => {
    const keyword = serviceSearch.trim().toLowerCase();
    return services
      .filter((service) => !selectedServices[service._id]?.selected)
      .filter((service) => !keyword || service.name?.toLowerCase().includes(keyword))
      .slice(0, 8);
  }, [serviceSearch, selectedServices, services]);

  const total = useMemo(() => {
    const serviceTotal = selectedRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const extraTotal = extraCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return serviceTotal + extraTotal;
  }, [extraCosts, selectedRows]);

  return (
    <section className="panel clinical-treatment-panel">
      <div className="section-title">
        <ReceiptText size={20} />
        <h2>Dịch vụ đã thực hiện</h2>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        <label className="field">
          <span>Lịch khám</span>
          <select value={form.appointmentId} onChange={(event) => onChange("appointmentId", event.target.value)}>
            <option value="">Chọn lịch khám</option>
            {appointments.map((appointment) => (
              <option key={appointment._id} value={appointment._id}>
                {[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")} - {appointment.service?.name || "Dịch vụ"} - {formatDateTime(appointment.startAt)}
              </option>
            ))}
          </select>
        </label>

        {selectedAppointment ? (
          <div className="clinical-selected-card">
            <strong>{[selectedAppointment.patient?.fullName || "Bệnh nhân", selectedAppointment.patient?.phone].filter(Boolean).join(" - ")}</strong>
            <span>{selectedAppointment.service?.name} / {selectedAppointment.room?.name}</span>
            <StatusBadge value={selectedAppointment.status} />
          </div>
        ) : (
          <EmptyState title="Chọn lịch khám" text="Dịch vụ đã thực hiện chỉ hiển thị sau khi y tá chọn một lịch khám cụ thể." />
        )}

        {isLockedForCharges && (
          <div className="empty-state compact">
            <strong>Chưa được chọn dịch vụ</strong>
            <span>Y tá chỉ xác nhận dịch vụ khi lịch khám đang ở trạng thái Đang khám.</span>
          </div>
        )}

        {selectedAppointment && (
          <div className="performed-service-picker">
            <label className="field">
              <span>Tìm dịch vụ</span>
              <div className="input-with-icon">
                <Search size={18} />
                <input
                  disabled={!canEditCharges}
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  placeholder="Nhập tên dịch vụ cần thêm"
                />
              </div>
            </label>

            {canEditCharges && (
              <div className="performed-service-results">
                {filteredServices.length ? (
                  filteredServices.map((service) => (
                    <button
                      className="button small secondary"
                      key={service._id}
                      type="button"
                      onClick={() => {
                        onToggleService(service, true, parseDefaultAmount(service.price));
                        setServiceSearch("");
                      }}
                    >
                      Thêm {service.name}
                    </button>
                  ))
                ) : (
                  <span className="mini">{serviceSearch ? "Không tìm thấy dịch vụ phù hợp." : "Nhập tên để tìm dịch vụ."}</span>
                )}
              </div>
            )}
          </div>
        )}

        {selectedAppointment && (
          <div className="performed-service-table">
            <div className="performed-service-table-head">
              <span>Dịch vụ</span>
              <span>Số tiền</span>
              <span></span>
            </div>
            {selectedRows.length ? (
              selectedRows.map((item) => (
                <div className="performed-service-table-row" key={item.serviceId}>
                  <strong>{item.name}</strong>
                  <input
                    disabled={!canEditCharges}
                    min="0"
                    step="1000"
                    type="number"
                    value={item.amount ?? 0}
                    onChange={(event) => onToggleService({ _id: item.serviceId, name: item.name }, true, event.target.value)}
                  />
                  <button
                    aria-label={`Xóa ${item.name}`}
                    className="button icon danger"
                    disabled={!canEditCharges}
                    type="button"
                    onClick={() => onToggleService({ _id: item.serviceId, name: item.name }, false)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="performed-service-table-empty">Chưa chọn dịch vụ. Có thể xác nhận hoàn tất nếu không phát sinh dịch vụ.</div>
            )}
          </div>
        )}

        {selectedAppointment && (
          <div className="stack">
            {extraCosts.map((item, index) => (
              <div className="form-grid" key={`extra-${index}`}>
                <label className="field">
                  <span>Chi phí khác</span>
                  <input
                    disabled={!canEditCharges}
                    value={item.name}
                    onChange={(event) => onExtraCostChange(index, "name", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Số tiền</span>
                  <input
                    disabled={!canEditCharges}
                    min="0"
                    step="1000"
                    type="number"
                    value={item.amount}
                    onChange={(event) => onExtraCostChange(index, "amount", event.target.value)}
                  />
                </label>
                <button className="button small danger" disabled={!canEditCharges} type="button" onClick={() => onRemoveExtraCost(index)}>
                  Xóa
                </button>
              </div>
            ))}
            <button className="button small ghost" disabled={!canEditCharges} type="button" onClick={onAddExtraCost}>
              Thêm chi phí khác
            </button>
          </div>
        )}

        {selectedAppointment && (
          <div className="clinical-selected-card">
            <strong>Tổng tiền: {formatMoney(total)}</strong>
          </div>
        )}

        {selectedAppointment && (
          <div className="row-actions clinical-treatment-actions">
            <button className="button primary" disabled={!canEditCharges}>
              Xác nhận hoàn tất
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function parseDefaultAmount(value) {
  const numberText = String(value || "").match(/\d[\d.]*/)?.[0]?.replace(/\./g, "") || "0";
  const amount = Number(numberText);
  return Number.isFinite(amount) ? amount : 0;
}
