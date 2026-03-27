import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Dropdown, Alert } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Upload, 
  FileText, 
  Calendar,
  ChevronDown,
  LayoutDashboard,
  User,
  BarChart3,
  Eye
} from 'lucide-react';
import api from '../services/api.ts';
import TaskDetailModal from '../components/TaskDetailModal.tsx';

const UserDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [note, setNote] = useState('');
  const [response, setResponse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      
      // Update selected task if it's open
      if (selectedTask) {
        const updatedTask = res.data.find((t: any) => t._id === selectedTask._id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await api.put(`/tasks/${selectedTask._id}`, { note });
      setShowNoteModal(false);
      setNote('');
      fetchTasks();
    } catch (err) {
      console.error('Error adding note', err);
    }
  };

  const handleSubmitResponse = async () => {
    const formData = new FormData();
    if (response) formData.append('response', response);
    if (file) formData.append('file', file);

    try {
      await api.put(`/tasks/${selectedTask._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowResponseModal(false);
      setResponse('');
      setFile(null);
      fetchTasks();
    } catch (err) {
      console.error('Error submitting response', err);
    }
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== 'Completed' && status !== 'Approved';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 size={16} className="text-success me-1" />;
      case 'Completed': return <CheckCircle2 size={16} className="text-primary me-1" />;
      case 'Rejected': return <AlertCircle size={16} className="text-danger me-1" />;
      case 'In Progress': return <Clock size={16} className="text-info me-1" />;
      default: return <AlertCircle size={16} className="text-secondary me-1" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      default: return 'info';
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length,
    overdue: tasks.filter(t => isOverdue(t.deadline, t.status)).length,
  };

  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Active') return t.status !== 'Completed' && t.status !== 'Approved';
    if (filter === 'Completed') return t.status === 'Completed' || t.status === 'Approved';
    return true;
  });

  const chartData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
  ];

  const COLORS = ['#FFBB28', '#0088FE', '#198754'];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading && tasks.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your tasks...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="display-6 fw-bold mb-0 d-flex align-items-center">
            <LayoutDashboard className="me-3 text-primary" size={32} />
            My Workspace
          </h1>
          <p className="text-muted mb-0">Track and manage your assigned tasks efficiently.</p>
        </div>
        <div className="bg-light p-2 rounded-pill px-3 d-flex align-items-center">
          <User size={18} className="text-primary me-2" />
          <span className="small fw-bold">Employee Portal</span>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

      <Row className="mb-5 g-4">
        <Col lg={8}>
          <Row className="g-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm stats-card bg-white">
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="bg-primary-subtle p-3 rounded-3 me-3">
                    <LayoutDashboard className="text-primary" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">Total Tasks</div>
                    <h3 className="mb-0 fw-bold">{stats.total}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm stats-card bg-white">
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="bg-warning-subtle p-3 rounded-3 me-3">
                    <Clock className="text-warning" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">In Progress</div>
                    <h3 className="mb-0 fw-bold">{stats.inProgress + stats.pending}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm stats-card bg-white">
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="bg-success-subtle p-3 rounded-3 me-3">
                    <CheckCircle2 className="text-success" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">Completed</div>
                    <h3 className="mb-0 fw-bold">{stats.completed}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm stats-card bg-white">
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="bg-danger-subtle p-3 rounded-3 me-3">
                    <AlertCircle className="text-danger" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">Overdue</div>
                    <h3 className="mb-0 fw-bold">{stats.overdue}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden bg-white">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center">
              <BarChart3 className="me-2 text-primary" size={20} />
              <h5 className="mb-0 fw-bold">Task Status</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={70} 
                    paddingAngle={5} 
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <div className="d-flex gap-2">
            <Button 
              variant={filter === 'All' ? 'primary' : 'light'} 
              size="sm" 
              className="rounded-pill px-3"
              onClick={() => setFilter('All')}
            >
              All Tasks
            </Button>
            <Button 
              variant={filter === 'Active' ? 'primary' : 'light'} 
              size="sm" 
              className="rounded-pill px-3"
              onClick={() => setFilter('Active')}
            >
              Active
            </Button>
            <Button 
              variant={filter === 'Completed' ? 'primary' : 'light'} 
              size="sm" 
              className="rounded-pill px-3"
              onClick={() => setFilter('Completed')}
            >
              Completed
            </Button>
          </div>
        </Col>
        <Col md={6} className="text-md-end mt-3 mt-md-0">
          <div className="d-inline-flex align-items-center bg-white p-2 rounded-pill shadow-sm px-3 border">
            <span className="small text-muted me-2">Overall Progress</span>
            <div className="progress" style={{ width: '100px', height: '8px' }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: `${completionRate}%` }} 
                aria-valuenow={completionRate} 
                aria-valuemin={0} 
                aria-valuemax={100}
              ></div>
            </div>
            <span className="small fw-bold ms-2">{completionRate}%</span>
          </div>
        </Col>
      </Row>

      {filteredTasks.length === 0 ? (
        <Card className="border-0 shadow-sm p-5 text-center bg-light">
          <div className="mb-3 text-muted">
            <CheckCircle2 size={64} className="opacity-25" />
          </div>
          <h4 className="fw-bold">No tasks found</h4>
          <p className="text-muted">Try changing your filter or check back later.</p>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredTasks.map(task => {
            const overdue = isOverdue(task.deadline, task.status);
            return (
              <Col md={6} lg={4} key={task._id}>
                <Card 
                  className={`border-0 shadow-sm h-100 task-card transition-all ${overdue ? 'border-start border-danger border-4' : ''}`}
                  onClick={() => handleTaskClick(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge bg={getPriorityColor(task.priority)} className="rounded-pill px-3 py-2 text-uppercase extra-small tracking-wider">
                        {task.priority}
                      </Badge>
                      {overdue && (
                        <Badge bg="danger" className="rounded-pill px-3 py-2 animate__animated animate__pulse animate__infinite">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    <h5 className="fw-bold mb-2">{task.title}</h5>
                    <Card.Text className="text-muted small mb-4 line-clamp-3">
                      {task.description}
                    </Card.Text>

                    <div className="d-flex align-items-center mb-3 text-muted small">
                      <Calendar size={14} className="me-2" />
                      <span className="fw-medium">Deadline:</span>
                      <span className={`ms-2 ${overdue ? 'text-danger fw-bold' : ''}`}>
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    {task.submissionDate && (
                      <div className="d-flex align-items-center mb-3 text-success small">
                        <CheckCircle2 size={14} className="me-2" />
                        <span className="fw-medium">Submitted:</span>
                        <span className="ms-2">
                          {new Date(task.submissionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="d-flex align-items-center mb-4">
                      <div className="me-auto d-flex align-items-center">
                        {getStatusIcon(task.status)}
                        <span className="small fw-bold text-uppercase tracking-tight">{task.status}</span>
                      </div>
                      <Dropdown onSelect={(s) => handleStatusUpdate(task._id, s || 'Pending')} onClick={(e) => e.stopPropagation()}>
                        <Dropdown.Toggle variant="light" size="sm" className="rounded-pill px-3 border-0 shadow-sm d-flex align-items-center">
                          Update <ChevronDown size={14} className="ms-1" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="border-0 shadow-lg">
                          <Dropdown.Item eventKey="Pending" className="small py-2">Pending</Dropdown.Item>
                          <Dropdown.Item eventKey="In Progress" className="small py-2">In Progress</Dropdown.Item>
                          <Dropdown.Item eventKey="Completed" className="small py-2">Completed</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    <div className="d-grid gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center"
                        onClick={() => handleTaskClick(task)}
                      >
                        <Eye size={14} className="me-2" />
                        View Details
                      </Button>
                      
                      {overdue && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center shadow-sm"
                          onClick={() => { setSelectedTask(task); setShowResponseModal(true); }}
                        >
                          <AlertCircle size={14} className="me-2" />
                          Submit Response
                        </Button>
                      )}
                      
                      {!task.file && task.status === 'Completed' && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center shadow-sm"
                          onClick={() => { setSelectedTask(task); setShowResponseModal(true); }}
                        >
                          <Upload size={14} className="me-2" />
                          Upload Proof
                        </Button>
                      )}

                      {task.file && (
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center"
                          as="a" 
                          href={`/uploads/${task.file}`} 
                          target="_blank"
                        >
                          <FileText size={14} className="me-2" />
                          View Proof
                        </Button>
                      )}
                    </div>

                    {task.notes && task.notes.length > 0 && (
                      <div className="mt-4 pt-3 border-top">
                        <div className="d-flex align-items-center mb-2 text-primary">
                          <MessageSquare size={12} className="me-1" />
                          <span className="extra-small fw-bold text-uppercase">Recent Updates</span>
                        </div>
                        <div className="bg-light p-2 rounded-3">
                          {task.notes.slice(-2).map((n: any, i: number) => (
                            <div key={i} className="extra-small text-muted mb-1 last-mb-0">
                              • {n.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Note Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pt-4 px-4">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <MessageSquare className="me-2 text-primary" size={24} />
            Add Task Update
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form.Group>
            <Form.Label className="small fw-bold text-uppercase text-muted">Your Message</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              placeholder="What's the latest progress on this task?" 
              className="bg-light border-0 py-2"
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
            />
          </Form.Group>
          <div className="d-grid mt-4">
            <Button variant="primary" className="py-2 fw-bold shadow-sm" onClick={handleAddNote}>
              Post Update
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Response/Upload Modal */}
      <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)} centered>
        <Modal.Header closeButton className="border-0 pt-4 px-4">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <Upload className="me-2 text-primary" size={24} />
            Submit Documentation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-uppercase text-muted">Explanation / Comments</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Provide any relevant details or reasons for delay..." 
              className="bg-light border-0 py-2"
              value={response} 
              onChange={(e) => setResponse(e.target.value)} 
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-uppercase text-muted">Upload PDF Proof</Form.Label>
            <div className="upload-area p-4 border-2 border-dashed rounded-3 text-center bg-light">
              <Upload size={32} className="text-muted mb-2 opacity-50" />
              <Form.Control 
                type="file" 
                accept=".pdf" 
                className="d-none" 
                id="task-file-upload"
                onChange={(e: any) => setFile(e.target.files[0])} 
              />
              <label htmlFor="task-file-upload" className="d-block cursor-pointer">
                <div className="fw-bold text-primary mb-1">Click to select file</div>
                <div className="extra-small text-muted">{file ? file.name : 'Only PDF files accepted'}</div>
              </label>
            </div>
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" className="py-2 fw-bold shadow-sm" onClick={handleSubmitResponse}>
              Submit Documentation
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal 
        task={selectedTask}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        onUpdate={fetchTasks}
      />
    </Container>
  );
};

export default UserDashboard;
