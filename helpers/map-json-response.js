const { offServerDomain } = require('../settings');

/**
 * Generates a random integer, up to max
 * @param {number} max
 */
const rand = (max = 10) => Math.floor((max + 1) * Math.random());

/**
 * Iterates an array of question objects and convert the fields
 * to the product_insight table column names, adding some in the process
 *
 * @param {array} questions
 */
function mapJsonResponse(questions) {
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
      server_domain: offServerDomain,
    })
  );
}

module.exports = mapJsonResponse;
