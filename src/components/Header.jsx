import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button, NavbarText } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaHome, FaChalkboardTeacher } from 'react-icons/fa';
import { SiStudyverse } from "react-icons/si";

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin':
                return '/admin';
            case 'tutor':
                return '/tutor-dashboard';
            case 'student':
                return '/student-dashboard';
            default:
                return '/';
        }
    };

    return (
        <Navbar variant="dark" expand="lg" className="mb-3" style={{
            background: 'linear-gradient(to right, #60d0d2 0%, #1bf3a0 100%)'
        }}>
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold" style={{
                    fontSize: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center'
                }} >
                    <SiStudyverse className="me-2" style={{
                        fontSize: '3rem'
                    }} />
                    <NavbarText style={{
                        color: '#fff'
                    }}
                    >
                        Gia Sư Nhà Mày!
                    </NavbarText>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Nav.Link as={Link} to="/" style={{
                            color: '#fff',
                            fontSize: '1.1rem'
                        }}>
                            <FaHome className="me-1" />
                            <NavbarText style={{
                                color: '#fff',
                                fontSize: '1.1rem'
                            }}>
                                Trang chủ
                            </NavbarText>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/tutors" style={{
                            color: '#fff'
                        }}>
                            <FaChalkboardTeacher className="me-1" />
                            <NavbarText style={{
                                color: '#fff'
                            }}>
                                Giáo viên
                            </NavbarText>
                        </Nav.Link>
                    </Nav>

                    <Nav>
                        {isAuthenticated ? (
                            <NavDropdown
                                title={
                                    <span>
                                        <FaUser className="me-1" />
                                        {user.fullName}
                                    </span>
                                }
                                id="user-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to={getDashboardLink()}>
                                    <FaCog className="me-2" />
                                    Dashboard
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/profile">
                                    <FaUser className="me-2" />
                                    Hồ sơ cá nhân
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    <FaSignOutAlt className="me-2" />
                                    Đăng xuất
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button
                                    as={Link}
                                    to="/login"
                                    variant="light"
                                    size="sm"
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    as={Link}
                                    to="/register"
                                    variant="light"
                                    size="sm"
                                >
                                    Đăng ký
                                </Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;