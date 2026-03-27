import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController.ts';
import User from '../models/User.ts';

const router = express.Router();

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ✅ Get all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});

// 🔥 DELETE employee
router.delete('/employee/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

// 🔥 UPDATE employee
router.put('/employee/:id', async (req, res) => {
  try {
    const { name, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error });
  }
});

export default router;