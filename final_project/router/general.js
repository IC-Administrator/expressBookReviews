const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (isValid(username)) {
        users.push({"username": username, "password": password});
        return res.status(201).json({message: "User registered successfully"});
    } else {
        return res.status(400).json({message: "Invalid username or already exists"});
    }
});

// Function to fetch all books
const getAllBooks = async () => {
    try {
        // Creating a mock API endpoint using local data
        const response = await axios.get('http://localhost:5000/api/books', {
            data: books
        });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching books');
    }
};

// Mock API endpoint to serve books data
public_users.get('/api/books', (req, res) => {
    res.json(books);
});

// Main endpoint using async/await with axios
public_users.get('/', async (req, res) => {
    try {
        const booksData = await getAllBooks();
        res.status(200).json(booksData);
    } catch(error) {
        res.status(500).json({message: error.message || "Error retrieving books"});
    }
});

// Function to fetch book by ISBN using async/await
const getBookByISBN = async (isbn) => {
    console.log(`Starting ISBN search for ${isbn}`);
    try {
        console.log('Making Axios request...');
        const response = await axios.get(`http://localhost:5000/api/isbn/${isbn}`);
        console.log('Axios request completed');
        return response.data;
    } catch (error) {
        console.log('Error in Axios request');
        throw error;
    }
};

// Mock API endpoint for ISBN with artificial delay
public_users.get('/api/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    console.log(`Mock API received request for ISBN: ${isbn}`);
    
    // Add artificial delay
    setTimeout(() => {
        if (books[isbn]) {
            console.log(`Mock API sending response for ISBN: ${isbn}`);
            res.json(books[isbn]);
        } else {
            console.log(`Mock API - Book not found for ISBN: ${isbn}`);
            res.status(404).json({message: "Book not found"});
        }
    }, 1000); // 1 second delay
});

// Main ISBN endpoint using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    console.log(`Received request for ISBN: ${isbn}`);
    
    try {
        console.log('Calling getBookByISBN...');
        const book = await getBookByISBN(isbn);
        console.log('Book data received');
        res.status(200).json(book);
    } catch (error) {
        console.log('Error caught in main endpoint');
        res.status(500).json({
            message: error.response?.data?.message || "Error retrieving book"
        });
    }
});
  
// Function to fetch books by author using async/await
const getBooksByAuthor = async (author) => {
    console.log(`Starting author search for ${author}`);
    try {
        console.log('Making Axios request...');
        const response = await axios.get(`http://localhost:5000/api/author/${author}`);
        console.log('Axios request completed');
        return response.data;
    } catch (error) {
        console.log('Error in Axios request');
        throw error;
    }
};

// Mock API endpoint for author search with artificial delay
public_users.get('/api/author/:author', (req, res) => {
    const authorName = req.params.author;
    console.log(`Mock API received request for author: ${authorName}`);
    
    // Add artificial delay
    setTimeout(() => {
        const booksByAuthor = [];
        const keys = Object.keys(books);
        
        keys.forEach(isbn => {
            if (books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
                booksByAuthor.push({
                    isbn: isbn,
                    ...books[isbn]
                });
            }
        });

        if (booksByAuthor.length > 0) {
            console.log(`Mock API sending response for author: ${authorName}`);
            res.json(booksByAuthor);
        } else {
            console.log(`Mock API - No books found for author: ${authorName}`);
            res.status(404).json({message: "No books found for this author"});
        }
    }, 1000); // 1 second delay
});

// Main author endpoint using async/await
public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author;
    console.log(`Received request for author: ${authorName}`);
    
    try {
        console.log('Calling getBooksByAuthor...');
        const books = await getBooksByAuthor(authorName);
        console.log('Books data received');
        res.status(200).json(books);
    } catch (error) {
        console.log('Error caught in main endpoint');
        res.status(500).json({
            message: error.response?.data?.message || "Error retrieving books"
        });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title;
    const booksByTitle = [];
    
    try {
        // Get all keys (ISBNs) from books object
        const keys = Object.keys(books);
        
        // Iterate through books and check title
        keys.forEach(isbn => {
            if (books[isbn].title.toLowerCase().includes(bookTitle.toLowerCase())) {
                booksByTitle.push({
                    isbn: isbn,
                    ...books[isbn]
                });
            }
        });

        if (booksByTitle.length > 0) {
            return res.status(200).json(JSON.parse(JSON.stringify(booksByTitle)));
        } else {
            return res.status(404).json({message: "No books found with this title"});
        }
    } catch(error) {
        return res.status(500).json({message: "Error retrieving books"});
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Check if the ISBN exists in our books object
        if (books[isbn]) {
            // Get the reviews for this book
            const reviews = books[isbn].reviews;
            
            // Check if there are any reviews
            if (Object.keys(reviews).length > 0) {
                return res.status(200).json(JSON.parse(JSON.stringify(reviews)));
            } else {
                return res.status(404).json({message: "No reviews found for this book"});
            }
        } else {
            return res.status(404).json({message: "Book not found"});
        }
    } catch(error) {
        return res.status(500).json({message: "Error retrieving reviews"});
    }
});

module.exports.general = public_users;
