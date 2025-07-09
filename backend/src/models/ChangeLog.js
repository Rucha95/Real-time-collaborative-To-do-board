import mongoose from 'mongoose';

const changeLogSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'added', 'edited', 'deleted', 'assigned', 'status_changed', 'drag_drop'
    fieldChanged: { type: String }, // e.g., 'title', 'description', 'status', 'assignedTo'
    oldValue: { type: mongoose.Schema.Types.Mixed }, // Stores old value, can be any type
    newValue: { type: mongoose.Schema.Types.Mixed }, // Stores new value, can be any type
    timestamp: { type: Date, default: Date.now },
    details: { type: String }, // More specific details about the change
});

export default mongoose.model('ChangeLog', changeLogSchema);