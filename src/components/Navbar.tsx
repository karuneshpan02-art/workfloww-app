import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isLanding = location.pathname === '/';

  return (
    <Navbar 
      bg={isLanding ? 'transparent' : 'white'} 
      variant={isLanding ? 'dark' : 'light'} 
      expand="lg" 
      className={`py-3 ${!isLanding ? 'shadow-sm sticky-top' : 'position-absolute w-100'}`}
      style={{ zIndex: 1000 }}
    >
      <Container>
        <Navbar.Brand as={Link as any} to="/" className="fw-bold fs-3">
          Work<span className={isLanding ? 'text-white' : 'text-primary'}>Flow</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {role === 'Admin' && (
              <>
                <Nav.Link as={Link as any} to="/admin" className="px-3">Dashboard</Nav.Link>
                <Nav.Link as={Link as any} to="/admin/employees" className="px-3">Employees</Nav.Link>
              </>
            )}
            {role === 'Employee' && (
              <Nav.Link as={Link as any} to="/user" className="px-3">My Tasks</Nav.Link>
            )}
            
            {name ? (
              <>
                <span className={`mx-2 d-none d-lg-inline ${isLanding ? 'text-white-50' : 'text-muted'}`}>
                  Welcome, <strong>{name}</strong>
                </span>
                <Button 
                  variant={isLanding ? 'outline-light' : 'outline-primary'} 
                  size="sm" 
                  className="rounded-pill px-4"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link as any} to="/login" className="px-3">Login</Nav.Link>
                <Button 
                  as={Link as any} 
                  to="/register" 
                  variant={isLanding ? 'light' : 'primary'} 
                  className="rounded-pill px-4"
                >
                  Get Started
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
