import { Link } from 'react-router-dom';
import AdsSection from './AdsSection';
import './Projects.css';

const Projects = () => {
  const projectList = [
    {
      title:       'Social Media Creatives',
      description: 'Designed engaging, brand-consistent creatives focusing on product promotion and digital engagement.',
      tech:        ['Graphic Design', 'Brand Identity', 'Marketing'],
      slug:        'social-media-creatives',
    },
    {
      title:       'Business Card Designs',
      description: 'Created distinctive business cards — minimal industrial for Stellar Constructions, elegant typography for a Wedding Media Company, and vibrant layouts for a Travel Agency.',
      tech:        ['Print Design', 'Typography', 'Layout'],
      slug:        'business-card-designs',
    },
    {
      title:       'Catalogue Designs',
      description: 'Developed visually appealing catalogues including a clean product catalogue for Imperion (Malaysia), a modern showcase for Salpido, and a cultural export catalogue for Ethnic Flavors.',
      tech:        ['Print Layout', 'Product Showcase', 'Editorial'],
      slug:        'catalogue-designs',
    },
    {
      title:       'Label Designs',
      description: 'Designed an Ethnic Flavors bottle label by combining traditional cultural aesthetics with a modern, eye-catching layout.',
      tech:        ['Labelling', 'Visual Aesthetic', 'Typography'],
      slug:        'label-designs',
    },
    {
      title:       'Packaging Designs',
      description: 'Developed structured packaging templates that enhance product presentation and maintain brand integrity.',
      tech:        ['Packaging', '3D Visualisation', 'Branding'],
      slug:        'packaging-designs',
    },
    {
      title:       'Motion Graphic Works',
      description: 'A collection of dynamic motion graphics showcasing visual storytelling, smooth animations, and engaging digital experiences.',
      tech:        ['After Effects', 'Animation', 'Visual Storytelling'],
      slug:        'motion-graphic-works',
    },
    {
      title:       'Video Editing Works',
      description: 'Professional video editing projects featuring seamless transitions, colour grading, and compelling narratives.',
      tech:        ['Premiere Pro', 'Video Production', 'Colour Grading'],
      slug:        'video-editing-works',
    },
    {
      title:       'Stationary Print Design',
      description: 'A curated collection of stationery print designs including letterheads, envelopes, notepads, and branded office essentials crafted with precision and aesthetic appeal.',
      tech:        ['Print Design', 'Branding', 'Layout'],
      slug:        'stationary-print-design',
    },
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="section-title">
        <h2>Ecommerce Listing Images</h2>
        <div className="line" />
      </div>

      <AdsSection />

      <div className="section-title">
        <h2>My Work</h2>
        <div className="line" />
      </div>

      <div className="projects-grid">
        {projectList.map((project, index) => {
          const cardContent = (
            <div className={`project-card${project.slug ? ' project-card--clickable' : ''}`}>
              {/* ── Info row ── */}
              <div className="project-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
              </div>

              {/* ── Footer row: tech + cta ── */}
              <div className="project-footer">
                <ul className="project-tech-list">
                  {project.tech.map((tech, i) => (
                    <li key={i} className="project-tech-badge">{tech}</li>
                  ))}
                </ul>

                {project.slug && (
                  <span className="view-gallery-label">
                    View Gallery
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12L12 2M12 2H5M12 2v7" />
                    </svg>
                  </span>
                )}
              </div>
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
