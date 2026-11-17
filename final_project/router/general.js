const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user. Username and password are required." });
  }
  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ---------- Helper functions that return Promises ----------
const getAllBooks = () => new Promise((resolve) => resolve(books));

const getBookByISBN = (isbn) => new Promise((resolve, reject) => {
  books[isbn] ? resolve(books[isbn]) : reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
});

const getBooksByAuthor = (author) => new Promise((resolve, reject) => {
  const result = Object.keys(books)
    .filter(isbn => books[isbn].author.toLowerCase() === author.toLowerCase())
    .map(isbn => ({ isbn, title: books[isbn].title, reviews: books[isbn].reviews }));
  result.length ? resolve(result) : reject({ status: 404, message: `No books found by author ${author}` });
});

const getBooksByTitle = (title) => new Promise((resolve, reject) => {
  const result = Object.keys(books)
    .filter(isbn => books[isbn].title.toLowerCase() === title.toLowerCase())
    .map(isbn => ({ isbn, author: books[isbn].author, reviews: books[isbn].reviews }));
  result.length ? resolve(result) : reject({ status: 404, message: `No books found with title ${title}` });
});

// Task 10: Get the book list available in the shop (async/await)
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 11: Get book details based on ISBN (Promise callbacks)
public_users.get('/isbn/:isbn', function (req, res) {
  getBookByISBN(req.params.isbn)
    .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch(err => res.status(err.status || 500).json({ message: err.message }));
});
  
// Task 12: Get book details based on author (async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const booksByAuthor = await getBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Task 13: Get all books based on title (Promise callbacks)
public_users.get('/title/:title', function (req, res) {
  getBooksByTitle(req.params.title)
    .then(result => res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4)))
    .catch(err => res.status(err.status || 500).json({ message: err.message }));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

// ---------- Tasks 10-13: client functions using Axios ----------

// Task 10: Get all books – using async/await with Axios
async function fetchAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
  }
}

// Task 11: Search by ISBN – using Promise callbacks with Axios
function fetchBookByISBN(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => {
      console.log(`Book with ISBN ${isbn}:`, response.data);
      return response.data;
    })
    .catch(error => console.error(`Error fetching ISBN ${isbn}:`, error.message));
}

// Task 12: Search by Author – using async/await with Axios
async function fetchBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by ${author}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by ${author}:`, error.message);
  }
}

// Task 13: Search by Title – using Promise callbacks with Axios
function fetchBooksByTitle(title) {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then(response => {
      console.log(`Books titled ${title}:`, response.data);
      return response.data;
    })
    .catch(error => console.error(`Error fetching title ${title}:`, error.message));
}

module.exports.general = public_users;
module.exports.fetchAllBooks = fetchAllBooks;
module.exports.fetchBookByISBN = fetchBookByISBN;
module.exports.fetchBooksByAuthor = fetchBooksByAuthor;
module.exports.fetchBooksByTitle = fetchBooksByTitle;
