import { useState, useEffect } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const badWordsList = ['badword', 'offensive', 'hate', 'stupid', 'ugly', 'vulgar', 'insult', 'bitch', 'fuck', 'shit', 'ass', 'damn'];

const Reviews = () => {
  useDocumentTitle('Reviews');
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Load initial reviews from local storage, or default
  useEffect(() => {
    const saved = localStorage.getItem('bn_reviews');
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      setReviews([
        { id: 1, name: 'Sarah', rating: 5, text: 'Absolutely loved my nails! Diana is a true artist.', date: new Date().toLocaleDateString() },
        { id: 2, name: 'Anonymous', rating: 5, text: 'Best BIAB treatment I have ever had. So relaxing.', date: new Date().toLocaleDateString() }
      ]);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Simple profanity checker
    const containsBadWords = text.toLowerCase().split(/\s+/).some(word => 
      badWordsList.some(bad => word.includes(bad))
    );

    if (containsBadWords) {
      setErrorMsg('Your review could not be posted. If you had any issues with your experience, please contact us directly.');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: name.trim() === '' ? 'Anonymous' : name.trim(),
      rating: rating,
      text: text,
      date: new Date().toLocaleDateString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('bn_reviews', JSON.stringify(updatedReviews));
    
    // Reset form
    setName('');
    setRating(5);
    setText('');
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5 fade-in">
        <h1 className="display-5 text-gold">Customer Reviews</h1>
        <div className="gold-line"></div>
        <p className="lead">Read what our clients have to say about their experience, or leave your own review!</p>
      </div>

      <div className="row">
        {/* Submit Review Form */}
        <div className="col-lg-5 mb-5 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel p-4">
            <h3 className="mb-4">Leave a Review</h3>
            
            {errorMsg && (
              <div style={{ backgroundColor: '#fff0f0', borderLeft: '4px solid #ff4d4d', padding: '15px', marginBottom: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle color="#ff4d4d" />
                <p style={{ margin: 0, color: '#cc0000', fontSize: '0.9rem' }}>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name (Optional)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave blank for Anonymous"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div className="form-group mb-3">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rating</label>
                <div style={{ display: 'flex', gap: '5px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      onClick={() => setRating(star)} 
                      fill={star <= rating ? 'var(--gold)' : 'none'} 
                      color={star <= rating ? 'var(--gold)' : '#ccc'} 
                      size={28}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group mb-4">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Experience</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="4"
                  placeholder="Share your thoughts..."
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-gold w-100">Post Review</button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="col-lg-7 fade-in" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map(review => (
              <div key={review.id} className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ margin: 0, fontWeight: 'bold' }}>{review.name}</h5>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{review.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? 'var(--gold)' : 'none'} color={i < review.rating ? 'var(--gold)' : '#ccc'} />
                  ))}
                </div>
                <p style={{ margin: 0, lineHeight: '1.6' }}>"{review.text}"</p>
              </div>
            ))}
            
            {reviews.length === 0 && (
              <div className="text-center p-5 text-muted">
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reviews;
