import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.ts';
import { UserPlus, ShieldCheck, Zap } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      setSuccess(`User registered successfully! ${response.data.employeeId ? 'Employee ID: ' + response.data.employeeId : ''}`);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={9}>
            <Card className="border-0 shadow-lg overflow-hidden rounded-4">
              <Row className="g-0">
                {/* Left Side - Image/Info */}
                <Col md={5} className="d-none d-md-flex flex-column justify-content-center p-5 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                  <div className="mb-4">
                    <UserPlus size={48} className="mb-3" />
                    <h2 className="fw-bold">Join WorkFlow</h2>
                    <p className="opacity-75">Create your account and start managing your team's productivity today.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex align-items-center mb-3">
                      <ShieldCheck size={20} className="me-2" />
                      <small>Enterprise Security</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Zap size={20} className="me-2" />
                      <small>Instant Setup</small>
                    </div>
                  </div>
                </Col>

                {/* Right Side - Form */}
                <Col md={7} className="p-4 p-lg-5 bg-white">
                  <div className="text-center mb-4 d-md-none">
                    <h2 className="fw-bold text-primary">WorkFlow</h2>
                  </div>
                  <h3 className="fw-bold mb-4 text-dark">Create Account</h3>
                  
                  {error && <Alert variant="danger" className="border-0 shadow-sm small">{error}</Alert>}
                  {success && <Alert variant="success" className="border-0 shadow-sm small">{success}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Full Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="John Doe" 
                        required 
                        className="py-2 border-light bg-light"
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </Form.Group>

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

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        className="py-2 border-light bg-light"
                        onChange={(e) => setPassword(e.target.value)} 
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-muted">Role</Form.Label>
                      <Form.Select 
                        className="py-2 border-light bg-light"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Admin">Admin</option>
                      </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm">
                      Create Account
                    </Button>
                  </Form>

                  <div className="text-center mt-4 pt-2">
                    <p className="text-muted small mb-0">
                      Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                    </p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
