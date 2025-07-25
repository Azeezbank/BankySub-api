// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BankyConnect',
      version: '1.0.0',
      description: 'API docs for BankyConnect virtual Top-Up',
    },
    servers: [
      {
        url: 'http://bankysub-api.onrender.com', // change this to your backend base URL
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'Bearer',
          bearerFormat: 'JWT', // Optional, helps Swagger UI show that it expects a JWT
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/config/swagger/*.js'], // path to your route files (adjust if needed)
};

export const swaggerSpec = swaggerJSDoc(options);