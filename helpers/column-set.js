const pgp = require('./pgp');

/* Sample query

insert into
  product_insight(
    id,barcode,type,value, data, latent, automatic_processing,
    unique_scans_n, reserved_barcode, source_image, server_domain
  )
  values(
   'e14a7a2b-6143-4e30-96fe-1453db3a416c', '8851013762490', 'brand', 'Tipco',
   '{}', true, false, 10, false, '/images/products/841/056/403/4380/1.400.jpg',
   'api.openfoodfacts.org'
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

module.exports = cs;
