import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    swaggerDefinition: {
        openapi: "3.0.2",
        tags: [
            {
                name: 'Appointments',
                description: 'Endpoints related to appointments'
            }
        ],
        info: {
            title: 'REST API Node.js with Express and Sequelize',
            version: '1.0.0',
            description: 'API REST with Node.js, Express and Sequelize'
        }
    },
    apis: ['./src/router.ts']
}

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;