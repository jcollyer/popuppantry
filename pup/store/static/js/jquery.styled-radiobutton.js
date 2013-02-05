(function( $ ){

  $.fn.styleRadioButtons = function( options ) {

    var that = $(this);

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend( {
      'selected-class': 'selected',
      'container-selector': 'label'
    }, options);

    var delegateStyle = function (radio, signal_element) {
      if (radio.prop('checked')) {
        signal_element.addClass(settings['selected-class']);
      } else {
        signal_element.removeClass(settings['selected-class']);
      }
    };

    return that.each(function() {

      var element = $(this);

      $(':radio', element).each(function () {

        var radio = $(this);
        var parent = radio.parents(settings['container-selector']);

        /* initial setup when re-loading page */
        delegateStyle(radio, parent);

        /* updating styles when radio-buttons change */
        radio.on('change', function (event) {
          // re-setting styles for radio buttons with same name
          var name = radio.attr('name') || '';
          $(':radio[name=' + name + ']').each(function () {
            var other_radio = $(this);
            var other_parent = other_radio.parents(settings['container-selector']);
            delegateStyle(other_radio, other_parent);
          });

          delegateStyle(radio, parent);
        });
      });

    });

  };
})( jQuery );