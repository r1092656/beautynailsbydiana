import { Link } from 'react-router-dom';
import WhatsNew from '../components/WhatsNew';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useBooking } from '../context/BookingContext';
import './Home.css';

const Home = () => {
  useDocumentTitle('Professionele Nagelstudio Laakdal', 'Welkom bij Beauty Nails by Diana in Laakdal. Dé plek voor professionele nagelverzorging, BIAB, gellak en kunstnagels. Boek nu uw afspraak bij Diana.');
  const { openModal } = useBooking();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero fade-in">
        <div className="home-hero-blob"></div>
        <div className="container home-hero-inner">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4">
              <h1 className="display-3 fw-bold mb-4 home-heading">
                BeautyNails <br /><span className="home-accent">By Diana</span>
              </h1>
              <p className="lead mb-4 home-lead">
                Ervaar hoogwaardige nagelverzorging met een persoonlijke touch. Van klassieke behandelingen tot
                creatieve designs; elke sessie is erop gericht om je zelfverzekerd en ontspannen te laten voelen.
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-wine" onClick={() => openModal('')}>Boek Nu</button>
                <Link to="/contact" className="btn-wine-outline">Neem contact op</Link>
              </div>
            </div>
            <div className="col-lg-7 text-center">
              <div className="home-logo-blob">
                <img src="/assets/logo-navbar.png" alt="Beauty Nails by Diana logo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="home-divider"></div>
      </div>

      {/* Stats */}
      <section className="container home-stats fade-in">
        <div className="home-stat">
          <div className="home-stat-number">50+</div>
          <div className="home-stat-label">Tevreden Klanten</div>
        </div>
        <div className="home-stat-divider"></div>
        <div className="home-stat">
          <div className="home-stat-number">100%</div>
          <div className="home-stat-label">Hygiëne & Passie</div>
        </div>
        <div className="home-stat-divider"></div>
        <div className="home-stat">
          <div className="home-stat-number">2</div>
          <div className="home-stat-label">Locaties</div>
        </div>
      </section>

      {/* Editorial: Wat is Nieuw naast pull-quote */}
      <section className="home-editorial fade-in">
        <div className="container home-editorial-grid">
          <div className="home-editorial-media">
            <WhatsNew />
          </div>
          <div className="home-editorial-quote">
            <p>"Elke klant verdient een moment van pure verwennerij."</p>
            <Link to="/about">Lees meer over Diana</Link>
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section className="container home-services-teaser fade-in">
        <div className="home-services-eyebrow">Populaire behandelingen</div>
        <div className="home-services-grid">
          <Link to="/services" className="home-service-tile">
            <img src="/assets/portfolio/12.jpeg" alt="Manicure voorbeeld" loading="lazy" />
            <div className="home-service-tile-label">Manicure</div>
          </Link>
          <Link to="/services" className="home-service-tile">
            <img src="/assets/portfolio/20.jpeg" alt="Gel Overlay voorbeeld" loading="lazy" />
            <div className="home-service-tile-label">Gel Overlay</div>
          </Link>
          <Link to="/services" className="home-service-tile">
            <img src="/assets/portfolio/40.jpeg" alt="BIAB voorbeeld" loading="lazy" />
            <div className="home-service-tile-label">BIAB</div>
          </Link>
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="container my-5 fade-in">
        <div className="home-cta-banner">
          <h3 className="mb-3">Klaar voor prachtige nagels?</h3>
          <p style={{ opacity: 0.85, marginBottom: '25px' }}>Boek je afspraak in slechts 2 minuten met ons nieuwe reserveringssysteem.</p>
          <button className="btn-wine" onClick={() => openModal('')}>Start Bij boeken</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
