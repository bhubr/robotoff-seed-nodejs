# Robotoff DB seeder

> **Motivation**: seed a local Robotoff instance's database from JSON data obtained from the production instance

It runs bulk-insert queries with the minimal set of required fields, e.g.:

```sql
INSERT INTO
  product_insight(
    id,barcode,type,value, data, latent, automatic_processing,
    unique_scans_n, reserved_barcode, source_image, server_domain
  )
VALUES(
  'e14a7a2b-6143-4e30-96fe-1453db3a416c', '8851013762490', 'brand', 'Tipco',
  '{}', true, false, 10, false, '/images/products/841/056/403/4380/1.400.jpg',
  'api.openfoodfacts.org'
);
```

## Setup

* Install dependencies: `npm install`
* Copy `.env.sample` as `.env`
* Your local Robotoff instance must be up and running (See [Robotoff's README](https://github.com/openfoodfacts/robotoff#installation) for Docker Compose instructions)

## Get some data

Get some data from production Robotoff, save the raw JSON responses under `data`.

You can do that with your browser's network tab open, select an AJAX request to Robotoff and right-click => copy response, then save that response as a `.json` file in `data`.

## Run!

`node index` will read all data files in `data` dir and inject them into PostgreSQL db.