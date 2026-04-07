import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--dark-bg)', color: 'var(--dark-text)', padding: '40px 0', marginTop: 'auto' }}>
      <div className="container text-center">
        <p style={{ margin: 0, opacity: 0.8 }}>Copyright &copy; BeautyNails Diana 2026. All rights reserved.</p>
        <p style={{ margin: '10px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>
          Laakdal, Belgium • Premium Nail Services
        </p>
        <div style={{ marginTop: '20px', fontSize: '0.75rem', opacity: 0.4 }}>
          <Link to="/admin/login" style={{ color: 'inherit', textDecoration: 'none' }}>Admin Login</Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
