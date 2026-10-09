import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getDisabledServices, setServiceDisabledState } from '../utils/siteSettings';

const CATEGORIES = ['Gel Overlay', 'BIAB', 'Verlenging', 'Manicure', 'Pedicure'];

const SUB_SERVICES = {
  'Gel Overlay': ['Fill In', 'Fullset'],
  'BIAB': ['Fill In', 'Fullset'],
  'Verlenging': ['Fill In', 'Fullset'],
  'Manicure': ['Manicure', 'Manicure + Gellak', 'Spa Manicure', 'Spa Manicure + Gellak'],
  'Pedicure': ['Basis Pedicure', 'Basis Pedicure + Gellak', 'Basis Pedicure + Versteviging Gel', 'Basis Pedicure incl. Versteviging Gel + Gellak']
};

const AdminServicesControl = () => {
  const [disabledMap, setDisabledMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const map = await getDisabledServices();
    setDisabledMap(map);
    setIsLoading(false);
  };

  const toggleService = async (serviceName) => {
    const isCurrentlyDisabled = !!disabledMap[serviceName];
    const newDisabledState = !isCurrentlyDisabled;

    // Optimistic UI update
    setDisabledMap((prev) => {
      const next = { ...prev };
      if (newDisabledState) next[serviceName] = true;
      else delete next[serviceName];
      return next;
    });

    const updatedMap = await setServiceDisabledState(serviceName, newDisabledState);
    setDisabledMap(updatedMap);

    setStatusMsg(`Status van '${serviceName}' bijgewerkt naar: ${newDisabledState ? 'Niet beschikbaar 🔴' : 'Beschikbaar 🟢'}`);
    setTimeout(() => setStatusMsg(''), 3500);
  };

  return (
    <div className="fade-in">
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--soft-pink)', padding: '15px', borderRadius: '50%' }}>
            <Settings size={28} color="var(--gold)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Boeking Beheer (Service Beschikbaarheid)</h2>
            <p className="text-muted" style={{ margin: 0 }}>Schakel behandelingen in of uit. Uitgeschakelde services verschijnen rood/grijs in de boeking en kunnen niet geboekt worden.</p>
          </div>
        </div>

        {statusMsg && (
          <div style={{ backgroundColor: '#eef2ff', color: '#3730a3', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
            {statusMsg}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-gold">Instellingen laden...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Main Categories Section */}
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--gold)', borderBottom: '2px solid var(--soft-pink)', paddingBottom: '8px' }}>
                Hoofdcategorieën
              </h3>
              <div className="row">
                {CATEGORIES.map((cat) => {
                  const isDisabled = !!disabledMap[cat];
                  return (
                    <div key={cat} className="col-12 col-sm-6 col-md-4 mb-3">
                      <div style={{ 
                        border: isDisabled ? '2px solid #ef4444' : '1px solid #e5e7eb', 
                        backgroundColor: isDisabled ? '#fef2f2' : '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        transition: '0.2s'
                      }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '1rem', color: isDisabled ? '#991b1b' : 'var(--dark-text)' }}>{cat}</strong>
                          <span style={{ fontSize: '0.8rem', color: isDisabled ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                            {isDisabled ? '🔴 Niet beschikbaar' : '🟢 Beschikbaar'}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleService(cat)}
                          style={{
                            backgroundColor: isDisabled ? '#ef4444' : '#16a34a',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: '0.2s'
                          }}
                        >
                          {isDisabled ? 'Inschakelen' : 'Uitschakelen'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub Services Section */}
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--gold)', borderBottom: '2px solid var(--soft-pink)', paddingBottom: '8px' }}>
                Specifieke Behandelingen Per Categorie
              </h3>
              {Object.entries(SUB_SERVICES).map(([cat, subList]) => (
                <div key={cat} style={{ marginBottom: '20px', backgroundColor: 'rgba(255, 255, 255, 0.4)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--dark-text)', opacity: 0.8 }}>{cat} Opties:</h4>
                  <div className="row">
                    {subList.map((sub) => {
                      const fullKey = `${cat}:${sub}`;
                      const isDisabled = !!disabledMap[fullKey] || !!disabledMap[cat];
                      const isParentDisabled = !!disabledMap[cat];

                      return (
                        <div key={sub} className="col-12 col-md-6 mb-2">
                          <div style={{ 
                            border: isDisabled ? '1px solid #fca5a5' : '1px solid #eee', 
                            backgroundColor: isDisabled ? '#fff5f5' : '#ffffff',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ fontSize: '0.9rem', color: isDisabled ? '#b91c1c' : 'inherit', fontWeight: isDisabled ? '600' : 'normal' }}>
                              {sub} {isParentDisabled && <small style={{ color: '#dc2626' }}>(uit via categorie)</small>}
                            </span>
                            <button
                              disabled={isParentDisabled}
                              onClick={() => toggleService(fullKey)}
                              style={{
                                backgroundColor: isParentDisabled ? '#d1d5db' : (isDisabled ? '#ef4444' : '#e5e7eb'),
                                color: isParentDisabled ? '#6b7280' : (isDisabled ? 'white' : '#374151'),
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                cursor: isParentDisabled ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isDisabled ? 'Uitgeschakeld' : 'Actief'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServicesControl;
