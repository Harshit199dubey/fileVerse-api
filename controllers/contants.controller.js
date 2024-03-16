const {
  getGenders,
  getMaritalstatus,
} = require("../services/constants.service");

/** GET Methods */
/**
 * @openapi
 * '/api/getConstants':
 *  get:
 *     tags:
 *     - Constants
 *     summary: Get a Constants Data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
exports.getConstants = async (req, res) => {
  const result = await getGenders();
  const result1 = await getMaritalstatus();
  res.json({
    data: [
      {
        key: "gender",
        values: result,
      },
      {
        key: "maritalstatus",
        values: result1,
      },
    ],
  });
};
