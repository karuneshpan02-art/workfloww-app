import React, { useState } from 'react';
import { Modal, Button, Form, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Paperclip,
  ArrowRight
} from 'lucide-react';
import api from '../services/api.ts';

interface TaskDetailModalProps {
  task: any;
  show: boolean;
  onHide: () => void;
  onUpdate: () => void;
  isAdmin?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, show, onHide, onUpdate, isAdmin = false }) => {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      await api.put(`/tasks/${task._id}`, { note: newNote });
      setNewNote('');
      onUpdate();
    } catch (err) {
      console.error('Error adding note', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setLoading(true);
    try {
      await api.put(`/tasks/${task._id}`, { status });
      onUpdate();
    } catch (err) {
      console.error('Error updating status', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return <Badge bg="danger" className="rounded-pill px-3">High Priority</Badge>;
      case 'Medium': return <Badge bg="warning" className="rounded-pill px-3">Medium Priority</Badge>;
      default: return <Badge bg="info" className="rounded-pill px-3">Low Priority</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge bg="success" className="rounded-pill px-3">Approved</Badge>;
      case 'Completed': return <Badge bg="primary" className="rounded-pill px-3">Completed</Badge>;
      case 'Rejected': return <Badge bg="danger" className="rounded-pill px-3">Rejected</Badge>;
      case 'In Progress': return <Badge bg="info" className="rounded-pill px-3">In Progress</Badge>;
      default: return <Badge bg="secondary" className="rounded-pill px-3">Pending</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="task-detail-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center gap-2 mb-2">
            {getPriorityBadge(task.priority)}
            {getStatusBadge(task.status)}
          </div>
          <Modal.Title className="fw-bold h3">{task.title}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Row className="g-4">
          <Col lg={7}>
            <div className="mb-4">
              <h6 className="text-muted small text-uppercase fw-bold mb-3 d-flex align-items-center">
                <FileText size={16} className="me-2" />
                Description
              </h6>
              <div className="bg-light p-3 rounded-3 text-muted">
                {task.description}
              </div>
            </div>

            <div className="mb-4">
              <h6 className="text-muted small text-uppercase fw-bold mb-3 d-flex align-items-center">
                <MessageSquare size={16} className="me-2" />
                Activity & Notes
              </h6>
              <div className="notes-container bg-light rounded-3 p-3 overflow-auto" style={{ maxHeight: '250px' }}>
                {task.notes && task.notes.length > 0 ? (
                  <ListGroup variant="flush" className="bg-transparent">
                    {task.notes.map((n: any, i: number) => (
                      <ListGroup.Item key={i} className="bg-transparent border-0 px-0 pb-3">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          
                          {/* 🔥 UPDATED LABEL LOGIC */}
                          <span className="fw-bold small">
                            {n.sender && n.role
                              ? `${n.role === 'Employee' ? 'Initial Assignment' : 'Update'} - ${n.sender.name}`
                              :  i === 0
                                ? 'Initial Assignment'
                                : 'Update'}
                          </span>

                          <span className="extra-small text-muted">
                            {new Date(n.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="small text-muted">{n.message}</div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4 text-muted small">No updates yet.</div>
                )}
              </div>
              
              <Form onSubmit={handleAddNote} className="mt-3">
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Add a comment or update..."
                    className="rounded-pill bg-light border-0"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={loading}
                  />
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                    disabled={loading || !newNote.trim()}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </Form>
            </div>
          </Col>

          <Col lg={5}>
            <div className="bg-light rounded-4 p-4 h-100">
              <h6 className="text-muted small text-uppercase fw-bold mb-4">Task Information</h6>
              
              <div className="d-flex align-items-center mb-4">
                <div className="bg-white p-2 rounded-3 me-3 shadow-sm">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <div className="extra-small text-muted text-uppercase fw-bold">Assigned To</div>
                  <div className="fw-bold">{task.assignedTo?.name || 'Unassigned'}</div>
                  <div className="extra-small text-muted">{task.assignedTo?.employeeId || 'N/A'}</div>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-white p-2 rounded-3 me-3 shadow-sm">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <div className="extra-small text-muted text-uppercase fw-bold">Deadline</div>
                  <div className={`fw-bold ${new Date(task.deadline) < new Date() && task.status !== 'Completed' && task.status !== 'Approved' ? 'text-danger' : ''}`}>
                    {new Date(task.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {task.submissionDate && (
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-white p-2 rounded-3 me-3 shadow-sm">
                    <CheckCircle2 size={20} className="text-success" />
                  </div>
                  <div>
                    <div className="extra-small text-muted text-uppercase fw-bold">Submitted On</div>
                    <div className="fw-bold text-success">{new Date(task.submissionDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h6 className="extra-small text-muted text-uppercase fw-bold mb-3 d-flex align-items-center">
                  <Paperclip size={14} className="me-2" />
                  Attachments
                </h6>
                {task.file ? (
                  <Button 
                    variant="white" 
                    className="w-100 text-start border shadow-sm rounded-3 d-flex align-items-center p-2 mb-2"
                    as="a"
                    href={`/uploads/${task.file}`}
                    target="_blank"
                  >
                    <FileText size={20} className="text-primary me-2" />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-bold text-truncate">{task.file}</div>
                      <div className="extra-small text-muted">Click to view</div>
                    </div>
                    <ArrowRight size={16} className="text-muted" />
                  </Button>
                ) : (
                  <div className="text-muted small italic">No files attached.</div>
                )}
              </div>

              <div className="mt-auto pt-3">
                <h6 className="extra-small text-muted text-uppercase fw-bold mb-3">Quick Actions</h6>
                <div className="d-flex flex-wrap gap-2">
                  {isAdmin ? (
                    <>
                      {task.status === 'Completed' && (
                        <>
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="rounded-pill px-4"
                            onClick={() => handleStatusUpdate('Approved')}
                            disabled={loading}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="rounded-pill px-4"
                            onClick={() => handleStatusUpdate('Rejected')}
                            disabled={loading}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {task.status !== 'Completed' && task.status !== 'Approved' && task.status !== 'Rejected' && (
                        <div className="text-muted small italic">No approval actions available.</div>
                      )}
                      {(task.status === 'Approved' || task.status === 'Rejected') && (
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="rounded-pill px-3"
                          onClick={() => handleStatusUpdate('Pending')}
                          disabled={loading}
                        >
                          Reset to Pending
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {task.status !== 'Pending' && (
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="rounded-pill px-3"
                          onClick={() => handleStatusUpdate('Pending')}
                          disabled={loading}
                        >
                          Set Pending
                        </Button>
                      )}
                      {task.status !== 'In Progress' && (
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="rounded-pill px-3"
                          onClick={() => handleStatusUpdate('In Progress')}
                          disabled={loading}
                        >
                          Set In Progress
                        </Button>
                      )}
                      {task.status !== 'Completed' && task.status !== 'Approved' && (
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          className="rounded-pill px-3"
                          onClick={() => handleStatusUpdate('Completed')}
                          disabled={loading}
                        >
                          Mark Done
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-0 p-4 pt-0">
        <Button variant="light" className="rounded-pill px-4" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskDetailModal;