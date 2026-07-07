import useDocumentTitle from '../hooks/useDocumentTitle';

const Terms = () => {
  useDocumentTitle('Algemene Voorwaarden', 'Algemene voorwaarden en annuleringsbeleid van Beauty Nails by Diana.');

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Algemene Voorwaarden</h1>
        <div className="gold-line"></div>
        <p className="text-muted">Laatst bijgewerkt: juli 2026</p>
      </div>

      <div className="glass-panel" style={{ padding: '40px', lineHeight: '1.8' }}>
        <h3 className="text-gold mb-3">Afspraken maken</h3>
        <p>
          Afspraken kunnen online via de website of via telefoon/WhatsApp gemaakt worden. Na het boeken
          ontvang je een bevestiging per e-mail met de details van je afspraak.
        </p>

        <h3 className="text-gold mt-5 mb-3">Annuleren of verzetten</h3>
        <p>
          Kan je niet aanwezig zijn op je afspraak? Annuleer of verzet je afspraak dan zo snel mogelijk,
          en het liefst minstens 24 uur op voorhand, via e-mail, telefoon of WhatsApp. Zo geef je Diana de
          kans om die tijd aan een andere klant aan te bieden.
        </p>

        <h3 className="text-gold mt-5 mb-3">Te laat komen</h3>
        <p>
          Kom je meer dan 15 minuten te laat, dan kan de behandeltijd worden ingekort of kan de afspraak
          in overleg verplaatst worden, om andere klanten niet te laten wachten.
        </p>

        <h3 className="text-gold mt-5 mb-3">No-show</h3>
        <p>
          Als je zonder bericht niet komt opdagen, behoudt Diana zich het recht voor om je bij een
          volgende boeking te vragen de afspraak vooraf te bevestigen.
        </p>

        <h3 className="text-gold mt-5 mb-3">Reviews</h3>
        <p>
          Reviews worden geplaatst door klanten en geven hun persoonlijke ervaring weer. Reviews met
          ongepaste taal of inhoud worden niet gepubliceerd.
        </p>

        <h3 className="text-gold mt-5 mb-3">Vragen?</h3>
        <p>
          Heb je vragen over deze voorwaarden? Neem contact op via{' '}
          <a href="mailto:info@beautynailsbydiana.be" style={{ color: 'var(--gold)' }}>
            info@beautynailsbydiana.be
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Terms;
