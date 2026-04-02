import { Link } from 'react-router-dom';
import './Navbar.css';

// Smooth-scrolls to a section by ID.
// Using onClick + e.preventDefault() keeps <a> tags (and their existing CSS)
// while avoiding HashRouter's # conflict.
const scrollTo = (e, id) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const Navbar = () => {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar glass">
        <div className="logo">
          <Link to="/">Rahul<span>.</span></Link>
        </div>

        <ul className="nav-links">
          <li><a href="#home"     onClick={(e) => scrollTo(e, 'home')}>Home</a></li>
          <li><a href="#about"    onClick={(e) => scrollTo(e, 'about')}>About</a></li>
          <li><a href="#skills"   onClick={(e) => scrollTo(e, 'skills')}>Skills</a></li>
          <li><a href="#projects" onClick={(e) => scrollTo(e, 'projects')}>Projects</a></li>
          <li><a href="#contact"  onClick={(e) => scrollTo(e, 'contact')}>Contact</a></li>
        </ul>

        <a href="#contact" className="btn-primary" onClick={(e) => scrollTo(e, 'contact')}>
          Get In Touch
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
