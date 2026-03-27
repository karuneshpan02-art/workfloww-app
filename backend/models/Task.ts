import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Approved', 'Rejected'], default: 'Pending' },

  // 🔥 UPDATED NOTES STRUCTURE
  notes: [
    {
      message: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String, // 'Admin' or 'Employee'
      },
      timestamp: { type: Date, default: Date.now }
    }
  ],

  file: { type: String },
  response: { type: String },
  submissionDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);