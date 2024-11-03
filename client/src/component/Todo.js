import React, { useEffect, useState } from "react";
import axios from "axios";

const Todo = () => {
  const [todoslist, setTodosList] = useState([]);
  const [filteredTodos, setfilteredTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [message, setMessage] = useState("");
  const [editingTodo, setEditingTodo] = useState(null);
  const [updatedTodo, setUpdatedTodo] = useState("");
  const [updatedStatus, setUpdatedStatus] = useState(false);
  const [updatedDate, setUpdatedDate] = useState("");
  const [filter, setFilter] = useState("all");
  // const [messageColor, setMessageColor] = useState("");
  const [isSorted, setIsSorted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://todolist-reactapplication.onrender.com/todos",
        { todo: newTodo },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        }
      );
      console.log("message1", response.data.message);

      alert(response.data.message);
      setNewTodo(""); // Clear the input after successful submission
      fetchTodos(); // Fetch the updated todos
    } catch (error) {
      alert(
        "Error: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  // Function to fetch todos
  const fetchTodos = async () => {
    const token = localStorage.getItem("token"); // Get the JWT token from local storage

    try {
      const responseget = await axios.get(
        "https://todolist-reactapplication.onrender.com/todos",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        }
      );
      console.log("Full Response:", responseget);

      const todosFromResponse = responseget.data.todos || []; // Use optional chaining to avoid errors

      console.log("Todos Array:", todosFromResponse);
      setTodosList(todosFromResponse); // Set the state with the extracted todos
    } catch (error) {
      setMessage(
        "Error: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  const fetchTodosfilter = async (filter) => {
    const token = localStorage.getItem("token"); // Get the token from local storage

    try {
      // Build the URL based on the filter
      let url = "https://todolist-reactapplication.onrender.com/todos";
      if (filter === "completed") {
        url += "?completed=true";
      } else if (filter === "uncompleted") {
        url += "?completed=false";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      });

      setfilteredTodos(response.data.todos); // Set the filtered todos in state
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "all") {
      setfilteredTodos([]);
    } else if (newFilter === "sort") {
      setIsSorted(!isSorted);
      const sortedTodos = [...todoslist].sort((a, b) => {
        return isSorted
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      });
      setfilteredTodos(sortedTodos);
    } else {
      fetchTodosfilter(newFilter);
    }
  };

  // Choose display list based on filter
  const displayTodos = filter === "all" ? todoslist : filteredTodos;

  useEffect(() => {
    fetchTodos(); // Call fetchTodos when the component mounts
  }, []); // Use an empty dependency array to prevent infinite loop

  // Function to handle editing a todo
  const handleEdit = (todo) => {
    console.log("Todo to edit:", todo); // Lo
    setEditingTodo(todo);
    setUpdatedTodo(todo.todo);
    setUpdatedStatus(todo.complete);
    setUpdatedDate(todo.date);
  };

  const handleDelete = async (todoId) => {
    const token = localStorage.getItem("token"); // Get the token from local storage

    try {
      const response = await axios.delete(
        `https://todolist-reactapplication.onrender.com/todos/${todoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        }
      );
      alert(response.data.message);
      // Fetch the updated todos after deletion
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Function to update the todo
  const updateTodo = async () => {
    const token = localStorage.getItem("token"); // Get the token from local storage

    try {
      // Assuming editingTodo contains the user's ID and the todo ID
      await axios.put(
        `https://todolist-reactapplication.onrender.com/todos/${editingTodo._id}`, // Adjusted URL to include userId
        {
          todo: updatedTodo,
          completed: updatedStatus, // Ensure the key matches what your backend expects
          date: updatedDate, // This should also match the key in your backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the Authorization header
          },
        }
      );

      alert("Todo updated successfully"); // Show success message
      await fetchTodos();
      resetEditing(); // Reset editing state
    } catch (error) {
      alert(
        "Error: " +
          (error.response ? error.response.data.message : error.message)
      ); // Handle error message
    }
  };

  // Function to reset editing state
  const resetEditing = () => {
    setEditingTodo(null);
    setUpdatedStatus(false);
    setUpdatedDate("");
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-6"
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter your todo"
          required
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Todo
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </form>

      <div className="flex flex-wrap space-x-0 space-y-2 sm:space-x-2 sm:space-y-0 mb-4 w-full max-w-lg justify-center sm:justify-start">
        <button
          onClick={() => handleFilterChange("all")}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 flex-grow sm:flex-grow-0"
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange("completed")}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 flex-grow sm:flex-grow-0"
        >
          Completed
        </button>
        <button
          onClick={() => handleFilterChange("uncompleted")}
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 flex-grow sm:flex-grow-0"
        >
          Uncompleted
        </button>
        <button
          onClick={() => handleFilterChange("sort")}
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 flex-grow sm:flex-grow-0"
        >
          Sort by create date
        </button>
      </div>

      <div className="w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Your Todo List</h2>
        {displayTodos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600">
                  <th className="py-2 px-4 border-b border-gray-200 text-left">
                    Task
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 text-left">
                    Completed
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 text-left">
                    Date
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 text-left">
                    Edit
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 text-left">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayTodos.map((todo) => (
                  <tr key={todo._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b border-gray-200">
                      {todo.todo}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {todo.completed ? "Yes" : "No"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {new Date(todo.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        onClick={() => handleDelete(todo._id)}
                        className="text-blue-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No todos found</p>
        )}
      </div>

      {editingTodo && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg mt-6">
          <h3 className="text-lg font-bold mb-2">
            Editing Todo: {editingTodo.todo}
          </h3>
          <div className="flex flex-col">
            <label className="mb-1">Your task</label>
            <input
              type="text"
              value={updatedTodo}
              onChange={(e) => setUpdatedTodo(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg mb-4"
            />
            <label className="mb-1">Completed:</label>
            <select
              value={updatedStatus}
              onChange={(e) =>
                setUpdatedStatus(e.target.value === "true" ? "true" : "false")
              }
              className="border border-gray-300 p-2 rounded-lg mb-2"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
            <label className="mb-1">Date:</label>
            <input
              type="date"
              value={updatedDate.substring(0, 10)}
              onChange={(e) => setUpdatedDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg mb-4"
            />
            <button
              onClick={updateTodo}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={resetEditing}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todo;
