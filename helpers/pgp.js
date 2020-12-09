const pgp = require('pg-promise')({
  capSQL: true, // capitalize all generated SQL
});

module.exports = pgp;
