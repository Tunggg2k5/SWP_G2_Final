import { KeyOutlined, EditOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, Select, Space, Table, Tag } from "antd";
import { useMemo, useState } from "react";
import StatusBadge from "../StatusBadge.jsx";
import { roleLabels } from "../../utils/roles.js";

export default function AccountManagement({
  editingUser,
  loading,
  onCancelEditUser,
  onCreateUser,
  onEditUser,
  onEditingUserChange,
  onResetPassword,
  onSubmitEditUser,
  onUpdateUserStatus,
  onUserFormChange,
  userForm,
  users
}) {
  const [filters, setFilters] = useState({ name: "", role: "all" });

  const visibleUsers = useMemo(() => {
    const name = filters.name.trim().toLowerCase();
    return users.filter((user) => {
      const matchesName = !name || user.fullName?.toLowerCase().includes(name);
      const matchesRole = filters.role === "all" || user.role === filters.role;
      return matchesName && matchesRole;
    });
  }, [filters, users]);

  const columns = [
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      fontWeight: "bold",
      render: (text) => <span className="font-medium text-slate-900">{text}</span>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "-"
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "-"
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{roleLabels[role] || role}</Tag>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge value={status} />
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEditUser(record)} title="Cập nhật tài khoản" />
          <Button type="text" danger icon={<KeyOutlined />} onClick={() => onResetPassword(record)} title="Đặt lại MK" />
          <Button
            size="small"
            type={record.status === "active" ? "default" : "primary"}
            danger={record.status === "active"}
            onClick={() => onUpdateUserStatus(record._id, record.status === "active" ? "inactive" : "active")}
          >
            {record.status === "active" ? "Ngưng" : "Kích hoạt"}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card title={<><UserOutlined className="text-primary-600 mr-2" /> Tạo tài khoản</>} className="shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={onCreateUser}>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Họ tên</span>
            <Input value={userForm.fullName} onChange={(event) => onUserFormChange({ fullName: event.target.value })} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <Input type="email" value={userForm.email || ""} onChange={(event) => onUserFormChange({ email: event.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
            <Input value={userForm.phone} onChange={(event) => onUserFormChange({ phone: event.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Địa chỉ</span>
            <Input value={userForm.address || ""} onChange={(event) => onUserFormChange({ address: event.target.value })} maxLength={255} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Vai trò</span>
            <Select value={userForm.role} onChange={(value) => onUserFormChange({ role: value })}>
              <Select.Option value="patient">Bệnh nhân</Select.Option>
              <Select.Option value="receptionist">Lễ tân</Select.Option>
              <Select.Option value="dentist">Bác sĩ</Select.Option>
              <Select.Option value="nurse">Y tá</Select.Option>
              <Select.Option value="admin">Quản trị viên</Select.Option>
            </Select>
          </div>
          <div className="md:col-span-full pt-2">
            <Button type="primary" htmlType="submit" className="w-full md:w-auto">Tạo tài khoản</Button>
          </div>
        </form>
      </Card>

      <Card title={<><UserOutlined className="text-primary-600 mr-2" /> Tài khoản hệ thống</>} className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo tên..."
            value={filters.name}
            onChange={(event) => setFilters((current) => ({ ...current, name: event.target.value }))}
            className="w-full md:w-64"
          />
          <Select
            value={filters.role}
            onChange={(value) => setFilters((current) => ({ ...current, role: value }))}
            className="w-full md:w-auto min-w-[120px]"
            options={[
              { value: "all", label: "Tất cả" },
              { value: "patient", label: "Bệnh nhân" },
              { value: "receptionist", label: "Lễ tân" },
              { value: "dentist", label: "Bác sĩ" },
              { value: "nurse", label: "Y tá" },
              { value: "admin", label: "Quản trị viên" }
            ]}
          />
        </div>

        <Table
          dataSource={visibleUsers}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="Cập nhật tài khoản"
        open={!!editingUser}
        onCancel={onCancelEditUser}
        footer={null}
        destroyOnClose
      >
        {editingUser && (
          <form className="flex flex-col gap-4 mt-4" onSubmit={onSubmitEditUser}>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Họ tên</span>
              <Input value={editingUser.fullName || ""} onChange={(event) => onEditingUserChange({ fullName: event.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <Input type="email" value={editingUser.email || ""} onChange={(event) => onEditingUserChange({ email: event.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
              <Input value={editingUser.phone || ""} onChange={(event) => onEditingUserChange({ phone: event.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Địa chỉ</span>
              <Input value={editingUser.address || ""} onChange={(event) => onEditingUserChange({ address: event.target.value })} maxLength={255} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Vai trò</span>
              <Select value={editingUser.role || "patient"} onChange={(value) => onEditingUserChange({ role: value })}>
                <Select.Option value="patient">Bệnh nhân</Select.Option>
                <Select.Option value="receptionist">Lễ tân</Select.Option>
                <Select.Option value="dentist">Bác sĩ</Select.Option>
                <Select.Option value="nurse">Y tá</Select.Option>
                <Select.Option value="admin">Quản trị viên</Select.Option>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button onClick={onCancelEditUser}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
