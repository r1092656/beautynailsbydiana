import { Link } from 'react-router-dom';

// Reusable consent checkbox for any form that collects personal data.
// Keeps styling/wording consistent across Contact, Booking and Reviews forms.
const ConsentCheckbox = ({ checked, onChange, id = 'consent' }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '20px',
        padding: '14px 16px',
        borderRadius: '10px',
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1px solid #eee',
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        style={{ marginTop: '4px', width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--gold)' }}
      />
      <label htmlFor={id} style={{ fontSize: '0.85rem', color: 'var(--dark-text)', lineHeight: '1.5', cursor: 'pointer' }}>
        Ik ga akkoord met de{' '}
        <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontWeight: 600 }}>
          privacyverklaring
        </Link>{' '}
        en de{' '}
        <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontWeight: 600 }}>
          algemene voorwaarden
        </Link>
        .
      </label>
    </div>
  );
};

export default ConsentCheckbox;
