import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/taskCard';
import {
    DragDropContext,
    Droppable,
    Draggable
  } from '@hello-pangea/dnd'; 
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

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
    socket.on('taskCreated', (newTask) => {
        setTasks((prevTasks) => [...prevTasks, newTask]);
      });
    return () => {
        socket.off('taskCreated');
      };
  }, [token]);

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

};
return(
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>

      <h2>Project Tasks</h2> 
      <button
  onClick={() => navigate('/create-task')}
  style={{
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    marginBottom: '16px',
    cursor: 'pointer'
  }}
>
  + Create Task
</button>

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