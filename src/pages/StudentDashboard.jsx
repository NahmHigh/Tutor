import React, { useState, useMemo } from "react";
import { Modal, Form } from "react-bootstrap";
import { instance } from "../lib/axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAppContext } from "../provider/AppProvider";
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaBookOpen,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";

const StudentDashboard = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingSchedule, setReviewingSchedule] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const hasReviewed = (schedule) => {
    return reviews.some((review) => {
      if (
        review?.studentId == null ||
        user?.id == null ||
        review?.tutorId == null ||
        schedule?.tutorId == null ||
        schedule?.id == null
      ) {
        return false;
      }
      return (
        String(review.studentId) === String(user.id) &&
        String(review.tutorId) === String(schedule.tutorId) &&
        String(review.scheduleId ?? "") === String(schedule.id)
      );
    });
  };
  const handleSubmitReview = async () => {
    try {
      if (editingReviewId) {
        await instance.patch(`/reviews/${editingReviewId}`, {
          rating: reviewRating,
          comment: reviewComment,
        });
      } else {
        await instance.post("/reviews", {
          studentId: user.id,
          tutorId: reviewingSchedule.tutorId,
          scheduleId: reviewingSchedule.id,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
        });
      }
      setShowReviewModal(false);
      setReviewComment("");
      setReviewRating(5);
      setEditingReviewId(null);
      window.location.reload();
    } catch (err) {
      alert("Gửi đánh giá thất bại!");
    }
  };
  const { user } = useAuth();
  const { schedules, reviews, tutors, attendance, loading, users } =
    useAppContext();
  const [activeTab, setActiveTab] = useState("overview");

  // Filter data for current student
  const studentSchedules = useMemo(() => {
    return schedules.filter((schedule) =>
      schedule?.studentId != null && user?.id != null
        ? String(schedule.studentId) === String(user.id)
        : false
    );
  }, [schedules, user]);

  const studentReviews = useMemo(() => {
    return reviews.filter((review) =>
      review?.studentId != null && user?.id != null
        ? String(review.studentId) === String(user.id)
        : false
    );
  }, [reviews, user]);

  const studentAttendance = useMemo(() => {
    return attendance.filter((attend) =>
      attend?.studentId != null && user?.id != null
        ? String(attend.studentId) === String(user.id)
        : false
    );
  }, [attendance, user]);

  //viết đánh giá giáo viên
  const tutorReview = (tutorId) => {
    return reviews.filter((review) =>
      review?.tutorId != null && tutorId != null
        ? String(review.tutorId) === String(tutorId)
        : false
    );
  };
  const getMyReviewForSchedule = (schedule) => {
    if (!schedule) return null;
    return (
      reviews.find(
        (review) =>
          review?.studentId != null &&
          review?.tutorId != null &&
          review?.scheduleId != null &&
          user?.id != null &&
          String(review.studentId) === String(user.id) &&
          String(review.tutorId) === String(schedule.tutorId) &&
          String(review.scheduleId) === String(schedule.id)
      ) || null
    );
  };
  // Statistics
  const stats = useMemo(() => {
    const totalSchedules = studentSchedules.length;
    const completedSchedules = studentSchedules.filter(
      (s) => s.status === "completed"
    ).length;
    const upcomingSchedules = studentSchedules.filter(
      (s) => s.status === "confirmed" && new Date(s.date) >= new Date()
    ).length;
    const totalReviews = studentReviews.length;

    return {
      totalSchedules,
      completedSchedules,
      upcomingSchedules,
      totalReviews,
    };
  }, [studentSchedules, studentReviews]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "pending":
        return <Badge bg="warning">Chờ xác nhận</Badge>;
      case "completed":
        return <Badge bg="primary">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  const getTutorName = (tutorId) => {
    const tutor = tutors.find((t) => t.id.toString() === tutorId.toString());
    if (!tutor) return "Không xác định";
    const userOfTutor = users?.find(
      (u) => u.id.toString() === tutor.userId?.toString()
    );
    return userOfTutor?.fullName || "Không xác định";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (time) => {
    return time;
  };

  // Helpers to replace ternaries with if-else style
  const renderUpcomingContent = () => {
    if (stats.upcomingSchedules === 0) {
      return (
        <Alert variant="info" className="text-center">
          <FaExclamationTriangle className="me-2" />
          Bạn chưa có lịch học nào sắp tới.
          <br />
          <Button
            as={Link}
            to="/tutors"
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Tìm giáo viên ngay
          </Button>
        </Alert>
      );
    }
    return (
      <Table responsive>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Thời gian</th>
            <th>Giáo viên</th>
            <th>Môn học</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {studentSchedules
            .filter(
              (schedule) =>
                schedule.status === "confirmed" &&
                new Date(schedule.date) >= new Date()
            )
            .slice(0, 5)
            .map((schedule) => (
              <tr key={schedule.id}>
                <td>{formatDate(schedule.date)}</td>
                <td>
                  {formatTime(schedule.startTime)} -{" "}
                  {formatTime(schedule.endTime)}
                </td>
                <td>{getTutorName(schedule.tutorId)}</td>
                <td>{schedule.subject}</td>
                <td>{getStatusBadge(schedule.status)}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    );
  };

  const renderScheduleActionCell = (schedule) => {
    if (schedule.status === "completed" && !hasReviewed(schedule)) {
      return (
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setReviewRating(5);
            setReviewComment("");
            setEditingReviewId(null);
            setReviewingSchedule(schedule);
            setShowReviewModal(true);
          }}
        >
          Đánh giá
        </Button>
      );
    }
    if (schedule.status === "completed") {
      return <Badge bg="success">Đã đánh giá</Badge>;
    }
    return <span className="text-muted">—</span>;
  };

  const renderSchedulesSection = () => {
    if (studentSchedules.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          <FaExclamationTriangle className="me-2" />
          Bạn chưa có lịch học nào.
          <br />
          <Button
            as={Link}
            to="/tutors"
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Đặt lịch học đầu tiên
          </Button>
        </Alert>
      );
    }

    return (
      <Table responsive striped>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Thời gian</th>
            <th>Giáo viên</th>
            <th>Môn học</th>
            <th>Địa điểm</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {studentSchedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{formatDate(schedule.date)}</td>
              <td>
                {formatTime(schedule.startTime)} -{" "}
                {formatTime(schedule.endTime)}
              </td>
              <td>{getTutorName(schedule.tutorId)}</td>
              <td>{schedule.subject}</td>
              <td>{schedule.location}</td>
              <td>{getStatusBadge(schedule.status)}</td>
              <td>{schedule.notes || "-"}</td>
              <td>{renderScheduleActionCell(schedule)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const formatReviewCreatedAt = (createdAt) => {
    if (!createdAt) return "—";
    return new Date(createdAt).toLocaleDateString("vi-VN");
  };

  const renderReviewsContent = () => {
    if (studentReviews.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          <FaExclamationTriangle className="me-2" />
          Bạn chưa có đánh giá nào.
        </Alert>
      );
    }
    return (
      <div>
        {studentReviews.map((review) => (
          <Card key={review.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6>Giáo viên: {getTutorName(review.tutorId)}</h6>
                <div className="d-flex align-items-center">
                  <div className="text-warning me-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < review.rating ? "text-warning" : "text-muted"
                        }
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => {
                      setReviewRating(review?.rating ?? 5);
                      setReviewComment(review?.comment ?? "");
                      setEditingReviewId(review?.id ?? null);
                      const scheduleFromReview = studentSchedules.find(
                        (s) => String(s.id) === String(review.scheduleId)
                      );
                      setReviewingSchedule(
                        scheduleFromReview || {
                          id: review.scheduleId,
                          tutorId: review.tutorId,
                          date: "",
                          startTime: "",
                          endTime: "",
                        }
                      );
                      setShowReviewModal(true);
                    }}
                  >
                    Sửa
                  </Button>
                </div>
              </div>
              <p className="mb-1">{review.comment}</p>
              <small className="text-muted">
                {formatReviewCreatedAt(review.createdAt)}
              </small>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
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
          <h2 className="fw-bold">Dashboard Học sinh</h2>
          <p className="text-muted">Xin chào, {user?.fullName}!</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/tutors" variant="primary">
            <FaPlus className="me-2" />
            Tìm giáo viên
          </Button>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Tổng quan">
          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="text-center border-primary">
                <Card.Body>
                  <FaCalendarAlt size={30} className="text-primary mb-2" />
                  <h4 className="fw-bold">{stats.totalSchedules}</h4>
                  <p className="text-muted mb-0">Tổng buổi học</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center border-success">
                <Card.Body>
                  <FaCheckCircle size={30} className="text-success mb-2" />
                  <h4 className="fw-bold">{stats.completedSchedules}</h4>
                  <p className="text-muted mb-0">Đã hoàn thành</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center border-warning">
                <Card.Body>
                  <FaClock size={30} className="text-warning mb-2" />
                  <h4 className="fw-bold">{stats.upcomingSchedules}</h4>
                  <p className="text-muted mb-0">Sắp diễn ra</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center border-info">
                <Card.Body>
                  <FaStar size={30} className="text-info mb-2" />
                  <h4 className="fw-bold">{stats.totalReviews}</h4>
                  <p className="text-muted mb-0">Đánh giá</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Upcoming Classes */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaClock className="me-2" />
                Lịch học sắp tới
              </h5>
            </Card.Header>
            <Card.Body>{renderUpcomingContent()}</Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="schedules" title="Lịch học">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Tất cả lịch học
              </h5>
            </Card.Header>
            <Card.Body>{renderSchedulesSection()}</Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="reviews" title="Đánh giá">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaStar className="me-2" />
                Đánh giá của tôi
              </h5>
            </Card.Header>
            <Card.Body>{renderReviewsContent()}</Card.Body>
          </Card>
        </Tab>
      </Tabs>
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đánh giá buổi học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Giáo viên:</strong>{" "}
            {reviewingSchedule ? getTutorName(reviewingSchedule.tutorId) : ""}
            <br />
            <strong>Ngày:</strong>{" "}
            {reviewingSchedule ? formatDate(reviewingSchedule.date) : ""}
            <br />
            <strong>Thời gian:</strong>{" "}
            {reviewingSchedule
              ? `${formatTime(reviewingSchedule.startTime)} - ${formatTime(
                  reviewingSchedule.endTime
                )}`
              : ""}
          </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Đánh giá</Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    className="me-2 mb-2"
                    variant={reviewRating === r ? "warning" : "outline-warning"}
                    onClick={(e) => {
                      e.preventDefault();
                      setReviewRating(r);
                    }}
                  >
                    {r} <FaStar className="ms-1" />
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>Nhận xét</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm buổi học..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitReview}
            disabled={!reviewingSchedule || reviewRating < 1}
          >
            Gửi đánh giá
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentDashboard;
