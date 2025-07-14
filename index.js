const express = require('express');
const app = express();
const port = 3000;
const pool = require('./db');

app.use(express.json());

// let books = [];
// let bookId = 1;

//fuction to validate book data
function validateBookData(title, author, year) {
    if (!title || !author || !year) {
        return { status: 400, error: 'Title, author, and year are required.' };
    }

    if (typeof year !== 'number' || year < 0) {
        return { status: 400, error: 'Year must be a positive number.' };
    }

    if (year > 2025) {
        return { status: 400, error: 'Year can not be greater than 2025.' };
    }

    if (typeof title !== 'string' || typeof author !== 'string') {
        return { status: 400, error: 'Title and author must be strings.' };
    }

    return null;
}

// Endpoint to add a book
app.post('/books', async (req, res) => {
    const { title, author, year } = req.body;

    const validation = validateBookData(title, author, year);
    if (validation) {
        return res.status(validation.status).json({ error: validation.error });
    }

    try {
        const duplicateBook = await pool.query(
            'SELECT * FROM books WHERE LOWER(title) = LOWER($1) AND LOWER(author) = LOWER($2) AND year = $3',
            [title, author, year]
        );
        if (duplicateBook.rows.length > 0) {
            return res.status(409).json({ error: 'Book with the same title, author, and year already exists.' });
        }

        const result = await pool.query(
            'INSERT INTO books (title, author, year) VALUES ($1, $2, $3) RETURNING *',
            [title, author, year]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Endpoint to get all books
app.get('/books', async (req, res) => {
    try {
        const books = await pool.query('SELECT * FROM books ORDER BY id');
        res.json(books.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Endpoint to get a book by ID
app.get('/books/:id', async (req, res) => {
    const bookid = parseInt(req.params.id);
    if (isNaN(bookid)) {
        return res.status(400).json({ error: 'Invalid book ID.' });
    }
    if (bookid <= 0) {
        return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    try {
        const book = await pool.query('SELECT * FROM books WHERE id = $1', [bookid]);

        if (book.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        res.json(book.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Endpoint to update a book by ID
app.put('/books/:id', async (req, res) => {
    const bookid = parseInt(req.params.id);
    const { title, author, year } = req.body;

    if (isNaN(bookid)) {
        return res.status(400).json({ error: 'Invalid book ID.' });
    }
    if (bookid <= 0) {
        return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    const validation = validateBookData(title, author, year);
    if (validation) {
        return res.status(validation.status).json({ error: validation.error });
    }

    try {
        const book = await pool.query('SELECT * FROM books WHERE id = $1', [bookid]);

        if (book.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        const duplicateBook = await pool.query(
            'SELECT * FROM books WHERE LOWER(title) = LOWER($1) AND LOWER(author) = LOWER($2) AND year = $3 AND id != $4',
            [title, author, year, bookid]
        );

        if (duplicateBook.rows.length > 0) {
            return res.status(409).json({ error: 'Book with the same title, author, and year already exists.' });
        }

        const updatedBook = await pool.query(
            'UPDATE books SET title = $1, author = $2, year = $3 WHERE id = $4 RETURNING *',
            [title, author, year, bookid]
        );
        res.json(updatedBook.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Endpoint to delete a book by ID
app.delete('/books/:id', async (req, res) => {
    const bookid = parseInt(req.params.id);

    if (isNaN(bookid)) {
        return res.status(400).json({ error: 'Invalid book ID.' });
    }
    if (bookid <= 0) {
        return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    try {
        const book = await pool.query('SELECT * FROM books WHERE id = $1', [bookid]);
        if (book.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        const deletedbook = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [bookid]);
        res.json({ message: 'Book deleted successfully.', book: deletedbook.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Catch-all for undefined endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

//start the server
app.listen(port, () => {
    console.log(`Book API running at http://localhost:${port}`);
});