import React from 'react';

const pillStyle = (bgColor, textColor) => ({
  backgroundColor: bgColor,
  color: textColor,
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '500',
});

const getCardColor = (status) => {
  switch (status) {
    case 'Todo':
      return '#e3f2fd'; 
    case 'In Progress':
      return '#fff8e1'; 
    case 'Done':
      return '#e8f5e9'; 
    default:
      return '#ffffff'; 
  }
};

const TaskCard = ({ task, status }) => {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        backgroundColor: getCardColor(status)
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={pillStyle('#e0f7fa', '#00796b')}>{task.status}</span>
        <span style={pillStyle('#fff3e0', '#ef6c00')}>{task.priority}</span>
      </div>

      <h4 style={{ margin: '4px 0' }}>{task.title}</h4>
      <p style={{ fontSize: '13px', margin: '2px 0' }}>Details:{task.description}</p>
      <p style={{ fontSize: '13px', margin: '2px 0' }}>
        Assigned To: <strong>{task.assignedTo?.name || 'Unassigned'}</strong>
      </p>
      <p style={{ fontSize: '11px', color: '#777' }}>
        Created At: {new Date(task.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default TaskCard;