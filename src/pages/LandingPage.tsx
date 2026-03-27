import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, BarChart, Bell } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-3 fw-bold mb-4 animate__animated animate__fadeInLeft">
                Streamline Your Workflow
              </h1>
              <p className="lead mb-5 opacity-90 animate__animated animate__fadeInLeft animate__delay-1s">
                The all-in-one task management platform for modern teams. Assign tasks, track progress, and boost productivity with ease.
              </p>
              <div className="d-flex gap-3 animate__animated animate__fadeInUp animate__delay-2s">
                <Button as={Link as any} to="/register" variant="light" size="lg" className="px-4 py-3 fw-bold text-primary shadow">
                  Get Started Free
                </Button>
                <Button as={Link as any} to="/login" variant="outline-light" size="lg" className="px-4 py-3 fw-bold">
                  Sign In
                </Button>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&w=800&q=80" 
                alt="Workflow Dashboard" 
                className="img-fluid rounded-4 shadow-lg animate__animated animate__zoomIn"
                referrerPolicy="no-referrer"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark">Why Choose WorkFlow?</h2>
            <p className="text-muted lead">Powerful features to help your team succeed.</p>
          </div>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift">
                <div className="feature-icon bg-primary-soft text-primary mb-4 mx-auto">
                  <CheckCircle size={32} />
                </div>
                <Card.Title className="fw-bold">Task Tracking</Card.Title>
                <Card.Text className="text-muted">
                  Monitor every task from start to finish with real-time status updates.
                </Card.Text>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift">
                <div className="feature-icon bg-success-soft text-success mb-4 mx-auto">
                  <Users size={32} />
                </div>
                <Card.Title className="fw-bold">Team Collaboration</Card.Title>
                <Card.Text className="text-muted">
                  Assign tasks to specific team members and manage workloads effectively.
                </Card.Text>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift">
                <div className="feature-icon bg-info-soft text-info mb-4 mx-auto">
                  <BarChart size={32} />
                </div>
                <Card.Title className="fw-bold">Analytics</Card.Title>
                <Card.Text className="text-muted">
                  Get visual insights into team performance with intuitive charts and reports.
                </Card.Text>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift">
                <div className="feature-icon bg-warning-soft text-warning mb-4 mx-auto">
                  <Bell size={32} />
                </div>
                <Card.Title className="fw-bold">Notifications</Card.Title>
                <Card.Text className="text-muted">
                  Stay informed with automatic email notifications for new task assignments.
                </Card.Text>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 text-center text-white" style={{ background: '#2d3436' }}>
        <Container>
          <h2 className="display-6 fw-bold mb-4">Ready to transform your team's productivity?</h2>
          <p className="lead mb-5 opacity-75">Join thousands of teams already using WorkFlow to get things done.</p>
          <Button as={Link as any} to="/register" variant="primary" size="lg" className="px-5 py-3 fw-bold shadow">
            Start Your Free Trial
          </Button>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-dark text-white-50 text-center">
        <Container>
          <p className="mb-0">&copy; 2026 WorkFlow Inc. All rights reserved.</p>
        </Container>
      </footer>

      <style>{`
        .feature-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }
        .bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
        .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
        .bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }
        .bg-warning-soft { background-color: rgba(255, 193, 7, 0.1); }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-10px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
