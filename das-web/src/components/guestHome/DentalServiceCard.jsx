import { Stethoscope, Activity, Sparkles, Smile } from "lucide-react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const iconMap = {
  implant: <Activity size={24} className="text-primary-600" />,
  cosmetic: <Sparkles size={24} className="text-rose-500" />,
  ortho: <Smile size={24} className="text-teal-600" />,
  general: <Stethoscope size={24} className="text-amber-500" />
};

const bgMap = {
  implant: "bg-primary-50",
  cosmetic: "bg-rose-50",
  ortho: "bg-teal-50",
  general: "bg-amber-50"
};

export default function DentalServiceCard({ service }) {
  const icon = iconMap[service.accent] || <Stethoscope size={24} className="text-slate-500" />;
  const bgClass = bgMap[service.accent] || "bg-slate-50";

  return (
    <Card 
      className="h-full border-t-4 border-t-transparent hover:border-t-primary-500 transition-all duration-300 group hover:shadow-md" 
      bordered={false} 
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' } }}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <Title level={4} className="text-slate-800 mb-3">{service.name}</Title>
      {service.priceText && <Text strong className="text-primary-600 mb-4 block text-lg">{service.priceText}</Text>}
      <Text className="text-slate-600 leading-relaxed flex-grow">{service.description}</Text>
    </Card>
  );
}
