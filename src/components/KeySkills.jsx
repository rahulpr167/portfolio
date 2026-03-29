import './KeySkills.css';

const KeySkills = () => {
  const skills = [
    "Social Media Designing",
    "Print Designing",
    "Videography",
    "Package Designing",
    "Video Editing",
    "Motion Graphics",
    "Photography",
    "UI/UX Designing"
  ];

  return (
    <section id="key-skills" className="key-skills-section">
      <h2 className="key-skills-heading">Key Skills</h2>
      
      <div className="key-skills-box glass">
        <ul className="key-skills-list">
          {skills.map((skill, index) => (
            <li key={index} className="key-skill-item">
              <span className="bullet-point"></span>
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default KeySkills;
