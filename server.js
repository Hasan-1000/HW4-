/*
CSC3916 HW5
File: server.js
Description: Web API for Movie API with JWT protected endpoints,
top-rated movies, movie details with reviews, and review creation
*/

require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
require('./auth');
require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var mongoose = require('mongoose');

var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

// SIGN UP
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.name) {
        return res.json({
            success: false,
            msg: 'Please include name, username, and password to signup.'
        });
    }

    var user = new User();
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;

    user.save(function(err) {
        if (err) {
            if (err.code == 11000) {
                return res.json({
                    success: false,
                    message: 'A user with that username already exists.'
                });
            } else {
                return res.json(err);
            }
        }

        res.json({
            success: true,
            msg: 'Successfully created new user.'
        });
    });
});

// SIGN IN
router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username })
        .select('name username password')
        .exec(function(err, user) {
            if (err) {
                return res.send(err);
            }

            if (!user) {
                return res.status(401).send({
                    success: false,
                    msg: 'Authentication failed. User not found.'
                });
            }

            user.comparePassword(userNew.password, function(isMatch) {
                if (isMatch) {
                    var userToken = { id: user._id, username: user.username };
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);

                    res.json({
                        success: true,
                        token: 'JWT ' + token
                    });
                } else {
                    res.status(401).send({
                        success: false,
                        msg: 'Authentication failed.'
                    });
                }
            });
        });
});

// GET ALL MOVIES - sorted by average rating descending
router.get(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var movies = await Movie.aggregate([
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'movieReviews'
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: '$movieReviews.rating' }
                    }
                },
                {
                    $sort: { avgRating: -1 }
                }
            ]);

            res.json(movies);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// CREATE MOVIE
router.post(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var movie = new Movie(req.body);
            var savedMovie = await movie.save();
            res.status(201).json(savedMovie);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// GET ONE MOVIE WITH REVIEWS AND AVG RATING
router.get(
    '/movies/:id',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var movieId = req.params.id;

            var result = await Movie.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(movieId)
                    }
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'movieReviews'
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: '$movieReviews.rating' }
                    }
                }
            ]);

            if (!result.length) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.json(result[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// UPDATE MOVIE
router.put(
    '/movies/:id',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var updatedMovie = await Movie.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!updatedMovie) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.json(updatedMovie);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// DELETE MOVIE
router.delete(
    '/movies/:id',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var deletedMovie = await Movie.findByIdAndDelete(req.params.id);

            if (!deletedMovie) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            res.json({ message: 'Movie deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// CREATE REVIEW
router.post(
    '/reviews',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var movieId = req.body.movieId;
            var username = req.user.username;
            var reviewText = req.body.review;
            var rating = req.body.rating;

            var movie = await Movie.findById(movieId);

            if (!movie) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            var newReview = new Review({
                movieId: movieId,
                username: username,
                review: reviewText,
                rating: rating
            });

            await newReview.save();

            res.status(201).json({
                message: 'Review created!',
                review: newReview
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// OPTIONAL: SEARCH MOVIES (extra credit)
router.post(
    '/movies/search',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
        try {
            var search = req.body.search;

            var movies = await Movie.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { 'actors.actorName': { $regex: search, $options: 'i' } }
                ]
            });

            res.json(movies);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app;