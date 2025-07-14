import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import './createTaskForm.css';

export default function CreateTaskForm() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch user list to assign task
    const fetchUsers = async () => {
      const res = await fetch('http://localhost:3001/v1/api/users/getAllUsers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`http://localhost:3001/v1/api/tasks/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        priority,
        status,
        assignedTo:assignedTo === '' ? null :assignedTo,
      })
    });
    const data = await res.json();
    console.log('AssignedTo received in response:', data.task?.assignedTo);

    if (res.ok) {
      navigate('/dashboard');
    } else {
      const error = await res.json();
      alert(error.msg || 'Task creation failed');
    }
  };

  return (
   <>
 
    <div className="task-form-card">
      
       <h2 className="form-title">Create Task</h2> 
      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="form-input"
        />
  
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
          rows="3"
        />
  
        <div className="form-row">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-select"
          >
            <option disabled>Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
  
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select"
          >
            <option disabled>Status</option>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>
  
        <select
          value={assignedTo || ''}
          onChange={(e) => {
            const val = e.target.value;
            setAssignedTo(val === '' ? null : val);
          }}
          className="form-select"
        >
          <option value="">Assign to...</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
  
        <button type="submit" className="form-button">
          Create Task
        </button>
      </form>
    </div>
    </>
  );
  
  
}