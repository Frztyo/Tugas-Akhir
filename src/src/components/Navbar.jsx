// Navbar.jsx — Navigasi utama aplikasi dengan dukungan mobile
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const links = [
  { to: '/',           label: 'Beranda',  icon: '🏠' },
  { to: '/prediksi',   label: 'Prediksi', icon: '🧪' },
  { to: '/riwayat',    label: 'Riwayat',  icon: '📋' },
  { to: '/dashboard',  label: 'Dashboard',icon: '📊' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand / Logo */}
        <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">🧠</span>
          <span>StressMeter</span>
        </NavLink>

        {/* Desktop Links */}
        <ul className={`navbar-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setOpen(false)}
              >
                <span>{l.icon}</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger (Mobile) */}
        <button
          className="hamburger"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
