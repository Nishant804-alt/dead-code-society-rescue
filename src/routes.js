// SMELL: [MEDIUM]
// Unused imports should be removed.
// path, fs, http are imported but never used.
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // user model
const Shipment = require('../models/Shipment'); // shipment model
const jwt = require('jsonwebtoken'); // auth
const bcrypt = require('bcrypt'); // secure password hashing
const mongoose = require('mongoose'); // for id checking
// SMELL: [MEDIUM]
// Unused imports should be removed.
// path, fs, http are imported but never used.
const path = require('path'); // unused import
const fs = require('fs'); // unused import
const http = require('http'); // unused import
const os = require('os'); // unused import

// SMELL: [CRITICAL]
// Hardcoded JWT_SECRET fallback is insecure.
// Production systems should never use hardcoded secrets.
// Remove fallback and require JWT_SECRET to be set.
var JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// ---------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------

// POST /register - make a new account
router.post('/register', async function(req, res) {
    // SMELL: [CRITICAL]
// Direct req.body usage without validation.
// Potential NoSQL injection - users can override role, status, etc.
// Add input validation with Joi.
    // Just save whatever the user sends in req.body.
    // Spread operator enables NoSQL injection since we take anything!
    const userData = { ...req.body };
    
    // FIXED: Using bcrypt for secure password hashing
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    userData.password = hashedPassword;

    const newUser = new User(userData);
    
    newUser.save()
        .then(function(user) {
            console.log('Registered user: ' + user.email);
            // using 200 for everything, its simpler for my frontend dev
            res.json({
                success: true,
                message: 'Account created!',
                user: user
            });
        })
        .catch(function(err) {
            console.log('Error in register: ' + err);
            res.json({ success: false, error: 'Cannot register' });
        });
});

// POST /login - get a token
router.post('/login', async function(req, res) {
    // SMELL: [CRITICAL]
// Direct req.body usage without validation.
// Add input validation with Joi.
    // find user by email - direct spread again for injection
    User.findOne({ email: req.body.email })
        .then(async function(user) {
            if (!user) {
                return res.json({ error: 'No user found with that email' });
            }

            // FIXED: Using bcrypt.compare for secure password verification
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordValid) {
                // sign jwt
                var token = jwt.sign(
                    { id: user._id, role: user.role }, 
                    JWT_SECRET, 
                    { expiresIn: '12h' }
                );

                res.json({
                    msg: 'Login OK',
                    token: token,
                    data: {
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                res.json({ error: 'Password does not match' });
            }
        })
        .catch(function(err) {
            console.log('Login crash: ' + err);
            res.json({ error: 'Server error' });
        });
});

// ---------------------------------------------------------
// SHIPMENT ROUTES
// ---------------------------------------------------------

// GET /shipments - list all shipments for user
router.get('/shipments', function(req, res) {
    // SMELL: [HIGH]
// Repeated JWT verification logic.
// Should be extracted to auth middleware.
    // --- AUTH BLOCK START ---
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        Shipment.find({ userId: req.userId })
            .then(function(shipments) {
                // SMELL: [HIGH]
// N+1 query problem - calling User.findById() inside a loop.
// Should use .populate('userId') instead.
                // N+1 problem: fetching user details for each shipment in a loop
                var finalData = [];
                var itemsProcessed = 0;

                if (shipments.length === 0) {
                    return res.json({ shipments: [] });
                }

                for (var i = 0; i < shipments.length; i++) {
                    (function(idx) {
                        var ship = shipments[idx].toObject();
                        // Calling DB inside a loop is standard right?
                        User.findById(ship.userId)
                            .then(function(u) {
                                ship.user_details = u;
                                finalData.push(ship);
                                itemsProcessed++;

                                if (itemsProcessed === shipments.length) {
                                    res.json({
                                        status: 'success',
                                        results: finalData.length,
                                        data: finalData
                                    });
                                }
                            }); // SMELL: [HIGH]
// Silent failure - no .catch() handler.
// Unhandled promise rejection.
                    })(i);
                }
            })
            .catch(function(err) {
                console.log(err);
                res.json({ error: 'Fetch failed' });
            });
    });
});

