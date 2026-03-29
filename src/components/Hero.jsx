import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h4 className="greeting">Hi, I'm</h4>
        <h1 className="name">Rahul</h1>
        <h2 className="role">I build things for the web.</h2>
        <p className="description">
          I'm a software engineer specializing in building exceptional digital experiences.
          Currently, I'm focused on building accessible, human-centered products.
        </p>
        <div className="hero-cta">
          <a href="#projects" className="btn-outline">Check out my work!</a>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="glow-circle top"></div>
      <div className="glow-circle bottom"></div>
    </section>
  );
};

export default Hero;
