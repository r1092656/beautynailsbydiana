import { useState, useEffect } from 'react';
import { Star, AlertCircle, Quote, User, Clock } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const badWordsList = ['badword', 'offensive', 'hate', 'stupid', 'ugly', 'vulgar', 'insult', 'bitch', 'fuck', 'shit', 'ass', 'damn'];

const Reviews = () => {
  useDocumentTitle('Beoordelingen');
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    const saved = localStorage.getItem('bn_reviews');
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      setReviews([
        { id: 1, name: 'Sarah', rating: 5, text: 'Absoluut dol op mijn nagels! Diana is een echte kunstenaar.', date: '12/04/2026' },
        { id: 2, name: 'Anoniem', rating: 5, text: 'Beste BIAB behandeling die ik ooit heb gehad. Zo ontspannend.', date: '10/04/2026' }
      ]);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const containsBadWords = text.toLowerCase().split(/\s+/).some(word => 
      badWordsList.some(bad => word.includes(bad))
    );

    if (containsBadWords) {
      setErrorMsg('Je beoordeling kon niet worden geplaatst. Neem voor problemen direct contact met ons op.');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: name.trim() === '' ? 'Anoniem' : name.trim(),
      rating: rating,
      text: text,
      date: new Date().toLocaleDateString('nl-BE')
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('bn_reviews', JSON.stringify(updatedReviews));
    
    setName('');
    setRating(5);
    setText('');
  };

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-4 text-gold mb-3">Klantenbeoordelingen</h1>
        <div className="gold-line"></div>
        <p className="lead text-muted max-width-600 mx-auto">
          Lees de ervaringen van onze klanten of deel je eigen mening over je bezoek aan de studio.
        </p>
      </div>

      <div className="row g-5">
        {/* Submit Review Form */}
        <div className="col-lg-4">
          <div className="glass-panel p-4" style={{ position: 'sticky', top: '100px' }}>
            <h3 className="h4 mb-4 fw-bold">Schrijf een Beoordeling</h3>
            
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                <AlertCircle size={18} />
                <div style={{ fontSize: '0.9rem' }}>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-uppercase mb-2">Naam (Optioneel)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Laat leeg voor Anoniem"
                  className="form-control custom-input"
                  style={{ borderRadius: '12px', padding: '12px' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-uppercase mb-2">Waardering</label>
                <div className="d-flex gap-1 rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      onClick={() => setRating(star)} 
                      fill={star <= rating ? 'var(--gold)' : 'none'} 
                      color={star <= rating ? 'var(--gold)' : '#dee2e6'} 
                      size={24}
                      style={{ cursor: 'pointer', transition: '0.2s transform' }}
                      className="star-hover"
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-uppercase mb-2">Jouw Ervaring</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="4"
                  placeholder="Deel je ervaring..."
                  className="form-control custom-input"
                  required
                  style={{ borderRadius: '12px', padding: '12px', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-gold w-100 py-3 fw-bold">
                Plaats Beoordeling
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            {reviews.map((review, index) => (
              <div 
                key={review.id} 
                className="review-card glass-panel p-4 fade-in" 
                style={{ 
                  borderRadius: '20px', 
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', backgroundColor: 'var(--soft-pink)', borderRadius: '50%' }}>
                      <User size={20} color="var(--gold)" />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{review.name}</h5>
                      <div className="d-flex align-items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? 'var(--gold)' : 'none'} color={i < review.rating ? 'var(--gold)' : '#dee2e6'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-muted d-flex align-items-center gap-1 small">
                    <Clock size={14} />
                    {review.date}
                  </div>
                </div>
                
                <div className="position-relative">
                  <Quote size={40} className="position-absolute opacity-05" style={{ top: '-10px', left: '-10px', color: 'var(--gold)', opacity: 0.1 }} />
                  <p className="mb-0 fs-5 ps-3 py-2" style={{ fontStyle: 'italic', color: '#444' }}>
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
            
            {reviews.length === 0 && (
              <div className="text-center py-5 glass-panel" style={{ borderRadius: '20px' }}>
                <Quote size={48} className="text-gold opacity-25 mb-3" />
                <p className="text-muted">Nog geen beoordelingen. Deel als eerste jouw ervaring!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
