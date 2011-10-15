var Db = require('mongodb').Db; 
var Connection = require('mongodb').Connection; 
var Server = require('mongodb').Server; 
var BSON = require('mongodb').BSON; 
var ObjectID = require('mongodb').ObjectID; 

AdvancedClassProvider = function(host, port) {
	this.db = new Db('node-mongo-swtor', new Server(host, port, {auto_reconnect: true}, {})); 
	this.db.open(function(){}); 
}; 

AdvancedClassProvider.prototype.getCollection = function(callback) {
	this.db.collection('advanced-class', function(error, classes_collection) {
		if( error ) {
			callback(error); 
		}
		else {
			callback(null, classes_collection); 
		}
	});
}; 

AdvancedClassProvider.prototype.findAll = function(callback) {
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

AdvancedClassProvider.prototype.findByInternalName = function(internal_name, callback) {
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

AdvancedClassProvider.prototype.save = function(classes, callback) {
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

exports.AdvancedClassProvider = AdvancedClassProvider; 