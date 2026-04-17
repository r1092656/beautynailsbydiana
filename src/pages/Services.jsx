import useDocumentTitle from '../hooks/useDocumentTitle';
import { useBooking } from '../context/BookingContext';
import { 
  Sparkles, 
  PlusCircle, 
  RefreshCw, 
  ShieldCheck, 
  Hand, 
  Footprints, 
  Trash2, 
  Palette, 
  Brush,
  Layers,
  Heart
} from 'lucide-react';
import './Services.css';

const serviceCategories = [
  {
    title: 'Kunstnagels',
    icon: <Layers size={24} />,
    items: [
      { 
        name: 'Verlengen', 
        desc: 'Het langer maken van natuurlijke nagel met builder gel of polygel voor een elegante, verlengde look.', 
        icon: Sparkles 
      },
      { 
        name: 'Full Set', 
        desc: 'Een volledige nieuwe set nagels, perfect voor een complete transformatie en versteviging.', 
        icon: PlusCircle 
      },
      { 
        name: 'Fill Ins / Opvullen', 
        desc: 'Het professioneel bijwerken van uitgroei zonder dat een volledige nieuwe set nodig is.', 
        icon: RefreshCw 
      },
    ]
  },
  {
    title: 'Verzorging & Natuurlijk',
    icon: <Heart size={24} />,
    items: [
      { 
        name: 'Gel Overlay', 
        desc: 'Hoogwaardige gel op de natuurlijke nagel voor extra stevigheid en een prachtige glans.', 
        icon: ShieldCheck 
      },
      { 
        name: 'Manicure', 
        desc: 'Een complete verzorging van de natuurlijke nagels en nagelriemen voor een gezonde uitstraling.', 
        icon: Hand 
      },
      { 
        name: 'Pedicure met gel lak', 
        desc: 'Grondige verzorging van de voeten en nagels, afgewerkt met een duurzame gellak.', 
        icon: Footprints 
      },
      { 
        name: 'Verwijderen van gel', 
        desc: 'Veilig en professioneel verwijderen van (kunst)nagels met respect voor de natuurlijke nagel.', 
        icon: Trash2 
      },
    ]
  },
  {
    title: 'Art & Design',
    icon: <Palette size={24} />,
    items: [
      { 
        name: 'Easy Nail Art', 
        desc: 'Het tekenen van eenvoudige nail art voor een subtiel en uniek accent op je nagels.', 
        icon: Palette 
      },
      { 
        name: 'Design', 
        desc: 'Exclusieve toevoegingen en artistieke details bovenop de gelnails voor een signature look.', 
        icon: Brush 
      },
    ]
  }
];

const Services = () => {
  useDocumentTitle('Services');
  const { openModal } = useBooking();

  return (
    <div className="services-page fade-in">
      <div className="container">
        <header className="services-header">
          <h1 className="text-gold">Onze Behandelingen</h1>
          <div className="gold-line"></div>
          <p className="lead text-muted">Exclusieve zorg en creativiteit voor jouw perfecte nagels.</p>
        </header>

        {serviceCategories.map((category, index) => (
          <section key={index} className="category-section">
            <h2 className="category-title">
              {category.icon}
              {category.title}
            </h2>
            
            <div className="services-grid">
              {category.items.map((service, sIndex) => {
                const IconComponent = service.icon;
                return (
                  <div key={sIndex} className="service-card">
                    <div>
                      <div className="service-icon-wrapper">
                        <IconComponent size={32} />
                      </div>
                      <h3>{service.name}</h3>
                      <p className="service-description">{service.desc}</p>
                    </div>
                    
                    <div className="service-footer">
                      <button 
                        className="btn-book" 
                        onClick={() => openModal(service.name)}
                      >
                        Boek Nu
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Services;
