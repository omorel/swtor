/*!
 * StarWars: the Old Republic 
 * Heroes Builder
 * http://www.tor-academy.com
 *
 * Copyright (c) 2011 Olivier Morel 
 * 
 */

/*
 * Description 
 *
 * Authors        Olivier Morel 
 * Email          omorel.dev@tuxz.net 
 */

// Global object 

function SWTORHeroesBuilder() {
	var args = Array.prototype.slice.call(arguments), 
	    // last argument => callback 
		  callback = args.pop(), 
		  // modules 
			modules = (args[0] && typeof args[0] === 'string') ? args : args[0], 
			i; 
			
	// check that this function is called as a constructor
	if( !(this instanceof SWTORHeroesBuilder) ) {
		return new SWTORHeroesBuilder(modules, callback); 
	}	
	
	// add modules 	  
	if( !modules || modules === '*' ) {
		modules = []; 
		for(i in SWTORHeroesBuilder.modules) {
			if( SWTORHeroesBuilder.modules.hasOwnProperty(i) ) {
				modules.push(i);  
			}
		}
	}
	
	// initialize the required module 
	for (i = 0; i < modules.length; i += 1) {
		SWTORHeroesBuilder.modules[modules[i]](this); 
	}
	
	// call the callback 
	callback(this);  
}

SWTORHeroesBuilder.prototype = {
	// Properties
	name: 'SWTOR: Heroes Builder', 
	version: '0.1', 
	id: undefined,
	level: 50, 
	talents_history: undefined,
	talents: undefined, 
	points_max: 41, 
	points_available: Number.NaN,
	points_used: Number.NaN, 
	points_by_tree: undefined, 
	advanced_class: undefined, 

	get_name: function() {
		return this.name; 
	}, 
	
	is_valid: function() {
		// collect all the talents 
	}, 
	
	is_available: function(talent) {
		// Variables
		var tree_name = this.get_talent_tree(talent); 
		var tree = this.advanced_class[tree_name]; 
		var talent_object, i, required_points_in_tree, used_points_in_tree; 
		
		for (i = 0; i < tree.talents.length; i += 1) {
	 		if (tree.talents[i].internal === talent) {
				talent_object = tree.talents[i]; 
				break; 
			}
		}
		
		// Check that there is still talents points left 
		if (this.available_points() < 1) {
			return false; 
		}
		
		// Check that the rank of the skill matches the number of talents points spent in the tree 
 		required_points_in_tree = talent_object.level; 
		used_points_in_tree = this.used_points_per_tree(tree_name);
		if (required_points_in_tree * 5 > used_points_in_tree) {
			return false; 
		}
		
		// Check that the limit has not been reached 
		if (talent_object.level_max <= this.talents[talent]) {
			return false; 
		}
				
		return true; 
	}, 
	
	enable_talents: function() {
		var count = this.used_points();
		jQuery('#' + this.id + ' li.talent').each(function(index, elem){
			// Check that this talent is available 
			
		}); 
	}, 
	
	used_points_per_tree: function(tree) {
		// Variables 
		var used_points = 0, tmp_val; 
		
		// Check in the cache
		if (this.points_by_tree[tree] === undefined || isNaN(this.points_by_tree[tree])) {
			jQuery('#' + this.id + ' ul.' + tree + ' li.talent div.current-level').each(
				function(index, elem){
					tmp_val = (isNaN(parseInt(jQuery(this).text()))) ? 0 : parseInt(jQuery(this).text()); 
					used_points += tmp_val;
				}); 
			
			// Set calculated value to the cache 
			this.points_by_tree[tree] = used_points; 
		}
		return this.points_by_tree[tree];		
	}, 
	
	max_points: function() {
		// TODO: this should behave like used_points & available_points and be based on the character level
		return this.points_max; 
	},
	
	used_points: function() {
		// Variables 
		var used_points = 0, tmp_val; 
		
		// Check in the cache
		if (isNaN(this.used_points)) {
			jQuery('#' + this.id + ' li.talent div.current-level').each(
				function(index, elem){
					tmp_val = (isNaN(parseInt(jQuery(this).text()))) ? 0 : parseInt(jQuery(this).text()); 
					used_points += tmp_val;
				}); 
			
			// Set calculated value to the cache 
			this.points_used = used_points; 
		}
		return this.points_used; 
	},
	
	available_points: function () {
		// Variables
		var used_points; 
		var max_points; 
		
		// Check in the cache 
		if (isNaN(this.points_available)) {
			used_points = this.used_points(); 
			max_points = this.max_points(); 
			// Set the value in the cache 
			this.points_available = max_points - used_points; 
		}
		return this.points_available; 
	},
	
	add_point: function(talent) {
		// Variables
		var tree_name = this.get_talent_tree(talent); 
		var talent_tree = this.advanced_class[tree_name];
		
		// Check that the operation is available 
		if (this.is_available(talent)) {
			// Complete the history  
			this.talents_history.push(talent); 
			if (this.talents[talent] === undefined) {
				this.talents[talent] = 1; 
			}
			else {
				this.talents[talent] += 1;
			}

			// Update the caches (we know they've already been calculated)
			this.points_available -= 1; 
			this.points_used += 1; 
			this.points_by_tree[tree_name] += 1; 
			
			// Set the value to the current level 
			jQuery('#' + this.id + ' li.' + talent + ' div.current-level').text(this.talents[talent]); 
			return true; 
		}
		else {
			console.log('not allowed here:' + talent); 
			return false; 
		}
	},
	
	remove_point: function(talent) {
		// Check that there is already a point 
	}, 
	
	add_listeners: function(){
		var that = this;
		jQuery('#' + this.id + ' li.talent').click(function(event){
			return that.add_point(that.get_internal_name(this)); 
		}); 
	},
	
	reset: function() {
	}, 
	
	// Clear the local cache (reset all counters)
	clear_cache: function() {
	}, 
	
	get_internal_name: function(element) {
		return jQuery(element).attr('class').split(' ')[0]; 
	}, 
	
	get_talent_tree: function(talent) {
    return jQuery('#' + this.id + ' li.' + talent).parent().attr('class').split(' ')[0]; 
	}, 
	
	_init_: function(object) {
		for (el in object) {
			this[el] = object[el];
		}
	}
	
}; 


