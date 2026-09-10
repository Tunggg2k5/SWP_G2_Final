import { EditOutlined, SettingOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, Space, Table } from "antd";

function cleanPriceInput(value) {
  return String(value || "").replace(/[^\d-]/g, "");
}

export default function DentalServiceManagement({
  editingService,
  loading,
  onCancelEditService,
  onCreateService,
  onDeleteService,
  onEditingServiceChange,
  onEditService,
  onServiceFormChange,
  onUpdateService,
  serviceForm,
  services
}) {
  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
      fontWeight: "bold",
      render: (text) => <span className="font-bold text-slate-800">{text}</span>
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "Chưa có mô tả"
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="text-primary-600 font-semibold">{text || "0"}</span>
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEditService(record)} title="Cập nhật" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDeleteService(record)} title="Xóa" />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card title={<><SettingOutlined className="text-primary-600 mr-2" /> Thêm dịch vụ nha khoa</>} className="shadow-sm">
        <form className="flex flex-col gap-4 max-w-3xl" onSubmit={onCreateService}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Tên dịch vụ</span>
              <Input value={serviceForm.name} onChange={(event) => onServiceFormChange({ name: event.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Giá tiền</span>
              <Input
                inputMode="numeric"
                pattern="[0-9-]+"
                placeholder="Ví dụ: 200000 hoặc 200000-500000"
                value={serviceForm.price}
                onChange={(event) => onServiceFormChange({ price: cleanPriceInput(event.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Mô tả</span>
            <Input.TextArea value={serviceForm.description} onChange={(event) => onServiceFormChange({ description: event.target.value })} rows={3} />
          </div>
          <div className="pt-2">
            <Button type="primary" htmlType="submit" className="w-full md:w-auto">Thêm dịch vụ</Button>
          </div>
        </form>
      </Card>

      <Card title={<><SettingOutlined className="text-primary-600 mr-2" /> Dịch vụ</>} className="shadow-sm">
        <Table
          dataSource={services}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title="Cập nhật dịch vụ"
        open={!!editingService}
        onCancel={onCancelEditService}
        footer={null}
        destroyOnClose
      >
        {editingService && (
          <form className="flex flex-col gap-4 mt-4" onSubmit={onUpdateService}>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Tên dịch vụ</span>
              <Input value={editingService.name} onChange={(event) => onEditingServiceChange({ name: event.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Giá tiền</span>
              <Input
                inputMode="numeric"
                pattern="[0-9-]+"
                value={editingService.price || ""}
                onChange={(event) => onEditingServiceChange({ price: cleanPriceInput(event.target.value) })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Mô tả</span>
              <Input.TextArea value={editingService.description || ""} onChange={(event) => onEditingServiceChange({ description: event.target.value })} rows={3} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button onClick={onCancelEditService}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
