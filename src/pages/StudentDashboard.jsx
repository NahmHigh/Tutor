import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useAppContext } from '../provider/AppProvider';
import {
    FaCalendarAlt, FaChalkboardTeacher, FaBookOpen, FaStar,
    FaClock, FaCheckCircle, FaExclamationTriangle, FaPlus
} from 'react-icons/fa';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { schedules, reviews, tutors, attendance, loading } = useAppContext();
    const [activeTab, setActiveTab] = useState('overview');

    // Filter data for current student
    const studentSchedules = useMemo(() => {
        return schedules.filter(schedule =>
            schedule.studentId.toString() === user?.id.toString()
        );
    }, [schedules, user]);

    const studentReviews = useMemo(() => {
        return reviews.filter(review =>
            review.studentId.toString() === user?.id.toString()
        );
    }, [reviews, user]);

    const studentAttendance = useMemo(() => {
        return attendance.filter(attend =>
            attend.studentId.toString() === user?.id.toString()
        );
    }, [attendance, user]);

    // Statistics
    const stats = useMemo(() => {
        const totalSchedules = studentSchedules.length;
        const completedSchedules = studentSchedules.filter(s => s.status === 'completed').length;
        const upcomingSchedules = studentSchedules.filter(s => s.status === 'confirmed' && new Date(s.date) >= new Date()).length;
        const totalReviews = studentReviews.length;

        return {
            totalSchedules,
            completedSchedules,
            upcomingSchedules,
            totalReviews
        };
    }, [studentSchedules, studentReviews]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <Badge bg="success">Đã xác nhận</Badge>;
            case 'pending':
                return <Badge bg="warning">Chờ xác nhận</Badge>;
            case 'completed':
                return <Badge bg="primary">Hoàn thành</Badge>;
            case 'cancelled':
                return <Badge bg="danger">Đã hủy</Badge>;
            default:
                return <Badge bg="secondary">Không xác định</Badge>;
        }
    };

    const getTutorName = (tutorId) => {
        const tutor = tutors.find(t => t.id.toString() === tutorId.toString());
        return tutor ? tutor.bio : 'Không xác định';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
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

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
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
                        <Card.Body>
                            {stats.upcomingSchedules === 0 ? (
                                <Alert variant="info" className="text-center">
                                    <FaExclamationTriangle className="me-2" />
                                    Bạn chưa có lịch học nào sắp tới.
                                    <br />
                                    <Button as={Link} to="/tutors" variant="primary" size="sm" className="mt-2">
                                        Tìm giáo viên ngay
                                    </Button>
                                </Alert>
                            ) : (
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
                                            .filter(schedule => schedule.status === 'confirmed' && new Date(schedule.date) >= new Date())
                                            .slice(0, 5)
                                            .map((schedule) => (
                                                <tr key={schedule.id}>
                                                    <td>{formatDate(schedule.date)}</td>
                                                    <td>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</td>
                                                    <td>{getTutorName(schedule.tutorId)}</td>
                                                    <td>{schedule.subject}</td>
                                                    <td>{getStatusBadge(schedule.status)}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
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
                        <Card.Body>
                            {studentSchedules.length === 0 ? (
                                <Alert variant="info" className="text-center">
                                    <FaExclamationTriangle className="me-2" />
                                    Bạn chưa có lịch học nào.
                                    <br />
                                    <Button as={Link} to="/tutors" variant="primary" size="sm" className="mt-2">
                                        Đặt lịch học đầu tiên
                                    </Button>
                                </Alert>
                            ) : (
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSchedules.map((schedule) => (
                                            <tr key={schedule.id}>
                                                <td>{formatDate(schedule.date)}</td>
                                                <td>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</td>
                                                <td>{getTutorName(schedule.tutorId)}</td>
                                                <td>{schedule.subject}</td>
                                                <td>{schedule.location}</td>
                                                <td>{getStatusBadge(schedule.status)}</td>
                                                <td>{schedule.notes || '-'}</td>
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
                        <Card.Header>
                            <h5 className="mb-0">
                                <FaStar className="me-2" />
                                Đánh giá của tôi
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {studentReviews.length === 0 ? (
                                <Alert variant="info" className="text-center">
                                    <FaExclamationTriangle className="me-2" />
                                    Bạn chưa có đánh giá nào.
                                </Alert>
                            ) : (
                                <div>
                                    {studentReviews.map((review) => (
                                        <Card key={review.id} className="mb-3">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6>Giáo viên: {getTutorName(review.tutorId)}</h6>
                                                    <div className="text-warning">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} className={i < review.rating ? 'text-warning' : 'text-muted'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mb-1">{review.comment}</p>
                                                <small className="text-muted">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </small>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default StudentDashboard;