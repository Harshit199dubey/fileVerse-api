// import swaggerJsdoc from 'swagger-jsdoc'

const  swaggerJSDoc  = require("swagger-jsdoc");
const swaggerUi = require('swagger-ui-express');
const { version } = require('./package.json');

const swaggerDef = {
    openapi: '3.0.0',
    info: {
      title: 'FileVerse',
      version,
      license: {
        name: 'MIT',
        url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
      },
    },
    servers: [
      {
        url: `/`,
      },
    ],
  };
const options =  ['./*.yml','./router/*.js', './controllers/*.js'];

const swaggerSpec = swaggerJSDoc({
    definition: swaggerDef,
    apis: options,
  });
function swaggerDocs(app, port) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve);
  // Documentation in JSON format
  app.get(
    '/docs',
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
    })
  );
}
module.exports = swaggerDocs;