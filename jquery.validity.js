/*
 * jQuery form validity plugin
 * @author: Jonathan Brumley <cayasso@gmail.com>
 */
 
/**
 * <p>The form validity plugin allow form validation, for the moment there are only two 
 * predefined rules, "required" and "email".</p>
 * <strong>Quick example:</strong> 
 * <pre>var news_letter = {	'#email' : 	[{ rule: 'email' }] }; <br>
 * $('#myForm').validity({ fields: news_letter});</pre>
 * @requires jquery
 */
(function ($) {
	
	/**
	 * <p>This class provide access to the visitor cookie information (registration, oap, region,
	 * cookie value).</p>
	 *
	 * <strong>Usage example 1:</strong> 
	 * <pre>var email_field = {'#email': [{rule: 'email'}] }; <br>
	 * $('#myForm').validity({ fields: email_field});</pre>
	 * <p>This will validate the input with id "email" from the form with id "myForm" applying 
	 * the email rule. If input value is invalid it will output an alert error message.</p>
	 *
	 * <strong>Usage example 2:</strong> 
	 * <pre>var news_letter = {	'#search' : 	[{ rule: 'required', message: 
	 * 'This field is required.' }] }; <br>
	 * $('#myForm').validity({ fields: news_letter});</pre>
	 * <p>This will validate the input field with id "search" from the form with id "myForm"
	 * running the "required" predefined rule, if input is empty it will output an alert with 
	 * error message.</p>
	 *
	 * <strong>Create your own validation rule</strong>
	 * <p>You can always create your own validation rule by passing a funtion that returns 
	 * boolean to the rule property. Check the example bellow.</p>
	 * <strong>Usage example 3:</strong> 
	 * <pre>var login_field = {	
	 *
	 *	'#login': [{ 										   
	 *   rule: function(obj){ 
	 *			return (obj.value == 'Secrey key')
	 *	   }
	 *	]}; <br>
	 * $('#myForm').validity({ fields: login_field, message: 'Invalid secret key.'});</pre>
	 *
	 * <p>This will use custom anonimus function to validate as a rule to validate if user is 
	 * entering the right secret key, if the object value (this refers to the input value) is 
	 * different than the secret key, message "Invalid secret key." will be displaying.</p>
	 *
	 * @class fn.validity
	 * @constructor
	 * @param options {Object} (Required) An Object containing one or more global options as minimum
	 * you have to pass the fields with the rules.
	 * @param fn {Function} (Optional) Callback function
	 */
    $.fn.validity = function (options, callback) {

		$inputs = $('input[type="text"], input[type="email"]');
		
		// Set autodefault by setting the onfocus events
        $inputs.live('focusin', function () {										  
			if (this.value == this.defaultValue)
				this.value = '';  
        }).live('focusout', function () {
			if (this.value === '')
				this.value = this.defaultValue || '';
        });
		
		// Form submit event definition
		this.submit(function () {
			
			// Cache the DOM form in variable
            var form = this, 
			
			// Set initial status
			status = true;

			// Iterate trough all fields
            $.each(o.fields, function (key, rls) {
				
				if ( ! runRules($(form).find(key), rls) === true) {											
					
					// execute on error
					$.isFunction(o.onError) && o.onError(form, errors);
					
					// If show_alerts is enable trigger the alert
					o.show_alerts && alert(errors.msg);
					
					// Set the error status
					status = false; 
					return false;
				}
            });

            // Run callback function and pass the status and the object
            o.callback(this, status, errors);
			
			return status;			
        });

		// Set default values
		var defaults = {
			
			/**
			 * Enable the error alerts functionality, this will use the.
			 * browser regular alert box
			 *
			 * @public
			 * @property show_alerts
			 * @type Boolean
			 * @default true
			 */
			show_alerts: true,
			
			/**
			 * Fields to validate
			 *
			 * @public
			 * @property fields
			 * @type Object
			 * @default Object
			 */
			fields: {},
			
			/**
			 * Contains default error messages for rules. <br>
			 * Default is an object literal with error messages for "required" and "email" rules.
			 * 
			 * @public
			 * @property messages
			 * @type Object
			 * @default Object
			 */
			messages: {
				required: 'This field is required when submitting.',
				email: 'The email address you entered is invalid.\n\nPlease reenter your email address. Example: name@example.com'
			},
			
			/**
			 * On error function allow adding a function that executes when an error is found.
			 *
			 * @public
			 * @property orError
			 * @type Function
			 * @default Function
			 */
			onError: function(){},
			
			/**
			 * Callback function, this will trigger at the end of any validation.
			 *
			 * @public
			 * @property callback
			 * @type Function
			 * @default Function
			 */
			callback: function(){}
		},
		
		rules = {
			
			// Required rule
			required: function (obj) {					
				return !(!obj.value || obj.value === '');
			},

			// Email rule
			email: function (obj) {				
				return /^[a-z0-9^_`{|}~-]+(?:\.[a-z0-9^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,4})$/i.test(obj.value);
			}
		}, 
		
		errors = {},
		
		// Get options based on user options or defaults
		o = {};
		
		setOptions(options, callback);		
		
		/**
		 * Set global default options
		 *
		 * @private
		 * @method setSegment
		 * @param key {String} rule key eg. NV which is in rules
		 * @param rule {Mixed} it cold be object literal or a custom function 
		 * e.g. setSegment('NOR', { reg: 1, oap: 0}) or setSegment('NOR', function(){})
		 * @return {Mixed} segment value or false
		 */
		function setOptions (options, fn) {
		
			if (options && options.callback && $.isFunction(fn)) {
				// Asign callback function
				o.callback = fn;
			}
	
			o = $.extend({}, defaults, options);
		}
		
		/**
		 * Set global default options
		 *
		 * @private
		 * @method setSegment
		 * @param key {String} rule key eg. NV which is in rules
		 * @param rule {Mixed} it cold be object literal or a custom function 
		 * e.g. setSegment('NOR', { reg: 1, oap: 0}) or setSegment('NOR', function(){})
		 * @return {Mixed} segment value or false
		 */
		function runRules(e, r){

			// Initial status
			var status = true;
			
			// Check if element exist
			if (e.length) {
					
				var field = e[0];
				
				// Set default if needed
				if (field.value === field.defaultValue)
					field.value = '';
				
				// if rules is an array continue
				if ($.isArray(r)) {
					
					// Run validation against each rule						
					for (var i = 0; i < r.length; i++) {
						
						if (r[i].rule){
							
							// If rule is just a string match with defined rules
							if (typeof r[i].rule === 'string') {
								
								status = rules[r[i].rule](field);
							
							// If rule is a function then execute
							} else if ($.isFunction(r[i].rule)) {
								
								status = r[i].rule(field);
							}
							
							// If this rule returns false then add error message
							if(status === false) {
																
								if (field.value === '')
									field.value = field.defaultValue || '';	
								
								// Adding error message to errors array
								errors.field = field; 
								errors.msg = r[i].message || defaults.messages[r[i].rule] || '';
								
								return false;
							}
						}
					}
				}
			}		
			
			return status;
		}    

        return this;
    };

})(jQuery);
