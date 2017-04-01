var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Merchant = require('../models/merchant');

var avgTime = 2; // MINUTES

// Register Merchant
router.post('/registermerchant', function(req, res){
	var businessname = req.body.businessname;
	var businessAddress = req.body.businessAddress;
	var businessCity = req.body.businessCity;
	var businessState = req.body.businessState;
	var businessZip = req.body.businessZip;
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
		Merchant.findOne({username:username}, function(err, result){
			if(err) throw err;
			// If merchant is not registered, then register merchant
			if(!result)
			{
				var businessUID = businessname+username;
				businessUID = businessUID.replace(/\s+/g, '');
				var newMerchant = new Merchant({
					businessname: businessname,
					businessAddress: businessAddress,
					businessCity: businessCity,
					businessState: businessState,
					businessZip: businessZip,
					firstname: firstname,
					lastname: lastname,
					phonenumber: phonenumber,
					username: username,
					password: password,
					businessUniqueID: businessUID
				});

				Merchant.createMerchant(newMerchant, function(err, merchant){
					if(err) throw err;
					console.log(merchant);
				});

				var businessUniqueName = businessname+username;
				businessUniqueName = businessUniqueName.replace(/\s+/g, '');
				var QueueSchema = new mongoose.Schema({
					firstname: {type: String},
					lastname: {type: String},
					email: {type: String},
					phonenumber: {type: Number},
					date: {type: Date, default: Date.now}
				});
				var BusinessCollection = mongoose.model(businessUniqueName, QueueSchema);
				var newBusiness = new BusinessCollection({
					firstname: firstname,
					lastname: lastname,
					email: username,
					phonenumber: phonenumber,
				});
				// Create the collection by inserting
				newBusiness.save(function(err){
					if(err) throw err;
				});
				// Then remove the initial index so that queue is empty
				businessUniqueName = businessUniqueName+'s';
				var query = BusinessCollection.where();
				query.findOneAndRemove({firstname: firstname}, function(err){
					if(err) throw err;
				});
				console.log(businessUniqueName);
				req.flash('success_msg', 'You are registered and can now login');
				res.redirect('/login');
			}
			else
			{
				console.log('Found same email already registered for another Merchant.');
				req.flash('error_msg', 'Cannot Register: Email already registered');
				res.redirect('/registerMerchant');
			}
		});
	}
});

// Merchant Delete User from queue
router.post('/completeTransaction', function(req, res){
	// Need to determine the businessQueue then remove queued user. 
	var businessQueueName = req.body.businessname+req.body.email+'s';
	businessQueueName = businessQueueNameres.replace(/\s+/g, '');
	businessQueueName.findByIdAndRemove(req.body.id, function(err){
		if(err) throw err;
		console.log('User deleted!');
	});
	res.redirect('/merchantlanding');
});

module.exports = router;