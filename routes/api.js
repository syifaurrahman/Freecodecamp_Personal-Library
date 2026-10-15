/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');

// Connect to MongoDB
if (process.env.DB) {
  mongoose.connect(process.env.DB)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.error('Warning: process.env.DB is not defined');
}

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({});
        const result = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: (book.comments && Array.isArray(book.comments)) ? book.comments.length : 0
        }));
        return res.json(result);
      } catch (err) {
        console.error('Error in GET /api/books:', err);
        return res.status(500).json({ error: err.message });
      }
    })

    .post(async function (req, res) {
      try {
        const title = req.body && req.body.title;
        if (!title) {
          return res.send('missing required field title');
        }
        const newBook = new Book({ title: title, comments: [] });
        const saved = await newBook.save();
        return res.json({ _id: saved._id, title: saved.title });
      } catch (err) {
        console.error('Error in POST /api/books:', err);
        return res.status(500).json({ error: err.message });
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        return res.send('complete delete successful');
      } catch (err) {
        console.error('Error in DELETE /api/books:', err);
        return res.status(500).json({ error: err.message });
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res) {
      try {
        const bookid = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.send('no book exists');
        }
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        return res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments || []
        });
      } catch (err) {
        console.error('Error in GET /api/books/:id:', err);
        return res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      try {
        const bookid = req.params.id;
        const comment = req.body && req.body.comment;
        if (!comment) {
          return res.send('missing required field comment');
        }
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.send('no book exists');
        }
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        if (!book.comments) {
          book.comments = [];
        }
        book.comments.push(comment);
        await book.save();
        return res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        console.error('Error in POST /api/books/:id:', err);
        return res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      try {
        const bookid = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.send('no book exists');
        }
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        return res.send('delete successful');
      } catch (err) {
        console.error('Error in DELETE /api/books/:id:', err);
        return res.send('no book exists');
      }
    });

};
