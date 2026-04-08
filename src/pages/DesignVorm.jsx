import { useState, useRef } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useBooking } from '../context/BookingContext';

const shapes = [
  { id: 'round', title: "Rond (Round)", desc: "De meest natuurlijke vorm. Ideaal voor korte nagels en mensen die hun handen veel gebruiken.", features: ["Zeer sterk", "Natuurlijk", "Ideaal voor korte nagels"], img: "/assets/portfolio/shape-round.jpeg" },
  { id: 'oval', title: "Ovaal (Oval)", desc: "Een elegante, tijdloze vorm die je vingers langer doet lijken. Het is eigenlijk een verlengde ronde vorm.", features: ["Verlengend effect", "Elegant", "Tijdloos"], img: "/assets/portfolio/shape-oval.jpeg" },
  { id: 'square', title: "Vierkant (Square)", desc: "Helemaal recht afgevijld aan de bovenkant met scherpe hoeken. Heel populair voor een klassieke French manicure.", features: ["Strakke hoeken", "Klassiek", "Perfect voor French"], img: "/assets/portfolio/shape-square.jpeg" },
  { id: 'squoval', title: "Squoval", desc: "Een combinatie van square en oval. De rechte bovenkant van de vierkante nagel, maar de hoeken zijn zacht afgerond.", features: ["Beste van beide werelden", "Veelzijdig", "Zachte hoeken"], img: "/assets/portfolio/shape-squoval.jpeg" },
  { id: 'almond', title: "Amandel (Almond)", desc: "Slank aan de zijkanten en eindigend in een zachte punt. Super vrouwelijk en verlengend.", features: ["Vrouwelijk", "Verlengend", "Modern"], img: "/assets/portfolio/shape-almond.jpeg" },
  { id: 'stiletto', title: "Stiletto", desc: "De meest dramatische vorm. Zeer lang en eindigend in een vlijmscherpe punt.", features: ["Gewaagd", "Extreem lang", "Statement look"], img: "/assets/portfolio/shape-stiletto.jpeg" },
  { id: 'coffin', title: "Coffin / Ballerina", desc: "Deze vorm lijkt op een stiletto, maar dan met een afgeplatte punt.", features: ["Trendy", "Elegante punt", "Veel ruimte voor design"], img: "/assets/portfolio/shape-coffin.jpeg" },
  { id: 'lipstick', title: "Lipstick", desc: "De nagels worden in een asymmetrische hoek gevijld, precies zoals een nieuwe lippenstift eruitziet.", features: ["Uniek", "Artistiek", "Asymmetrisch"], img: "/assets/portfolio/shape-lipstick.jpeg" }
];

const DesignVorm = () => {
  useDocumentTitle('Design & Vorm');
  const { openModal } = useBooking();
  const [activeShape, setActiveShape] = useState(null);
  const detailRef = useRef(null);

  const handleSelectShape = (shape) => {
    setActiveShape(shape);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const closeDetail = () => {
    setActiveShape(null);
  };

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Vormen & Designs</h1>
        <div className="gold-line"></div>
        <p className="lead" style={{ maxWidth: '700px', margin: '0 auto' }}>
          Kies de perfecte vorm als basis en laat je inspireren door onze exclusieve nail art designs.
        </p>
      </div>

      <div className="row g-4" style={{ rowGap: '20px' }}>
        {shapes.map((shape) => (
          <div key={shape.id} className="col-6 col-md-4 col-lg-3">
            <div 
              style={{
                background: 'white', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                border: activeShape?.id === shape.id ? '2px solid var(--gold)' : '1px solid rgba(212, 175, 55, 0.1)',
                transition: '0.3s',
                boxShadow: activeShape?.id === shape.id ? '0 15px 30px rgba(0,0,0,0.1)' : 'none',
                transform: activeShape?.id === shape.id ? 'translateY(-5px)' : 'none'
              }}
              onClick={() => handleSelectShape(shape)}
            >
              <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>{shape.title.split(' ')[0]}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeShape && (
        <div ref={detailRef} className="glass-panel fade-in" style={{ padding: '40px', marginTop: '40px' }}>
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4 mb-lg-0">
            <div style={{ width: '100%', height: '350px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                <img src={activeShape.img} alt={activeShape.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="col-lg-7 ps-lg-5">
              <h2 className="text-gold mb-3">{activeShape.title}</h2>
              <p className="text-muted mb-4">{activeShape.desc}</p>
              
              <div className="mb-4">
                <h5 className="fw-bold mb-3">Kenmerken:</h5>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {activeShape.features.map((feat, idx) => (
                    <li key={idx} style={{ marginBottom: '10px' }}>✨ {feat}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-gold" onClick={() => openModal(activeShape.title)}>Boek deze stijl</button>
                <button className="btn-outline-gold" onClick={closeDetail}>Sluiten</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignVorm;
