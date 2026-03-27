import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.ts';
import { LogIn, ShieldCheck, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await api.get('/db-status');
        setDbStatus(res.data.connected);
        setDbError(res.data.error);
        
        const emailRes = await api.get('/email-status');
        setEmailStatus(emailRes.data);
      } catch (err) {
        setDbStatus(false);
        setDbError('Could not reach backend');
      }
    };
    checkDb();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dbStatus === false) {
      setError('Database is not connected. Please check the MONGODB_URI secret.');
      return;
    }
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('name', response.data.name);
      localStorage.setItem('employeeId', response.data.employeeId);
      
      if (response.data.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="border-0 shadow-lg overflow-hidden rounded-4">
              <Row className="g-0">
                {/* Left Side - Image/Info */}
                <Col md={5} className="d-none d-md-flex flex-column justify-content-center p-5 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                  <div className="mb-4">
                    <LogIn size={48} className="mb-3" />
                    <h2 className="fw-bold">Welcome Back!</h2>
                    <p className="opacity-75">Access your dashboard and manage your tasks efficiently.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex align-items-center mb-3">
                      <ShieldCheck size={20} className="me-2" />
                      <small>Secure Authentication</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Mail size={20} className="me-2" />
                      <small>Email Notifications</small>
                    </div>
                  </div>
                </Col>

                {/* Right Side - Form */}
                <Col md={7} className="p-4 p-lg-5 bg-white">
                  <div className="text-center mb-4 d-md-none">
                    <h2 className="fw-bold text-primary">WorkFlow</h2>
                  </div>
                  <h3 className="fw-bold mb-4 text-dark">Sign In</h3>
                  
                  {dbStatus === false && (
                    <Alert variant="warning" className="small border-0 shadow-sm">
                      <div className="d-flex align-items-center">
                        <strong className="me-2">Database Disconnected:</strong>
                      </div>
                      <p className="mb-0 mt-1 opacity-75">{dbError || 'Database configuration required.'}</p>
                    </Alert>
                  )}

                  {emailStatus && emailStatus.error && (
                    <Alert variant="warning" className="d-flex justify-content-between align-items-center py-2 px-3 border-0 shadow-sm mb-3">
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong>Email Error:</strong> Troubleshooting required.
                      </div>
                      <Button variant="outline-warning" size="sm" style={{ fontSize: '0.7rem' }} onClick={() => setShowTroubleshoot(true)}>
                        Fix
                      </Button>
                    </Alert>
                  )}

                  {error && <Alert variant="danger" className="border-0 shadow-sm small">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Email Address</Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder="name@company.com" 
                        required 
                        className="py-2 border-light bg-light"
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="small fw-semibold text-muted mb-0">Password</Form.Label>
                        <Link to="/forgot-password" className="text-primary text-decoration-none extra-small fw-bold">Forgot Password?</Link>
                      </div>
                      <Form.Control 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        className="py-2 border-light bg-light"
                        onChange={(e) => setPassword(e.target.value)} 
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm">
                      Sign In
                    </Button>
                  </Form>

                  <div className="text-center mt-4 pt-2">
                    <p className="text-muted small mb-0">
                      Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create Account</Link>
                    </p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showTroubleshoot} onHide={() => setShowTroubleshoot(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Email Troubleshooting</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Alert variant="danger" className="border-0 shadow-sm"><strong>Error:</strong> {emailStatus?.error}</Alert>
          <h6 className="fw-bold mt-4">Common Fixes for Gmail:</h6>
          <ul className="text-muted">
            <li>
              <strong>App Password:</strong> Gmail requires an App Password for SMTP.
              <br />
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary mt-2 rounded-pill px-3">
                Generate App Password
              </a>
            </li>
            <li className="mt-3"><strong>2-Step Verification:</strong> Must be enabled to use App Passwords.</li>
            <li className="mt-2"><strong>SMTP_FROM:</strong> Must match your Gmail address exactly.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowTroubleshoot(false)} className="rounded-pill px-4">Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
