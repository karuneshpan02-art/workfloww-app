import Task from '../models/Task.ts';
import User from '../models/User.ts';
import { Request, Response } from 'express';
import { sendEmail } from '../utils/email.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, employeeId, priority, deadline } = req.body;

  try {
    const employee = await User.findOne({ employeeId, role: 'Employee' });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const activeTasksCount = await Task.countDocuments({
      assignedTo: employee._id,
      status: { $nin: ['Completed', 'Approved'] }
    });

    if (activeTasksCount >= 3) {
      return res.status(400).json({ message: 'Employee is overloaded (3+ active tasks). Cannot assign more.' });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo: employee._id,
      priority,
      deadline,
    });

    if (req.file) {
      console.log(`File received for new task: ${req.file.filename}`);
      newTask.file = req.file.filename;
    }

    await newTask.save();

    await sendEmail(
      employee.email,
      'New Task Assigned',
      `Hello ${employee.name},\n\nA new task "${title}" has been assigned to you. Priority: ${priority}. Deadline: ${deadline}.\n\nPlease check your dashboard for details.`
    );

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role === 'Admin') {
      const tasks = await Task.find()
        .populate('assignedTo', 'name email employeeId')
        .populate('notes.sender', 'name role'); // 🔥 ADDED
      res.json(tasks);
    } else {
      const tasks = await Task.find({ assignedTo: req.user.id })
        .populate('assignedTo', 'name email employeeId')
        .populate('notes.sender', 'name role'); // 🔥 ADDED
      res.json(tasks);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  const { status, note, response } = req.body;
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (status) {
      task.status = status;
      if (status === 'Completed' || status === 'Approved') {
        task.submissionDate = new Date();
      }
    }

    // 🔥 UPDATED NOTES LOGIC
    if (note) {
      task.notes.push({
        message: note,
        sender: req.user.id,
        role: req.user.role,
        timestamp: new Date()
      });
    }

    if (response) {
      task.response = response;
      task.submissionDate = new Date();
    }

    if (req.file) {
      console.log(`File received for task update (${taskId}): ${req.file.filename}`);
      task.file = req.file.filename;
      task.submissionDate = new Date();
    }

    await task.save();

    if (response) {
      const admin = await User.findOne({ role: 'Admin' });
      if (admin) {
        await sendEmail(
          admin.email,
          'Task Response Submitted',
          `Employee ${req.user.name} (${req.user.employeeId}) has submitted a response for task "${task.title}".`
        );
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

// ✅ UPDATED LEADERBOARD (Completed + Approved separate)
export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('-password');

    const result = await Promise.all(
      employees.map(async (emp) => {
        const active = await Task.countDocuments({
          assignedTo: emp._id,
          status: { $nin: ['Completed', 'Approved'] }
        });

        const completed = await Task.countDocuments({
          assignedTo: emp._id,
          status: 'Completed'
        });

        const approved = await Task.countDocuments({
          assignedTo: emp._id,
          status: 'Approved'
        });

        return {
          ...emp.toObject(),
          active,
          completed,
          approved
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error });
  }
};