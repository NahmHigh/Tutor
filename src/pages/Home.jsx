import React from "react";
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAppContext } from "../provider/AppProvider";
import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaClock,
  FaStar,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { tutors, subjects, loading } = useAppContext();

  // Get top rated tutors
  const topTutors = tutors.filter((tutor) => tutor.rating > 4.5).slice(0, 3);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section
        className="bg-primary text-white py-5"
        style={{
          background: "",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-4">
                Tìm Giáo Viên Gia Sư Tốt Nhất
              </h1>
              <p className="lead mb-4">
                Kết nối với hàng nghìn giáo viên chất lượng cao, học tập hiệu
                quả với chi phí hợp lý.
              </p>
              <div className="d-flex gap-3">
                {!isAuthenticated ? (
                  <>
                    <Button as={Link} to="/register" variant="light" size="lg">
                      Bắt đầu ngay
                    </Button>
                    <Button
                      as={Link}
                      to="/tutors"
                      variant="outline-light"
                      size="lg"
                    >
                      Tìm giáo viên
                    </Button>
                  </>
                ) : (
                  <Button as={Link} to="/tutors" variant="light" size="lg">
                    Tìm giáo viên <FaArrowRight className="ms-2" />
                  </Button>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center">
                <FaChalkboardTeacher
                  size={200}
                  className="text-white opacity-75"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold mb-3">Tại sao chọn chúng tôi?</h2>
              <p className="text-muted">
                Nền tảng học tập trực tuyến hàng đầu với nhiều ưu điểm vượt trội
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <FaChalkboardTeacher
                    size={50}
                    className="text-primary mb-3"
                  />
                  <Card.Title>Giáo Viên Chất Lượng</Card.Title>
                  <Card.Text>
                    Đội ngũ giáo viên được tuyển chọn kỹ lưỡng với trình độ
                    chuyên môn cao và kinh nghiệm giảng dạy phong phú.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <FaClock size={50} className="text-success mb-3" />
                  <Card.Title>Linh Hoạt Thời Gian</Card.Title>
                  <Card.Text>
                    Học tập theo lịch trình phù hợp với bạn. Có thể học online
                    hoặc offline tùy theo nhu cầu.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <FaStar size={50} className="text-warning mb-3" />
                  <Card.Title>Đánh Giá Minh Bạch</Card.Title>
                  <Card.Text>
                    Hệ thống đánh giá và phản hồi từ học viên giúp bạn chọn được
                    giáo viên phù hợp nhất.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Subjects Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold mb-3">Môn Học Phổ Biến</h2>
              <p className="text-muted">
                Chúng tôi có giáo viên cho tất cả các môn học
              </p>
            </Col>
          </Row>
          <Row>
            {subjects.slice(0, 5).map((subject) => (
              <Col key={subject.id} md={2} className="mb-3">
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <FaBookOpen size={30} className="text-primary mb-2" />
                    <Card.Title className="h6">{subject.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-5 bg-primary text-white">
          <Container className="text-center">
            <Row>
              <Col>
                <h2 className="fw-bold mb-3">Sẵn sàng bắt đầu học?</h2>
                <p className="lead mb-4">
                  Tham gia cộng đồng học tập của chúng tôi ngay hôm nay
                </p>
                <Button as={Link} to="/register" variant="light" size="lg">
                  Đăng ký miễn phí
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default Home;
