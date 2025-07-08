import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user,token, logout } = useContext(AuthContext);
  const [tasks,setTasks] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:3001/v1/api/tasks/getAlltasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await res.json();
        setTasks(data.tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();
  }, [token]);

  const handleLogout = () => {
    logout();             
    navigate('/signup'); 
  };

  const pillStyle = (bgColor, textColor) => ({
    backgroundColor: bgColor,
    color: textColor,
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    minWidth: 'fit-content'
  });

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
      <h2>Project Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
    {tasks.map((task) => (
      <div
        key={task._id}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          width: '250px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={pillStyle('#e0f7fa', '#00796b')}>{task.status}</span>
          <span style={pillStyle('#fff3e0', '#ef6c00')}>{task.priority}</span>
        </div>
  
        <h3 style={{ margin: '0 0 8px' }}>{task.title}</h3>
  
        <p style={{ fontSize: '14px', margin: '4px 0' }}>
          Assigned To: <strong>{task.assignedTo?.name || 'Unassigned'}</strong>
        </p>

        <p style={{ fontSize: '14px', margin: '4px 0' }}>
          Details: {task.description}
        </p>

        <p style={{ fontSize: '14px', margin: '4px 0' }}>
          Created By: {task.createdBy.name}
        </p>
        
        <p style={{ fontSize: '12px', color: '#666', marginTop: 'auto' }}>
          Created At: {new Date(task.createdAt).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
      )}
    </div>
  );
}