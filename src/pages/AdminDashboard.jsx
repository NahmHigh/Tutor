import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { useAppContext } from "../provider/AppProvider";
import { instance } from "../lib/axios";
import {
  FaChalkboardTeacher,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaEdit,
  FaTimes,
  FaPlus,
} from "react-icons/fa";

const AdminDashboard = () => {
  const {
    stats,
    users,
    setUsers,
    tutors,
    setTutors,
    schedules,
    loading,
    showModal,
    setShowModal,
    modalType,
    setModalType,
    selectedItem,
    setSelectedItem,
    formData,
    setFormData,
    loadData,
  } = useAppContext();

  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "success" }),
      3000
    );
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (modalType === "user") {
        if (selectedItem) {
          await instance.put(`/users/${selectedItem.id}`, formData);
          setUsers(
            users.map((u) =>
              u.id === selectedItem.id ? { ...u, ...formData } : u
            )
          );
          showAlert("Cập nhật người dùng thành công");
        } else {
          const newUser = {
            ...formData,
            id: String(users.length + 1),
            createdAt: new Date().toISOString(),
            isActive: true,
          };
          await instance.post("/users", newUser);
          setUsers([...users, newUser]);
          showAlert("Thêm người dùng thành công");
        }
      } else if (modalType === "tutor") {
        if (selectedItem) {
          await instance.put(`/tutors/${selectedItem.id}`, formData);
          setTutors(
            tutors.map((t) =>
              t.id === selectedItem.id ? { ...t, ...formData } : t
            )
          );
          showAlert("Cập nhật giáo viên thành công");
        } else {
          const newTutor = {
            ...formData,
            id: String(tutors.length + 1),
            userId: formData.userId || users.length + 1,
            rating: 0,
            totalReviews: 0,
            isActive: true,
          };
          await instance.post("/tutors", newTutor);
          setTutors([...tutors, newTutor]);
          showAlert("Thêm giáo viên thành công");
        }
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      showAlert("Có lỗi xảy ra khi lưu dữ liệu", "danger");
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        if (type === "user") {
          await instance.delete(`/users/${id}`);
          setUsers(users.filter((u) => u.id !== id));
          showAlert("Xóa người dùng thành công");
        } else if (type === "tutor") {
          await instance.delete(`/tutors/${id}`);
          setTutors(tutors.filter((t) => t.id !== id));
          showAlert("Xóa giáo viên thành công");
        }
        loadData();
      } catch (error) {
        console.error("Error deleting:", error);
        showAlert("Có lỗi xảy ra khi xóa", "danger");
      }
    }
  };

  const StatCard = ({ title, value, icon, color = "primary" }) => (
    <Card className={`text-center border-${color}`}>
      <Card.Body>
        <div className={`text-${color} mb-2`}>{icon}</div>
        <Card.Title className="h4">{value}</Card.Title>
        <Card.Text className="text-muted">{title}</Card.Text>
      </Card.Body>
    </Card>
  );

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
    <Container className="mt-4 mb-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Bảng điều khiển Quản trị viên</h2>
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

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xs={12} sm={6} md={3} className="mb-3">
          <StatCard
            title="Tổng người dùng"
            value={stats.totalUsers}
            icon={<FaUsers size={40} />}
            color="primary"
          />
        </Col>
        <Col xs={12} sm={6} md={3} className="mb-3">
          <StatCard
            title="Giáo viên"
            value={stats.totalTutors}
            icon={<FaChalkboardTeacher size={40} />}
            color="success"
          />
        </Col>
        <Col xs={12} sm={6} md={3} className="mb-3">
          <StatCard
            title="Học sinh"
            value={stats.totalStudents}
            icon={<FaUser size={40} />}
            color="info"
          />
        </Col>
        <Col xs={12} sm={6} md={3} className="mb-3">
          <StatCard
            title="Lịch học"
            value={stats.totalSchedules}
            icon={<FaCalendarAlt size={40} />}
            color="warning"
          />
        </Col>
      </Row>

      {/* Users Management */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6>Quản lý người dùng</h6>
              <Button
                variant="primary"
                onClick={() => handleOpenModal("user")}
                size="sm"
              >
                <FaPlus className="me-1" /> Thêm người dùng
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.role}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal("user", user)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete("user", user.id)}
                        >
                          <FaTimes />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tutors Management */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6>Quản lý giáo viên</h6>
              <Button
                variant="primary"
                onClick={() => handleOpenModal("tutor")}
                size="sm"
              >
                <FaPlus className="me-1" /> Thêm giáo viên
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Môn học</th>
                    <th>Giá/giờ</th>
                    <th>Đánh giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((tutor) => {
                    const user = users.find(
                      (u) => String(u.id) === String(tutor.userId)
                    );
                    const tutorName = user?.fullName || "";
                    return (
                      <tr key={tutor.id}>
                        <td>{tutor.id}</td>
                        <td>{tutorName}</td>
                        <td>
                          {Array.isArray(tutor.subjects)
                            ? tutor.subjects.join(", ")
                            : tutor.subjects || ""}
                        </td>
                        <td>{tutor.hourlyRate?.toLocaleString("vi-VN")} VNĐ</td>
                        <td>
                          {tutor.rating}/5 ({tutor.totalReviews})
                        </td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal("tutor", tutor)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete("tutor", tutor.id)}
                          >
                            <FaTimes />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedItem ? "Chỉnh sửa" : "Thêm mới"}{" "}
            {modalType === "user" ? "người dùng" : "giáo viên"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {modalType === "user" && (
              <>
                <Form.Group controlId="formFullName" className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fullName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPhone" className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!selectedItem}
                  />
                  {!selectedItem && (
                    <Form.Text className="text-muted">
                      Mật khẩu sẽ được tạo mới hoặc cập nhật.
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group controlId="formRole" className="mb-3">
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.role || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="tutor">Giáo viên</option>
                    <option value="student">Học sinh</option>
                  </Form.Control>
                </Form.Group>
              </>
            )}
            {modalType === "tutor" && (
              <>
                <Form.Group controlId="formUserId" className="mb-3">
                  <Form.Label>ID Người dùng liên kết</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.userId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, userId: e.target.value })
                    }
                    placeholder="Nhập ID của người dùng liên kết (từ bảng Người dùng)"
                    required
                  />
                  <Form.Text className="text-muted">
                    Đảm bảo ID người dùng này tồn tại trong danh sách người
                    dùng.
                  </Form.Text>
                </Form.Group>
                <Form.Group controlId="formBio" className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formSubjects" className="mb-3">
                  <Form.Label>Môn học</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subjects || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subjects: e.target.value,
                      })
                    }
                    placeholder="Nhập các môn học, phân cách bằng dấu phẩy (ví dụ: Toán, Lý, Hóa)"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formHourlyRate" className="mb-3">
                  <Form.Label>Giá mỗi giờ (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.hourlyRate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourlyRate: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formLocation" className="mb-3">
                  <Form.Label>Địa điểm</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formExperience" className="mb-3">
                  <Form.Label>Kinh nghiệm</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.experience || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="formEducation" className="mb-3">
                  <Form.Label>Học vấn</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.education || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, education: e.target.value })
                    }
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
