import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.ts';
import { Request, Response } from 'express';
import { sendEmail } from '../utils/email.ts';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    if (role === 'Employee') {
      // Generate Employee ID (EMP1001, EMP1002, etc.)
      const lastUser = await User.findOne({ role: 'Employee' }).sort({ createdAt: -1 });
      let employeeId = 'EMP1001';
      if (lastUser && lastUser.employeeId) {
        const lastId = parseInt(lastUser.employeeId.replace('EMP', ''));
        employeeId = `EMP${lastId + 1}`;
      }
      userData.employeeId = employeeId;
    }

    const newUser = new User(userData);
    await newUser.save();

    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to WorkFlow',
        `Hello ${name},\n\nWelcome to WorkFlow! Your account has been created successfully.\n\n${role === 'Employee' ? `Your Employee ID is: ${userData.employeeId}` : ''}\n\nYou can now log in to your dashboard.`
      );
    } catch (emailError) {
      console.error('Registration email failed to send:', emailError);
      // We don't fail the registration if only the email fails
    }

    res.status(201).json({ message: 'User registered successfully', employeeId: newUser.employeeId });
  } catch (error: any) {
    console.error('Registration Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, error });
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ 
        message: `Duplicate field error: ${Object.keys(error.keyValue).join(', ')} already exists.`, 
        error 
      });
    }

    res.status(500).json({ message: error.message || 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, employeeId: user.employeeId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, name: user.name, employeeId: user.employeeId });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

    await sendEmail(
      email,
      'Password Reset Request',
      `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    );

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error in forgot password', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};
