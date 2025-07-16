# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RESTful Bookstore API built with Node.js, Express, and PostgreSQL. The API allows managing books through CRUD operations (Create, Read, Update, Delete).

## Commands

### Setup and Running

1. **Start the application with Docker:**
   ```bash
   docker-compose up
   ```

2. **Start the application locally:**
   ```bash
   # Ensure PostgreSQL is running and configured
   node server.js
   ```

### Testing

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Run tests with custom database configuration:**
   ```bash
   DB_HOST=localhost DB_NAME=custom_test_db npm test
   ```

## Architecture

### Core Components

1. **Server Setup** (`server.js`):
   - Entry point that initializes the Express server
   - Configures the port (default: 3000)

2. **Application Logic** (`app.js`):
   - Defines all RESTful endpoints
   - Implements request validation
   - Contains API route handlers for books
   - Endpoints:
     - `POST /books`: Add a new book
     - `GET /books`: Get all books
     - `GET /books/:id`: Get a book by ID
     - `PUT /books/:id`: Update a book by ID
     - `DELETE /books/:id`: Delete a book by ID

3. **Database Connection** (`db.js`):
   - Configures PostgreSQL connection using environment variables
   - Provides a connection pool for database operations

### Database Schema

The database consists of a single `books` table with the following schema:
- `id`: SERIAL PRIMARY KEY
- `title`: VARCHAR(255) NOT NULL
- `author`: VARCHAR(255) NOT NULL
- `year`: INT NOT NULL

### Validation

The application includes validation logic for book data:
- Title, author, and year are required fields
- Title and author must be strings
- Year must be a positive number and cannot be greater than 2025
- Duplicate books (same title, author, and year) are not allowed

### Docker Setup

The application can be run using Docker with:
- Node.js container for the API
- PostgreSQL container for the database
- Volume for persisting database data

### Testing

Tests are implemented using Jest and SuperTest:
- Test database is configured in `__tests__/setup.js`
- Database schema is created from `__tests__/setup.sql`
- Test files validate all API endpoints and error cases