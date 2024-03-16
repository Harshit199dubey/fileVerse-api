const AuthService = require("../services/auth.service");
const jwtConfig = require("../config/jwt.config");
const bcryptUtil = require("../utils/bcrypt.util");

/** POST Methods */
/**
 * @openapi
 * '/api/um/register':
 *  post:
 *     tags:
 *     - User
 *     summary: Register new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - organization
 *               - gender
 *               - phoneNumber
 *               - dob
 *               - designation
 *               - maritalStatus
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               organization:
 *                 type: string
 *               password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *               gender:
 *                 type: number
 *               phoneNumber:
 *                 type: string
 *               designation:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               dob:
 *                 type: string
 *               maritalStatus:
 *                 type: number
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               phoneNumber: '9574637464'
 *               designation: fake
 *               organization: fake ORG
 *               gender: 0
 *               password: password1P@23
 *               dob: 1998-01-12
 *               maritalStatus: 0
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
exports.register = async (req, res) => {
  const isExist = await AuthService.findUserByEmail(req.body.email);
  if (isExist) {
    return res.status(400).json({
      message: "Email already exists.",
    });
  }
  const hashedPassword = await bcryptUtil.createHash(req.body.password);
  const userData = {
    ...req.body,
    password: hashedPassword,
  };
  const user = await AuthService.createUser(userData);
  return res.json({
    data: user,
    message: "User registered successfully.",
  });
};

/** POST Methods */
/**
 * @openapi
 * '/api/um/login':
 *  post:
 *     tags:
 *     - User
 *     summary: login user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *             example:
 *               email: fake@example.com
 *               password: password1P@23
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
exports.login = async (req, res) => {
  const user = await AuthService.findUserByEmail(req.body.email);
  if (user) {
    const isMatched = await bcryptUtil.compareHash(
      req.body.password,
      user.password,
    );
    if (isMatched) {
      const token = await AuthService.createToken(user);
      return res.json({
        access_token: token.token,
        refresh_token: token.refresh_token,
        token_type: "Bearer",
        expires_in: jwtConfig.ttl,
        refresh_token_expires_in: jwtConfig.ttl * 24,
      });
    }
  }
  return res.status(404).json({ message: "Unauthorized." });
};

/** GET Methods */
/**
 * @openapi
 * '/api/um/user':
 *  get:
 *     tags:
 *     - User
 *     summary: Get current user Info
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
exports.getUser = async (req, res) => {
  const user = await AuthService.findUserById(req.user.id);
  return res.json({
    data: user,
    message: "Success.",
  });
};
/** GET Methods */
/**
 * @openapi
 * '/api/um/logout':
 *  get:
 *     tags:
 *     - User
 *     summary: logout current user
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
exports.logout = async (req, res) => {
  await AuthService.logoutUser(req.token, req.user.exp);
  return res.json({ message: "Logged out successfully." });
};
/** POST Methods */
/**
 * @openapi
 * '/api/um/refreshToken':
 *  post:
 *     tags:
 *     - User
 *     summary: Refresh the user login token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNzEwNjA3NDM1LCJleHAiOjE3MTA2MTEwMzV9.PTZK7mVLXrxJorjsTtZ1LOyo0rgfT2NKFO1AxSg1bLc
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
exports.refreshToken = async (req, res) => {
  const token = await AuthService.refreshToken(req.body.refreshToken);
  return res.json({
    access_token: token.token,
    refresh_token: token.refresh_token,
    token_type: "Bearer",
    expires_in: jwtConfig.ttl,
    refresh_token_expires_in: jwtConfig.ttl * 24,
  });
};

/** POST Methods */
/**
 * @openapi
 * '/api/um/sendEmailVerificationOtp':
 *  post:
 *     tags:
 *     - User
 *     summary: Send email verification otp to user email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: email@verified.com
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
exports.sendEmailVerificationOtp = async (req, res) => {
  const sendOtp = await AuthService.sendEmailVerificationOtp(req.body.email);

  return res.json({
    message: sendOtp,
  });
};
