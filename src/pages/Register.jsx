import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserPlus } from 'react-icons/fa'; // Bỏ FaUserTag

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '', // Thêm trường phone
        password: '',
        confirmPassword: '',
        // role: 'student' // Bỏ trường role khỏi state ban đầu, sẽ được mặc định trong AuthContext
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        // Thêm kiểm tra định dạng số điện thoại cơ bản (tùy chọn)
        if (!/^\d{10,11}$/.test(formData.phone)) { // Ví dụ: 10 hoặc 11 chữ số
            setError('Số điện thoại không hợp lệ');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const userData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone, // Gửi số điện thoại
                password: formData.password,
                // role: 'student', // Không cần gửi role ở đây, AuthContext sẽ tự đặt
                username: formData.email.split('@')[0] // Generate username from email
            };

            const result = await register(userData);

            if (result.success) {
                setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Đăng ký</h2>
                                <p className="text-muted">Tạo tài khoản mới để bắt đầu học tập</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" className="mb-3">
                                    {success}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUser className="me-2" />
                                                Họ và tên
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Nhập họ và tên"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaPhone className="me-2" />
                                                Số điện thoại
                                            </Form.Label>
                                            <Form.Control
                                                type="tel" // Loại input là tel
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Nhập số điện thoại"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FaEnvelope className="me-2" />
                                        Email
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Nhập email của bạn"
                                        required
                                    />
                                </Form.Group>

                                {/* Bỏ phần chọn vai trò */}
                                {/*
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FaUserTag className="me-2" />
                                        Vai trò
                                    </Form.Label>
                                    <Form.Select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="student">Học sinh</option>
                                        <option value="tutor">Giáo viên</option>
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Chọn vai trò phù hợp với nhu cầu của bạn
                                    </Form.Text>
                                </Form.Group>
                                */}

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaLock className="me-2" />
                                                Mật khẩu
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Nhập mật khẩu"
                                                required
                                                minLength={6}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaLock className="me-2" />
                                                Xác nhận mật khẩu
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Nhập lại mật khẩu"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        id="terms"
                                        label="Tôi đồng ý với các điều khoản và điều kiện"
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Đang đăng ký...
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus className="me-2" />
                                            Đăng ký
                                        </>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <p className="mb-0">
                                        Đã có tài khoản?{' '}
                                        <Link to="/login" className="text-primary text-decoration-none fw-bold">
                                            Đăng nhập ngay
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
