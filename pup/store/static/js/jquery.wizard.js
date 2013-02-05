(function( $ ) {
  'use strict';
  /*
  Creates a wizard-object: run through multiple steps by either the user
  clicking the next-button or by calling "$('.some-container').wizard('next')".

  Expects html-snippet like:
  <style>
  .wizard.wizard-last-step .wizard-back {
    display: none;
  }
  .wizard.wizard-last-step .wizard-next {
    display: none;
  }
  .wizard.wizard-first-step .wizard-back {
    display: none;
  }
  </style>

  <div class="some-container">
    <div class="wizard-step">
      Content 1
    </div>
    <div class="wizard-step">
      Content 2
    </div>

    <div class="wizard-back">
      <a href="#">Back</a>
    </div>
    <div class="wizard-next">
      <button type="submit">
        Next
      </button>
    </div>
  </div>
  */

  var methods = {
    // called when $('...').wizard();
    init: function( options ) {

      var wizard_container = $(this);

      // Create some defaults, extending them with any options that were provided
      var settings = $.extend( {
        'step-selector': '.wizard-step',
        'next-button-selector': '.wizard-next',
        'back-button-selector': '.wizard-back',

        'active-class': 'active',
        'init-class': 'wizard-initialized',
        'first-step-class': 'wizard-first-step',
        'last-step-class': 'wizard-last-step',

        'init-step': null // which step to set active after initialization
      }, options);

      return wizard_container.each(function () {
        var steps = $(settings['step-selector'], wizard_container);
        var first_step = steps.first();
        var last_step = steps.last();
        var init_step = settings['init-step'] || first_step;
        var next_button = $(settings['next-button-selector'], wizard_container);
        var back_button = $(settings['back-button-selector'], wizard_container);

        var first_step_class = settings['first-step-class'];
        var last_step_class = settings['last-step-class'];

        wizard_container.data('wizard', {
          'steps': steps,
          'active_step': init_step,
          'next_button': next_button,
          'back_button': back_button,

          'settings': settings
        });

        wizard_container.on('next', function (event, next_step) {
          wizard_container.removeClass(first_step_class)
                          .removeClass(last_step_class);

          if ( next_step.is(last_step) ) {
            wizard_container.addClass(last_step_class);
          }
          if ( next_step.is(first_step) ) {
            wizard_container.addClass(first_step_class);
          }

        });

        // marking first and last-step with special classes
        first_step.addClass(first_step_class);
        last_step.addClass(last_step_class);

        // showing elements from wizard
        wizard_container.wizard('next', init_step);

        next_button.on('click', function (event) {
          event.preventDefault();
          wizard_container.wizard('next');
        });

        back_button.on('click', function (event) {
          event.preventDefault();
          wizard_container.wizard('previous');
        });

        wizard_container.addClass(settings['init-class']);
      });
    },
    'next': function (next_step) {
      /*
      :param next_step:
      accepts a numeric id - used as index when looking for the next-step.

      accepts a dom-element or jquery-element as the next-step.

      if no parameter is given:
      try to find the active-step and switch to the next
      or use the first step as the active-step.
      */
      return this.each(function () {
        var wizard_container = $(this);
        var data = wizard_container.data('wizard');

        if (data) {
          var settings = data['settings'];

          var steps = data['steps'];
          var first_step = steps.first();
          var last_step = steps.last();
          var previous_step = steps.filter('.' + settings['active-class']).first();
          var previous_index = steps.index(previous_step);
          var steps_length = steps.length;

          var next_button = data['next_button'];

          // sanitize next_step
          if ( next_step === undefined ) {
            // if available, switch to the next step
            if (previous_step.length) {
              next_step = previous_step.next('.' + settings['step-selector']);
            }
          } else if ($.isNumeric(next_step)) {
            // if next_step is just a number
            // use it as an index
            next_step = $(steps.get(next_step));
          } else {
            // otherwise try to directly convert to a jquery object
            next_step = $(next_step).first();
          }

          if ( !next_step || next_step.length === 0 ) {
            // fallback is to switch to the first element in steps
            next_step = steps.first();
          }

          if (next_step.length) {
            var next_index = steps.index(next_step);

            steps.removeClass(settings['active-class']);
            next_step.addClass(settings['active-class']);

            if ( last_step.is(next_step) ) {
              // trigger event
              wizard_container.trigger('next', [ next_step, next_index,
                                                 previous_step, previous_index,
                                                 steps_length ]);
              wizard_container.trigger('complete');
            } else {
              // trigger events
              wizard_container.trigger('next', [ next_step, next_index,
                                                 previous_step, previous_index,
                                                 steps_length ]);
            }
          }
        }
      });
    },

    'previous': function () {
      return this.each(function () {
        var wizard_container = $(this);
        var data = wizard_container.data('wizard');

        if (data) {
          var settings = data['settings'];

          var steps = data['steps'];
          var first_step = steps.first();
          var last_step = steps.last();
          var previous_step = steps.filter('.' + settings['active-class']).first();
          var previous_index = steps.index(previous_step);

          wizard_container.wizard('next', previous_index - 1);
        }
      });
    }

  };

  $.fn.wizard = function ( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.wizard' );
    }

  };

})( jQuery );