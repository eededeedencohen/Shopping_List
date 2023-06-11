import { Link } from "react-router-dom";
import "./Toolbar.css";
function Toolbar() {
  return (
    <nav className="toolbar">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

export default Toolbar;
