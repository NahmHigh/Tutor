import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { FaUser, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { instance } from "../lib/axios";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "success" }),
      3000
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      setIsEditing(false);
      showAlert("Cập nhật thông tin thành công");
    } catch (error) {
      showAlert("Có lỗi xảy ra khi cập nhật thông tin", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate current password entered
      if (!formData.currentPassword) {
        showAlert("Vui lòng nhập mật khẩu hiện tại", "danger");
        setLoading(false);
        return;
      }

      // Validate new password matches confirm password
      if (formData.newPassword !== formData.confirmPassword) {
        showAlert("Mật khẩu xác nhận không khớp", "danger");
        setLoading(false);
        return;
      }

      // Validate new password length
      if (formData.newPassword.length < 6) {
        showAlert("Mật khẩu mới phải có ít nhất 6 ký tự", "danger");
        setLoading(false);
        return;
      }

      // Verify current password against stored password
      const { data: storedUser } = await instance.get(`/users/${user.id}`);
      if (!storedUser || storedUser.password !== formData.currentPassword) {
        showAlert("Mật khẩu hiện tại không chính xác", "danger");
        setLoading(false);
        return;
      }

      // Update password via updateProfile
      await updateProfile({
        ...formData,
        password: formData.newPassword,
      });

      // Reset form after successful update
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showAlert("Đổi mật khẩu thành công", "success");
    } catch (error) {
      showAlert(`Có lỗi xảy ra khi đổi mật khẩu: ${error.message}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FaUser className="me-2" />
                Hồ sơ cá nhân
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {alert.show && (
                <Alert
                  variant={alert.variant}
                  dismissible
                  onClose={() => setAlert({ ...alert, show: false })}
                >
                  {alert.message}
                </Alert>
              )}

              <Tabs defaultActiveKey="profile" className="mb-4">
                <Tab eventKey="profile" title="Thông tin cá nhân">
                  <Form onSubmit={handleSaveProfile}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Họ và tên</Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Vai trò</Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              user?.role === "admin"
                                ? "Quản trị viên"
                                : user?.role === "tutor"
                                ? "Giáo viên"
                                : "Học sinh"
                            }
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex gap-2">
                      {!isEditing ? (
                        <Button
                          variant="primary"
                          onClick={() => setIsEditing(true)}
                        >
                          <FaEdit className="me-2" />
                          Chỉnh sửa
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="submit"
                            variant="success"
                            disabled={loading}
                          >
                            <FaSave className="me-2" />
                            {loading ? "Đang lưu..." : "Lưu"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleCancelEdit}
                          >
                            <FaTimes className="me-2" />
                            Hủy
                          </Button>
                        </>
                      )}
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey="password" title="Đổi mật khẩu">
                  <Form onSubmit={handleChangePassword}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mật khẩu hiện tại</Form.Label>
                          <Form.Control
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mật khẩu mới</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            minLength={6}
                            required
                          />
                          <Form.Text className="text-muted">
                            Mật khẩu phải có ít nhất 6 ký tự
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button type="submit" variant="warning" disabled={loading}>
                      <FaSave className="me-2" />
                      {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
