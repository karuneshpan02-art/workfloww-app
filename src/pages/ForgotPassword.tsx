import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
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
              <Mail className="text-primary" size={32} />
            </div>
            <h2 className="fw-bold">Forgot Password?</h2>
            <p className="text-muted">No worries, we'll send you reset instructions.</p>
          </div>

          {message && <Alert variant="success" className="rounded-3">{message}</Alert>}
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="small text-muted text-uppercase fw-bold">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                className="rounded-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 rounded-pill py-2 fw-bold mb-3"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none small d-flex align-items-center justify-content-center text-muted">
                <ArrowLeft size={14} className="me-1" /> Back to Login
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
