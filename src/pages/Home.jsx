import { Link } from 'react-router-dom';
import WhatsNew from '../components/WhatsNew';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = () => {
  useDocumentTitle('Diana');
  const { openModal } = useBooking();

  return (
    <div>
      {/* Hero Section */}
      <section className="container py-5 mt-4 fade-in">
        <div className="row align-items-center">
          <div className="col-lg-5 mb-4">
            <h1 className="display-3 fw-bold mb-4">
              BeautyNails <br /><span className="text-gold">By Diana</span>
            </h1>
            <p className="lead mb-4">
              Ervaar hoogwaardige nagelverzorging met een persoonlijke touch. Van klassieke behandelingen tot
              creatieve designs; elke sessie is erop gericht om je zelfverzekerd en ontspannen te laten voelen.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-gold" onClick={() => openModal('')}>Boek Nu</button>
              <Link to="/contact" className="btn-outline-gold">Neem contact op</Link>
            </div>
          </div>
          <div className="col-lg-7 text-center">
            {/* The original app used an asset, we'll point to public/assets */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ position: 'absolute', top: '20px', left: '-20px', right: '20px', bottom: '-20px', border: '2px solid var(--gold)', borderRadius: '20px', zIndex: -1 }}></div>
              <img src="/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (10).jpeg" alt="BeautyNails Cover" style={{ width: '100%', maxWidth: '600px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Whats New Section (Automatic) */}
      <WhatsNew />

      {/* Booking Banner */}
      <section className="container my-5 fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass-panel text-center" style={{ padding: '50px 20px', background: 'var(--dark-bg)', color: 'var(--dark-text)', border: 'none' }}>
          <h3 className="mb-3">Klaar voor prachtige nagels?</h3>
          <p style={{ opacity: 0.8, marginBottom: '25px' }}>Boek je afspraak in slechts 2 minuten met ons nieuwe reserveringssysteem.</p>
          <button className="btn-gold" onClick={() => openModal('')}>Start Bij boeken</button>
        </div>
      </section>

      {/* Quick Links / Discover */}
      <section className="container py-5 fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="glass-panel" style={{ height: '100%', padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <h2 className="text-gold mb-3">Diensten</h2>
              <p className="text-muted mb-4 flex-grow-1">
                Ik bied diverse professionele nagelbehandelingen aan om je nagels gezond, sterk en prachtig afgewerkt te houden. Elke behandeling wordt uitgevoerd met precisie en zorg.
              </p>
              <Link to="/services" className="btn-outline-gold" style={{ width: 'fit-content' }}>Meer Info</Link>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="glass-panel" style={{ height: '100%', padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <h2 className="text-gold mb-3">Design & Vorm</h2>
              <p className="text-muted mb-4 flex-grow-1">
                Ik creëer elegante en moderne nageldesigns die passen bij jouw stijl. Van stiletto tot ovaal en klassiek French; elke look wordt tot in de puntjes verzorgd.
              </p>
              <Link to="/design" className="btn-outline-gold" style={{ width: 'fit-content' }}>Bekijk Werk</Link>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="glass-panel" style={{ height: '100%', padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <h2 className="text-gold mb-3">Portfolio</h2>
              <p className="text-muted mb-4 flex-grow-1">
                Bekijk hier een selectie van mijn werk, met diverse stijlen en afwerkingen. Neem ook een kijkje in mijn studio.
              </p>
              <Link to="/portfolio" className="btn-outline-gold" style={{ width: 'fit-content' }}>Bekijk Alles</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
