const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('Bookstore API', () => {
    afterAll(async () => {
        await pool.end();
    });

    describe('POST /books', () => {
        it('should add a new book', async () => {
            const response = await request(app)
                .post('/books')
                .send({ title: 'Test Book', author: 'John Doe', year: 2024 });
            expect(response.statusCode).toBe(201);
            expect(response.body.title).toBe('Test Book');
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/books')
                .send({ author: 'John Doe' });
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toMatch(/Title/);
        });

        it('should return 409 for duplicate book', async () => {
            await request(app)
                .post('/books')
                .send({ title: 'Duplicate Book', author: 'Jane Doe', year: 2023 });
            const response = await request(app)
                .post('/books')
                .send({ title: 'Duplicate Book', author: 'Jane Doe', year: 2023 });
            expect(response.statusCode).toBe(409);
        });
    });

    describe('GET /books', () => {
        it('should return all books', async () => {
            const response = await request(app).get('/books');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should get a book by ID', async () => {
            const book = await request(app)
                .post('/books')
                .send({ title: 'Find Me', author: 'Someone', year: 2022 });
            const response = await request(app).get(`/books/${book.body.id}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBe('Find Me');
        });

        it('should return 404 for non-existent book', async () => {
            const response = await request(app).get('/books/9999');
            expect(response.statusCode).toBe(404);
        });
    });

    describe('PUT /books/:id', () => {
        it('should update a book', async () => {
            const book = await request(app)
                .post('/books')
                .send({ title: 'Update Me', author: 'Author', year: 2021 });
            const response = await request(app)
                .put(`/books/${book.body.id}`)
                .send({ title: 'Updated Title', author: 'Author', year: 2021 });
            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBe('Updated Title');
        });
    });

    describe('DELETE /books/:id', () => {
        it('should delete a book', async () => {
            const book = await request(app)
                .post('/books')
                .send({ title: 'Delete Me', author: 'Author', year: 2021 });
            const response = await request(app).delete(`/books/${book.body.id}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toMatch(/deleted successfully/);
        });
    });
});
