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

const response = {
  questions: [
    {
      barcode: '0848737007295',
      type: 'add-binary',
      value: 'Berries',
      question: 'Does the product belong to this category?',
      insight_id: 'aba0d459-ffdf-4b89-a7bd-6f37121695fd',
      insight_type: 'category',
    },
    {
      barcode: '3478920008524',
      type: 'add-binary',
      value: 'fr:pommes-dauphines-surgelees',
      question: 'Does the product belong to this category?',
      insight_id: '02c63e4e-5d91-49f5-bbf3-42d4ec3449f6',
      insight_type: 'category',
      source_image_url:
        'https://static.openfoodfacts.org/images/products/347/892/000/8524/front_fr.4.400.jpg',
    },
    {
      barcode: '7610809048429',
      type: 'add-binary',
      value: 'Sweet cream butters',
      question: 'Does the product belong to this category?',
      insight_id: 'fdae3aac-56d5-4e5d-898d-9ea189e62acf',
      insight_type: 'category',
      source_image_url:
        'https://static.openfoodfacts.org/images/products/761/080/904/8429/front_fr.9.400.jpg',
    },
  ],
};

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
