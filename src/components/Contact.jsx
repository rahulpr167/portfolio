import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <h2 className="contact-title">Get In Touch</h2>
      <p className="contact-desc">
        Although I'm not currently looking for any new opportunities, my inbox is
        always open. Whether you have a question or just want to say hi, I'll try
        my best to get back to you!
      </p>
      
      <div className="contact-glass glass">
        <a href="mailto:hello@rahul.com" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
          Say Hello
        </a>
      </div>
      
      <footer className="footer">
        <p>Built by Rahul with React & Vite.</p>
      </footer>
    </section>
  );
};

export default Contact;
