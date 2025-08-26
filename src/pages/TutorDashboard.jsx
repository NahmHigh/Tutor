import React, { useState, useMemo } from "react";
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
  Form,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { useAppContext } from "../provider/AppProvider";
import { instance } from "../lib/axios";
import {
  FaCalendarAlt,
  FaUsers,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEye,
  FaPlus,
} from "react-icons/fa";

const TutorDashboard = () => {
  const { user } = useAuth();
  const { schedules, setSchedules, reviews, tutors, users, loading } =
    useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  // Find current tutor data
  const currentTutor = useMemo(() => {
    return (
      tutors.find(
        (tutor) => tutor.userId?.toString() === user?.id?.toString()
      ) || tutors.find((tutor) => tutor.id?.toString() === user?.id?.toString())
    );
  }, [tutors, user]);

  // Filter data for current tutor
  const tutorSchedules = useMemo(() => {
    if (!currentTutor) return [];
    return schedules.filter(
      (schedule) => schedule.tutorId?.toString() === currentTutor.id?.toString()
    );
  }, [schedules, currentTutor]);

  const tutorReviews = useMemo(() => {
    if (!currentTutor) return [];
    return reviews.filter(
      (review) => review.tutorId?.toString() === currentTutor.id?.toString()
    );
  }, [reviews, currentTutor]);

  // Statistics
  const stats = useMemo(() => {
    const totalSchedules = tutorSchedules.length;
    const completedSchedules = tutorSchedules.filter(
      (s) => s.status === "completed"
    ).length;
    const pendingSchedules = tutorSchedules.filter(
      (s) => s.status === "pending"
    ).length;
    const totalStudents = new Set(tutorSchedules.map((s) => s.studentId)).size;
    const totalEarnings = tutorSchedules
      .filter((s) => s.status === "completed")
      .reduce(
        (sum, schedule) =>
          sum + (currentTutor?.hourlyRate || 0) * (schedule.duration / 60),
        0
      );

    return {
      totalSchedules,
      completedSchedules,
      pendingSchedules,
      totalStudents,
      totalEarnings,
      totalReviews: tutorReviews.length,
    };
  }, [tutorSchedules, tutorReviews, currentTutor]);

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "success" }),
      3000
    );
  };

  const handleScheduleAction = async (scheduleId, action) => {
    try {
      const schedule = schedules.find((s) => s.id === scheduleId);
      const updatedSchedule = { ...schedule, status: action };

      await instance.put(`/schedules/${scheduleId}`, updatedSchedule);

      setSchedules(
        schedules.map((s) => (s.id === scheduleId ? updatedSchedule : s))
      );

      showAlert(
        action === "confirmed" ? "Đã xác nhận lịch học" : "Đã từ chối lịch học",
        "success"
      );
    } catch (error) {
      console.error("Error updating schedule:", error);
      showAlert("Có lỗi xảy ra khi cập nhật lịch học", "danger");
    }
  };

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

  const getStudentName = (studentId) => {
    const student = users.find(
      (u) => u.id?.toString() === studentId?.toString()
    );
    return student ? student.fullName : "Không xác định";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (time) => {
    return time;
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

  if (!currentTutor) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="text-center">
          <h5>Chưa có thông tin giáo viên</h5>
          <p>Bạn chưa được thiết lập làm giáo viên trong hệ thống.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard Giáo viên</h2>
          <p className="text-muted">Xin chào, {user?.fullName}!</p>
        </Col>
      </Row>

      {alert.show && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

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
                  <FaUsers size={30} className="text-success mb-2" />
                  <h4 className="fw-bold">{stats.totalStudents}</h4>
                  <p className="text-muted mb-0">Học sinh</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} className="mb-3">
              <Card className="text-center border-info">
                <Card.Body>
                  <FaPlus size={30} className="text-info mb-2" />
                  <h4 className="fw-bold">
                    {stats.totalEarnings.toLocaleString("vi-VN")}
                  </h4>
                  <p className="text-muted mb-0">Thu nhập (VNĐ)</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Pending Requests */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaClock className="me-2" />
                Yêu cầu chờ xác nhận ({stats.pendingSchedules})
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.pendingSchedules === 0 ? (
                <Alert variant="info" className="text-center">
                  <FaCheckCircle className="me-2" />
                  Không có yêu cầu nào cần xác nhận.
                </Alert>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Thời gian</th>
                      <th>Học sinh</th>
                      <th>Môn học</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorSchedules
                      .filter((schedule) => schedule.status === "pending")
                      .map((schedule) => (
                        <tr key={schedule.id}>
                          <td>{formatDate(schedule.date)}</td>
                          <td>
                            {formatTime(schedule.startTime)} -{" "}
                            {formatTime(schedule.endTime)}
                          </td>
                          <td>{getStudentName(schedule.studentId)}</td>
                          <td>{schedule.subject}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() =>
                                handleScheduleAction(schedule.id, "confirmed")
                              }
                            >
                              <FaCheckCircle className="me-1" />
                              Xác nhận
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleScheduleAction(schedule.id, "cancelled")
                              }
                            >
                              <FaTimesCircle className="me-1" />
                              Từ chối
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="schedules" title="Lịch dạy">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Tất cả lịch dạy
              </h5>
            </Card.Header>
            <Card.Body>
              {tutorSchedules.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <FaCalendarAlt className="me-2" />
                  Chưa có lịch dạy nào.
                </Alert>
              ) : (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Thời gian</th>
                      <th>Học sinh</th>
                      <th>Môn học</th>
                      <th>Địa điểm</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{formatDate(schedule.date)}</td>
                        <td>
                          {formatTime(schedule.startTime)} -{" "}
                          {formatTime(schedule.endTime)}
                        </td>
                        <td>{getStudentName(schedule.studentId)}</td>
                        <td>{schedule.subject}</td>
                        <td>{schedule.location}</td>
                        <td>{getStatusBadge(schedule.status)}</td>
                        <td>{schedule.notes || "-"}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setShowModal(true);
                            }}
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="reviews" title="Đánh giá">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaStar className="me-2" />
                Đánh giá từ học sinh
              </h5>
              <div>
                <small className="text-muted">
                  {" "}
                  ({stats.totalReviews} đánh giá)
                </small>
              </div>
            </Card.Header>
            <Card.Body>
              {tutorReviews.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <FaStar className="me-2" />
                  Chưa có đánh giá nào.
                </Alert>
              ) : (
                <div>
                  {tutorReviews.map((review) => (
                    <Card key={review.id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6>Học sinh: {getStudentName(review.studentId)}</h6>
                          <div className="text-warning">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={
                                  i < review.rating
                                    ? "text-warning"
                                    : "text-muted"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mb-1">{review.comment}</p>
                        <small className="text-muted">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </small>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

                <Tab eventKey="profile" title="Hồ sơ">
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <FaEdit className="me-2" />
                                Thông tin giáo viên
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mô tả</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={currentTutor.bio || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Môn học</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={Array.isArray(currentTutor.subjects)
                                                ? currentTutor.subjects.join(', ')
                                                : currentTutor.subjects || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giá/giờ (VNĐ)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={currentTutor.hourlyRate?.toLocaleString('vi-VN') || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Kinh nghiệm</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={currentTutor.experience || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Học vấn</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={currentTutor.education || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Địa điểm</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={currentTutor.location || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Alert variant="info">
                                <small>Để cập nhật thông tin hồ sơ, vui lòng liên hệ quản trị viên.</small>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

      {/* Schedule Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết lịch học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule && (
            <Row>
              <Col md={6}>
                <p>
                  <strong>Ngày:</strong> {formatDate(selectedSchedule.date)}
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {formatTime(selectedSchedule.startTime)} -{" "}
                  {formatTime(selectedSchedule.endTime)}
                </p>
                <p>
                  <strong>Thời lượng:</strong> {selectedSchedule.duration} phút
                </p>
                <p>
                  <strong>Học sinh:</strong>{" "}
                  {getStudentName(selectedSchedule.studentId)}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Môn học:</strong> {selectedSchedule.subject}
                </p>
                <p>
                  <strong>Địa điểm:</strong> {selectedSchedule.location}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  {getStatusBadge(selectedSchedule.status)}
                </p>
                <p>
                  <strong>Ghi chú:</strong>{" "}
                  {selectedSchedule.notes || "Không có"}
                </p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {selectedSchedule &&
            selectedSchedule.status !== "completed" &&
            selectedSchedule.status !== "cancelled" && (
              <Button
                variant="primary"
                onClick={async () => {
                  await handleScheduleAction(selectedSchedule.id, "completed");
                  setShowModal(false);
                }}
              >
                Kết thúc buổi học
              </Button>
            )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TutorDashboard;
