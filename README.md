# User Management API

A RESTful API built with Node.js, TypeScript, Express, and MongoDB.

## Features

- Create, retrieve, update, and delete users
- Search users by name
- Sort and paginate results
- Validate request data using Zod
- Centralized error handling
- Integration tests using Vitest and Supertest
- Database seeding for development and testing

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB Atlas
- Mongoose
- Zod
- Vitest
- Supertest

## Prerequisites

Before running this project, make sure you have installed:

- Node.js
- npm
- A MongoDB database, such as MongoDB Atlas
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Aryan-2508/user-management-api.git
cd user-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env
```

Open `.env` and configure your MongoDB connection string.

The application uses `MONGO_URL` to connect to MongoDB.

For integration tests, configure `TEST_MONGO_URL` to point to a dedicated test database named `user_management_test`.

**Important:** Never upload your `.env` file or expose database credentials publicly.

### 4. Start the development server

```bash
npm run dev
```

## Database Seeding

The project includes a seed script at `scripts/seed.ts` for inserting sample data into MongoDB.

Seeding is useful for local development and manual API testing because it lets you populate the database with sample user records without creating them individually through API requests.

### Run the seed script

```bash
npm run seed
```

This command assumes the `seed` script is configured in `package.json`.

For example:

```json
{
  "scripts": {
    "seed": "tsx scripts/seed.ts"
  }
}
```

Use the command above only if your project uses `tsx` to execute TypeScript scripts. Adjust it to match your existing dependencies and configuration.

### Seed script considerations

- Ensure `MONGO_URL` is configured before running the script.
- Run the seed script against a development database, not production.
- Check whether the script inserts new records, updates existing records, or deletes existing data before executing it.
- Consider making the script idempotent so repeated runs do not create unintended duplicate users.
- Never commit database credentials or other secrets to version control.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Retrieve users |
| GET | `/api/users/:id` | Retrieve a user by ID |
| PATCH | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

## Search, Sorting, and Pagination

The users endpoint supports query parameters for searching, sorting, and pagination.

| Parameter | Description |
|---|---|
| `search` | Search users by name |
| `sortBy` | Select the sorting field |
| `order` | Set the sorting direction |
| `page` | Specify the page number |
| `limit` | Specify the number of results per page |

Example request:

```http
GET /api/users?search=Alex&page=1&limit=10
```

## Running Tests

Run the integration test suite with:

```bash
npm test
```

Make sure `TEST_MONGO_URL` is configured before running the tests.

**Warning:** Use a dedicated test database. Integration tests may create or delete database records.

## TypeScript Type Checking

Check for TypeScript errors:

```bash
npx tsc --noEmit
```

## Project Structure

```text
user-management-api/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   └── validate.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── routes/
│   │   └── user.routes.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── utils/
│   │   └── app-error.ts
│   ├── validators/
│   │   └── user.validator.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   └── users.integration.test.ts
├── scripts/
│   └── seed.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Future Improvements

- Add interactive API documentation using Swagger/OpenAPI
- Configure automated testing with GitHub Actions
- Deploy the API to a hosting platform

## License

No license has been specified yet.