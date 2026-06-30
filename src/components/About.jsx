import "./About.css";
import profilePic from "../../media/rahulpr.jpeg";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="section-title">
        <h2>About Me</h2>
        <div className="line"></div>
      </div>

      <div className="about-card glass">
        <div className="about-image">
          <img src={profilePic} alt="Rahul Pr" className="profile-image" />
        </div>

        <div className="about-text">
          <p>
            Hello! I'm <strong>Rahul Pr</strong>, a Creative Visual Designer
            based in Mananthavady, India. I hold a BA in Multimedia and create
            impactful visual experiences that combine creativity with strategy.
          </p>

          <p>
            My expertise includes graphic design, UI/UX, branding, motion
            graphics, packaging, photography and video editing. I help brands
            communicate through clean, modern and meaningful visuals.
          </p>

          <h4>Core Skills</h4>

          <ul className="skills-list">
            <li>Social Media Design</li>
            <li>Print & Packaging</li>
            <li>UI/UX Design</li>
            <li>Motion Graphics</li>
            <li>Video Editing</li>
            <li>Photography</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;