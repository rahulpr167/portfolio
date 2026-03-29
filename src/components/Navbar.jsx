import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar glass">
        <div className="logo">
          <a href="#home">Rahul<span>.</span></a>
        </div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" className="btn-primary">Get In Touch</a>
      </nav>
    </header>
  );
};

export default Navbar;
