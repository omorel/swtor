
/**
 * Module dependencies.
 */
var express = require('express');
var AdvancedClassProvider = require('./advancedclass-provider-mongodb.js').AdvancedClassProvider; 
var ClassProvider = require('./class-provider-mongodb.js').ClassProvider; 


var app = module.exports = express.createServer();

/** 
 * Configuration
 */ 
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var advancedClassProvider = new AdvancedClassProvider('localhost', 27017); 
var classProvider = new ClassProvider('localhost', 27017); 

/**
 * Routes
 */ 
app.get('/', function(req, res){
	advancedClassProvider.findAll(function(error, classes){
		res.render('index.jade', { 
			locals: {
				title: 'Blog', 
				classes: classes 
			}
		}); 
	});
});

app.get('/ac/:name', function(req, res, next) {
	advancedClassProvider.findByInternalName(req.params.name, function(error, ac_element){
		classProvider.findByInternalName(ac_element.class, function(error, class_element) {
			res.render('classes/show.jade', { 'locals': {
	        'title': ac_element.name,
	        'ac': ac_element, 
					'class': class_element
	    	}
			});			
		}) 
	}); 
}); 

app.get('/advancedclass/new', function(req, res){
	res.render('classes/edit.jade', { locals: {
			title: 'New Class'
		}
	})
}); 

app.post('/advancedclass/new', function(req, res) {
	advancedClassProvider.save({
		'name': 					req.param('name'), 
		'internal_name': 	req.param('internal'), 
		'class': 					req.param('class')
	}, function(error, docs) {
		res.redirect('/'); 
	}); 
}); 

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
