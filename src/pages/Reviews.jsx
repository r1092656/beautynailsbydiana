import { useState, useEffect } from 'react';
import { Star, AlertCircle, Quote, User, Clock, CheckCircle } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './Reviews.css';

const badWordsList = ['badword', 'offensive', 'hate', 'stupid', 'ugly', 'vulgar', 'insult', 'bitch', 'fuck', 'shit', 'ass', 'damn'];

const Reviews = () => {
  useDocumentTitle('Klantervaringen & Reviews', 'Lees wat anderen zeggen over Beauty Nails by Diana. Eerlijke reviews over onze nagelservices en klantvriendelijkheid.');
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
        { id: 1, name: 'Sarah', rating: 5, text: 'Absoluut dol op mijn nagels! Diana is een echte kunstenaar.', date: '12/04/2026', verified: true },
        { id: 2, name: 'Anoniem', rating: 5, text: 'Beste BIAB behandeling die ik ooit heb gehad. Zo ontspannend.', date: '10/04/2026', verified: true }
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
      setErrorMsg('Oeps! Je bericht bevat ongepaste taal. Laten we het netjes houden.');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: name.trim() === '' ? 'Anoniem' : name.trim(),
      rating: rating,
      text: text,
      date: new Date().toLocaleDateString('nl-BE'),
      verified: false
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('bn_reviews', JSON.stringify(updatedReviews));
    
    setName('');
    setRating(5);
    setText('');
  };

  return (
    <div className="reviews-container fade-in">
      <header className="reviews-header text-center mb-5">
        <h1 className="display-4 text-gold fw-bold mb-3">Ervaringen</h1>
        <div className="gold-line"></div>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Jouw schoonheid is mijn passie. Lees wat anderen over hun bezoek zeggen of deel jouw eigen ervaring.
        </p>
      </header>

      <div className="reviews-grid">
        {/* Sidebar Form */}
        <aside className="reviews-sidebar">
          <div className="review-form-card">
            <h3 className="form-title">Schrijf een Review</h3>
            
            {errorMsg && (
              <div className="alert-box mb-4">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="custom-form-group">
                <label className="custom-form-label">Naam (Optioneel)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Laat leeg voor Anoniem"
                  className="custom-input-field"
                />
              </div>

              <div className="custom-form-group">
                <label className="custom-form-label">Waardering</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      onClick={() => setRating(star)} 
                      fill={star <= rating ? 'var(--gold)' : 'none'} 
                      color={star <= rating ? 'var(--gold)' : '#e0e0e0'} 
                      size={28}
                      className="star-icon"
                    />
                  ))}
                </div>
              </div>

              <div className="custom-form-group">
                <label className="custom-form-label">Jouw Bericht</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="5"
                  placeholder="Hoe was je ervaring bij Diana?"
                  className="custom-input-field"
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-gold w-100 py-3 mt-2 fw-bold">
                Review Plaatsen
              </button>
            </form>
          </div>
        </aside>

        {/* Reviews List */}
        <main className="reviews-feed">
          {reviews.map((review, index) => (
            <div 
              key={review.id} 
              className="testimonial-card fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="quote-icon font-display" size={60} />
              
              <div className="card-header">
                <div className="user-info">
                  <div className="user-avatar">
                    <User color="var(--gold)" size={24} />
                  </div>
                  <div>
                    <h4 className="reviewer-name">{review.name}</h4>
                    {review.verified && (
                      <span className="verified-badge">
                        <CheckCircle size={10} style={{ marginRight: '4px' }} />
                        Geverifieerd
                      </span>
                    )}
                  </div>
                </div>
                <div className="review-date">
                  <Clock size={14} />
                  {review.date}
                </div>
              </div>

              <div className="mb-3 d-flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? 'var(--gold)' : 'none'} color={i < review.rating ? 'var(--gold)' : '#ddd'} />
                ))}
              </div>
              
              <p className="testimonial-text">
                {review.text}
              </p>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center py-5 glass-panel opacity-75">
              <Quote size={40} className="text-gold opacity-25 mb-3" />
              <p className="text-muted">Nog geen beoordelingen. Wees de eerste!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Reviews;
