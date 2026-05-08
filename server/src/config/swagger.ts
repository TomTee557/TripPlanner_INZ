import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trip Planner API',
      version: '1.0.0',
      description: [
          'Comprehensive API documentation for Trip Planner application.',
          '',
          'Manage trips, expenses, packing lists, todos, group invitations, and group trip messages with JWT authentication.',
          '',
          '### Authentication',
          'All protected endpoints require a Bearer JWT token in the `Authorization` header.',
          'Obtain a token via `POST /api/auth/login`.',
          '',
          '### Key features',
          '- Full CRUD for trips, expenses, packing lists, and todos',
          '- Group trips with participant invitations (PENDING → ACCEPTED/REJECTED/LEFT flow)',
          '- Role-based access: owner can edit/delete/transfer; participants can view and leave',
          '- Transfer ownership: owner can hand off a group trip to any accepted participant atomically',
          '- System notifications (TRIP_DELETED, TRIP_COMMENT) with badge counter',
          '- Group trip messages (TripComment) — chat-style comments with notifications',
          '- Per-item privacy on expenses, packing items, and todos in group trips',
          '- Travel documents management with expiry tracking (6-month warning for passports/visas, 30-day for others)',
          '- Budget Overview: single-request `GET /api/trips/budget-summary` returns all trips with expenses for pie chart + progress bars',
          '- Multi-currency budget: budget stored as symbol+amount string (e.g. `€600.00`, `$1200.00`); live conversion via NBP API',
          '- JWT token expiry 15 min with refresh endpoint',
        ].join('\n'),
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
              type: 'string',
              nullable: true,
              description: 'Budget stored as currency symbol + amount string (e.g. `€600.00`, `$1200.00`, `zł800.00`). Parse with regex to extract the numeric value.',
              example: '€2500.00',
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
        TransferOwnerRequest: {
          type: 'object',
          description: 'Payload for transferring trip ownership to an accepted participant',
          required: ['newOwnerId'],
          properties: {
            newOwnerId: {
              type: 'integer',
              description: 'User ID of the accepted participant who should become the new owner',
              example: 5,
            },
          },
        },
        AiPackingItem: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Passport' },
            category: {
              type: 'string',
              enum: ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Medicine', 'Accessories', 'Sports & Recreation', 'Other'],
              example: 'Documents',
            },
            quantity: { type: 'integer', example: 1 },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
          },
        },
        AiTodoItem: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Book flight tickets' },
            description: { type: 'string', example: 'Check cheapest options on Skyscanner' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            dueDate: { type: 'string', format: 'date', nullable: true, example: '2025-06-01' },
          },
        },
        AiExpenseItem: {
          type: 'object',
          properties: {
            description: { type: 'string', example: 'Accommodation 10 nights' },
            categoryName: {
              type: 'string',
              enum: ['Accommodation', 'Transportation', 'Food & Dining', 'Activities', 'Shopping', 'Healthcare', 'Entertainment', 'Other'],
              example: 'Accommodation',
            },
            amount: { type: 'number', example: 1200 },
            currency: { type: 'string', example: 'EUR' },
            expenseDate: { type: 'string', format: 'date', example: '2025-07-10' },
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
          description: 'System-generated notification (e.g. TRIP_DELETED, TRIP_COMMENT)',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer', description: 'Recipient user ID', example: 5 },
            type: {
              type: 'string',
              enum: ['TRIP_DELETED', 'TRIP_COMMENT'],
              example: 'TRIP_COMMENT',
            },
            message: {
              type: 'string',
              example: "john@example.com commented on trip 'Summer Vacation'.",
            },
            seen: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TripComment: {
          type: 'object',
          description: 'A single chat message posted in a group trip by an accepted participant or the owner',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tripId: { type: 'string', format: 'uuid' },
            message: {
              type: 'string',
              maxLength: 1000,
              example: 'I booked the hotel for nights 3–5!',
            },
            createdAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 5 },
                name: { type: 'string', example: 'John' },
                surname: { type: 'string', example: 'Smith' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
              },
            },
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
              description: '`participant` = from TripParticipant (LEFT); `notification` = from Notification table (TRIP_DELETED, TRIP_COMMENT)',
            },
            type: {
              type: 'string',
              enum: ['ACCEPTED', 'REJECTED', 'LEFT', 'TRIP_DELETED', 'TRIP_COMMENT'],
              description: '`ACCEPTED`/`REJECTED`/`LEFT` come from TripParticipant; `TRIP_DELETED`/`TRIP_COMMENT` come from the Notification table',
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
              description: 'LEFT (participant left my trip), TRIP_DELETED (my trip was deleted), and TRIP_COMMENT (new group message) notifications',
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
              description: 'Unread system notifications (TRIP_DELETED + TRIP_COMMENT combined)',
              example: 0,
            },
            total: {
              type: 'integer',
              description: 'Sum of all three — displayed as the badge number',
              example: 3,
            },
          },
        },
        UserDocument: {
          type: 'object',
          description: 'A single travel document belonging to a user',
          properties: {
            id: { type: 'string', format: 'uuid' },
            documentType: {
              type: 'string',
              enum: ['Passport', 'ID Card', 'Visa', 'Insurance', 'Vaccination Card', 'Driving License', 'Other'],
              example: 'Passport',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Passport number AB123456',
            },
            expirationDate: {
              type: 'string',
              format: 'date',
              example: '2030-05-01',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DocumentsExpiringSoon: {
          type: 'object',
          description: 'Result of the expiring-soon check. True when at least one document is within its warning window.',
          properties: {
            hasExpiring: {
              type: 'boolean',
              description:
                'True if any document expires within 6 months (Passport/ID/Visa/Insurance/Vaccination/Driving License) or within 30 days (Other)',
              example: true,
            },
          },
        },
        BudgetTripSummary: {
          type: 'object',
          description: 'A single trip entry in the budget summary response — contains the trip details and its relevant expenses',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Summer in Greece' },
            budget: {
              type: 'string',
              nullable: true,
              description: 'Raw budget string as stored in DB, e.g. `€2500.00`, `$1200.00`. Null when no budget was set.',
              example: '€2500.00',
            },
            dateFrom: { type: 'string', format: 'date', example: '2026-07-01' },
            dateTo:   { type: 'string', format: 'date', example: '2026-07-15' },
            expenses: {
              type: 'array',
              description: 'Expenses visible to the requesting user (public + own private expenses)',
              items: {
                type: 'object',
                properties: {
                  id:       { type: 'string', format: 'uuid' },
                  amount:   { type: 'number', format: 'float', example: 45.50 },
                  currency: { type: 'string', example: 'EUR' },
                },
              },
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
