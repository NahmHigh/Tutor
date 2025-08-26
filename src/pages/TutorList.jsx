import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAppContext } from "../provider/AppProvider";
import {
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaBook,
  FaUser,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
} from "react-icons/fa";
import { RiProfileLine } from "react-icons/ri";

const TutorList = () => {
  const { user, isAuthenticated } = useAuth();
  const { users, tutors, subjects, locations, loading } = useAppContext();
  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    location: "",
    minRating: 0,
    maxPrice: "",
  });
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const handleSort = (e) => {
    setSortBy(e.target.value);
  };
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      // Search filter
      if (
        filters.search &&
        !tutor.bio.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Subject filter
      if (filters.subject && !tutor.subjects?.includes(filters.subject)) {
        return false;
      }

      // Location filter
      if (filters.location && tutor.location !== filters.location) {
        return false;
      }

      // Rating filter
      if (filters.minRating && tutor.rating < filters.minRating) {
        return false;
      }

      // Price filter
      if (filters.maxPrice && tutor.hourlyRate > parseInt(filters.maxPrice)) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    const order = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "rating") {
      sorted.sort((a, b) => (a.rating - b.rating) * order);
    } else if (sortBy === "hourlyRate") {
      sorted.sort(
        (a, b) => ((a.hourlyRate ?? 0) - (b.hourlyRate ?? 0)) * order
      );
    } else if (sortBy === "totalReviews") {
      sorted.sort(
        (a, b) => ((a.totalReviews ?? 0) - (b.totalReviews ?? 0)) * order
      );
    }

    return sorted;
  }, [tutors, filters, sortBy, sortOrder]);

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      location: "",
      minRating: 0,
      maxPrice: "",
    });
  };

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
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Danh sách Giáo viên</h2>
          <p className="text-muted">
            Tìm giáo viên phù hợp với nhu cầu học tập của bạn
          </p>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Bộ lọc tìm kiếm</h5>
          <Row>
            <Col md={4} className="mb-3">
              <Form.Label>Tìm kiếm</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Tìm theo tên hoặc mô tả..."
                />
              </InputGroup>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Label>Môn học</Form.Label>
              <Form.Select
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Label>Đánh giá tối thiểu</Form.Label>
              <Form.Select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value="0">Tất cả</option>
                <option value="3">3★ trở lên</option>
                <option value="4">4★ trở lên</option>
                <option value="4.5">4.5★ trở lên</option>
              </Form.Select>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Label>Giá tối đa (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Không giới hạn"
              />
            </Col>
          </Row>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </Button>
            <Badge bg="primary" className="align-self-center">
              {filteredTutors.length} kết quả
            </Badge>
          </div>
          <div className="d-flex justify-content-end mb-3">
            <div className="d-flex align-items-center gap-2">
              <Form.Select
                size="md"
                onChange={handleSort}
                value={sortBy}
                style={{ width: "220px" }}
              >
                <option value="">-- Sort by --</option>
                <option value="rating">Rating</option>
                <option value="hourlyRate">Price</option>
                <option value="totalReviews">Total Reviews</option>
              </Form.Select>
              <Button
                variant="outline-secondary"
                size="md"
                onClick={toggleSortOrder}
              >
                {sortOrder === "asc" ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <FaSortAmountUpAlt />
                    <span className="small">Asc</span>
                  </span>
                ) : (
                  <span className="d-inline-flex align-items-center gap-2">
                    <FaSortAmountDownAlt />
                    <span className="small">Desc</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tutors Grid */}
      <Row>
        {filteredTutors.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <FaUser size={60} className="text-muted mb-3" />
                <h5>Không tìm thấy giáo viên</h5>
                <p className="text-muted">
                  Thử thay đổi bộ lọc để tìm thấy giáo viên phù hợp
                </p>
                <Button variant="primary" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredTutors.map((tutor) => (
            <Col key={tutor.id} lg={6} xl={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column">
                  <div className="text-center mb-3">
                    <div
                      className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <FaUser size={40} className="text-white" />
                    </div>
                  </div>

                  <Card.Title className="text-center h5 mb-3">
                    {
                      users.find((u) => String(u.id) === String(tutor.userId))
                        ?.fullName
                    }
                  </Card.Title>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <RiProfileLine className="text-primary me-2" />
                      <span className="small">
                        <strong>Mô tả: </strong>
                        {tutor.bio}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaBook className="text-primary me-2" />
                      <span className="small">
                        <strong>Môn học:</strong>{" "}
                        {Array.isArray(tutor.subjects)
                          ? tutor.subjects.join(", ")
                          : tutor.subjects || ""}
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-danger me-2" />
                      <span className="small">
                        <strong>Địa điểm:</strong> {tutor.location}
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FaClock className="text-info me-2" />
                      <span className="small">
                        <strong>Kinh nghiệm:</strong> {tutor.experience}
                      </span>
                    </div>

                    {tutor.education && (
                      <div className="d-flex align-items-start mb-2">
                        <FaUser className="text-success me-2 mt-1" />
                        <span className="small">
                          <strong>Học vấn:</strong> {tutor.education}
                        </span>
                      </div>
                    )}

                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <FaStar className="text-warning me-1" />
                        <span className="fw-bold">{tutor.rating}</span>
                        <span className="text-muted small">
                          /5 ({tutor.totalReviews} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-top">
                    <div className="text-success fw-bold fs-5 mb-3">
                      {tutor.hourlyRate?.toLocaleString("vi-VN")} VNĐ/giờ
                    </div>

                    {isAuthenticated && user?.role === "student" ? (
                      <Button
                        as={Link}
                        to={`/booking/${tutor.id}`}
                        variant="primary"
                        className="w-100"
                      >
                        Đặt lịch học
                      </Button>
                    ) : isAuthenticated ? (
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        disabled
                      >
                        Chỉ học sinh mới có thể đặt lịch
                      </Button>
                    ) : (
                      <Button
                        as={Link}
                        to="/register"
                        variant="outline-primary"
                        className="w-100"
                      >
                        Đăng ký để đặt lịch
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Load more or pagination could be added here */}
      {filteredTutors.length > 0 && (
        <Row className="mt-4">
          <Col className="text-center">
            <p className="text-muted">
              Hiển thị {filteredTutors.length} trên tổng số {tutors.length} giáo
              viên
            </p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default TutorList;
