import './About.css';
import profilePic from '../../media/rahul copy copy.jpg';

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
            Hello! I'm Rahul Pr, a Creative Visual Designer based in Mananthavady, India.
            I hold a BA in Multimedia and am deeply passionate about transforming ideas into
            impactful visual experiences.
          </p>
          <p>
            My work spans across graphic design, UI/UX, motion graphics, packaging, photography,
            and video editing. I've had the privilege of designing engaging creatives, modern
            product catalogs, and elegant brand presentations for clients across various industries.
          </p>
          <p>Here are my core skills and areas of expertise:</p>
          <ul className="skills-list">
            <li>Social Media Design</li>
            <li>Print & Packaging Design</li>
            <li>UI/UX Design</li>
            <li>Video Editing</li>
            <li>Motion Graphics</li>
            <li>Photography & Videography</li>
          </ul>
        </div>

        <div className="about-image-container">
          <div className="about-image glass" style={{ overflow: 'hidden', padding: 0 }}>
            <img src={profilePic} alt="Rahul Pr" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
