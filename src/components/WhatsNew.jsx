import { useState, useEffect, useCallback } from 'react';
import { useContent } from '../context/ContentContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WhatsNew = () => {
  const { getWhatsNew } = useContent();
  const items = getWhatsNew();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [items.length, nextSlide]);

  if (items.length === 0) return null;

  return (
    <section className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h2 className="display-5 text-gold">Wat is nieuw</h2>
        <div className="gold-line"></div>
        <p className="lead">Ontdek mijn nieuwste creaties van de afgelopen 48 uur.</p>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto', overflow: 'hidden', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          display: 'flex', 
          transform: `translateX(-${currentIndex * 100}%)`, 
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '500px'
        }}>
          {items.map((item) => (
            <div key={item.id} style={{ minWidth: '100%', position: 'relative' }}>
              <img 
                src={item.image} 
                alt={item.caption} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '0', 
                left: '0', 
                right: '0', 
                padding: '40px', 
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: 'white'
              }}>
                <span style={{ 
                  backgroundColor: 'var(--gold)', 
                  padding: '5px 15px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: '600',
                  marginBottom: '10px',
                  display: 'inline-block'
                }}>
                  {item.category}
                </span>
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)' }}>{item.caption}</h3>
              </div>
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '20px', 
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.3)',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)'
              }}
            >
              <ChevronLeft size={30} />
            </button>
            <button 
              onClick={nextSlide}
              style={{ 
                position: 'absolute', 
                top: '50%', 
                right: '20px', 
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.3)',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)'
              }}
            >
              <ChevronRight size={30} />
            </button>

            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              right: '20px', 
              display: 'flex', 
              gap: '10px' 
            }}>
              {items.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{ 
                    width: idx === currentIndex ? '30px' : '10px', 
                    height: '10px', 
                    backgroundColor: idx === currentIndex ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default WhatsNew;
