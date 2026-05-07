import { useEffect } from "react";
import "./PageCommon.css";

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <p className="page-eyebrow">Về chúng tôi</p>
          <h1>SVN <span className="green">Automation</span></h1>
          <p className="page-desc">Đồng hành cùng nền công nghiệp Việt Nam trong hành trình số hóa và tự động hóa</p>
        </div>
      </div>

      <section className="page-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-img">
              <img
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80"
                alt="SVN Office"
              />
            </div>
            <div className="about-text">
              <h2>Chúng tôi là <span className="green">SVN Automation</span></h2>
              <p>
                SVN Automation Co., Ltd là công ty chuyên cung cấp các giải pháp tự động hóa công nghiệp toàn diện tại Việt Nam. Với hơn 15 năm kinh nghiệm, chúng tôi đã triển khai hàng trăm dự án tự động hóa cho các doanh nghiệp lớn trong và ngoài nước.
              </p>
              <p>
                Đội ngũ kỹ sư của SVN được đào tạo chuyên sâu về robot công nghiệp, hệ thống SCADA/PLC, vision machine và các công nghệ Industry 4.0 mới nhất.
              </p>
              <p>
                Chúng tôi là đối tác chính thức của JAKA, iPLUS MOBOT, Interface, RoMARIC và nhiều thương hiệu hàng đầu thế giới trong lĩnh vực tự động hóa.
              </p>
            </div>
          </div>

          <h2 className="section-title" style={{ marginBottom: 40 }}>
            Giá trị <span className="green">cốt lõi</span>
          </h2>
          <div className="values-grid">
            {[
              { icon: "🎯", title: "Chuyên nghiệp", desc: "Đội ngũ kỹ sư được đào tạo bài bản, giàu kinh nghiệm thực chiến trong ngành công nghiệp." },
              { icon: "🤝", title: "Tin cậy", desc: "Cam kết chất lượng và tiến độ dự án. Hỗ trợ kỹ thuật 24/7 sau khi bàn giao." },
              { icon: "🚀", title: "Đổi mới", desc: "Luôn cập nhật và ứng dụng công nghệ mới nhất để mang lại giải pháp tối ưu nhất." },
              { icon: "🌏", title: "Toàn cầu", desc: "Kết nối với mạng lưới đối tác toàn cầu, mang công nghệ thế giới đến Việt Nam." },
              { icon: "💡", title: "Sáng tạo", desc: "Thiết kế giải pháp tùy chỉnh phù hợp với nhu cầu và điều kiện đặc thù của từng khách hàng." },
              { icon: "📈", title: "Hiệu quả", desc: "Tối ưu hóa ROI, giảm chi phí vận hành và tăng năng suất sản xuất cho doanh nghiệp." },
            ].map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
