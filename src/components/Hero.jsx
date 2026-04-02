import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h4 className="greeting">Hi, I'm</h4>
        <h1 className="name">Rahul Pr</h1>
        <h2 className="role">Creative Visual Designer.</h2>
        <p className="description">
          BA in Multimedia specializing in graphic design, UI/UX, motion graphics,
          packaging, photography, and video editing. Passionate about transforming
          ideas into impactful visual experiences.
        </p>
        <div className="hero-cta">
            <button
              className="btn-outline"
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Check out my work!
            </button>
          </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="glow-circle top"></div>
      <div className="glow-circle bottom"></div>
    </section>
  );
};

export default Hero;
