import { Card, Statistic, Typography } from "antd";

const { Text } = Typography;

export default function AdminMetric({ icon: Icon, label, value }) {
  return (
    <Card style={{ height: "100%", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }} bodyStyle={{ padding: "20px" }}>
      <Statistic
        title={<Text style={{ color: "#64748b", fontWeight: 500 }}>{label}</Text>}
        value={value}
        prefix={
          <div style={{ backgroundColor: "#eff6ff", padding: "8px", borderRadius: "12px", color: "#2563eb", marginRight: "8px", display: "inline-flex" }}>
            <Icon size={20} />
          </div>
        }
        valueStyle={{ color: "#1e293b", fontWeight: "bold", fontSize: "24px" }}
      />
    </Card>
  );
}
