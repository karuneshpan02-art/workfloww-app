import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.ts';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
      <Card className="border-0 shadow-lg p-4 w-100" style={{ maxWidth: '450px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <div className="bg-primary-subtle p-3 rounded-circle d-inline-block mb-3">
              <Lock className="text-primary" size={32} />
            </div>
            <h2 className="fw-bold">Reset Password</h2>
            <p className="text-muted">Enter your new password below.</p>
          </div>

          {message && (
            <Alert variant="success" className="rounded-3 d-flex align-items-center">
              <CheckCircle2 size={20} className="me-2" />
              <div>
                {message}
                <div className="small mt-1">Redirecting to login...</div>
              </div>
            </Alert>
          )}
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

          {!message && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small text-muted text-uppercase fw-bold">New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  className="rounded-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small text-muted text-uppercase fw-bold">Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  className="rounded-3 py-2"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 rounded-pill py-2 fw-bold mb-3"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-decoration-none small d-flex align-items-center justify-content-center text-muted">
                  <ArrowLeft size={14} className="me-1" /> Back to Login
                </Link>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
