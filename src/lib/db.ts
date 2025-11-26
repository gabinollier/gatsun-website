import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const defaultPricingData = {
  services: [
    {
      title: "Enregistrement",
      price: "15 €",
      frequency: "/h",
      vAvantagePrice: "8 €",
      description: "Enregistrement de votre morceau au studio.",
      features: [
        { text: "Ingé son étudiant", included: true },
        { text: "Prise de voix", included: true },
        { text: "Prise d'instruments", included: true },
        { text: "Matériel de qualité", included: true },
        { text: "Cabine traitée", included: true },
        { text: "Mixage / Mastering", included: false },
      ],
      popular: true,
    },
    {
      title: "Podcast",
      price: "7,50 €",
      frequency: "/demi-heure",
      vAvantagePrice: "4 €",
      description: "Idéal pour une exellente qualité sonore.",
      features: [
        { text: "Configuration multi-micros", included: true },
        { text: "Enregistrement haute qualité", included: true },
        { text: "Mixage / Mastering", included: false },
      ],
      popular: false,
    },
    {
      title: "Mixage / Mastering",
      price: "20 €",
      frequency: "/morceau**",
      vAvantagePrice: "10 €", 
      description: "Finalisation de votre morceau par un de nos membres.",
      features: [
        { text: "Mixage multi-pistes", included: true },
        { text: "Mastering pour les plateformes de streaming", included: true },
        { text: "3 révisions incluses", included: true }, 
      ],
      popular: false,
    },
  ],
  footnotes: [
    "*Tarif applicable sur présentation de la carte VAvantage de l'INSA Lyon uniquement.",
    "**Tarif indicatif, peut varier selon la complexité du projet."
  ]
};

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        "start" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        "end" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        members TEXT NOT NULL,
        repeat_weekly INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_event_exceptions (
        event_id INTEGER NOT NULL,
        occurrence_date TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
        CONSTRAINT pk_event_exception PRIMARY KEY (event_id, occurrence_date),
        FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ('pricing_data', $1)
      ON CONFLICT (key) DO NOTHING;
    `, [JSON.stringify(defaultPricingData)]);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events("start");
      CREATE INDEX IF NOT EXISTS idx_events_end ON calendar_events("end");
      CREATE INDEX IF NOT EXISTS idx_events_repeat ON calendar_events(repeat_weekly);

      CREATE INDEX IF NOT EXISTS idx_exceptions_event_id ON calendar_event_exceptions(event_id);
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};

initDb();

export default pool;