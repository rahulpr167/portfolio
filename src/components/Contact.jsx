import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <h2 className="contact-title">Get In Touch</h2>
      <p className="contact-desc">
        I am always open to discussing new projects, creative ideas, or opportunities to be part of your vision. Feel free to reach out!
      </p>
      
      <div className="contact-glass glass">
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Email:</strong> <a href="mailto:rahulpr167@gmail.com" style={{color: 'var(--accent)'}}>rahulpr167@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+919605224904" style={{color: 'var(--accent)'}}>+91 9605224904</a></p>
          <p><strong>Location:</strong> Mananthavady, India</p>
          <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/rahul-pr-" target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>linkedin.com/in/rahul-pr-</a></p>
        </div>
        <a href="mailto:rahulpr167@gmail.com" className="btn-primary" style={{ display: 'inline-block' }}>
          Say Hello
        </a>
      </div>
      
      <footer className="footer">
        <p>Built by Rahul Pr. Creative Visual Designer.</p>
      </footer>
    </section>
  );
};

export default Contact;
