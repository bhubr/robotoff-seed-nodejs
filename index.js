// https://stackoverflow.com/q/37300997/
// pg-promise uses the env variables described in
// https://www.postgresql.org/docs/9.1/libpq-envars.html
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const settings = require('./settings');
const pgp = require('./helpers/pgp');
const cs = require('./helpers/column-set');
const mapJsonResponse = require('./helpers/map-json-response');

const db = pgp(settings.pg);

async function getDataFiles() {
  const allFiles = await fs.readdir('data');
  return allFiles.filter((f) => f.endsWith('.json'));
}

async function insertQuestions(questions) {
  // data input values:
  const values = mapJsonResponse(questions);

  // generating a multi-row insert query:
  const query = pgp.helpers.insert(values, cs);

  // executing the query:
  return db.none(query);
}

async function getExistingInsightIds() {
  const rows = await db.any('SELECT id FROM product_insight');
  return rows.map(({ id }) => id);
}

async function processFile(file, insightIds) {
  const filePath = path.join('data', file);
  const fileContents = await fs.readFile(filePath, 'utf8');
  const parsedContents = JSON.parse(fileContents);
  // Filter out insights that are already in DB
  const questions = parsedContents.questions.filter(
    q => {
      const alreadyExists = insightIds.includes(q.insight_id);
      const msg = alreadyExists ? chalk.yellow(`${q.insight_id} ALREADY EXISTS`) :  chalk.green(`${q.insight_id} NEW`)
      console.log(msg);
      return !alreadyExists;
    }
  );
  return questions.length > 0  ? insertQuestions(questions) : Promise.resolve();
}

async function processAllFiles() {
  const existingInsightIds = await getExistingInsightIds();
  const dataFiles = await getDataFiles();
  const promises = dataFiles.map((f) => processFile(f, existingInsightIds));
  await Promise.all(promises);
}

processAllFiles()
  .then(() => {
    console.log('Done!');
    process.exit();
  })
  .catch((err) => {
    console.error('Failed!', err);
    process.exit(1);
  });
