import useDocumentTitle from '../hooks/useDocumentTitle';
import './Prices.css';

// Design add-ons, BIAB and "verwijderen van gel" pricing are identical at
// both locations, so they're shared between the two lists below. Only
// Gel Overlay, Verlenging, Manicures and Andere differ per location.
const DESIGN_SECTION = {
  title: 'Design',
  items: [
    { name: 'Simpel design', desc: 'french, enkele stenen, one nail design...', price: '€ + 5' },
    { name: 'Medium design', desc: 'french met design, meerdere stenen, 2-3 nail design...', price: '€ + 10' },
    { name: 'Full design', desc: 'French met design + add ons, meerdere verschillende technieken, full charm nail, 3+ nail design...', price: '€ + 15' },
  ],
};

const BIAB_SECTION = {
  title: 'BIAB',
  columns: ['nieuwe set', 'opvullen'],
  items: [
    { name: 'Basic BIAB', prices: ['€45', '€40'] },
    { name: 'Basic BIAB incl. kleur/french', prices: ['€50', '€45'] },
  ],
};

const VERWIJDEREN_SECTION = {
  title: 'Verwijderen van gel',
  items: [
    { name: 'Verwijderen van gel overlay / pedicure', desc: 'verwijderen van ander salon of voor nieuwe set, na 3 opvullingen = nieuwe set verplicht', price: '€ + 10' },
    { name: 'Verwijderen van verlenging', desc: 'verwijderen van ander salon of voor nieuwe set, na 3 opvullingen = nieuwe set verplicht', price: '€ + 15' },
  ],
};

const ANDERE_SECTION = {
  title: 'Andere',
  items: [
    { name: 'Nagel correctie', desc: 'prijs na beoordeling van de nagels', price: '€ + .....' },
  ],
};

// Layout: left = Gel Overlay, Verlenging, Design.
// right = BIAB, Manicures, Verwijderen van gel. Andere at the bottom.
const LAAKDAL = {
  left: [
    {
      title: 'Gel Overlay',
      columns: ['nieuwe set', 'opvullen'],
      items: [
        { name: 'Basis gel', prices: ['€35', '€30'] },
        { name: 'Basis gel + kleur/french', prices: ['€40', '€35'] },
      ],
    },
    {
      title: 'Verlenging',
      columns: ['nieuwe set', 'opvullen'],
      items: [
        { name: 'Short (1&2)', prices: ['€45', '€40'] },
        { name: 'Medium (3&4)', prices: ['€55', '€50'] },
        { name: 'Long (5&6)', prices: ['€70', '€65'] },
      ],
    },
    DESIGN_SECTION,
  ],
  right: [
    BIAB_SECTION,
    {
      title: 'Manicures',
      items: [
        { name: 'Manicure', price: '€20' },
        { name: 'Manicure + gellak', price: '€25' },
        { name: 'Spa manicure', price: '€25' },
        { name: 'Spa manicure + gellak', price: '€30' },
      ],
    },
    VERWIJDEREN_SECTION,
  ],
  bottom: [ANDERE_SECTION],
};

const PEDICURE_SECTION = {
  title: 'Cosmetische Pedicure',
  items: [
    { name: 'Basis pedicure', desc: "Behandeling v.d. nagelriemen en velletjes, knippen en vijlen v.d. teennagels, nagelriemolie, transparante gelcoat naar keuze.", price: '€25' },
    { name: 'Basis pedicure incl. gellak', price: '€35' },
    { name: 'Basis pedicure incl. versteviging gel', price: '€40' },
    { name: 'Basis pedicure incl. versteviging gel + gellak/french', price: '€45' },
  ],
};

const PriceCategory = ({ section }) => (
  <div className="price-category">
    <div className="price-category-title">
      <span>{section.title}</span>
      {section.columns && (
        <span className="price-columns-labels">
          {section.columns.map((c) => <span key={c}>{c}</span>)}
        </span>
      )}
    </div>
    {section.items.map((item) => (
      <div className="price-row" key={item.name}>
        <div className="price-row-name">
          {item.name}
          {item.desc && <span className="price-row-desc">{item.desc}</span>}
        </div>
        {item.prices ? (
          <div className="price-row-values">
            {item.prices.map((p, i) => <span key={i}>{p}</span>)}
          </div>
        ) : (
          <div className="price-row-single">{item.price}</div>
        )}
      </div>
    ))}
  </div>
);

const Prices = () => {
  useDocumentTitle('Pricelist', 'Bekijk de pricelist van Beauty Nails by Diana in Laakdal: gel overlay, BIAB, verlenging, manicure, pedicure en meer.');
  const list = LAAKDAL;

  return (
    <div className="prices-page fade-in">
      <div className="container">
        <div className="prices-header">
          <h1 className="prices-brand">Beauty<span>nails</span></h1>
          <div className="prices-by">by Diana</div>
          <div className="prices-script-title">Price List</div>
        </div>

        <p className="prices-intro">
          Bekijk hieronder de actuele tarieven voor de behandelingen in Laakdal. Op speciale dagen zoals <strong>Kerstmis, Valentijn
          of jouw verjaardag</strong> kan er af en toe een leuke korting gelden. Twijfel je? Vraag gerust
          naar de mogelijkheden bij het boeken.<br /><br />
          <span style={{ fontSize: '0.9rem', color: '#7A2245', fontWeight: '600' }}>
            📍 Het exacte adres in Laakdal ontvang je automatisch in je bevestigingsmail na het boeken.
          </span>
        </p>

        <div className="prices-grid">
          <div>
            {list.left.map((section) => <PriceCategory section={section} key={section.title} />)}
          </div>
          <div>
            {list.right.map((section) => <PriceCategory section={section} key={section.title} />)}
          </div>
        </div>

        <div className="price-pedicure-wrap">
          <div className="prices-grid">
            <div>
              {list.bottom.map((section) => <PriceCategory section={section} key={section.title} />)}
            </div>
            <div>
              <PriceCategory section={PEDICURE_SECTION} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;
