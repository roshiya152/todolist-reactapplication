const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // Add jwt for generating tokens
require("dotenv").config();

const port = 8000;
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB connectivity
const cors = require("cors");
app.use(cors({ origin: "https://todolistreactapp-client.onrender.com" }));

// app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log("Server connected to port ", port);
});

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  todos: [
    {
      todo: { type: String, required: true },
      completed: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
    },
  ],
});

const userCollection = mongoose.model("User", userSchema);

module.exports = { userCollection };

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await userCollection.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // Return the token and a success message
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Error logging in" });
  }
});

// User Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Hash the password
    const newUser = new userCollection({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Get token from 'Bearer <token>'

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token not found, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded User ID:", decoded.userId);
    req.userId = decoded.userId; // Add userId to request object
    console.log("...........", req.userId);
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: "Token is not valid" });
  }
};

app.post("/todos", authenticateToken, async (req, res) => {
  const { todo } = req.body;
  const userId = req.userId; // Assuming you attach the user ID to the request in your authenticateToken middleware

  if (!todo) {
    return res.status(400).json({ message: "Todo content is required" });
  }

  try {
    const user = await userCollection.findOne({ _id: userId });
    console.log("message1user", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the new todo to the user's todos array
    user.todos.push({ todo, completed: false });

    // Save the updated user document
    await user.save();

    res.status(201).json({ message: "Todo created successfully", todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/todos", authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { completed } = req.query;
  try {
    const user = await userCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If "completed" query parameter is provided, filter by its value
    let todos = user.todos;
    if (completed === "true") {
      todos = todos.filter((todo) => todo.completed === true);
    } else if (completed === "false") {
      todos = todos.filter((todo) => todo.completed === false);
    } else {
      todos = user.todos;
    }
    res.status(200).json({ todos }); // Send the user's todos
  } catch (error) {
    res.status(500).json({ message: "Error fetching todos", error });
  }
});

app.put("/todos/:todoId", authenticateToken, async (req, res) => {
  const { todoId } = req.params; // Extract todoId from the URL parameters
  const { todo, completed, date } = req.body; // Get the updated data from the request body

  try {
    console.log("Request Body:", req.body);

    // Find the todo across all users (Assuming todos is an array in each user document)
    const user = await userCollection.findOne(
      { "todos._id": todoId },
      { "todos.$": 1 }
    );

    if (!user || user.todos.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Update the todo's properties
    const updatedTodo = user.todos[0];
    updatedTodo.todo = todo || updatedTodo.todo;
    updatedTodo.completed =
      completed !== undefined ? completed : updatedTodo.completed; // Only update if provided
    updatedTodo.date = date || updatedTodo.date; // Update date if provided

    // Save the updated user document
    await userCollection.updateOne(
      { "todos._id": todoId },
      { $set: { "todos.$": updatedTodo } } // Using $set to update the specific todo
    );

    res.status(200).json({
      message: "Todo updated successfully",
      todo: updatedTodo,
    });
  } catch (error) {
    console.error("Error updating todo:", error); // Log the error for debugging
    res.status(500).json({ message: "Error updating todo", error });
  }
});

app.delete("/todos/:todoId", authenticateToken, async (req, res) => {
  const { todoId } = req.params; // Get the todoId from the URL
  const userId = req.userId; // Get userId from authenticated user

  try {
    // Find the user and remove the todo by its todoId
    const user = await userCollection.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the todo that matches the todoId
    const updatedTodos = user.todos.filter(
      (todo) => todo._id.toString() !== todoId
    );

    // Update user's todos
    user.todos = updatedTodos;
    await user.save();

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
