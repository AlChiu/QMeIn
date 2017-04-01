var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var QueueSchema = new mongoose.Schema({
	firstname: {type: String},
	lastname: {type: String},
	email: {type: String},
	phonenumber: {type: Number},
	date: {type: Date, default: Date.now}
});

var User = require('../models/user');

var avgTime = 2; // MINUTES

// Add to Queue
/* need a form to submit the business name to queue into */
router.post('/addtoqueue', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var email = req.body.email;
	var businessUniqueName = req.body.businessQueued+req.body.businessEmail+'s';
	var queued = req.body.queued;

	// Need to check if the user is already queued somewhere else
	User.findOne({username:email}, function(err, result, result2){
		if(result.queued === false && result.businessQueued === null)
		{
			businessUniqueName = businessUniqueName.replace(/\s+/g, '');
			businessUniqueName.findOne({email:email}, function(err, result2){
				if(err) throw err;
				if(!result2)
				{
					// Save the user into the specific queue
					businessUniqueName.create({
						firstname: firstname,
						lastname: lastname,
						email: email,
						phonenumber: phonenumber,
						}, function(err){
						if(err) throw err;
					});
				// Update the tags in the user so that he can't queue anywhere else
					User.findOneAndUpdate({username:email}, {queued: true, businessQueued: businessUniqueName}, function(err){
						if(err) throw err;
					});
				}	
				// User is already in this queue
				else
				{
					req.flash('error_msg', 'You are already in queue!');
					res.redirect('/queuestatus');
				}
			});
		}
		// User is queued in a different business
		else
		{
			req.flash('error_msg', 'You are already in a different queue!');
			res.redirect('/queuestatus');
		}
	});
});

// Queue Out
router.post('/queuemeout', function(req,res){
	var email = req.body.email;
	var businessID = req.body.business;

	businessID = businessID+'s';
	businessID = businessID.replace(/\s+/g,'');
	
	businessID.findOneAndRemove({email:email}, function(err){
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
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	
	if(errors){
		res.render('register',{
			errors:errors
		});
	}
	else
	{
		User.findOne({username:username}, function(err, result){
		if(err) throw err;
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
	}
});

module.exports = router;