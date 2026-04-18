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
        TripParticipant: {
          type: 'object',
          description: 'A single invitation record linking a user to a trip',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer', example: 5 },
            tripId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'LEFT'],
              example: 'PENDING',
            },
            ownerSeen: {
              type: 'boolean',
              description: 'Whether the trip owner has acknowledged this status change',
              example: false,
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          description: 'System-generated notification (e.g. TRIP_DELETED)',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer', description: 'Recipient user ID', example: 5 },
            type: {
              type: 'string',
              enum: ['TRIP_DELETED'],
              example: 'TRIP_DELETED',
            },
            message: {
              type: 'string',
              example: "Trip 'Summer Vacation' has been deleted by the owner.",
            },
            seen: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TripMessage: {
          type: 'object',
          description: 'Unified message shown in the Messages section of the Invitations tab',
          properties: {
            id: { type: 'string', format: 'uuid' },
            source: {
              type: 'string',
              enum: ['participant', 'notification'],
              description: '`participant` = from TripParticipant (LEFT); `notification` = from Notification table (TRIP_DELETED)',
            },
            type: {
              type: 'string',
              enum: ['ACCEPTED', 'REJECTED', 'LEFT', 'TRIP_DELETED'],
            },
            tripTitle: { type: 'string', example: 'Summer Vacation' },
            detail: {
              type: 'string',
              example: 'John Smith (john@example.com) left your trip.',
            },
            seen: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        InvitationsData: {
          type: 'object',
          description: 'Full invitations payload returned by GET /api/invitations',
          properties: {
            received: {
              type: 'array',
              description: 'PENDING invitations I received to join someone else\'s trip',
              items: { type: 'object' },
            },
            sent: {
              type: 'array',
              description: 'PENDING invitations I sent as trip owner',
              items: { type: 'object' },
            },
            confirmations: {
              type: 'array',
              description: 'ACCEPTED/REJECTED responses on trips I own (not LEFT — those go to messages)',
              items: { type: 'object' },
            },
            messages: {
              type: 'array',
              description: 'LEFT (participant left my trip) and TRIP_DELETED (my trip was deleted) messages',
              items: { $ref: '#/components/schemas/TripMessage' },
            },
          },
        },
        NotificationCount: {
          type: 'object',
          description: 'Numeric counts for the notification badge in the UI header',
          properties: {
            pendingReceived: {
              type: 'integer',
              description: 'PENDING invitations waiting for my response',
              example: 1,
            },
            unseenResponses: {
              type: 'integer',
              description: 'ACCEPTED/REJECTED/LEFT responses on my trips I haven\'t acknowledged',
              example: 2,
            },
            unseenNotifications: {
              type: 'integer',
              description: 'Unread TRIP_DELETED system notifications',
              example: 0,
            },
            total: {
              type: 'integer',
              description: 'Sum of all three — displayed as the badge number',
              example: 3,
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
