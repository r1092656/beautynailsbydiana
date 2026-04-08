import { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useContent } from '../context/ContentContext';

const staticPortfolioItems = [
  { id: 'p1', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-03-31 at 17.27.32.jpeg' },
  { id: 'p2', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (1).jpeg' },
  { id: 'p3', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (2).jpeg' },
  { id: 'p4', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (3).jpeg' },
  { id: 'p5', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (4).jpeg' },
  { id: 'p6', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (5).jpeg' },
  { id: 'p7', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (6).jpeg' },
  { id: 'p8', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (7).jpeg' },
  { id: 'p9', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41 (8).jpeg' },
  { id: 'p10', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.41.jpeg' },
  { id: 'p11', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (1).jpeg' },
  { id: 'p12', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (2).jpeg' },
  { id: 'p13', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (3).jpeg' },
  { id: 'p14', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (4).jpeg' },
  { id: 'p15', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (5).jpeg' },
  { id: 'p16', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (6).jpeg' },
  { id: 'p17', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (7).jpeg' },
  { id: 'p18', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (8).jpeg' },
  { id: 'p19', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (9).jpeg' },
  { id: 'p20', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (10).jpeg' },
  { id: 'p21', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (11).jpeg' },
  { id: 'p22', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42 (12).jpeg' },
  { id: 'p23', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.42.jpeg' },
  { id: 'p24', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (1).jpeg' },
  { id: 'p25', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (2).jpeg' },
  { id: 'p26', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (3).jpeg' },
  { id: 'p27', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (4).jpeg' },
  { id: 'p28', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (5).jpeg' },
  { id: 'p29', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (6).jpeg' },
  { id: 'p30', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (7).jpeg' },
  { id: 'p31', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (8).jpeg' },
  { id: 'p32', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (9).jpeg' },
  { id: 'p33', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (10).jpeg' },
  { id: 'p34', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (11).jpeg' },
  { id: 'p35', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43 (12).jpeg' },
  { id: 'p36', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.43.jpeg' },
  { id: 'p37', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (1).jpeg' },
  { id: 'p38', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (2).jpeg' },
  { id: 'p39', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (3).jpeg' },
  { id: 'p40', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (4).jpeg' },
  { id: 'p41', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (5).jpeg' },
  { id: 'p42', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (6).jpeg' },
  { id: 'p43', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (7).jpeg' },
  { id: 'p44', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (8).jpeg' },
  { id: 'p45', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (9).jpeg' },
  { id: 'p46', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (10).jpeg' },
  { id: 'p47', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (11).jpeg' },
  { id: 'p48', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44 (12).jpeg' },
  { id: 'p49', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.44.jpeg' },
  { id: 'p50', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (1).jpeg' },
  { id: 'p51', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (2).jpeg' },
  { id: 'p52', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (3).jpeg' },
  { id: 'p53', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (4).jpeg' },
  { id: 'p54', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (5).jpeg' },
  { id: 'p55', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (6).jpeg' },
  { id: 'p56', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (7).jpeg' },
  { id: 'p57', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (8).jpeg' },
  { id: 'p58', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (9).jpeg' },
  { id: 'p59', category: 'Pedicure', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (10).jpeg' },
  { id: 'p60', category: 'Gel Overlay', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45 (11).jpeg' },
  { id: 'p61', category: 'BIAB', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.45.jpeg' },
  { id: 'p62', category: 'Nail Art', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.46 (1).jpeg' },
  { id: 'p63', category: 'Full Set', img: '/assets/portfolio/WhatsApp Image 2026-04-06 at 17.23.46.jpeg' },
  { id: 'p64', category: 'Pedicure', img: '/assets/portfolio/page.jpg' },
];

const Portfolio = () => {
  useDocumentTitle('Portfolio');
  const [filter, setFilter] = useState('all');
  const { getPortfolioItems } = useContent();
  
  const dynamicItems = getPortfolioItems().map(item => ({
    id: item.id,
    category: item.category,
    img: item.image,
    caption: item.caption
  }));

  const allItems = [...dynamicItems, ...staticPortfolioItems];

  const filteredItems = filter === 'all' 
    ? allItems 
    : allItems.filter(item => item.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Mijn Werk</h1>
        <div className="gold-line"></div>
        <p className="lead">Een greep uit de 50+ sets die ik met passie heb gezet.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <button className={filter === 'all' ? 'btn-gold' : 'btn-outline-gold'} onClick={() => setFilter('all')}>Alles</button>
        <button className={filter === 'biab' ? 'btn-gold' : 'btn-outline-gold'} onClick={() => setFilter('biab')}>BIAB</button>
        <button className={filter === 'nail art' ? 'btn-gold' : 'btn-outline-gold'} onClick={() => setFilter('nail art')}>Nail Art</button>
        <button className={filter === 'fullset' ? 'btn-gold' : 'btn-outline-gold'} onClick={() => setFilter('fullset')}>Full Set</button>
        <button className={filter === 'pedicure' ? 'btn-gold' : 'btn-outline-gold'} onClick={() => setFilter('pedicure')}>Pedicure</button>
        <button className={filter === 'gel overlay' ? 'btn-gold' : 'btn-outline-gold'} onClick={() => setFilter('gel overlay')}>Gel Overlay</button>
      </div>

      <div className="row">
        {filteredItems.map(item => (
          <div key={item.id} className="col-6 col-md-4 col-lg-3 mb-4 fade-in">
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
              <img 
                src={item.img} 
                alt={item.caption || "Nagel Portfolio"} 
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} 
              />
              {item.caption && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  padding: '10px', 
                  background: 'rgba(255,255,255,0.9)', 
                  transform: 'translateY(100%)', 
                  transition: '0.3s',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }} className="portfolio-caption">
                  {item.caption}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Portfolio;
