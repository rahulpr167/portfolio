import './SoftwareSkills.css';

const SoftwareSkills = () => {
  return (
    <section id="skills" className="software-skills-section">
      <h2 className="software-skills-header" style={{ fontFamily: 'var(--font-main)', fontSize: '2rem', color: '#fff', marginBottom: '25px', textAlign: 'center', fontWeight: '700' }}>Software Skills</h2>
      <div className="skills-container glass">
        
        <div className="icons-grid">
          <div className="adobe-icon ps">Ps</div>
          <div className="adobe-icon ai">Ai</div>
          <div className="adobe-icon ae">Ae</div>
          <div className="adobe-icon pr">Pr</div>
          <div className="adobe-icon xd">Xd</div>
          
          <div className="icons-row-2">
            <div className="adobe-icon id">Id</div>
            <div className="adobe-icon lr">Lr</div>
            <div className="icon-image figma">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" alt="Figma" />
            </div>
            <div className="icon-image acrobat">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" alt="Acrobat" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SoftwareSkills;
