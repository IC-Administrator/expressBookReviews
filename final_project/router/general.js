const express = require('express');
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

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    try {
        res.status(200).json(JSON.parse(JSON.stringify(books)));
    } catch(error) {
        res.status(500).json({message: "Error retrieving books"});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Check if the ISBN exists in our books object
        if (books[isbn]) {
            return res.status(200).json(JSON.parse(JSON.stringify(books[isbn])));
        } else {
            return res.status(404).json({message: "Book not found"});
        }
    } catch(error) {
        return res.status(500).json({message: "Error retrieving book"});
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author;
    const booksByAuthor = [];
    
    try {
        // Get all keys (ISBNs) from books object
        const keys = Object.keys(books);
        
        // Iterate through books and check author
        keys.forEach(isbn => {
            if (books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
                booksByAuthor.push({
                    isbn: isbn,
                    ...books[isbn]
                });
            }
        });

        if (booksByAuthor.length > 0) {
            return res.status(200).json(JSON.parse(JSON.stringify(booksByAuthor)));
        } else {
            return res.status(404).json({message: "No books found for this author"});
        }
    } catch(error) {
        return res.status(500).json({message: "Error retrieving books"});
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
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
