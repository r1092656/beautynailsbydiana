import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="navbar-brand">
          <span className="text-gold">BEAUTYNAILS</span> DIANA
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={toggleMenu}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={toggleMenu}>About</Link>
          </li>
          <li className="nav-item">
            <Link to="/services" className={`nav-link ${isActive('/services')}`} onClick={toggleMenu}>Services</Link>
          </li>
          <li className="nav-item">
            <Link to="/portfolio" className={`nav-link ${isActive('/portfolio')}`} onClick={toggleMenu}>Portfolio</Link>
          </li>
          <li className="nav-item">
            <Link to="/reviews" className={`nav-link ${isActive('/reviews')}`} onClick={toggleMenu}>Reviews</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={toggleMenu}>Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;
