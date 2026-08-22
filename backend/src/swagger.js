const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Git Version Control Backend API',
            version: '1.0.0',
            description: 'API documentation for the backend authentication and CLI token management. \n\n**Note:** Auth routes generate an HttpOnly secure cookie for Access and Refresh tokens. Simply execute `/api/v1/auth/login` to authenticate, and your browser will automatically attach the cookie to all subsequent requests. No manual Authorize configuration is needed for web endpoints!',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Path to the API docs inside routes
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};

module.exports = setupSwagger;
