var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Queue Schema
var QueueSchema = mongoose.Schema({
	firstname: {
		type: String
	},
	lastname: {
		type: String
	},
	email: {
		type: String
	},
	phonenumber: {
		type: Number
	},
	date: {
		type: Date, 
		default: Date.now // This is in milliseconds
	}
});

var Queue = module.exports = mongoose.model('Queue', QueueSchema);

module.exports.createQueue = function(newQueue, callback){
		newQueue.save(callback);
};

module.exports.getQueueByEmail = function(email, callback){
	var email = {email: email};
	Queue.findOne(email, callback);
}

module.exports.getQueueByLastname = function(lastname, callback){
	var query = {lastname: lastname};
	Queue.findOne(query, callback);
}

module.exports.getQueueById = function(id, callback){
	Queue.findById(id, callback);
}

module.exports.getQueueCount = function(callback){
    Queue.count(callback);
}
