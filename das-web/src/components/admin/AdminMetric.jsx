import { Card, Statistic } from "antd";

export default function AdminMetric({ icon: Icon, label, value }) {
  return (
    <Card className="shadow-sm h-full" bodyStyle={{ padding: "20px" }}>
      <Statistic
        title={<span className="text-slate-500 font-medium">{label}</span>}
        value={value}
        prefix={
          <div className="bg-primary-50 p-2 rounded-xl text-primary-600 mr-2">
            <Icon size={20} />
          </div>
        }
        valueStyle={{ color: "#1e293b", fontWeight: "bold", fontSize: "24px" }}
      />
    </Card>
  );
}
