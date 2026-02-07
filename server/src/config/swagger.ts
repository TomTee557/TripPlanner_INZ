import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trip Planner API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Trip Planner application. Manage trips, expenses, packing lists, and todos with JWT authentication.',
      contact: {
        name: 'API Support',
        email: 'support@tripplanner.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.tripplanner.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message description',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Summer Vacation 2024',
            },
            destination: {
              type: 'string',
              example: 'Paris, France',
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2024-07-01',
            },
            endDate: {
              type: 'string',
              format: 'date',
              example: '2024-07-15',
            },
            description: {
              type: 'string',
              example: 'Two weeks exploring the city of lights',
            },
            tripType: {
              type: 'string',
              enum: ['business', 'leisure', 'adventure', 'beach', 'mountain', 'city', 'cultural', 'safari', 'cruise', 'road-trip', 'family', 'backpacking', 'luxury', 'budget'],
              example: 'leisure',
            },
            budget: {
              type: 'number',
              example: 2500,
            },
            picture: {
              type: 'string',
              example: 'beach.jpg',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            tripId: {
              type: 'string',
              format: 'uuid',
            },
            categoryId: {
              type: 'integer',
              example: 1,
            },
            amount: {
              type: 'number',
              format: 'float',
              example: 45.50,
            },
            currency: {
              type: 'string',
              example: 'USD',
            },
            description: {
              type: 'string',
              example: 'Dinner at restaurant',
            },
            expenseDate: {
              type: 'string',
              format: 'date',
              example: '2024-07-05',
            },
          },
        },
        PackingItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            tripId: {
              type: 'string',
              format: 'uuid',
            },
            categoryId: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'T-shirts',
            },
            quantity: {
              type: 'integer',
              example: 5,
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              example: 'medium',
            },
            isPacked: {
              type: 'boolean',
              example: false,
            },
          },
        },
        TodoItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            tripId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              example: 'Book hotel',
            },
            description: {
              type: 'string',
              example: 'Find and book accommodation near city center',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              example: 'high',
            },
            isCompleted: {
              type: 'boolean',
              example: false,
            },
            dueDate: {
              type: 'string',
              format: 'date',
              example: '2024-06-15',
              nullable: true,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
