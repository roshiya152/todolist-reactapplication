import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://todolistreactapp-server.onrender.com/login", //https://todolistreactapp-server.onrender.com
        {
          username,
          password,
        }
      );

      // Handle successful login
      setMessage(response.data.message);
      setUsername("");
      setPassword("");
      setMessageColor("green");

      localStorage.setItem("token", response.data.token); // Save token for future use

      setTimeout(() => {
        navigate("/Todo");
      }, 1000);
    } catch (error) {
      setMessage(
        "Error: " +
          (error.response ? error.response.data.message : error.message)
      );
      setMessageColor("red");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded px-8 py-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full"
            >
              login
            </button>
          </div>
          {message && (
            <h1 style={{ color: messageColor }} className="mt-4 text-center">
              {message}
            </h1>
          )}

          <h1 className=" mt-3 flex items-center justify-center">
            Don't have an account?....{" "}
            <button
              className="bg-green-900  hover:bg-green-800 text-white font-bold py-0 px-1 rounded"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </h1>
        </form>
      </div>
    </div>
  );
};

export default Login;
