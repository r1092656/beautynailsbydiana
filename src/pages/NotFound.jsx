import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('Pagina niet gevonden');

  return (
    <div className="container py-5 text-center fade-in" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 className="display-3 text-gold fw-bold">404</h1>
      <p className="lead mb-4">Oeps, deze pagina bestaat niet (meer).</p>
      <div>
        <Link to="/" className="btn-gold">Terug naar de homepage</Link>
      </div>
    </div>
  );
};

export default NotFound;
