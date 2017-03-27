var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Merchant = require('../models/merchant');
var Queue = require('../models/queue');
var avgTime = 2; //time in minutes

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
    Queue.find({}, function(err, doc, c) {
        if(err) {
            res.send(500);
            return;
        }
        
        Queue.getQueueCount(function(err, c){
            console.log(c);
            var waitTime = c * avgTime;
        res.render('index', {queuedata: doc,count:c, waitTime: waitTime});
        });
    });
});

// QueueStatus
router.get('/queuestatus', ensureAuthenticated, function(req, res){
    Queue.find({}, function(err, doc, c) {
        if(err) {
            res.send(500);
            return;
        }
        
        Queue.getQueueCount(function(err, c){
			console.log('There are', c, 'users in Queue now.');
            var waitTime = (c-1) * avgTime;
        res.render('queuestatus', {queuedata: doc, count:c, waitTime: waitTime});
        });
    });
});

// Register
router.get('/register', function(req, res){
    res.render('register');
});

// Login
router.get('/login', function(req, res){
    res.render('login');
});

passport.use('user', new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
        return done(null, false, {message: 'Unknown Username'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, user);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
}));
  
passport.use('merchant', new LocalStrategy(
  function(username, password, done) {
   Merchant.getMerchantByUsername(username, function(err, merchant){
    if(err) throw err;
    if(!merchant){
        return done(null, false, {message: 'Unknown Username'});
    }

    Merchant.comparePassword(password, merchant.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, merchant);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Merchant.getMerchantById(id, function(err, user){
    if(err) done(err);
        if(user){
            done(null, user);
        } else {
            User.getUserById(id, function(err, user){
                if(err) done(err);
                done(null, user);
            })
        }
    })
});

router.post('/loginuser',
  passport.authenticate(['user', 'merchant'], {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

module.exports = router;