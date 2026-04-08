import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

const About = () => {
  useDocumentTitle('About');
  return (
    <div className="fade-in">
      {/* Header */}
      <header className="text-center" style={{ padding: '80px 0 60px 0', background: 'linear-gradient(rgba(253, 240, 240, 0.5), rgba(252, 248, 249, 1))' }}>
        <div className="container">
          <span style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--dark-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>
            The Artist Behind the Art
          </span>
          <h1 className="display-3 fw-bold mt-2">Ontmoet Diana</h1>
          <div className="gold-line"></div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-5 mb-5 text-center">
            <img 
              src="/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (10).jpeg" 
              alt="Diana" 
              style={{ width: '100%', maxWidth: '400px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
            />
          </div>
          <div className="col-lg-7">
            <h2 className="fw-bold mb-4">Passie voor Perfectie</h2>
            <p className="lead text-muted mb-4">
              Sinds ik mijn deuren opende, is mijn missie altijd hetzelfde gebleven: elke klant laten vertrekken met een glimlach en een gevoel van pure luxe.
            </p>
            <p className="mb-4 text-muted" style={{ lineHeight: '1.8' }}>
              Met meer dan 50 unieke sets en jarenlange ervaring in de nagelindustrie, combineer ik technische precisie met artistieke creativiteit. Of het nu gaat om een natuurlijke BIAB versteviging of een gedurfde full-set met custom nail art; ik neem de tijd voor elk detail.
            </p>

            <div className="row mt-5">
              <div className="col-6">
                <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: '20px', marginBottom: '30px' }}>
                  <h3 className="fw-bold text-gold" style={{ fontSize: '2.5rem' }}>50+</h3>
                  <p className="text-muted small" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Tevreden Klanten</p>
                </div>
              </div>
              <div className="col-6">
                <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: '20px', marginBottom: '30px' }}>
                  <h3 className="fw-bold text-gold" style={{ fontSize: '2.5rem' }}>100%</h3>
                  <p className="text-muted small" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Hygiëne & Passie</p>
                </div>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold)', marginTop: '20px', fontStyle: 'italic' }}>
              Diana – BeautyNails Diana
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Cards */}
      <section className="container py-5 mb-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Waarom BeautyNails Diana?</h2>
        </div>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="glass-panel" style={{ padding: '40px 20px', height: '100%' }}>
              <div style={{ color: 'var(--gold)', fontSize: '2rem', marginBottom: '15px' }}>✨</div>
              <h4 className="fw-bold mb-3">Kwaliteit</h4>
              <p className="text-muted">Ik werk uitsluitend met de beste producten om de gezondheid van jouw natuurlijke nagels te waarborgen.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="glass-panel" style={{ padding: '40px 20px', height: '100%' }}>
              <div style={{ color: 'var(--gold)', fontSize: '2rem', marginBottom: '15px' }}>💖</div>
              <h4 className="fw-bold mb-3">Persoonlijk</h4>
              <p className="text-muted">Geen lopende band werk. In mijn studio draait alles om jouw wensen en een moment van ontspanning.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="glass-panel" style={{ padding: '40px 20px', height: '100%' }}>
              <div style={{ color: 'var(--gold)', fontSize: '2rem', marginBottom: '15px' }}>🛡️</div>
              <h4 className="fw-bold mb-3">Hygiëne</h4>
              <p className="text-muted">Een schone werkomgeving en gesteriliseerde tools zijn voor mij de absolute basis van elke behandeling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: 'var(--dark-gold)', color: 'white', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 className="display-6 fw-bold mb-4">Klaar voor een transformatie?</h2>
          <Link to="/services" style={{ backgroundColor: 'white', color: 'var(--dark-gold)', padding: '15px 40px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
            Bekijk mijn services
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
