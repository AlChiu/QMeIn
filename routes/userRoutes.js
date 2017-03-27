var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Queue = require('../models/queue');

var avgTime = 2; // MINUTES

// Add to Queue
router.post('/addtoqueue', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var email = req.body.email;
	
	Queue.findOne({email:email}, function(err, result){
		if(err) throw err;
		// If user is not in queue, add to queue
		if(!result)
		{
			var newQueue = new Queue({
				firstname: firstname,
				lastname: lastname,
				phonenumber: phonenumber,
				email: email
			});
	
			Queue.createQueue(newQueue, function(err, queue){
				if(err) throw err;
			});
		
			console.log('The following user added to queue:');
			console.log(req.body.firstname, req.body.lastname);
			console.log(req.body.email);
			console.log(req.body.phonenumber);
			res.redirect('/queuestatus');
		}
		// If user is already queued, redirect user to the queuestatus.
		else
		{
			req.flash('error_msg', 'You are already in queue!');
			res.redirect('/queuestatus');
		}
	});
});

// Queue Out
router.post('/queuemeout', function(req,res){
	var email = req.body.email;
	
	Queue.findOneAndRemove({email:email}, function(err){
		if (err) throw err;
		console.log('User Queued Out');
		res.redirect('/');
	});
});

// Register User
router.post('/registeruser', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var username = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('firstname', 'First Name is required').notEmpty();
	req.checkBody('lastname', 'Last Name is required').notEmpty();
	req.checkBody('phonenumber', 'Phone Number is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').notEmpty().equals(req.body.password);

	var errors = req.validationErrors();
	
	if(errors){
		res.render('register',{
			errors:errors
		});
	}

	User.findOne({username:username}, function(err, result){
		if(err) 
		{
			throw err;
		}
		// If user is not registered, then register user
		if(!result)
		{
		var newUser = new User({
			firstname: firstname,
			lastname: lastname,
			phonenumber: phonenumber,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		
		res.redirect('/login');
		}
		else
		{
			console.log('Found same email already registered for another User.');
			req.flash('error_msg', 'Cannot Register: Email already registered');
			res.redirect('/register');
		}
	})
});

module.exports = router;