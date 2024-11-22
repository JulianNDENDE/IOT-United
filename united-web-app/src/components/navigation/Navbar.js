import React from 'react';
import { Container, Nav, Navbar as BootstrapNavbar, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ROUTES from '../../constants/ROUTES';
import './Navbar.css';

const Navbar = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate(ROUTES.PATHS.login);
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to={ROUTES.PATHS.dashboard} className="navbar-title me-auto">
          United
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav>
            <Nav.Link
              as={Link}
              to={ROUTES.PATHS.dashboard}
              active={location.pathname === ROUTES.PATHS.dashboard}
              className="navbar-link"
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={ROUTES.PATHS.devices}
              active={location.pathname === ROUTES.PATHS.devices}
              className="navbar-link"
            >
              Devices
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>

        <Nav className="ms-auto">
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
