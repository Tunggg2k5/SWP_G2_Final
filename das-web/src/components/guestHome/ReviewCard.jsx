import { Star } from "lucide-react";
import { Card, Typography, Avatar } from "antd";

const { Text } = Typography;

export default function ReviewCard({ review }) {
  return (
    <Card 
      key={review._id} 
      className="h-full bg-white border border-slate-100 hover:shadow-md transition-shadow" 
      bordered={false} 
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' } }}
    >
      <div className="text-amber-400 flex gap-1 mb-4" aria-label={`${review.rating} sao`}>
        {Array.from({ length: review.rating }).map((_, index) => (
          <Star size={16} fill="currentColor" className="drop-shadow-sm" key={index} />
        ))}
      </div>

      <Text italic className="text-slate-600 leading-relaxed mb-6 flex-grow block">
        "{review.text}"
      </Text>

      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100">
        <Avatar size={40} className="bg-primary-100 text-primary-700 font-bold flex-shrink-0">
          {review.name[0]?.toUpperCase() || "K"}
        </Avatar>
        <div className="overflow-hidden">
          <Text strong className="block text-slate-800 truncate">{review.name}</Text>
          <Text type="secondary" className="block text-sm truncate">{review.service}</Text>
        </div>
      </div>
    </Card>
  );
}
