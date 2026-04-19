import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  useDocumentTitle('Admin Login');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Verkeerd wachtwoord. Probeer het opnieuw.');
      setPassword('');
    }
  };

  return (
    <div className="container py-5 mt-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <div className="glass-panel text-center" style={{ padding: '40px 20px' }}>
            <div style={{ backgroundColor: 'var(--gold)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: 'white' }}>
              <Lock size={35} />
            </div>
            <h2 className="mb-4">Admin Login</h2>
            <p className="text-muted mb-5">Voer je wachtwoord in om toegang te krijgen tot het beheerpaneel.</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Wachtwoord" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '15px 25px', 
                    borderRadius: '50px', 
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  autoFocus
                />
              </div>
              
              {error && <p style={{ color: '#d9534f', fontSize: '0.9rem', marginBottom: '20px' }}>{error}</p>}
              
              <button type="submit" className="btn-gold" style={{ width: '100%' }}>Inloggen</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
