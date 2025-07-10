const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let books = [];
let bookId = 1;

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
app.post('/books', (req,res) => {
    const {title, author, year} = req.body;
    
    const validation = validateBookData(title, author, year);
    if (validation) {
        return res.status(validation.status).json({error: validation.error});
    }  

    const duplicateBook = books.find(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase() && b.year === year);
    if (duplicateBook) {
        return res.status(409).json({error: 'Book with the same title, author, and year already exists.'});
    }


    const newBook = {id: bookId++, title, author, year};
    books.push(newBook);
    res.status(201).json(newBook);
});

// Endpoint to get all books
app.get('/books', (req, res) => {
    res.json(books);
});

// Endpoint to get a book by ID
app.get('/books/:id', (req, res) => {
    const bookid = parseInt(req.params.id);
    const book = books.find(b => b.id ===bookid);
    if(!book) {
        return res.status(404).json({error: 'Book not found.'});
    }
    res.json(book);
});

// Endpoint to update a book by ID
app.put('/books/:id', (req, res) => {
    const bookid = parseInt(req.params.id);
    const {title, author, year} = req.body;
    const bookIndex = books.findIndex(b => b.id === bookid);
    
    if (bookIndex === -1) {
        return res.status(404).json({error: 'Book not found.'});
    }
    
    const validation = validateBookData(title, author, year);
    if (validation) {
        return res.status(validation.status).json({error: validation.error});
    } 

    const duplicateBook = books.find(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase() && b.year === year);
    if (duplicateBook) {
        return res.status(409).json({error: 'Book with the same title, author, and year already exists.'});
    }
    
    const updatedBook = {id: bookid, title, author, year};
    books[bookIndex] = updatedBook;
    res.json(updatedBook);
});

// Endpoint to delete a book by ID
app.delete('/books/:id', (req, res) => {
    const bookid = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === bookid);
    
    if (bookIndex === -1) {
        return res.status(404).json({error: 'Book not found.'});
    }
    
    const deletedbook = books.splice(bookIndex, 1);
    res.json({message: 'Book deleted successfully.', book: deletedbook[0]});
});

// Catch-all for undefined endpoints
app.use((req, res) => {
    res.status(404).json({error: 'Endpoint not found.'});
});

//start the server
app.listen(port, () => {
    console.log(`Book API running at http://localhost:${port}`);
});