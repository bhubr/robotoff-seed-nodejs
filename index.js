// https://stackoverflow.com/q/37300997/
// pg-promise uses the env variables described in
// https://www.postgresql.org/docs/9.1/libpq-envars.html
require('dotenv').config();
const settings = require('./settings');

const pgp = require('pg-promise')({
  capSQL: true, // capitalize all generated SQL
});
const db = pgp(settings.pg);

/* Sample query

insert into
  product_insight(
    id,barcode,type,value, data, latent, automatic_processing,
    unique_scans_n, reserved_barcode, source_image
  )
  values(
   'e14a7a2b-6143-4e30-96fe-1453db3a416c', '8851013762490', 'brand', 'Tipco',
   '{}', true, false, 10, false, '/images/products/841/056/403/4380/1.400.jpg'
  );
*/

// our set of columns, to be created only once (statically), and then reused,
// to let it cache up its formatting templates for high performance:
const cs = new pgp.helpers.ColumnSet(
  [
    'id',
    'barcode',
    'type',
    'value',
    'data',
    'latent',
    'automatic_processing',
    'unique_scans_n',
    'reserved_barcode',
    'source_image',
    'server_domain',
  ],
  { table: 'product_insight' }
);

const rand = (max = 10) => Math.floor((max + 1) * Math.random());

function mapJsonResponseToColumns(questions) {
  return questions.map(
    ({
      insight_id: id,
      value,
      barcode,
      insight_type: type,
      source_image_url: source_image,
    }) => ({
      id,
      barcode,
      type,
      value,
      data: '{}',
      latent: false,
      automatic_processing: false,
      unique_scans_n: rand() + 1,
      reserved_barcode: false,
      source_image,
      server_domain: settings.offServerDomain
    })
  );
}

// data input values:
const values = mapJsonResponseToColumns([
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
]);

// generating a multi-row insert query:
const query = pgp.helpers.insert(values, cs);
console.log(query);
//=> INSERT INTO "tmp"("col_a","col_b") VALUES('a1','b1'),('a2','b2')

// executing the query:
db.none(query);