// GET /shipments/:id - get one shipment
router.get('/shipments/:id', function(req, res) {
    // SMELL: [HIGH]
// Repeated JWT verification logic.
// Should be extracted to auth middleware.
    // --- AUTH BLOCK START ---
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        Shipment.findById(req.params.id)
            .then(function(shipment) {
                if (!shipment) {
                    return res.json({ error: 'Not found' });
                }
                
                // check permissions
                if (shipment.userId.toString() !== req.userId && req.userRole !== 'admin') {
                    return res.json({ error: 'No access to this shipment' });
                }

                res.json(shipment);
            })
            .catch(function(err) {
                res.json({ error: 'Error on findById' });
            });
    });
});

// POST /shipments - create shipment
router.post('/shipments', function(req, res) {
    // SMELL: [HIGH]
// Repeated JWT verification logic.
// Should be extracted to auth middleware.
    // --- AUTH BLOCK START ---
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // SMELL: [HIGH]
// Business logic in route - tracking ID generation should be in service layer.
        // generation of tracking id
        var trackId = 'SHIP-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        
        // SMELL: [MEDIUM]
// Magic number 100 should be a named constant.
        // SMELL: [CRITICAL]
// Direct req.body spread usage without validation.
// Potential NoSQL injection.
        // Use spread to save time, mongoose will handle validation... maybe
        var newShipment = new Shipment({
            ...req.body,
            trackingId: trackId,
            userId: req.userId,
            status: 'pending' // SMELL: [MEDIUM]
// Magic string should be a constant.
        });

        newShipment.save()
            .then(function(saved) {
                res.json(saved);
            })
            .catch(function(err) {
                console.log('Error saving shipment');
                res.json({ error: err });
            });
    });
});

// PATCH /shipments/:id/status - change status
router.patch('/shipments/:id/status', function(req, res) {
    // SMELL: [HIGH]
// Repeated JWT verification logic.
// Should be extracted to auth middleware.
    // --- AUTH BLOCK START ---
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // SMELL: [HIGH]
// Business logic in route - status validation should be in service layer.
        // logic: only admins can mark as delivered
        if (req.body.status === 'delivered') { // SMELL: [MEDIUM]
// Magic string should be a constant.
            if (req.userRole !== 'admin') {
                return res.json({ error: 'Admins only can deliver' });
            }
        }

        Shipment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
            .then(function(doc) {
                res.json(doc);
            })
            .catch(function(err) {
                res.json({ error: 'Update failed' });
            });
    });
});

// DELETE /shipments/:id - remove shipment
router.delete('/shipments/:id', function(req, res) {
    // SMELL: [HIGH]
// Repeated JWT verification logic.
// Should be extracted to auth middleware.
    // --- AUTH BLOCK START ---
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // SMELL: [CRITICAL]
// Missing permission check - any authenticated user can delete any shipment.
// Should verify user owns the shipment or is admin.
        // No permission check! Anyone can delete any shipment if they have a token.
        Shipment.findByIdAndDelete(req.params.id)
            .then(function() {
                res.json({ message: 'Deleted ' + req.params.id });
            })
            .catch(function(e) {
                res.json({ error: 'Delete error' });
            });
    });
});

// ---------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------

// GET /profile - current user
router.get('/profile', function(req, res) {
    // SMELL: [HIGH]
// Repeated JWT verification logic.
// Should be extracted to auth middleware.
    // --- AUTH BLOCK START ---
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        User.findById(req.userId)
            .then(function(user) {
                res.json(user);
            }); // SMELL: [HIGH]
// Missing .catch() handler - unhandled promise rejection.
    });
});

// ---------------------------------------------------------
// DUMMY DATA FOR TESTING
// ---------------------------------------------------------

// route to check if server is up
router.get('/status', function(req, res) {
    var info = {
        os: os.type(),
        release: os.release(),
        uptime: process.uptime(),
        memory: process.memoryUsage().rss
    };
    res.json(info);
});

// TODO: fix the N+1 problem later
// TODO: refactor into proper controllers
// TODO: add validation library like Joi or Zod
// TODO: use async/await to avoid callback hell

// final route
router.get('/ping', function(req, res) {
    res.json({ pong: 'active' });
});

module.exports = router;
