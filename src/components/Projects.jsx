import { Link } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
  const projectList = [
    {
      title: "Social Media Creatives",
      description: "Designed engaging and brand-consistent creatives for Salpido, focusing on product promotion and digital engagement.",
      tech: ["Graphic Design", "Brand Identity", "Marketing"],
      slug: "social-media-creatives"
    },
    {
      title: "Print Designs",
      description: "Extensive experience in creating high-quality print materials, ensuring visual consistency and brand alignment across various physical media.",
      tech: ["Print Media", "Layout", "Typography"],
      slug: null
    },
    {
      title: "Business Card Designs",
      description: "Created distinctive business cards: minimal industrial design for Stellar Constructions, elegant typography-focused cards for a Wedding Media Company, and vibrant layouts for a Travel Agency.",
      tech: ["Print Design", "Typography", "Layout"],
      slug: "business-card-designs"
    },
    {
      title: "Catalogue Designs",
      description: "Developed visually appealing catalogs including a clean product catalog for Imperion (Malaysia), a modern showcase for Salpido, and a cultural export catalog for Ethnic Flavors.",
      tech: ["Print Layout", "Product Showcase", "Editorial"],
      slug: "catalogue-designs"
    },
    {
      title: "Motion Graphic Works",
      description: "A collection of dynamic motion graphics showcasing visual storytelling, smooth animations, and engaging digital experiences.",
      tech: ["After Effects", "Animation", "Visual Storytelling"],
      slug: "motion-graphic-works"
    },
    {
      title: "Video Editing Works",
      description: "Professional video editing projects featuring seamless transitions, color grading, and compelling narratives for various platforms.",
      tech: ["Premiere Pro", "Video Production", "Color Grading"],
      slug: "video-editing-works"
    },
    {
      title: "Packaging Designs",
      description: "Developed structured packaging templates and materials that enhance product presentation and maintain brand integrity.",
      tech: ["Packaging", "3D Visualization", "Branding"],
      slug: "packaging-designs"
    },
    {
      title: "Label Designs",
      description: "Designed an Ethnic Flavors bottle label by combining traditional cultural aesthetics with a modern, eye-catching layout.",
      tech: ["Labeling", "Visual Aesthetic", "Typography"],
      slug: "label-designs"
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="section-title">
        <h2>My Work</h2>
        <div className="line"></div>
      </div>

      <div className="projects-grid">
        {projectList.map((project, index) => {
          const cardContent = (
            <div className={`project-card glass ${project.slug ? 'project-card--clickable' : ''}`}>
              <div className="project-top">
                <div className="folder-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                {project.slug && (
                  <span className="view-gallery-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </span>
                )}
              </div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <ul className="project-tech-list">
                {project.tech.map((tech, i) => (
                  <li key={i}>{tech}</li>
                ))}
              </ul>
              {project.slug && <span className="view-gallery-label">View Gallery →</span>}
            </div>
          );

          return project.slug ? (
            <Link
              to={`/projects/${project.slug}`}
              key={index}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              {cardContent}
            </Link>
          ) : (
            <div key={index}>{cardContent}</div>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
