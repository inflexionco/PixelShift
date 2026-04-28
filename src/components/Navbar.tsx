import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">PixelShift</NavLink>

      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          Convert
        </NavLink>
        <NavLink
          to="/batch"
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          Batch
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          History
        </NavLink>
      </div>

      <div className="navbar-icons">
        <button className="navbar-icon" title="Settings" aria-label="Settings">⚙</button>
        <button className="navbar-icon" title="Profile" aria-label="Profile">○</button>
      </div>
    </nav>
  )
}
