import { Card, Typography, Tag } from "antd";

const { Title, Text } = Typography;

export default function DentistCard({ dentist }) {
  const yearsOfExperience = Number(dentist.yearsOfExperience || dentist.experienceYears || 0);
  const experienceText = yearsOfExperience ? `${yearsOfExperience} năm kinh nghiệm` : "Kinh nghiệm đang cập nhật";
  const description = dentist.description || dentist.bio || "Thông tin bác sĩ đang được cập nhật từ hệ thống.";

  return (
    <Card 
      className="text-center h-full group hover:shadow-md" 
      bordered={false} 
      styles={{ body: { display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: '24px' } }}
    >
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-6 bg-slate-100 group-hover:border-primary-100 transition-colors">
        {dentist.avatarUrl ? (
          <img
            className="w-full h-full object-cover"
            src={dentist.avatarUrl}
            alt={dentist.fullName}
            decoding="async"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-4xl font-bold">
            {dentist.fullName?.trim()?.[0]?.toUpperCase() || "B"}
          </div>
        )}
      </div>
      <Title level={4} className="text-slate-800 mb-2">{dentist.fullName}</Title>
      <Tag color="cyan" className="mb-4 rounded-full px-3 py-1 text-xs font-bold border-none bg-teal-50 text-teal-700">
        {experienceText}
      </Tag>
      <Text className="text-slate-600 text-sm leading-relaxed line-clamp-3">
        {description}
      </Text>
    </Card>
  );
}
