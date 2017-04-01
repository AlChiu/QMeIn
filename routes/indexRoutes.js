var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Merchant = require('../models/merchant');
var avgTime = 2; //time in minutes

/* Main function to make sure that the user is */
/* logged in before accessing session specific */
/* pages.                                      */
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}
/***********************************************/

// Get Homepage
router.get('/', function(req, res){
    res.render('index');
});

// Get the user landing page
router.get('/userlanding', ensureAuthenticated, function(req, res){
    Merchant.find({}, function(err, doc){
        if(err){
            res.send(500);
            return;
        }
        res.render('userlanding', {merchdata: doc});
    });
});

// Get the merchant landing page
router.get('/merchantlanding', ensureAuthenticated, function(req, res){
        //Need to access the queue of the businessname
        if(user.businessname){
            var businessQueue = user.businessname+user.username+'s';
            businessQueue = businessQueue.replace(/\s+/g, '');

            businessQueue.find({}, function(err, doc){
                if(err){
                    res.send(500);
                    return;
                }
                res.render('merchantlanding', {queuedata: doc});
            });
        }
        else res.redirect('/');
});

// QueueStatus
router.get('/queuestatus', ensureAuthenticated, function(req, res){
    User.findOne({username: email}, function(err, user, merch, queue, count){
        if(err) throw err;
        Merchant.findOne({businessUniqueID: businessQueued}, function(err, merch, queue, count){
            if(err) throw err;
            businessQueued.find({}, function(err, queue, count){
                if(err) throw err;
                businessQueued.count(function(err, count){
                    var waitTime = (c-1) * avgTime;
                    res.render('queuestatus', {userdata: user, merchdata: merch, queuedata: queue, count: count, waitTime: waitTime});
                });
            });
        });  
    });
});

// Register
router.get('/registerUser', function(req, res){
    res.render('registerUser');
});

router.get('/registerMerchant', function(req, res){
    res.render('registerMerchant');
});

// Login
router.get('/login', function(req, res){
    res.render('login');
});

/**************************************************************/
/* Passport functions to actually login as a user or merchant */
/**************************************************************/
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

/******************************************************************************/

/* Clear session and log the yser out */
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

module.exports = router;