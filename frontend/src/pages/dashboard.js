import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/taskCard';
import {
    DragDropContext,
    Droppable,
    Draggable
  } from '@hello-pangea/dnd'; 
import socket from '../utils/socket.js';


export default function Dashboard() {
  const { user,token, logout } = useContext(AuthContext);
  const [tasks,setTasks] = useState([]);
  const [changelogs, setChangelogs] = useState([]);
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

    const fetchChangelogs = async () => {
        try {
          const res = await fetch('http://localhost:3001/v1/api/tasks/changelogs', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (!res.ok) throw new Error('Failed to fetch changelogs');
          const data = await res.json();
          setChangelogs(data);
        } catch (err) {
          console.error('Error fetching changelogs:', err);
        }
      };

    fetchTasks();
    fetchChangelogs();

    const handleChangedLogs = (newLog) => {
        console.log('New log received via socket:', newLog);
        setChangelogs(prevLogs => [newLog, ...prevLogs.slice(0, 19)]);
    };
    socket.on('changelogs', handleChangedLogs);

    // socket.on('connect', () => {
    //     console.log('Connected to socket:', socket.id);
    //   });

    return () => {
        socket.off('changelogs', handleChangedLogs);
      };
  }, [token]);

  useEffect(() => {
    console.log("changelogs updated:", changelogs);
  }, [changelogs]);

  const handleLogout = () => {
    logout();             
    navigate('/signup'); 
  };

  const statuses = ['Todo', 'In Progress', 'Done'];

  const groupedTasks = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map((task) =>
      task._id === draggableId ? { ...task, status: newStatus } : task
    );

    setTasks(updatedTasks);

    //update status api call
    try {
        const res = await fetch(`http://localhost:3001/v1/api/tasks/${draggableId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ newStatus })
        });
    
        if (!res.ok) {
          throw new Error('Failed to update status');
        }

      } catch (err) {
        console.error('Error updating status:', err);
      }

};
return(
    <>
    
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#4120a9',
        color: 'white',
        borderBottom: '1px solid #ccc'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Welcome, {user?.name}</h1>
          <p style={{ margin: 0, fontSize: '14px' }}>Email: {user?.email}</p>
        </div>
        <div style={{
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff'
  }}>
    Project: Real-Time To-Do Collaborative Board
  </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/create-task')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#43a047',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Create Task
          </button>
      
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    <div style={{ display: 'flex' }}>
        
        <div style={{
        width: '300px',
        borderRight: '1px solid #ccc',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ textAlign: 'center' }}>Recent Changes</h3>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FADADD' }}>
              <th style={cellStyle}>Task</th>
              <th style={cellStyle}>User</th>
              <th style={cellStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {changelogs.map((log, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{log.taskId?.title || 'N/A'}</td>
                <td style={cellStyle}>{log.userId?.name || 'N/A'}</td>
                <td style={cellStyle}>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    <div style={{ flex: 1, padding: '24px' }}>
      

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f8f8',
                    minHeight: '500px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: getHeaderColor(status),
                      color: getTextColor(status),
                      padding: '12px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    {status}
                  </div>
                  <div style={{ padding: '12px' }}>
                    {groupedTasks[status].map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} status={status} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
    </div>
    </>
);
}
const getHeaderColor = (status) => {
    switch (status) {
      case 'Todo':
        return '#e3f2fd';
      case 'In Progress':
        return '#fff3e0';
      case 'Done':
        return '#e8f5e9';
      default:
        return '#eeeeee';
    }
  };
  
  const getTextColor = (status) => {
    switch (status) {
      case 'Todo':
        return '#1565c0';
      case 'In Progress':
        return '#ef6c00';
      case 'Done':
        return '#2e7d32';
      default:
        return '#333';
    }
  };
  const cellStyle = {
    border: '1px solid #ccc',
    padding: '6px',
    textAlign: 'left'
  };