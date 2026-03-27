import cron from 'node-cron';
import Task from '../models/Task.ts';
import User from '../models/User.ts';
import { sendEmail } from './email.ts';

export const startCronJobs = () => {
  // Runs daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily deadline monitoring CRON job...');
    const now = new Date();
    const tasks = await Task.find({ status: { $ne: 'Completed' } }).populate('assignedTo', 'name email employeeId');

    for (const task of tasks) {
      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const employee = task.assignedTo as any;

      if (diffDays === 1) {
        // Reminder (1 day before deadline)
        await sendEmail(employee.email, 'Task Reminder: 1 Day Left', `Hello ${employee.name},\n\nYour task "${task.title}" is due in 1 day. Please complete it soon.`);
      } else if (diffDays === 0) {
        // Reminder (deadline day)
        await sendEmail(employee.email, 'Task Reminder: Deadline Today', `Hello ${employee.name},\n\nYour task "${task.title}" is due today. Please submit it by end of day.`);
      } else if (diffDays === -1) {
        // Warning (1 day after deadline)
        await sendEmail(employee.email, 'Task Warning: Overdue', `Hello ${employee.name},\n\nYour task "${task.title}" is 1 day overdue. Please submit a response if you missed the deadline.`);
      } else if (diffDays <= -2) {
        // Final Warning (2+ days overdue) + Escalation
        await sendEmail(employee.email, 'Final Warning: Task Overdue', `Hello ${employee.name},\n\nYour task "${task.title}" is 2+ days overdue. This has been escalated to the Admin.`);
        
        const admin = await User.findOne({ role: 'Admin' });
        if (admin) {
          await sendEmail(admin.email, 'Escalation: Overdue Task', `Task "${task.title}" assigned to ${employee.name} (${employee.employeeId}) is 2+ days overdue.`);
        }
      }
    }
  });
};
