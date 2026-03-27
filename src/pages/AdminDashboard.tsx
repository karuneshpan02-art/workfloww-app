import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert, Dropdown } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../services/api.ts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import TaskDetailModal from '../components/TaskDetailModal.tsx';
import { 
  Plus, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Users, 
  LayoutDashboard,
  ListTodo,
  Filter,
  Calendar,
  FileCheck,
  AlertCircle,
  Download,
  AlertTriangle,
  Eye
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', employeeId: '', priority: 'Medium', deadline: '', file: null as File | null });
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, employeesRes, emailRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/employees'),
        api.get('/email-status')
      ]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
      setEmailStatus(emailRes.data);
      
      // Update selected task if it's open
      if (selectedTask) {
        const updatedTask = tasksRes.data.find((t: any) => t._id === selectedTask._id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newTask.title);
    formData.append('description', newTask.description);
    formData.append('employeeId', newTask.employeeId);
    formData.append('priority', newTask.priority);
    formData.append('deadline', newTask.deadline);
    if (newTask.file) {
      formData.append('file', newTask.file);
    }

    try {
      await api.post('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setNewTask({ title: '', description: '', employeeId: '', priority: 'Medium', deadline: '', file: null });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const confirmDelete = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestLoading(true);
    setTestMessage('');
    try {
      const res = await api.post('/test-email', { email: testEmail });
      setTestMessage(res.data.message);
      fetchData(); // Refresh status
    } catch (err: any) {
      setTestMessage(err.response?.data?.message || 'Failed to send test email');
      fetchData(); // Refresh status
    } finally {
      setTestLoading(false);
    }
  };
  const generateReport = () => {
    const doc = new jsPDF() as any;
    doc.text('WorkFlow Task Report', 14, 15);
    const tableData = tasks.map(t => [
      t.title,
      t.assignedTo?.name || 'N/A',
      t.priority,
      t.status,
      new Date(t.deadline).toLocaleDateString(),
      t.submissionDate ? new Date(t.submissionDate).toLocaleDateString() : '-'
    ]);
    doc.autoTable({
      head: [['Title', 'Assigned To', 'Priority', 'Status', 'Deadline', 'Submitted At']],
      body: tableData,
      startY: 20,
    });
    doc.save('task-report.pdf');
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    approved: tasks.filter(t => t.status === 'Approved').length,
    rejected: tasks.filter(t => t.status === 'Rejected').length,
  };

  const chartData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
  ];

  const COLORS = ['#FFBB28', '#0088FE', '#0d6efd', '#198754', '#dc3545'];

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <Container fluid className="px-4 py-4 animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="display-5 fw-bold mb-0 d-flex align-items-center">
            <LayoutDashboard className="me-3 text-primary" size={40} />
            Admin Dashboard
          </h1>
          <p className="text-muted mb-0">Manage tasks, monitor performance, and track team progress.</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            className="d-flex align-items-center shadow-sm px-4" 
            onClick={() => setShowModal(true)}
          >
            <Plus className="me-2" size={18} />
            Create Task
          </Button>
          <Button 
            variant="outline-primary" 
            className="d-flex align-items-center shadow-sm px-4" 
            onClick={generateReport}
          >
            <Download className="me-2" size={18} />
            Export PDF
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          {emailStatus && emailStatus.error && (
            <Alert variant="warning" className="d-flex justify-content-between align-items-center border-0 shadow-sm mb-4 animate__animated animate__shakeX">
              <div className="d-flex align-items-center">
                <AlertTriangle className="me-3 text-warning" size={24} />
                <div>
                  <strong className="d-block">Email System Alert</strong>
                  <span className="small">{emailStatus.error}</span>
                </div>
              </div>
              <Button variant="warning" size="sm" className="fw-bold" onClick={() => setShowTroubleshootModal(true)}>
                Troubleshoot
              </Button>
            </Alert>
          )}
          
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-light px-4 py-2 border-bottom d-flex align-items-center">
              <Mail className="me-2 text-primary" size={18} />
              <span className="fw-bold small text-uppercase tracking-wider">Communication System</span>
            </div>
            <Card.Body className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
              <div className="d-flex align-items-center">
                <div className={`p-2 rounded-circle me-3 ${emailStatus?.configured ? 'bg-success-subtle' : 'bg-secondary-subtle'}`}>
                  {emailStatus?.configured ? <CheckCircle2 className="text-success" size={24} /> : <Clock className="text-secondary" size={24} />}
                </div>
                <div>
                  <div className="fw-bold">Email Notifications</div>
                  <div className="small text-muted">
                    Status: {emailStatus?.configured ? <Badge bg="success" className="rounded-pill">Active</Badge> : <Badge bg="secondary" className="rounded-pill">Inactive</Badge>}
                    {emailStatus?.configured && <span className="ms-2">• Host: {emailStatus.details.host}</span>}
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Form.Control 
                  type="email" 
                  placeholder="Test email address" 
                  className="bg-light border-0" 
                  style={{ width: '250px' }}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button 
                  variant="dark" 
                  onClick={handleTestEmail} 
                  disabled={testLoading || !emailStatus?.configured}
                  className="px-4"
                >
                  {testLoading ? 'Sending...' : 'Send Test'}
                </Button>
              </div>
            </Card.Body>
            {testMessage && (
              <Alert 
                variant={testMessage.includes('successfully') ? 'success' : 'danger'} 
                className="m-3 border-0 shadow-sm py-2"
              >
                {testMessage}
              </Alert>
            )}
          </Card>
        </Col>
      </Row>

<Row className="mb-4 g-4">
  <Col md={2}>
    <Card className="border-0 shadow-sm h-100 stats-card">
      <Card.Body className="d-flex align-items-center">
        <div className="bg-primary-subtle p-3 rounded-3 me-3">
          <LayoutDashboard className="text-primary" size={24} />
        </div>
        <div>
          <div className="text-muted small text-uppercase fw-bold">Total Tasks</div>
          <h2 className="mb-0 fw-bold">{stats.total}</h2>
        </div>
      </Card.Body>
    </Card>
  </Col>

  <Col md={2}>
    <Card className="border-0 shadow-sm h-100 stats-card">
      <Card.Body className="d-flex align-items-center">
        <div className="bg-warning-subtle p-3 rounded-3 me-3">
          <Clock className="text-warning" size={24} />
        </div>
        <div>
          <div className="text-muted small text-uppercase fw-bold">Pending</div>
          <h2 className="mb-0 fw-bold">{stats.pending}</h2>
        </div>
      </Card.Body>
    </Card>
  </Col>

  <Col md={2}>
    <Card className="border-0 shadow-sm h-100 stats-card">
      <Card.Body className="d-flex align-items-center">
        <div className="bg-info-subtle p-3 rounded-3 me-3">
          <BarChart3 className="text-info" size={24} />
        </div>
        <div>
          <div className="text-muted small text-uppercase fw-bold">In Progress</div>
          <h2 className="mb-0 fw-bold">{stats.inProgress}</h2>
        </div>
      </Card.Body>
    </Card>
  </Col>

  <Col md={2}>
    <Card className="border-0 shadow-sm h-100 stats-card">
      <Card.Body className="d-flex align-items-center">
        <div className="bg-success-subtle p-3 rounded-3 me-3">
          <CheckCircle2 className="text-success" size={24} />
        </div>
        <div>
          <div className="text-muted small text-uppercase fw-bold">Completed</div>
          <h2 className="mb-0 fw-bold">{stats.completed}</h2>
        </div>
      </Card.Body>
    </Card>
  </Col>

  {/* ✅ NEW APPROVED CARD */}
  <Col md={2}>
    <Card className="border-0 shadow-sm h-100 stats-card">
      <Card.Body className="d-flex align-items-center">
        <div className="bg-success-subtle p-3 rounded-3 me-3">
          <CheckCircle2  className="text-success" size={24} />
        </div>
        <div>
          <div className="text-muted small text-uppercase fw-bold">Approved</div>
          <h2 className="mb-0 fw-bold">{stats.approved}</h2>
        </div>
      </Card.Body>
    </Card>
  </Col>  
</Row>

      <Row className="mb-4 g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center">
              <BarChart3 className="me-2 text-primary" size={20} />
              <h5 className="mb-0 fw-bold">Task Distribution</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={8} 
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
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center">
              <Users className="me-2 text-primary" size={20} />
              <h5 className="mb-0 fw-bold">Employee Leaderboard</h5>
            </Card.Header>
            <Card.Body className="px-0 pb-0">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 border-0 py-3 text-muted small text-uppercase">Employee</th>
                      <th className="border-0 py-3 text-muted small text-uppercase">Active</th>
                      <th className="border-0 py-3 text-muted small text-uppercase">Done</th>
                      <th className="pe-4 border-0 py-3 text-muted small text-uppercase text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...employees].sort((a, b) => {
                      const countA = tasks.filter(t => t.assignedTo?._id === a._id && t.status === 'Completed').length;
                      const countB = tasks.filter(t => t.assignedTo?._id === b._id && t.status === 'Completed').length;
                      return countB - countA;
                    }).slice(0, 5).map(emp => {
                      const activeCount = tasks.filter(t => t.assignedTo?._id === emp._id && t.status !== 'Completed').length;
                      const completedCount = tasks.filter(t => t.assignedTo?._id === emp._id && t.status === 'Completed').length;
                      const isBusy = activeCount >= 3;
                      return (
                        <tr key={emp._id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle me-3 bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                {emp.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="fw-bold">{emp.name || 'Unknown'}</div>
                                <div className="text-muted extra-small">{emp.employeeId || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td><Badge bg={isBusy ? 'danger' : 'info'} className="rounded-pill">{activeCount}</Badge></td>
                          <td><Badge bg="success" className="rounded-pill">{completedCount}</Badge></td>
                          <td className="pe-4 text-end">
                            <Badge bg={isBusy ? 'danger' : 'success'} className="rounded-pill px-3 py-2">
                              {isBusy ? 'Busy' : 'Available'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">No employees registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <ListTodo className="me-2 text-primary" size={20} />
            <h5 className="mb-0 fw-bold">All Tasks</h5>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Form.Control
              type="text"
              placeholder="Search tasks..."
              size="sm"
              className="rounded-pill px-3 border-0 bg-light"
              style={{ width: '200px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Dropdown onSelect={(s) => setFilterStatus(s || 'All')}>
              <Dropdown.Toggle variant={filterStatus === 'All' ? 'light' : 'primary'} size="sm" className="rounded-pill px-3 border-0 shadow-sm">
                <Filter size={14} className="me-1" /> {filterStatus === 'All' ? 'Status' : filterStatus}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-0 shadow-lg">
                <Dropdown.Item eventKey="All">All Statuses</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item eventKey="Pending">Pending</Dropdown.Item>
                <Dropdown.Item eventKey="In Progress">In Progress</Dropdown.Item>
                <Dropdown.Item eventKey="Completed">Completed</Dropdown.Item>
                <Dropdown.Item eventKey="Approved">Approved</Dropdown.Item>
                <Dropdown.Item eventKey="Rejected">Rejected</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown onSelect={(s) => setFilterPriority(s || 'All')}>
              <Dropdown.Toggle variant={filterPriority === 'All' ? 'light' : 'primary'} size="sm" className="rounded-pill px-3 border-0 shadow-sm">
                <BarChart3 size={14} className="me-1" /> {filterPriority === 'All' ? 'Priority' : filterPriority}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-0 shadow-lg">
                <Dropdown.Item eventKey="All">All Priorities</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item eventKey="High">High</Dropdown.Item>
                <Dropdown.Item eventKey="Medium">Medium</Dropdown.Item>
                <Dropdown.Item eventKey="Low">Low</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {(filterStatus !== 'All' || filterPriority !== 'All' || searchTerm) && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-muted text-decoration-none"
                onClick={() => {
                  setFilterStatus('All');
                  setFilterPriority('All');
                  setSearchTerm('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="px-0 pb-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 border-0 py-3 text-muted small text-uppercase">Task Details</th>
                  <th className="border-0 py-3 text-muted small text-uppercase">Assigned To</th>
                  <th className="border-0 py-3 text-muted small text-uppercase">Priority</th>
                  <th className="border-0 py-3 text-muted small text-uppercase">Status</th>
                  <th className="border-0 py-3 text-muted small text-uppercase">Deadline</th>
                  <th className="border-0 py-3 text-muted small text-uppercase">Submitted At</th>
                  <th className="pe-4 border-0 py-3 text-muted small text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <ListTodo size={48} className="opacity-25 mb-2 d-block mx-auto" />
                      No tasks found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task._id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
                      <td className="ps-4">
                        <div className="fw-bold">{task.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{task.description}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle me-2 bg-light text-primary d-flex align-items-center justify-content-center rounded-circle" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                            {task.assignedTo?.name?.charAt(0) || '?'}
                          </div>
                          <span className="small">{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'} className="rounded-pill px-3">
                          {task.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={
                          task.status === 'Approved' ? 'success' :
                          task.status === 'Completed' ? 'primary' :
                          task.status === 'Rejected' ? 'danger' :
                          task.status === 'In Progress' ? 'info' : 'secondary'
                        } className="rounded-pill px-3">
                          {task.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center small">
                          <Calendar size={14} className="me-1 text-muted" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        {task.submissionDate ? (
                          <div className="d-flex align-items-center small text-success">
                            <CheckCircle2 size={14} className="me-1" />
                            {new Date(task.submissionDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-flex justify-content-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="rounded-circle p-1"
                            onClick={() => handleTaskClick(task)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                          {task.file && (
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="rounded-circle p-1"
                              as="a" 
                              href={`/uploads/${task.file}`} 
                              target="_blank"
                              title="View File"
                            >
                              <FileCheck size={16} />
                            </Button>
                          )}
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="rounded-circle p-1"
                            onClick={() => confirmDelete(task._id)}
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Task Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="border-0">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold">Create New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
          <Form onSubmit={handleCreateTask}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small text-muted text-uppercase fw-bold">Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter task title"
                    className="rounded-3 py-2"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small text-muted text-uppercase fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe the task..."
                    className="rounded-3"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small text-muted text-uppercase fw-bold">Assign To</Form.Label>
                  <Form.Select
                    className="rounded-3 py-2"
                    value={newTask.employeeId}
                    onChange={(e) => setNewTask({ ...newTask, employeeId: e.target.value })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => {
                      const activeCount = tasks.filter(t => t.assignedTo?._id === emp._id && t.status !== 'Completed').length;
                      const isBusy = activeCount >= 3;
                      return (
                        <option key={emp._id} value={emp.employeeId} disabled={isBusy}>
                          {emp.name} ({emp.employeeId}) - {activeCount} active {isBusy ? '(BUSY)' : '(FREE)'}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small text-muted text-uppercase fw-bold">Priority</Form.Label>
                  <Form.Select 
                    className="rounded-3 py-2"
                    value={newTask.priority} 
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small text-muted text-uppercase fw-bold">Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    className="rounded-3 py-2"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small text-muted text-uppercase fw-bold">Attach File (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    className="rounded-3 py-2"
                    onChange={(e: any) => setNewTask({ ...newTask, file: e.target.files[0] })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="rounded-pill px-4">
                Create Task
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3">
            <AlertCircle size={48} />
          </div>
          <h5 className="fw-bold mb-2">Delete Task?</h5>
          <p className="text-muted small mb-4">This action cannot be undone. Are you sure you want to delete this task?</p>
          <div className="d-grid gap-2">
            <Button variant="danger" className="rounded-pill" onClick={handleDeleteTask}>
              Yes, Delete Task
            </Button>
            <Button variant="light" className="rounded-pill" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Email Troubleshooting Modal */}
      <Modal show={showTroubleshootModal} onHide={() => setShowTroubleshootModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold">Email Troubleshooting</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="bg-light p-3 rounded-3 mb-4">
            <h6 className="fw-bold text-danger mb-2">Current Error:</h6>
            <div className="text-muted small font-monospace">{emailStatus?.error}</div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="fw-bold mb-3">Common Fixes for Gmail:</h6>
              <ul className="small text-muted ps-3">
                <li className="mb-2">
                  <strong>App Password:</strong> Use a 16-character app password instead of your regular password.
                  <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="d-block mt-1 text-primary">Generate App Password</a>
                </li>
                <li className="mb-2"><strong>2FA:</strong> Ensure 2-Step Verification is enabled on your account.</li>
                <li><strong>SMTP_FROM:</strong> Must match the Gmail address used in <code>SMTP_USER</code>.</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold mb-3">Configuration Details:</h6>
              <Table striped bordered hover size="sm" className="small">
                <tbody>
                  <tr><td><strong>Host</strong></td><td><code>{emailStatus?.details?.host || 'Not set'}</code></td></tr>
                  <tr><td><strong>Port</strong></td><td><code>{emailStatus?.details?.port || 'Not set'}</code></td></tr>
                  <tr><td><strong>User</strong></td><td><code>{emailStatus?.details?.user || 'Not set'}</code></td></tr>
                </tbody>
              </Table>
            </div>
          </div>
          
          <Button variant="primary" className="w-100 rounded-pill mt-4" onClick={() => setShowTroubleshootModal(false)}>
            Got it
          </Button>
        </Modal.Body>
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal 
        task={selectedTask}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        onUpdate={fetchData}
        isAdmin={true}
      />
    </Container>
  );
};

export default AdminDashboard;
