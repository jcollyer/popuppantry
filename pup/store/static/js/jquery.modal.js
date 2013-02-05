(function( $ ) {
  'use strict';

  var methods = {
    // called when $('...').modalWindow();
    init: function( options ) {

      var that = $(this);

      // Create some defaults, extending them with any options that were provided
      var settings = $.extend( {
        'mask-selector': '#mask',
        'overlay-top': null,
        'overlay-width': null,
        'overlay-height': null,

        'close-button-selector': '.overlay-action-close',

        'fade-in-speed': 'slow',
        'fade-in-opacity': 0.6
      }, options);

      return that.last().each(function() {

        var overlay = $(this);
        var active_overlay = $(window).data('overlay-active');
        var mask = $(settings['mask-selector']);

        if ( active_overlay ) { // && !active_over.is(overlay)
          active_overlay.modalWindow('close');
        }

        // save mask-reference and original-settings to overlay-object
        $(window).data('overlay-active', overlay);
        overlay.data('overlay-mask', mask);
        overlay.data('overlay-settings', settings);

        // set attributes
        var documentHeight = $(document).height();
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        var overlayWidth = settings['overlay-width'];
        var overlayHeight = settings['overlay-height'];


        // event callback functions
        var exitButtonHandler = function (event) {
          overlay.modalWindow('close');
        };

        var escKeyHandler = function (event) {
          // exit when ESC-key gets pressed
          if (event.keyCode === 27) {
            overlay.modalWindow('close');
          }
        };

        var resizeHandler = function (event) {
          overlay.modalWindow('resize');
        };

        // attaching callbacks
        mask.on('click', exitButtonHandler);
        $(overlay).on('click', settings['close-button-selector'], exitButtonHandler);
        $(document).on('keyup', escKeyHandler);
        $(window).on('resize', resizeHandler);

        // detaching callback functions
        overlay.on('overlay-close', function (event) {
          mask.off('click', exitButtonHandler);
          $(overlay).off('click', exitButtonHandler);
          $(document).off('keyup', escKeyHandler);
          $(window).off('resize', resizeHandler);
        });


        // display the mask and overlay
        $(window).scrollTop(0);

        mask.css({
          "width" : windowWidth,
          "height" : documentHeight
        });
        mask.stop().fadeTo(settings['fade-in-speed'],
                           settings['fade-in-opacity']);

        overlay.css({
          "width": overlayWidth,
          "minHeight": overlayHeight,
          // "top" : windowHeight / 2 - overlayHeight / 2,
          "top": settings['overlay-top'],
          "left": windowWidth / 2 - overlayWidth / 2
        });
        overlay.fadeIn();

        overlay.trigger('overlay-loaded');
      });

    },
    close: function ( ) {
      return this.last().each(function() {
        var overlay = $(this);
        var active_overlay = $(window).data('overlay-active');
        var mask = overlay.data('overlay-mask');

        if (mask && active_overlay.is(overlay)) {
          // removing reference to mask
          overlay.removeData('overlay-mask');
          overlay.removeData('overlay-settings');

          mask.fadeOut();
          overlay.fadeOut();

          overlay.trigger('overlay-close', [ overlay ]);
        }
      });
    },

    resize: function ( ) {
      return this.last().each(function() {
        var overlay = $(this);
        var mask = overlay.data('overlay-mask');
        var settings = overlay.data('overlay-settings');

        if (mask && settings) {
          // set overlay attributes
          var windowHeight = $(window).height();
          var windowWidth = $(window).width();
          var overlayWidth = settings['overlay-width'];

          overlay.css({
            "left": windowWidth / 2 - overlayWidth / 2
          });
          mask.css({
            "width": windowWidth
          });

        }
      });
    }
  };

  $.fn.modalWindow = function ( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.modalWindow' );
    }

  };

})( jQuery );