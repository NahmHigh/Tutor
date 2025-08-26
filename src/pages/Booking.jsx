import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useAppContext } from '../provider/AppProvider';
import { instance } from '../lib/axios';
import { FaUser, FaStar, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaClock, FaBookOpen } from 'react-icons/fa';
import { RiProfileLine } from 'react-icons/ri';
const Booking = () => {
    const { tutorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { users, tutors, schedules, setSchedules, subjects, locations } = useAppContext();

    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        subject: '',
        location: 'Online',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

    // Find the tutor
    const tutor = useMemo(() => {
        return tutors.find(t => t.id.toString() === tutorId.toString());
    }, [tutors, tutorId]);

    // Available time slots for the tutor
    const availableSlots = [
        '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    const showAlert = (message, variant = 'success') => {
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Auto-calculate end time when start time changes
        if (name === 'startTime' && value) {
            const startHour = parseInt(value.split(':')[0]);
            const endTime = `${(startHour + 2).toString().padStart(2, '0')}:00`;
            setFormData(prev => ({
                ...prev,
                endTime: endTime
            }));
        }

        // Clear alert when user makes changes
        if (alert.show) {
            setAlert({ show: false, message: '', variant: 'success' });
        }
    };

    const validateBooking = () => {
        const { date, startTime, endTime, subject } = formData;

        if (!date || !startTime || !endTime || !subject) {
            showAlert('Vui lòng điền đầy đủ thông tin bắt buộc', 'danger');
            return false;
        }

        // Check if booking date is not in the past
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            showAlert('Không thể đặt lịch trong quá khứ', 'danger');
            return false;
        }

        // Check if tutor teaches the selected subject
        if (!tutor.subjects?.includes(subject)) {
            showAlert('Giáo viên không dạy môn học này', 'danger');
            return false;
        }

        // Check for time conflicts
        const existingSchedules = schedules.filter(s =>
            s.tutorId.toString() === tutorId &&
            s.date === date &&
            s.status !== 'cancelled'
        );

        const newStartTime = new Date(`${date} ${startTime}`);
        const newEndTime = new Date(`${date} ${endTime}`);

        for (let schedule of existingSchedules) {
            const existingStart = new Date(`${schedule.date} ${schedule.startTime}`);
            const existingEnd = new Date(`${schedule.date} ${schedule.endTime}`);

            if ((newStartTime >= existingStart && newStartTime < existingEnd) ||
                (newEndTime > existingStart && newEndTime <= existingEnd) ||
                (newStartTime <= existingStart && newEndTime >= existingEnd)) {
                showAlert('Thời gian này đã có lịch học khác', 'danger');
                return false;
            }
        }

        return true;
    };

    const calculateDuration = () => {
        if (!formData.startTime || !formData.endTime) return 0;

        const start = new Date(`2023-01-01 ${formData.startTime}`);
        const end = new Date(`2023-01-01 ${formData.endTime}`);

        return Math.max(0, (end - start) / (1000 * 60)); // Duration in minutes
    };

    const calculateCost = () => {
        const duration = calculateDuration();
        const hourlyRate = tutor?.hourlyRate || 0;
        return (duration / 60) * hourlyRate;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateBooking()) return;

        setLoading(true);

        try {
            const duration = calculateDuration();
            const newSchedule = {
                id: String(schedules.length + 1),
                tutorId: parseInt(tutorId),
                studentId: parseInt(user.id),
                subject: formData.subject,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                duration: duration,
                status: 'pending',
                location: formData.location,
                notes: formData.notes,
                createdAt: new Date().toISOString()
            };

            await instance.post('/schedules', newSchedule);
            setSchedules([...schedules, newSchedule]);

            showAlert('Đặt lịch thành công! Giáo viên sẽ xác nhận sớm nhất có thể.', 'success');

            setTimeout(() => {
                navigate('/student-dashboard');
            }, 2000);

        } catch (error) {
            console.error('Error booking schedule:', error);
            showAlert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    if (!tutor) {
        return (
            <Container className="py-4">
                <Alert variant="danger" className="text-center">
                    <h5>Không tìm thấy giáo viên</h5>
                    <p>Giáo viên không tồn tại hoặc đã bị xóa.</p>
                    <Button variant="primary" onClick={() => navigate('/tutors')}>
                        Quay lại danh sách
                    </Button>
                </Alert>
            </Container>
        );
    }

    const duration = calculateDuration();
    const totalCost = calculateCost();

    return (
        <Container className="py-4">
            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h4 className="mb-0">
                                <FaCalendarAlt className="me-2" />
                                Đặt lịch học
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {alert.show && (
                                <Alert variant={alert.variant} className="mb-3">
                                    {alert.message}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngày học *</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giờ bắt đầu *</Form.Label>
                                            <Form.Select
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Chọn giờ</option>
                                                {availableSlots.map(time => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giờ kết thúc *</Form.Label>
                                            <Form.Select
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Chọn giờ</option>
                                                {availableSlots.filter(time =>
                                                    formData.startTime ? time > formData.startTime : true
                                                ).map(time => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Môn học *</Form.Label>
                                            <Form.Select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Chọn môn học</option>
                                                {(Array.isArray(tutor.subjects)
                                                    ? tutor.subjects
                                                    : typeof tutor.subjects === "string"
                                                        ? tutor.subjects.split(",").map(s => s.trim()).filter(s => s)
                                                        : []
                                                ).map(subject => (
                                                    <option key={subject} value={subject}>
                                                        {subject}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Hình thức học</Form.Label>
                                            <Form.Select
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                            >
                                                {locations.map(location => (
                                                    <option key={location.id} value={location.name}>
                                                        {location.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Ghi chú cho giáo viên</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Mô tả nội dung muốn học, mục tiêu, yêu cầu đặc biệt..."
                                    />
                                </Form.Group>

                                {/* Summary */}
                                {duration > 0 && (
                                    <Card className="bg-light mb-4">
                                        <Card.Body>
                                            <h6 className="mb-3">Tóm tắt đặt lịch:</h6>
                                            <Row>
                                                <Col md={6}>
                                                    <p className="mb-1"><strong>Thời lượng:</strong> {duration} phút ({duration / 60} giờ)</p>
                                                    <p className="mb-1"><strong>Giá/giờ:</strong> {tutor.hourlyRate?.toLocaleString('vi-VN')} VNĐ</p>
                                                </Col>
                                                <Col md={6}>
                                                    <p className="mb-1 text-success">
                                                        <strong>Tổng chi phí: {totalCost.toLocaleString('vi-VN')} VNĐ</strong>
                                                    </p>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                )}

                                <div className="d-flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Đang đặt lịch...
                                            </>
                                        ) : (
                                            'Đặt lịch'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline-secondary"
                                        size="lg"
                                        onClick={() => navigate('/tutors')}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    {/* Tutor Info */}
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Thông tin giáo viên</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center mb-3">
                                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '80px', height: '80px' }}>
                                    <FaUser size={40} className="text-white" />
                                </div>
                            </div>

                            <Card.Title className="text-center h5 mb-3">
                                {users.find(u => u.id === tutor.userId)?.fullName}
                            </Card.Title>

                            <div className="mb-2">
                                <RiProfileLine className="text-danger me-2" />
                                <strong>Mô tả:</strong> {tutor.bio}
                            </div>

                            <div className="mb-2">
                                <FaBookOpen className="text-primary me-2" />
                                <strong>Môn học:</strong> {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects || ''}
                            </div>

                            <div className="mb-2">
                                <FaMapMarkerAlt className="text-danger me-2" />
                                <strong>Địa điểm:</strong> {tutor.location}
                            </div>

                            <div className="mb-2">
                                <FaDollarSign className="text-success me-2" />
                                <strong>Giá:</strong> {tutor.hourlyRate?.toLocaleString('vi-VN')} VNĐ/giờ
                            </div>

                            <div className="mb-3 text-center">
                                <FaStar className="text-warning me-1" />
                                <span className="fw-bold">{tutor.rating}/5</span>
                                <small className="text-muted"> ({tutor.totalReviews} đánh giá)</small>
                            </div>

                            {tutor.education && (
                                <div className="mb-2">
                                    <strong>Học vấn:</strong> {tutor.education}
                                </div>
                            )}

                            {tutor.experience && (
                                <div className="mb-2">
                                    <strong>Kinh nghiệm:</strong> {tutor.experience}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Booking;