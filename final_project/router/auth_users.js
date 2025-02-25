const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Username should be at least 3 characters long and not already exist
    return username.length >= 3 && !users.find(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Check if username and password match records
    return users.find(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username: username
        }, 'access-token-secret', {
            expiresIn: '1h'
        });
        return res.status(200).json({accessToken});
    } else {
        return res.status(401).json({message: "Invalid credentials"});
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    // Get username from the session
    const username = req.session && req.session.authorization ? 
        jwt.decode(req.session.authorization.accessToken).username : 
        null;

    if (!username) {
        return res.status(401).json({message: "User not logged in"});
    }

    try {
        if (!books[isbn]) {
            return res.status(404).json({message: "Book not found"});
        }

        if (!review) {
            return res.status(400).json({message: "Review text is required"});
        }

        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/modified successfully",
            book: books[isbn]
        });
    } catch(error) {
        return res.status(500).json({message: "Error processing review"});
    }
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Get username from the session
    const username = req.session && req.session.authorization ? 
        jwt.decode(req.session.authorization.accessToken).username : 
        null;

    if (!username) {
        return res.status(401).json({message: "User not logged in"});
    }

    try {
        if (!books[isbn]) {
            return res.status(404).json({message: "Book not found"});
        }

        if (!books[isbn].reviews[username]) {
            return res.status(404).json({message: "No review found for this user"});
        }

        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            book: books[isbn]
        });
    } catch(error) {
        return res.status(500).json({message: "Error deleting review"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
