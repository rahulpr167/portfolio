import './Projects.css';

const Projects = () => {
  const projectList = [
    {
      title: "Neon Chat App",
      description: "A real-time messaging platform with end-to-end encryption, built using WebSockets. Features a sleek dark mode and vibrant UI elements.",
      tech: ["React", "Node.js", "Socket.io"],
      link: "#"
    },
    {
      title: "Crypto Dashboard",
      description: "A customizable dashboard for tracking cryptocurrency prices, highlighting market trends using interactive D3.js charts.",
      tech: ["React", "D3.js", "API"],
      link: "#"
    },
    {
      title: "Portfolio Template",
      description: "A developer portfolio template focusing on minimal aesthetics, smooth animations, and high lighthouse performance scores.",
      tech: ["Vite", "JavaScript", "CSS"],
      link: "#"
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="section-title">
        <h2>Some Things I've Built</h2>
        <div className="line"></div>
      </div>

      <div className="projects-grid">
        {projectList.map((project, index) => (
          <div className="project-card glass" key={index}>
            <div className="project-top">
              <div className="folder-icon">
                <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <a href={project.link} className="external-link">
                <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
            <h3 className="project-title">{project.title}</h3>
            <p className="project-desc">{project.description}</p>
            <ul className="project-tech-list">
              {project.tech.map((tech, i) => (
                <li key={i}>{tech}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
