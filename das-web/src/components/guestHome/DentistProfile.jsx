import { UsersRound } from "lucide-react";
import { useState, useEffect } from "react";
import { Carousel, Typography, Row, Col, Flex, Tag } from "antd";
import EmptyState from "../EmptyState.jsx";
import DentistCard from "./DentistCard.jsx";

const { Title } = Typography;

export default function DentistProfile({ dentistSlides }) {
  const dentists = dentistSlides.flat();
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(dentists.length / itemsPerPage);

  return (
    <section style={{ padding: "80px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex vertical align="center" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Tag color="blue" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <UsersRound size={16} />
            Đội ngũ bác sĩ
          </Tag>
          <Title level={2} style={{ color: "#0f172a", margin: 0 }}>Bác sĩ đồng hành theo từng kế hoạch điều trị</Title>
        </Flex>

        {dentists.length ? (
          <div style={{ padding: "0 20px" , display :"flex" , justifyContent : "center" }}>
            <Carousel autoplay>
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div key={pageIndex}>
                  <Row gutter={[24, 24]} style={{ padding: "16px 0" }}>
                    {dentists.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map((dentist) => (
                      <Col xs={24} sm={12} lg={6} key={dentist._id}>
                        <DentistCard dentist={dentist} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <div style={{ background: "#fff", padding: 32, borderRadius: 16, textAlign: "center", maxWidth: 600, margin: "0 auto", border: "1px solid #f1f5f9" }}>
            <EmptyState title="Đang cập nhật đội ngũ bác sĩ" text="Danh sách bác sĩ sẽ hiển thị sau khi có dữ liệu trong hệ thống." />
          </div>
        )}
      </div>
    </section>
  );
}
