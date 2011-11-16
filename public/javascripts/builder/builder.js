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
	'name': 'SWTOR: Heroes Builder', 
	'version': '0.1', 
	'id': undefined,
	'level': 50, 
	'talents_history': undefined,
	'talents': undefined, 
	'points_max': 41, 
	'points_available': NaN,
	'points_used': NaN, 
	'points_by_tree': undefined, 
	'advanced_class': undefined, 
	'rank': 10,

	'get_name': function() {
		return this.name; 
	}, 
	
	'is_valid': function() {
		// collect all the talents 
	}, 
	
	'is_available': function(talent) {
		// Variables
		var tree_name = this.get_talent_tree(talent); 
		var tree = this.advanced_class[tree_name]; 
		var talent_object, i, required_points_in_tree, used_points_in_tree, counter; 
		
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
		counter = 0; 
		for (i = 0; i < required_points_in_tree; i++) {
			counter += used_points_in_tree['rank_' + i]; 
		}
		
		if (required_points_in_tree * 5 > counter) {
			return false; 
		}
		
		// Check that the limit has not been reached 
		if (talent_object.level_max <= this.talents[talent]) {
			return false; 
		}
		
		// Check that there is no dependency problem
		// TODO: complete
				
		return true; 
	}, 
	
	'enable_talents': function() {
		var check
		var that = this; 
		jQuery('#' + this.id + ' ul.tree li.talent').each( function() {
			var name = that.get_internal_name(jQuery(this)); 
			if (that.is_available(name)) {
				if (jQuery(this).hasClass('active')) { 
					jQuery(this).removeClass('disabled'); 
					jQuery(this).removeClass('inactive'); 
				}
				else {
					jQuery(this).removeClass('disabled'); 
					jQuery(this).addClass('inactive');
				}
			} 
			else {
				if (jQuery(this).hasClass('active')) { 
					; // nothing to do it is active, let it stay active
				}
				else {
					jQuery(this).removeClass('inactive'); 
					jQuery(this).addClass('disabled');
				}
			}
		}); 
	}, 
	
	'used_points_per_tree': function(tree) {
		// Variables 
		var used_points, tmp_val, i, total; 
		var calculate = function(index, elem){
			tmp_val = (isNaN(parseInt(jQuery(this).text(), 10))) ? 0 : parseInt(jQuery(this).text(), 10); 
			used_points += tmp_val;
		};
		
		// Check in the cache
		if (this.points_by_tree[tree] === undefined || isNaN(this.points_by_tree[tree].total)) {
			// Initialize
			this.points_by_tree[tree] = {}; 
			total = 0; 
			// Count the numbers per rank 
			for(i = 0; i < this.rank; i++) {
				used_points = 0; 
				jQuery('#' + this.id + ' ul.' + tree + ' li.rank_' + i + ' div.current-level').each(
					calculate); 
				this.points_by_tree[tree]['rank_' + i] = used_points; 
				total += used_points; 
			}
			// Set calculated value to the cache 
			this.points_by_tree[tree].total = used_points;
		}
		return this.points_by_tree[tree];
	}, 
	
	'max_points': function() {
		// TODO: this should behave like used_points & available_points and be based on the character level
		return this.points_max; 
	},
	
	'used_points': function() {
		// Variables 
		var used_points = 0, tmp_val; 
		
		// Check in the cache
		if (isNaN(this.used_points)) {
			jQuery('#' + this.id + ' li.talent div.current-level').each(
				function(index, elem){
					tmp_val = (isNaN(parseInt(jQuery(this).text(), 10))) ? 0 : parseInt(jQuery(this).text(), 10); 
					used_points += tmp_val;
				}); 
			
			// Set calculated value to the cache 
			this.points_used = used_points; 
		}
		return this.points_used; 
	},
	
	'available_points': function () {
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
	
	'add_point': function(talent) {
		// Variables
		var tree_name = this.get_talent_tree(talent); 
		var talent_tree = this.advanced_class[tree_name];
		var tree = this.advanced_class[tree_name]; 
		var talent_object; 
		
		for (i = 0; i < tree.talents.length; i += 1) {
			if (tree.talents[i].internal === talent) {
				talent_object = tree.talents[i]; 
				break; 
			}
		}
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
			this.points_by_tree[tree_name].total += 1; 
			this.points_by_tree[tree_name]['rank_' + talent_object.level] += 1; 
			
			// Set the value to the current level 
			jQuery('#' + this.id + ' li.' + talent + ' span.current-level').text(this.talents[talent]); 
			jQuery('#' + this.id + ' li.' + talent).removeClass('disabled'); 
			jQuery('#' + this.id + ' li.' + talent).addClass('active');
			
			this.enable_talents();
			return true; 
		}
		else {
			return false; 
		}
	},
	
	'remove_point': function(talent) {
		var tree_name = this.get_talent_tree(talent); 
		var talent_tree = this.advanced_class[tree_name];
		var points_by_rank = this.used_points_per_tree(tree_name); 
		var tree = this.advanced_class[tree_name]; 
		// copy the object 
		var points_by_rank_copy = jQuery.extend(true, {}, points_by_rank); 
		var talent_object, i, j, valid;
				
		// Look for the talent
		for (i = 0; i < tree.talents.length; i += 1) {
			if (tree.talents[i].internal === talent) {
				talent_object = tree.talents[i]; 
				break; 
			}
		}	
		
		// Check that there is at least one point 
		if (!this.talents[talent] || this.talents[talent] < 1) {
			console.log('useless');
			return false; 
		}
		
		// Check that there is no dependency problem
		// TODO: complete 
		
		// Check that higher levels talents are valid 
		// Remove the point to simulate (we do it on the copy only)
		points_by_rank_copy['rank_' + talent_object.level] -= 1;
		points_by_rank_copy.total -= 1;
		
		valid = true; 
		for (i = 0; i < tree.talents.length; i ++) {
			// If talent is active 
			if (this.talents[tree.talents[i].internal] > 0) {
				sum = 0;
				for(j = 0; j <= (tree.talents[i].level - 1); j++) {
					sum += points_by_rank_copy['rank_' + j]; 
				}
				
				if (valid && tree.talents[i].level * 5 > sum) {
					valid = false;
				}
			}
		}
		
		if (valid) {
			this.talents[talent] -= 1;
			
			// Update the caches (we know they've already been calculated)
			this.points_available += 1; 
			this.points_used -= 1; 
			this.points_by_tree[tree_name].total -= 1; 
			this.points_by_tree[tree_name]['rank_' + talent_object.level] -= 1; 
			
			// Set the value to the current level 
			jQuery('#' + this.id + ' li.' + talent + ' span.current-level').text(this.talents[talent]); 
			if (this.talents[talent] == 0) {
				jQuery('#' + this.id + ' li.' + talent).removeClass('active');
				jQuery('#' + this.id + ' li.' + talent).addClass('inactive'); 
			}
			
			
			this.enable_talents();
			return true;
		}
		else {
			console.log('not allowed');
			return false; 
		}
		
	}, 
	
	'add_listeners': function(){
		var that = this;
		// Don't allow contextmenu 
		jQuery('#' + this.id + ' ul.tree li.talent').bind('contextmenu', function(event) {
			return false;
		}); 
		
		jQuery('#' + this.id + ' li.talent').bind('mousedown', function(event){
			switch (event.which) {
				// Left mouse button
				case 1:
					return that.add_point(that.get_internal_name(this)); 
				// Middle mouse button
				case 2: 
					return false; 
				// Right mouse button
				case 3: 
					return that.remove_point(that.get_internal_name(this)); 
				default: 
					return false; 
			}
		}); 
	},
	
	'reset': function() {
		// TODO: complete
	}, 
	
	// Clear the local cache (reset all counters)
	'clear_cache': function() {
		// TODO: complete
	}, 
	
	'get_internal_name': function(element) {
		return jQuery(element).attr('class').split(' ')[0]; 
	}, 
	
	'get_talent_tree': function(talent) {
    return jQuery('#' + this.id + ' li.' + talent).parent().attr('class').split(' ')[0]; 
	}, 
	
	'_init_': function(object) {
		var el; 
		for (el in object) {
			this[el] = object[el];
		}
		this.add_listeners(); 
		this.enable_talents();
	}
}; 


