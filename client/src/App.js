import Register from "./component/Register";
import Login from "./component/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Todo from "./component/Todo";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Todo" element={<Todo />} />
      </Routes>
    </Router>
  );
};

export default App;
