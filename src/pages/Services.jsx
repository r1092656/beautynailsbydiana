import { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useBooking } from '../context/BookingContext';

const servicesList = [
  { id: 1, name: 'Nieuwe Set (Full Set)', desc: 'Verlenging van de natuurlijke nagels met tips of sjablonen, afgewerkt met gel of acryl naar keuze.', icon: '✨' },
  { id: 2, name: 'Bijvullen (Fill)', desc: 'Onderhoud van je kunstnagels na 3-4 weken. We werken de uitgroei bij en verfrissen de kleur.', icon: '🔄' },
  { id: 3, name: 'Luxe Manicure', desc: 'Verzorging van de nagelriemen, vijlen, handmassage en gellak finish voor zijdezachte handen.', icon: '💅' },
  { id: 4, name: 'Spa Pedicure', desc: 'Een heerlijk voetbad, eeltbehandeling en verzorging van de teennagels.', icon: '🌸' },
  { id: 5, name: 'Easy Nail Art', desc: 'Van handgeschilderde designs tot glitters en steentjes.', icon: '🎨' },
  { id: 6, name: 'Natural Nail Treatment (BIAB)', desc: 'Versteviging van de eigen nagel zonder verlenging.', icon: '🛡️' },
  { id: 7, name: 'Pedicure Met Gellak', desc: 'Pedicure behandeling inclusief langdurige gellak finish op de tenen.', icon: '👣' },
  { id: 8, name: 'Gel Verwijdering', desc: 'Veilig en professioneel verwijderen van kunstnagels zonder de natuurlijke nagel te beschadigen.', icon: '🧼' },
];

const Services = () => {
  useDocumentTitle('Services');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const { openModal } = useBooking();

  const toggleAccordion = (id) => {
    if (activeAccordion === id) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(id);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Onze Behandelingen</h1>
        <div className="gold-line"></div>
        <p className="lead">Professionele zorg voor je handen en voeten in een ontspannen sfeer.</p>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-5">
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}>
            <img src="/assets/portfolio/hero.jpeg" alt="Services" style={{ width: '100%', height: '500px', objectFit: 'cover' }} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-panel" style={{ padding: '20px' }}>
            {servicesList.map((service) => (
              <div key={service.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                  onClick={() => toggleAccordion(service.id)}
                >
                  <span>{service.icon} <span style={{ marginLeft: '10px' }}>{service.name}</span></span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--gold)', transition: '0.3s', transform: activeAccordion === service.id ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </div>
                
                {activeAccordion === service.id && (
                  <div className="fade-in" style={{ padding: '15px 0 10px 40px', color: 'var(--text-muted)' }}>
                    <p style={{ marginBottom: '15px' }}>{service.desc}</p>
                    <button className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.9rem' }} onClick={() => openModal(service.name)}>
                      Boek Nu
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Services;
