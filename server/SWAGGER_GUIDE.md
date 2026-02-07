# How to Add Swagger Documentation to API Endpoints

This guide explains how to document new API endpoints using Swagger/OpenAPI annotations.

## Prerequisites

The project is already configured with:
- `swagger-ui-express` - Swagger UI interface
- `swagger-jsdoc` - JSDoc to OpenAPI conversion
- Configuration in `src/config/swagger.ts`

## Documentation Structure

All API documentation uses JSDoc comments with `@swagger` tags above route definitions.

## Basic Template

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   method:
 *     tags:
 *       - Tag Name
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []  # If authentication required
 *     parameters:
 *       - in: path/query/header
 *         name: paramName
 *         required: true/false
 *         schema:
 *           type: string
 *         description: Parameter description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *                 example: value
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.method('/your-endpoint', controller);
```

## Real Examples

### 1. GET Endpoint (No Body, With Path Parameter)

```typescript
/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     tags:
 *       - Trips
 *     summary: Get trip by ID
 *     description: Retrieve a single trip by its UUID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getTripById);
```

### 2. POST Endpoint (With Request Body)

```typescript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *               username:
 *                 type: string
 *                 example: johndoe
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post('/register', register);
```

### 3. DELETE Endpoint (Simple)

```typescript
/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     tags:
 *       - Trips
 *     summary: Delete trip
 *     description: Delete a trip and all associated data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', deleteTrip);
```

### 4. PATCH Endpoint (Partial Update)

```typescript
/**
 * @swagger
 * /api/todos/{id}/toggle:
 *   patch:
 *     tags:
 *       - Todos
 *     summary: Toggle todo completion status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *       404:
 *         description: Todo not found
 */
router.patch('/:id/toggle', toggleTodo);
```

## Using Schema References

If you have complex schemas defined in `swagger.ts`, reference them:

```typescript
responses:
  200:
    description: Success
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Trip'
```

Available schemas in this project:
- `User`
- `Trip`
- `Expense`
- `PackingItem`
- `TodoItem`
- `Error`

## Parameter Types

### Path Parameters
```typescript
parameters:
  - in: path
    name: id
    required: true
    schema:
      type: string
```

### Query Parameters
```typescript
parameters:
  - in: query
    name: search
    required: false
    schema:
      type: string
    description: Search term
```

### Header Parameters
```typescript
parameters:
  - in: header
    name: X-Custom-Header
    required: false
    schema:
      type: string
```

## Response Status Codes

Common HTTP status codes:
- `200` - OK (Success)
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Authentication

For protected endpoints, add:

```typescript
security:
  - bearerAuth: []
```

This references the `bearerAuth` security scheme defined in `swagger.ts`.

## Tags

Group related endpoints using tags:
- `Authentication`
- `Trips`
- `Expenses`
- `Packing List`
- `Todos`
- `Admin`

## Testing Your Documentation

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000/api-docs`
3. Check if your endpoint appears correctly
4. Click "Try it out" to test

## Best Practices

1. **Always document all parameters** - Required and optional
2. **Include examples** - Help users understand expected format
3. **Document all response codes** - Not just success cases
4. **Use meaningful descriptions** - Explain what the endpoint does
5. **Keep schemas consistent** - Use references for repeated structures
6. **Test the documentation** - Try endpoints from Swagger UI

## Common Issues

### Documentation not appearing
- Check JSDoc syntax (must be `/**` not `/*`)
- Ensure route file is in `src/routes/*.ts` pattern
- Restart server after changes

### Schema not found
- Check if schema is defined in `src/config/swagger.ts`
- Use correct path: `#/components/schemas/SchemaName`

### Authentication not working in Swagger UI
- Click "Authorize" button at top
- Enter: `Bearer <your-jwt-token>`
- Must include "Bearer " prefix

## Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)

---

Happy documenting! 📚
