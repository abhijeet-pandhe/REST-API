const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const checkAuth = require("../middleware/check-auth");
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length > 0) {
            return res.status(409).json({
                message: "Email already exist"
            });
        }
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if(err) {
                res.status(500).json(err);
            } else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash
                });
                user.save()
                .then(result => {
                    res.status(201).json({
                        message: "User created successfully"
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json(err);
                });
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post("/login", (req, res, next) => {
    User.findOne({email: req.body.email})
    .exec()
    .then(user => {
        if(!user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        bcrypt.compare(req.body.password, user.password).then((result) => {
            if(result === true) {
                const token = jwt.sign({
                    id: user._id,
                    email: user.email
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                });
                res.status(200).json({
                    message: "Authentication successful",
                    token: token
                });
            } else {
                res.status(401).json({
                    message: "Authentication failed"
                });
            }
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.delete("/:userId", checkAuth, (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "User deleted successfully"
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

module.exports = router;