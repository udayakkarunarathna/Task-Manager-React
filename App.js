import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [filter, setFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingPriority, setEditingPriority] = useState("Low");

  // Fetch tasks from the backend API
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:3001/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Add a new task
  const addTask = async () => {
    if (newTask.trim() !== "") {
      const task = {
        id: Date.now().toString(), // Use a unique ID
        text: newTask,
        dueDate: dueDate,
        priority: priority,
        completed: false,
      };

      try {
        const response = await fetch("http://localhost:3001/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
        const data = await response.json();
        setTasks([...tasks, data]);
        setNewTask("");
        setDueDate("");
        setPriority("Low");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle task completion
  const toggleComplete = async (id) => {
    const task = tasks.find((task) => task.id === id);
    const updatedTask = { ...task, completed: !task.completed };

    try {
      const response = await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      const data = await response.json();
      setTasks(tasks.map((task) => (task.id === id ? data : task)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setEditingDueDate(task.dueDate);
    setEditingPriority(task.priority);
  };

  // Save edited task
  const saveEditing = async (id) => {
    console.log("id = " + id);
    const updatedTask = {
      text: editingText,
      dueDate: editingDueDate,
      priority: editingPriority,
    };

    try {
      // Try RESTful endpoint first
      let response = await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      // If RESTful endpoint fails, fallback to query parameter
      if (!response.ok) {
        console.warn(
          "RESTful endpoint failed, falling back to query parameter"
        );
        response = await fetch(`http://localhost:3001/tasks?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTasks(tasks.map((task) => (task.id === id ? data : task)));
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true; // 'all'
  });

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      <div className="task-input">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("incomplete")}>Incomplete</button>
      </div>
      <div className="task-table">
        <div className="task-row header">
          <div className="task-cell">Task</div>
          <div className="task-cell">Due Date</div>
          <div className="task-cell">Priority</div>
          <div className="task-cell">Actions</div>
        </div>
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`task-row ${task.completed ? "completed" : ""}`}
          >
            <div className="task-cell">
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
              ) : (
                <span onClick={() => toggleComplete(task.id)}>{task.text}</span>
              )}
            </div>
            <div className="task-cell">
              {editingTaskId === task.id ? (
                <input
                  type="date"
                  value={editingDueDate}
                  onChange={(e) => setEditingDueDate(e.target.value)}
                />
              ) : (
                <span>{task.dueDate}</span>
              )}
            </div>
            <div className="task-cell">
              {editingTaskId === task.id ? (
                <select
                  value={editingPriority}
                  onChange={(e) => setEditingPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <span>{task.priority}</span>
              )}
            </div>
            <div className="task-cell actions">
              {editingTaskId === task.id ? (
                <button onClick={() => saveEditing(task.id)}>Save</button>
              ) : (
                <>
                  <button onClick={() => startEditing(task)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
