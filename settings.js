module.exports = {
  pg: {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  },
  // In the robotoff repo, the robotoff/settings.py
  // contains an OFF_SERVER_DOMAIN which defaults to api.openfoodfacts.org
  offServerDomain: process.env.OFF_SERVER_DOMAIN || 'api.openfoodfacts.org',
};
