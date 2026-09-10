import { KeyOutlined, EditOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, Select, Space, Table, Tag, Typography, Row, Col, Flex } from "antd";
import { useMemo, useState } from "react";
import StatusBadge from "../StatusBadge.jsx";
import { roleLabels } from "../../utils/roles.js";

const { Text } = Typography;

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
      render: (text) => <span style={{ fontWeight: 500, color: "#0f172a" }}>{text}</span>
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
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Card 
        title={
          <Space>
            <UserOutlined style={{ color: "#2563eb" }} /> 
            <span>Tạo tài khoản</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <form onSubmit={onCreateUser}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Họ tên</Text>
                <Input value={userForm.fullName} onChange={(event) => onUserFormChange({ fullName: event.target.value })} required />
              </Space>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Email</Text>
                <Input type="email" value={userForm.email || ""} onChange={(event) => onUserFormChange({ email: event.target.value })} />
              </Space>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Số điện thoại</Text>
                <Input value={userForm.phone} onChange={(event) => onUserFormChange({ phone: event.target.value })} />
              </Space>
            </Col>
            <Col xs={24} md={12} lg={16}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Địa chỉ</Text>
                <Input value={userForm.address || ""} onChange={(event) => onUserFormChange({ address: event.target.value })} maxLength={255} />
              </Space>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Vai trò</Text>
                <Select style={{ width: "100%" }} value={userForm.role} onChange={(value) => onUserFormChange({ role: value })}>
                  <Select.Option value="patient">Bệnh nhân</Select.Option>
                  <Select.Option value="receptionist">Lễ tân</Select.Option>
                  <Select.Option value="dentist">Bác sĩ</Select.Option>
                  <Select.Option value="nurse">Y tá</Select.Option>
                  <Select.Option value="admin">Quản trị viên</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col span={24}>
              <Button type="primary" htmlType="submit">Tạo tài khoản</Button>
            </Col>
          </Row>
        </form>
      </Card>

      <Card 
        title={
          <Space>
            <UserOutlined style={{ color: "#2563eb" }} /> 
            <span>Tài khoản hệ thống</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <Flex gap="middle" align="center" style={{ marginBottom: 24 }} wrap="wrap">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Tìm theo tên..."
            value={filters.name}
            onChange={(event) => setFilters((current) => ({ ...current, name: event.target.value }))}
            style={{ width: "100%", maxWidth: 256 }}
          />
          <Select
            value={filters.role}
            onChange={(value) => setFilters((current) => ({ ...current, role: value }))}
            style={{ width: "100%", maxWidth: 160 }}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "patient", label: "Bệnh nhân" },
              { value: "receptionist", label: "Lễ tân" },
              { value: "dentist", label: "Bác sĩ" },
              { value: "nurse", label: "Y tá" },
              { value: "admin", label: "Quản trị viên" }
            ]}
          />
        </Flex>

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
          <form onSubmit={onSubmitEditUser}>
            <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Họ tên</Text>
                <Input value={editingUser.fullName || ""} onChange={(event) => onEditingUserChange({ fullName: event.target.value })} required />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Email</Text>
                <Input type="email" value={editingUser.email || ""} onChange={(event) => onEditingUserChange({ email: event.target.value })} />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Số điện thoại</Text>
                <Input value={editingUser.phone || ""} onChange={(event) => onEditingUserChange({ phone: event.target.value })} />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Địa chỉ</Text>
                <Input value={editingUser.address || ""} onChange={(event) => onEditingUserChange({ address: event.target.value })} maxLength={255} />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Vai trò</Text>
                <Select style={{ width: "100%" }} value={editingUser.role || "patient"} onChange={(value) => onEditingUserChange({ role: value })}>
                  <Select.Option value="patient">Bệnh nhân</Select.Option>
                  <Select.Option value="receptionist">Lễ tân</Select.Option>
                  <Select.Option value="dentist">Bác sĩ</Select.Option>
                  <Select.Option value="nurse">Y tá</Select.Option>
                  <Select.Option value="admin">Quản trị viên</Select.Option>
                </Select>
              </Space>
              <Flex justify="flex-end" gap="small" style={{ marginTop: 16 }}>
                <Button onClick={onCancelEditUser}>Hủy</Button>
                <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
              </Flex>
            </Space>
          </form>
        )}
      </Modal>
    </Space>
  );
}
