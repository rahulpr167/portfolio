import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="section-title">
        <h2>About Me</h2>
        <div className="line"></div>
      </div>
      
      <div className="about-content">
        <div className="about-text glass">
          <p>
            Hello! I'm Rahul, a passionate software developer who enjoys creating
            things that live on the internet. My interest in web development started
            when I decided to try editing custom templates — turns out hacking
            together HTML & CSS taught me a lot about the web!
          </p>
          <p>
            Fast-forward to today, and I've had the privilege of building software
            that makes a difference. My main focus these days is building
            accessible, inclusive products and digital experiences.
          </p>
          <p>Here are a few technologies I've been working with recently:</p>
          <ul className="skills-list">
            <li>JavaScript (ES6+)</li>
            <li>React & Vite</li>
            <li>TypeScript</li>
            <li>Node.js</li>
            <li>HTML5 & CSS3</li>
            <li>Python</li>
          </ul>
        </div>
        
        <div className="about-image-container">
          <div className="about-image glass">
            {/* Visual placeholder for profile image */}
            <div className="image-overlay"></div>
            <span>R .</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
