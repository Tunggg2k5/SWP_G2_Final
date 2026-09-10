import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DoorOpen } from "lucide-react";
import { Button, Card, Input, Modal, Select, Space, Table } from "antd";

export default function ClinicRoomManagement({
  dentistUsers,
  editingRoom,
  loading,
  nurseUsers,
  onCancelEditRoom,
  onCreateRoom,
  onEditingRoomChange,
  onEditRoom,
  onDeleteRoom,
  onRoomFormChange,
  onUpdateRoom,
  roomForm,
  rooms
}) {
  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-bold text-slate-800">{text}</span>
    },
    {
      title: "Bác sĩ phụ trách",
      key: "assignedDentist",
      render: (_, record) => record.assignedDentist?.fullName || "Chưa gán bác sĩ"
    },
    {
      title: "Y tá phụ trách",
      key: "assignedNurse",
      render: (_, record) => record.assignedNurse?.fullName || "Không gán y tá"
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEditRoom(record)} title="Cập nhật" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDeleteRoom(record)} title="Xóa" />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card title={<><DoorOpen size={20} className="inline text-primary-600 mr-2" /> Tạo phòng khám</>} className="shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={onCreateRoom}>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Tên phòng</span>
            <Input value={roomForm.name} onChange={(event) => onRoomFormChange({ name: event.target.value })} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Bác sĩ phụ trách</span>
            <Select value={roomForm.assignedDentist} onChange={(value) => onRoomFormChange({ assignedDentist: value })}>
              <Select.Option value="">Chưa gán</Select.Option>
              {dentistUsers.map((dentist) => (
                <Select.Option key={dentist._id} value={dentist._id}>{dentist.fullName}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Y tá phụ trách</span>
            <Select value={roomForm.assignedNurse} onChange={(value) => onRoomFormChange({ assignedNurse: value })}>
              <Select.Option value="">Không gán</Select.Option>
              {nurseUsers.map((nurse) => (
                <Select.Option key={nurse._id} value={nurse._id}>{nurse.fullName}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-3 pt-2">
            <Button type="primary" htmlType="submit" className="w-full md:w-auto">Thêm phòng</Button>
          </div>
        </form>
      </Card>

      <Card title={<><DoorOpen size={20} className="inline text-primary-600 mr-2" /> Phòng khám</>} className="shadow-sm">
        <Table
          dataSource={rooms}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title="Cập nhật phòng khám"
        open={!!editingRoom}
        onCancel={onCancelEditRoom}
        footer={null}
        destroyOnClose
      >
        {editingRoom && (
          <form className="flex flex-col gap-4 mt-4" onSubmit={onUpdateRoom}>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Tên phòng</span>
              <Input value={editingRoom.name} onChange={(event) => onEditingRoomChange({ name: event.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Bác sĩ phụ trách</span>
              <Select value={editingRoom.assignedDentist} onChange={(value) => onEditingRoomChange({ assignedDentist: value })}>
                <Select.Option value="">Chưa gán</Select.Option>
                {dentistUsers.map((dentist) => (
                  <Select.Option key={dentist._id} value={dentist._id}>{dentist.fullName}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Y tá phụ trách</span>
              <Select value={editingRoom.assignedNurse} onChange={(value) => onEditingRoomChange({ assignedNurse: value })}>
                <Select.Option value="">Không gán</Select.Option>
                {nurseUsers.map((nurse) => (
                  <Select.Option key={nurse._id} value={nurse._id}>{nurse.fullName}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button onClick={onCancelEditRoom}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
