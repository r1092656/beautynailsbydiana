import useDocumentTitle from '../hooks/useDocumentTitle';
import { useContent } from '../context/ContentContext';

// List of image numbers to remove
const removedImageNumbers = [1, 2, 3, 5, 7, 9, 10, 11, 16, 17, 22, 25, 28, 34, 43];

// Generate static numbered files 52 down to 1, filtered by removal list
const staticItems = Array.from({ length: 52 }, (_, i) => {
  const num = 52 - i;
  return {
    id: `static-${num}`,
    img: `/assets/portfolio/${num}.jpeg`,
    category: 'All',
    num
  };
}).filter(item => !removedImageNumbers.includes(item.num));

const Portfolio = () => {
  useDocumentTitle('Portfolio & Inspiratie', 'Bekijk het vakmanschap van Beauty Nails by Diana. Laat u inspireren door onze unieke nageldesigns en kwalitatieve afwerkingen.');
  const { getPortfolioItems } = useContent();
  
  const dynamicItems = getPortfolioItems().map(item => ({
    id: item.id,
    category: item.category,
    img: item.image,
    caption: item.caption
  }));

  // Logic: 2 most recent dynamic photos at top, then static numbered, then other dynamic
  const latestDynamic = dynamicItems.slice(0, 2);
  const otherDynamic = dynamicItems.slice(2);

  // Final list: 2 Latest Dynamic -> Static Numbered (52...1) -> Remaining Dynamic
  const allItems = [...latestDynamic, ...staticItems, ...otherDynamic];

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Portfolio</h1>
        <div className="gold-line"></div>
        <p className="lead">Bekijk hier een selectie van mijn werk, van de nieuwste creaties tot klassieke favorieten.</p>
      </div>

      <div className="row">
        {allItems.map(item => (
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
