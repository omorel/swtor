var Db = require('mongodb').Db; 
var Connection = require('mongodb').Connection; 
var Server = require('mongodb').Server; 
var BSON = require('mongodb').BSON; 
var ObjectID = require('mongodb').ObjectID; 

ClassProvider = function(host, port) {
	this.db = new Db('node-mongo-swtor', new Server(host, port, {auto_reconnect: true}, {})); 
	this.db.open(function(){}); 
}; 

ClassProvider.prototype.getCollection = function(callback) {
	this.db.collection('class', function(error, classes_collection) {
		if( error ) {
			callback(error); 
		}
		else {
			callback(null, classes_collection); 
		}
	});
}; 

ClassProvider.prototype.findAll = function(callback) {
	this.getCollection(function(error, classes_collection) {
		if( error ) {
			callback(error); 
		} 
		else {
			classes_collection.find().toArray(function(error, results){
				if( error ){
					callback(error); 
				}
				else {
					callback(null, results); 
				}
			}); 
		}
	}); 
}; 

ClassProvider.prototype.findByInternalName = function(internal_name, callback) {
	this.getCollection(function(error, classes_collection) {
		if( error ) {
			callback(error); 
		}
		else {
			classes_collection.findOne({'internal_name': internal_name}, function(error, result) {
				if( error ) {
					callback(error); 
				}
				else {
					callback(null, result); 
				}
			}); 
		}
	}); 
}

ClassProvider.prototype.save = function(classes, callback) {
	this.getCollection(function(error, classes_collection) {
		if( error ) {
			callback(error); 
		}
		else {
			if( typeof(classes.length) == 'undefined' ) {
				classes = [classes]; 
			}
			
			for( var i = 0; i < classes.length; i++) {
				class = classes[i]; 
				class.updated_at = new Date(); 
			}
			
			classes_collection.insert(classes, function() {
				callback(null, classes); 
			}); 
		}
	}); 
}; 

exports.ClassProvider = ClassProvider; 