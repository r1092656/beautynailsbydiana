import useDocumentTitle from '../hooks/useDocumentTitle';

const Privacy = () => {
  useDocumentTitle('Privacyverklaring', 'Privacyverklaring van Beauty Nails by Diana: welke gegevens we verzamelen en hoe we ermee omgaan.');

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <h1 className="display-5 text-gold">Privacyverklaring</h1>
        <div className="gold-line"></div>
        <p className="text-muted">Laatst bijgewerkt: juli 2026</p>
      </div>

      <div className="glass-panel" style={{ padding: '40px', lineHeight: '1.8' }}>
        <p>
          Beauty Nails by Diana ("wij", "we" of "Diana") hecht veel waarde aan de bescherming van je
          persoonsgegevens. Deze verklaring legt uit welke gegevens we verzamelen wanneer je onze website
          bezoekt of gebruikt, waarom we dat doen, en welke rechten je hebt.
        </p>

        <h3 className="text-gold mt-5 mb-3">Welke gegevens verzamelen we?</h3>
        <p>
          Wanneer je een afspraak boekt via het boekingsformulier, verzamelen we je naam, e-mailadres,
          telefoonnummer, gekozen behandeling, locatie, datum en tijd, en eventueel een door jou geüploade
          inspiratiefoto. Wanneer je het contactformulier gebruikt, verzamelen we je naam, e-mailadres,
          eventueel telefoonnummer en je bericht. Wanneer je een review achterlaat, verzamelen we je naam
          (of "Anoniem" als je geen naam invult), je waardering en je tekst.
        </p>

        <h3 className="text-gold mt-5 mb-3">Waarom verzamelen we deze gegevens?</h3>
        <p>
          We gebruiken deze gegevens uitsluitend om je afspraak in te plannen en te bevestigen, om te
          reageren op je vragen via het contactformulier, en om reviews op de website te kunnen tonen. We
          gebruiken je gegevens niet voor marketingdoeleinden zonder je uitdrukkelijke toestemming, en we
          verkopen of delen je gegevens niet met derden voor commerciële doeleinden.
        </p>

        <h3 className="text-gold mt-5 mb-3">Waar worden je gegevens opgeslagen?</h3>
        <p>
          Je gegevens worden veilig opgeslagen in onze database (Supabase, met servers binnen de EU) en,
          voor het versturen van bevestigingsmails, verwerkt door onze e-maildienst (Resend). Beide
          partijen zijn verplicht om zorgvuldig met je gegevens om te gaan.
        </p>

        <h3 className="text-gold mt-5 mb-3">Cookies</h3>
        <p>
          Deze website gebruikt geen niet-noodzakelijke trackingcookies of advertentiecookies. Enkel
          technische, functioneel noodzakelijke gegevens (zoals je sessie in het beheerpaneel) worden
          lokaal bijgehouden.
        </p>

        <h3 className="text-gold mt-5 mb-3">Hoe lang bewaren we je gegevens?</h3>
        <p>
          We bewaren je gegevens niet langer dan nodig is voor de hierboven beschreven doeleinden, of zo
          lang als wettelijk vereist is (bijvoorbeeld voor boekhoudkundige verplichtingen).
        </p>

        <h3 className="text-gold mt-5 mb-3">Jouw rechten</h3>
        <p>
          Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen. Ook
          kan je bezwaar maken tegen de verwerking van je gegevens. Neem hiervoor contact met ons op via{' '}
          <a href="mailto:info@beautynailsbydiana.be" style={{ color: 'var(--gold)' }}>
            info@beautynailsbydiana.be
          </a>
          . Je hebt ook het recht om een klacht in te dienen bij de Gegevensbeschermingsautoriteit (GBA) in
          België.
        </p>

        <h3 className="text-gold mt-5 mb-3">Contact</h3>
        <p>
          Vragen over deze privacyverklaring? Neem gerust contact op via{' '}
          <a href="mailto:info@beautynailsbydiana.be" style={{ color: 'var(--gold)' }}>
            info@beautynailsbydiana.be
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Privacy;
