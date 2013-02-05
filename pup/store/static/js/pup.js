var pup = $(function () {
  'use strict';

  var _kmq = _kmq || [];
  var _gaq = _gaq || [];

  $('input, textarea').placeholder();

  $('html').click(function () {
    $('.user .menu').hide();
  });

  $('header .user').click(
    function (event) {
      event.stopPropagation();
      $('.user .menu').toggle();
    }
  );

  //sign-in hover function
  $('.sign-in').hover(function () {
    $('.login', this).show();
  }, function () {
    $('.login', this).fadeOut(250);
  });

  //remove register-modal, if logged in
  if ($('header .user').length) {
    $('.register-modal').attr('href', '/');
    $('.register-modal').removeClass('register-modal');
  }

  //hide and shipping info when checked, on the accounts/update page
  if ($('.account-update').length) {
    if ($('#id_copy_address:checked').length) {
      $('.shiprow').addClass('hidden');
    }
    $('#id_copy_address').live('click', function () {
      if ($('#id_copy_address:checked').length) {
        $('.shiprow').addClass('hidden');
      } else {
        $('.shiprow').removeClass('hidden');
      }
    });
  }

  //Sign Up modal hide fields untill clicked
  $(".password2").hide();
  $(".invitation_code").hide();

  $('#id_password1').live("keyup", function () {
    $(".password2").delay(1500).fadeIn();
  });

  $('.invitation_code_click').click(function () {
    $(this).fadeOut(function () {
       $(".invitation_code").fadeIn();
    });
  });


  // opt-out ajax
  if ($('.opt-out').length) {
    $('.opt-out span').click(function () {
      $.ajax({
        type: 'POST',
        url: '/plans/submit/',
        data: $('.opt-out form').serializeArray(),
        success: function (resp, textStatus) {
          $(".opt-out").html("You've skipped this month.");
          if (typeof _kmq !== 'undefined') {
            _kmq.push(['record', 'Skipped Month', {'reason':'User skipped the month'}]);
          }
        },
        error: function (xhr, textStatus, errorThrown) {
          //console.log('failed');
          //console.log(textStatus);
        }
      });
      return false;
    });
  }


  //notifications modal
  $('.my-notifications').live("click", function () {
    $('.list').fadeIn();
  });

  $('.remove-notifications').live("click", function () {
    $('.list').fadeOut();
  });


  // remove items from cart
  $('.shopping-cart .remove').live("click", function () {
    var removeid = $(this).attr('class').replace("remove ", "");
    var inputSelector = '.shopping-cart .' + removeid+ ' input';
    $(inputSelector).val(0).blur();
    $(this).closest('li').fadeOut();
  });

  //remove items from cart checkout page
  $('.shopping-cart .remove_item').live("click", function () {
    var removeid = $(this).attr('class').replace("remove_item ", "");
    var inputSelector = '.shopping-cart .' + removeid+ ' input';
    $(inputSelector).val(0).blur();

    $(this).closest('tr').fadeOut();

  });

  // do nothing if gift quantity box is changed
  $('.gift_quantity').focus(function () {
    $(this).prop('disabled', true);
  });

  // Add error message if quantity in cart is not a valid number
  $('.quantity').live("blur", function () {
    var fieldq = $(this);
    if (isNaN($(this).attr('value'))) {
      $(this).after('<span class="error quantity2">Enter a valid number.</span>');
      $(this).live("focus", function () {
        $(this).next().addClass('removeme');
      });
    }
    return;
  });

  var mousedownHappened = false;

  //change quantity function
  $('.quantity').blur(function () {

    if(mousedownHappened) {
        //alert('stay focused!');
        $('input').focus();
        mousedownHappened = false;
    }
    else
    {

        var field = $(this);


        if($("#checkout_page").length) {
          //adjusting the checkout prices
          var itemPriceBox = field.parent().parent().find("p[class^='total_item_price']");
          var numberItems = field.val();
          var itemCost = field.parent().parent().find("div[class^='unit-price']").text();
          var itemCostNumber = Number(itemCost.replace(/[^0-9\.]+/g,""));
          var totalItemPrice = numberItems * itemCostNumber;
          itemPriceBox.contents().remove();
          itemPriceBox.append("<p>$" + totalItemPrice + ".00</p>");

        }

        var discountVal = $('.code').attr('value');
        var cartItem = $(this).attr('name').replace("cartitem_", "");
        var data = { cartitem: cartItem, quantity: $(this).attr('value'), csrfmiddlewaretoken: $('.csrf').html(), message: '',cart: $('.shopping-cart').attr('class').replace('shopping-cart ', ''), discount: $('.code').attr('value') };


        if (!isNaN($(this).attr('value'))) {
          $.ajax({
            type: 'POST',
            url: '/cart/qty/',
            dataType: 'json',
            data: data,
            success: function (resp, textStatus, data) {
             // :TODO: jshint recommendation: use '===' instead of '=='
             if (resp.item_qty == 0) {
                if ($('#checkout_page_logo').length) {
                  field.closest('tr').fadeOut().remove();
                } else {
                  field.closest('li').remove();
                }
              } else {
                $('div.pantry.hidden div.shopping-cart li.'+resp.item_id + ' input.quantity').val(resp.item_qty);
                $('div.order li.'+resp.item_id + ' input.quantity').val(resp.item_qty);
                var serves = field.parent().parent().find("span[class^='serves']");
                //console.log(serves);
                if (serves) {
                    serves.html(Number(field.val()) * 2);
                }
              }


              // for gift only checkouts
              // :TODO: jshint recommendation: use '===' instead of '=='
              if (resp.cart_gift_only == true) {
                $('.checkout_delivery_date').css("display", "none");
                $('.shipping-date').css("display", "none");
                $('.chekout_shipping_address').css("display", "none");
                $('#id_copy_address').prop('checked', true);
              }
              //if on checkout page
              if ($("#checkout_page").length) {
                  if (!resp.messages) {
                    $('input.orange_button').attr("disabled", false);
                    $('.cart-message .button').removeClass('post-plan-change');
                    $('.errors_on_page').css("display","none");
                    $('.cart-message').remove();
                    $('.cart-messages').remove();
                  } else {
                    $('input.orange_button').attr("disabled", true);
                    $('.errors_on_page').css("display","block");
                    var secondMessage = $('.order').find("div[class^='cart-messages']");
                    secondMessage.remove();
                    $('.cart-message').remove();

                    for (var i = resp.messages.length - 1; i >= 0; i -= 1) {
                      var ms = resp.messages[i];
                      //console.log(resp.messages);
                      $('.order').prepend("<div class='cart-message clearfix'><div class='cart-messages'><div class='cart-messages-left'>" + ms.alert_message + "</div> ");
                      if(ms.alert_link && ms.alert_post) {
                        $('input.orange_button').attr("disabled", false);
                        var itemQty = resp.item_qty;
                        var itemPrice = resp.item_price;
                        var totalItemCost = itemPrice * itemQty;
                        //console.log(totalItemCost);
                        $('.quantity').val("" + itemQty + "");
                        $('.total_item_price').contents().remove();
                        $('.total_item_price').append("<p>$" + totalItemCost + ".00</p>");
                        $('.cart-messages').append('<div class="cart-messages-right"><a class="orange_button post-plan-change" id="checkout_continue" href="'+ms.alert_link+'"><div class="med_button_arrow">'+ms.alert_link_text+'</div></a></div></div>');
                        $('.upgrade-plan-form').attr('action', ms.alert_link);
                        $('.upgrade-plan-form input.group').val(ms.alert_post.group);
                        $('.upgrade-plan-form input.ajax').val(ms.alert_post.ajax);

                        //console.log($('.upgrade-plan-form input.ajax').val());
                      } else {
                        if (ms.alert_link) {
                          $('.cart-messages').append('<div class="cart-messages-right"><a class="orange_button" id="checkout_continue" href="'+ms.alert_link+'"><div class="med_button_arrow">'+ms.alert_link_text+'</div></a></div></div>');
                        }
                      }
                      if ($('.cart-message').length > 1 ) {
                        var rightMessage = $('.order').find("div[class^='cart-messages-right']");
                        var lastRightMessage = rightMessage[rightMessage.length-1];
                        $(lastRightMessage).detach();
                      }
                      if (ms.disable_checkout) {
                        $('input.submit').attr('disabled', 'disabled');
                      }
                    }
                  }
              }


              $('.my-pantry .cart-num').html(Math.round(resp.cart_count));
              // change values on checkout page
              if ($("#checkout_page").length) {
                $('#price_subtotal').html(resp.cart_sub_total);
                $('#price_tax').html(resp.cart_tax);
                $('#total_amt').html(resp.cart_total);
                $('#discount_amt').html(resp.discount);
              }

              if (resp.new_group_id) {
                if (typeof _kmq !== 'undefined' && resp.new_group_quantity) {
                  _kmq.push(['record', 'upgraded', {'plan level': resp.new_group_quantity, 'plan price': resp.cart_item_price}]);
                }
              }
            },
            error: function (xhr, textStatus, errorThrown) {

              $('#overlay').modalWindow({
                'overlay-width': 622,
                'overlay-height': 200,
                'overlay-top': 50
              }).on('overlay-close', function (event) {
                if (typeof _kmq !== 'undefined') {
                  _kmq.push(['record', 'Dismiss Modal', {'reason':'User dismissed modal'}]);
                }
              });

              var thisPage = window.location;
              $('header').append("<div class='cart-error'>An error occurd with your shopping cart, click ok to continue<a href='" + thisPage + "' class='orange_button_small' style='float:right;'>OK</a></div>");
              //console.log(xhr);
              //console.log(errorThrown);
              //console.log('failed');
              //console.log(textStatus);
            }
          });

        }
      }
  });

$('a').mousedown(function () {
    mousedownHappened = true;
});
$('button').mousedown(function () {
    mousedownHappened = true;
});

  // Modal for Sign-In Interstitial
  var signup = $('.register-modal'),
      windowHeight = $(document).height(),
      windowWidth = $(window).width();

  // sign up modal
  if (signup.length && !($('.user_home').length)) {
    var register_selectors = [
      '.register-modal',
      '.steps > ul li',
      '.sign-up-modal',
      '.index .box',
      '.user_is_auth',
      // '.how-it-works',
      //'.about',
      '.sign-up-modal'
    ];
    $(register_selectors.join(',')).click(function () {

      $("#overlay").modalWindow({
        'overlay-width': 520,
        'overlay-height': 410,
        'overlay-top': 50
      }).on('overlay-close', function (event) {
        if (typeof _kmq !== 'undefined') {
          _kmq.push(['record', 'Dismiss Modal', {'reason':'User dismissed modal'}]);
        }
      });

      return false;
    });
  }


  // :TODO: BUG: "('.user_home').length" probably misses the jQuery "$"
  // invitation modal is created latter in the file.
  // Look for 'invitation_code_available'
  // Maybe this code can be removed?
  if ($('.invitation_code_available').length && !(('.user_home').length)) {
    // sign up modal
    $("#overlay").modalWindow({
      'overlay-width': 622,
      'overlay-height': 200,
      'overlay-top': 50
    });
  }


  // Cancel Account modal
  if ($('.cancel-account').length) {
    $('.cancel-account').click(function () {

      var overlay = $("#cancel-overlay");

      overlay.modalWindow({
        'overlay-width': 500,
        'overlay-height': 100,

        'fade-in-speed': 'fast',
        'fade-in-opacity': 0.7
      });

      var exitSelectors = [
        '.yes-no .no',
        '.yes-no .ok'
      ];
      $(exitSelectors.join(',')).live('click', function () {
          overlay.modalWindow('close');
      });

      $('.yes-no .yes').on('click', function (event) {

        $.ajax({
          type: 'POST',
          url: '/plans/deactivate/',
          data: $('.yes-no form').serializeArray(),
          success: function (resp, textStatus) {

            if (typeof _kmq !== 'undefined') {
             _kmq.push(['record', 'canceled', {'reason':'User Deactivated Account'}]);
            }

            $('#cancel-overlay').html('<h3>Your account has been cancelled.</h3><div class="yes-no"><a class="ok button mini">OK</a></div>');

            $('.cancel-account').after('Your account has been cancelled');
            $('.cancel-account').hide();
            window.location.href = '/accounts/deactivated/';
          },
          error: function (xhr, textStatus, errorThrown) {
            //console.log('failed');
            //console.log(textStatus);
          }
        });
        return false;
      });
    });
  }

  //add cookie to open modal if product was orderd on sign-up
  if($.cookie('cart_add')) {
      $('.user-shopping-cart').fadeIn();
      $.cookie("cart_add", null);
  }


  // ADD REGISTRATION MODAL IN HERE
  if ($('.invitation_code_available').length) {

    $('.invitation_code input').val($('.invitation_code_available').data('invite-code'));
    var code = $('.invitation_code input').val();

    $("#overlay").modalWindow({
      'overlay-width': 622,
      'overlay-height': 200,
      'overlay-top': 50,

      'fade-in-speed': 'fast',
      'fade-in-opacity': 0.7
    });
  }


 //Invitation Page Modal
 function inviteOverlay() {
          $("#overlay").modalWindow({
            'overlay-width': 380,
            'overlay-height': 460,
            'overlay-top': 50
          }).on('overlay-close', function (event) {
            if (typeof _kmq !== 'undefined') {
              _kmq.push(['record', 'Dismiss Modal', {'reason':'User dismissed modal'}]);
            }
          });
        }
  if($('.user-not-authenticated').length) {
        inviteOverlay();
     $("#id_emails").click(function () {
          inviteOverlay();
     });
     $("#submit_invite").click(function () {
          inviteOverlay();
      return false;
     });
  }

  if ($('#overlay').length) {
    $('.close').click(function () {
      $('#overlay').modalWindow('close');
    });

    // FB Register
    $('.fb-register .submit').click(function () {

      $('.fb-register ul').after('<div class="loading"></div>');
      $('input[type=submit]').attr('disabled', 'disabled');

      $('.non-field-error, .errorlist, div.error').remove();
      $('input').removeClass('error');

      $.ajax({
        type: 'POST',
        url: '/accounts/facebookregister/',
        data: $('.fb-register').serializeArray(),
        success: function (resp, textStatus) {
          var reg = jQuery.parseJSON(resp);
          //console.log(resp);

          if(reg.errors) {

            $.each(reg.errors, function (i, value) {

              if (typeof _kmq !== 'undefined') {
                  _kmq.push(['record', 'Facebook Registration Error', {'error':value.error}]);
              }

              // non field form error
              if(value.field_name == "N/A") {

                if($(".fb .non-field-error").length) {
                  $(".fb .error").html(value.error);
                } else {
                  $(".fb form").before('<div class="error non-field-error">' + value.error + '</div>');
                }
              } else {
                $(".fb #id_" + value.field_name).before("<ul class='errorlist'><li>" + value.error + "</li></ul>");
                $(".fb #id_" + value.field_name).addClass("error");
              }

            });

            $('input[type=submit]').removeAttr("disabled");

          } else {
            // Do this when everything is successful
            if (reg.success_url) {
              window.location.href = reg.success_url;
            }
          }

          $('.loading').remove();

        },
        error: function (xhr, textStatus, errorThrown) {
          //console.log('failed');
          //console.log(textStatus);
        }
      });

      return false;

    });


    // add div if cart add on sign up
    $('.product_page_order').click(function () {
      $("html body").append("<div class='product_page_order_div'></div>");
    });

    // Beta Register
    $('.beta-register .sign_up_button').click(function () {

      $('.beta-register input[type="text"]').css("border", "1px solid #ccc");
      $('.errorlist').remove();

      // :TODO: jshint recommendation: use '===' instead of '=='
	  var firstNameValue = $('.beta-register input[name="first_name"]');
      if ($.trim(firstNameValue.val()) == "" ) {
            $('.beta-register input[name="first_name"]').css("border", "1px solid red");
            $('.first_name').before("<ul class='errorlist'><li>This field is required.</li></ul>");
            return false;
      }
      // :TODO: jshint recommendation: use '===' instead of '=='
      var lastNameValue = $('.beta-register input[name="last_name"]');
	  if ($.trim(lastNameValue.val()) == "" ) {
            $('.beta-register input[name="last_name"]').css("border", "1px solid red");
            $('.last_name').before("<ul class='errorlist'><li>This field is required.</li></ul>");
            return false;
      }

      $('.beta-register ul').after('<div class="loading"></div>');
      $('input[type=submit]').attr('disabled', 'disabled');

      $('.non-field-error, .errorlist, div.error').remove();
      $('input').removeClass('error');


      var prod_slug = $('.menu-slug').html();
      var data = $('.beta-register').serializeArray();

      if (prod_slug && $('.product_page_order_div').length) {
        if (prod_slug !== "gifting") {
          data.push({"name":"product","value":prod_slug});
        }
      }

      $.ajax({
        type: 'POST',
        url: '/accounts/betaregister/',
        data: data,
        success: function (resp, textStatus) {

          var reg = jQuery.parseJSON(resp);
		
          if(reg.errors) {

            $.each(reg.errors, function (i, value) {
              if (typeof _kmq !== 'undefined') {
                  _kmq.push(['record', 'Registration Error', {'error':value.error}]);
              }
              // non field form error
              if(value.field_name == "N/A") {
                if($(".sign-up .non-field-error").length) {
                  $(".sign-up .error").html(value.error);
                } else {
                  $(".sign-up form").before('<div class="error non-field-error">' + value.error + '</div>');
                }
              } else {
                  $(".sign-up #id_" + value.field_name).before("<ul class='errorlist'><li>" + value.error + "</li></ul>");
                  $(".sign-up #id_" + value.field_name).addClass("error");
              }
            });

            $('input[type=submit]').removeAttr("disabled");
          } else {
            // Do this when everything is successful
            if (typeof _kmq !== 'undefined') {
              _kmq.push(['record', 'signed up', {'plan level':'Beta Invite'}]);
              var _qevents = _qevents || [];
              _qevents.push(
                  {qacct:"p-CtGRuC-swqzEZ",labels:"_fp.event.Beta Invite"}
              );
              _gaq.push(['_trackEvent', 'Registration', 'Submit', 'Create Account']);
            }

            if(reg.created_waitlist) {
              $('#waitlist-overlay').modalWindow({
                'overlay-width': 625,
                'overlay-top': 150
              });
            } else if($('.gifting').length) {
              window.location.reload();
            }else if($('#invitation_content').length) {
              window.location.reload();
            }else if($('.product_page_order_div').length) {
                $.cookie("cart_add", "true", { path: '/home' });
                window.location.href = "/home";
            }else{
              window.location.href = "/home";
            }
          }

          $('.loading').remove();

        },
        error: function (xhr, textStatus, errorThrown) {
          //console.log('failed');
          //console.log(textStatus);
        }
      });

      return false;
    });
  }

  // click my-pantry: display shopping cart
  $('.my-pantry').click(function () {
    $('.user-shopping-cart').fadeIn();
  });

  $('.shopping-cart-close').click(function () {
    $('.user-shopping-cart').fadeOut();
  });

  // user home popover for additional menu items
  $('.additional .image, .categories .box, .personalize .box').mouseenter(function () {
    if ($(this).parent().parent().find("div[class^='menu-slug']").html() == "gifting") {
      return;
      //do nothing
    } else {
      var popover = $('.popover');
      if (! popover.is(':visible')) {
        $(this).find('.popover').fadeIn(500);
      }
    }
  }).mouseleave(function () {
    $(this).find('.popover').fadeOut(1);
  });

  // order this item modal
  var product = $('.order-item');
  product.click(function () {
    if ($('#user-cart ul li').hasClass('new-shopping-menu')) {
      //$('.new-shopping-menu').remove();
    }
    var prod_slug, prod_img, prod_name;
    var prod_img_name, prod_img_edit, prod_img_thumb;

    // if we are on user home
    if($('.user_home').length) {
      // set the image and name
      prod_slug = $(this).parent().find('.menu-slug').html();
      prod_img = $(this).parent().find('img').attr('src'),
      prod_name = $(this).parent().find('.menu-name').html();

      prod_img_name = prod_img.match(/(.*)\.[^.]+$/)[1];
      prod_img_edit = prod_img_name.replace("entree", "thumb");
      prod_img_thumb = prod_img_edit + ".jpg";
    } else {
      prod_slug = $('.menu-slug').text();
      prod_img = $('#user_menu_main_pic_hide').find('img').attr('src');
      prod_name = $('.product_name_top').text();

      prod_img_name = prod_img.match(/(.*)\.[^.]+$/)[1];
      prod_img_edit = prod_img_name.replace("entree-hero", "thumb");
      prod_img_thumb = prod_img_edit + ".jpg";
    }

    var data = {
      productname: prod_slug,
      quantity: '1',
      csrfmiddlewaretoken: $('.csrf').html()
    };

    var shopping_cart_slug_array = $(".shopping-cart-slug").map(function () {
      return $(this).text();
    }).get();

    $.ajax({
      type: 'POST',
      url: '/cart/add/',
      dataType: 'json',
      data: data,
      async: false,

      success: function (data) {
        var slug_id = data.cart_item_id;
        $('.cart-num').text(data.cart_count);
        if ($('.shopping-cart ul li').hasClass(slug_id) ) {
          var qty = '.shopping-cart .' + slug_id + ' input' ;
          $(qty).val(data.quantity);
        } else {
          $("<li class='" + slug_id  + "'><div class='shopping-cart-thumb-image'><img src='" + prod_img_thumb + "'></div><div class='shopping-cart-description'><div class='desc'><h4><a href='/product/" + prod_slug  + "'> " + prod_name  + " </a></h4></div><div class='remove " + slug_id + "'><h5>REMOVE</h5></div></div><div class='quantity-box'><input type='text' class='quantity' name='cartitem_" + slug_id + "' value='1'></div></div>").appendTo('.shopping-cart ul');
        }
      },

      error: function (xhr, textStatus, errorThrown) {
        $('#overlay').modalWindow({
          'overlay-width': 622,
          'overlay-height': 200,
          'overlay-top': 50
        }).on('overlay-close', function (event) {
          if (typeof _kmq !== 'undefined') {
            _kmq.push(['record', 'Dismiss Modal', {'reason':'User dismissed modal'}]);
          }
        });

        var thisPage = window.location;
        $('header').appendTo("<div class='cart-error'>An error occurd with your shopping cart, click ok to continue<a href='" + thisPage + "' class='orange_button_tiny' style='float:right;'>OK</a></div>");
        //console.log(errorThrown);
        //console.log('failed');
        //console.log(textStatus);
        $('.shopping-cart').prepend(errorThrown);
      }
    });

    if( $.browser.msie && $.browser.version <= 8.0) {
      location.reload();
    }

    $("html, body").animate({ scrollTop: 0 }, "slow");
    $('.user-shopping-cart').fadeIn();
    $('.new-shopping-menu').animate({top: '-40px'}, 1000);
    $('#overlay .sign-up').remove();
    $('.close-just-added').click(function () {
      location.reload();
    });
  });


  // waitlist this item
  var wait_product = $('.waitlist-item');
  if (wait_product.length) {
    wait_product.on('click', function () {
      var prod_slug;
      // if we are on user home
      if($('.user_home').length) {
        // set the image and name
        prod_slug = $(this).parent().find('.menu-slug').html();
      } else {
        prod_slug = $('.menu-slug').html();
      }
      if (typeof _kmq !== 'undefined') {
        _kmq.push(['record', 'added to wait list', {'wait list product name': prod_slug}]);

        var _qevents = _qevents || [];
        _qevents.push(
          {qacct:"p-CtGRuC-swqzEZ",labels:"_fp.event.Added to Wait List"}
        );
      }

      $.ajax({
        type: 'POST',
        url: '/product/waitlist/add/',
        data: {
          productname : prod_slug, csrfmiddlewaretoken: $('.csrf').html()
        }
      });
      if ( ! $('.blue_button').hasClass('not_logged_in') ) {
        $("#waitlist-overlay").modalWindow({
          'overlay-width': 625,
          'overlay-top': 150
        });
      }

    });
  }


  // About Page
  if ($('#main .about')) {

    $('.sub-nav li a').hover(function () {
      $(this).addClass('hovered');
    }, function () {
      $(this).removeClass('hovered');
    });

    $('.sub-nav li a').click(function () {
      var navName = $(this).data('trigger');
      $('.sub-nav li a').removeClass('selected');
      $(this).addClass('selected');
      $('.sections .section').hide();
      $(".sections #" + navName).show();

      return false;
    });


    // FAQ page
    $('.faq-listing h5').click(function () {

      if ($(this).parent('li').hasClass('open')) {
        $(this).parent().removeClass('open');
      } else {
        $(this).parent('li').addClass('open');
      }
    });

  }



  //home product box links
  $('.home_box').click(function () {
    var prodSlugForHomePage = $(this).find("div[class^='home_product_slug']").text();
    window.location = "/product/" + prodSlugForHomePage + "/";
  });

  //order button for gift on UHP
  $('.gift-item').click(function () {
    window.location.href = "/gifts";
  });

  //wrap input buttons with stiching
  $('input.stitching').wrap('<span class="input_stitching"></span>');



}());


/**
http://ozkatz.github.com/structuring-client-side-javascript-code.html

The common.js file is used to create a namespace and provide general utilities
and classes that are, well, common to the entire project.
*/

var pup = {
  'settings': {
    'analytics': {
      'logEvents': {
        'review-modal-started': 'Started Modal Review',
        'review-modal-finished': 'Finished Modal Review',

        'review-onepage-started': 'Started Onepage Review',
        'review-onepage-finished': 'Finished Onepage Review'
      }
    }
  }
};


/**
http://ozkatz.github.com/structuring-client-side-javascript-code.html

handlers.js is used to hold callbacks that are fired when the
user does something.

They are not yet tied to their respective events, but only defined here.
This might seem counter-intuitive or difficult at first, but it has proven
itself to be really helpful at fighting and preventing callback hell.
*/

(function () {
  "use strict";

  pup.handlers = {
    'orderSurveys': {
      'wizard': {
        'complete': function (event) {
          var wizard_container = $(event.currentTarget);
          (pup.views.orderSurveys.wizard.getSubmitRow(wizard_container)).show();
        }, // complete

        'next': function (event,
                          next_step, next_index,
                          previous_step, previous_index,
                          steps_length) {
          $(window).scrollTop(0);
          var wizard_container = $(event.currentTarget);

          // updating progress indicator
          $('.wizard-progress-current', wizard_container).text(next_index + 1);
          $('.wizard-progress-max', wizard_container).text(steps_length);
        }
      }, // wizard
      'overlay': {
        'submitted': function (event) {
          event.preventDefault();

          var form = $(event.currentTarget);
          pup.views.orderSurveys.overlay.submitSurvey(form);

        }, // submitted
        'contentLoaded': function (event, data, textStatus, jqXHR) {
          var settings = this;
          pup.views.orderSurveys.overlay.replaceContent($(data), settings.url);
          pup.views.orderSurveys.initSurveyLinks();
        } // contentLoaded
      } // overlay
    }, // orderSurveys

    'orderHistory': {
      'overlay': {
        'closed': function ( event, overlay ) {
          if ( pup.views.orderSurveys.hasThankYouContent(overlay) ) {
            window.location.reload();
          }
        }
      }
    }, // orderHistory
    'overlayTrigger': {
      'orderSurvey': function (event) {
        event.preventDefault();

        var link = $(event.currentTarget);
        var target_url = link.attr('href');

        pup.views.orderSurveys.overlay.init(target_url);
      }
    }
  };

}) ();

/**
http://ozkatz.github.com/structuring-client-side-javascript-code.html

views.js holds the presentational logic.
This could be Backbone.js views, your own template handling code,
or just manual creation of DOM elements.

It all happens here.
*/
(function () {
  "use strict";

  pup.views = {
    'orderSurveys': {
      'init': function () {

        pup.views.orderSurveys.initRadioButtons();
        pup.views.orderSurveys.wizard.init($('.order-survey.wizard'));

        if ( pup.views.orderSurveys.hasThankYouContent() ) {
          if ( ! pup.views.orderSurveys.hasShippingContent() ) {
            $(document).trigger('review-onepage-finished');
          }
        } else if ( pup.views.orderSurveys.hasSurveyContent() ) {
          $(document).trigger('review-onepage-started');
        }
      }, // init
      'initRadioButtons': function () {
        $('.order-survey .question').styleRadioButtons();
      }, // initRadioButtons


      'initSurveyLinks': function () {
        // Since overlay-logic is javascript dependent, load href-target
        // from data-href attribute.
        // Otherwise fast-clicking users will see one-page layout
        // although they should see modal-version of the survey.
        $('a.survey-link').each(function () {
          var surveyLink = $(this);
          var target_url = surveyLink.data('href');
          if (target_url) {
            surveyLink.attr('href', target_url);
            surveyLink.data('href', null);
          }
        });

        pup.views.orderSurveys.overlay.initSurveyLinks();

      }, // initSurveyLinks

      'wizard': {
        'init': function (wizardContainer) {
          wizardContainer.each(function () {
            var wizardContainer = $(this);
            var submit_row = pup.views.orderSurveys.wizard.getSubmitRow(wizardContainer);

            var form_errors = $('.form-errors', wizardContainer);
            var step_with_errors = form_errors.first().parents('.wizard-step');

            submit_row.hide();
            wizardContainer.on('complete', pup.handlers.orderSurveys.wizard.complete);
            wizardContainer.on('next', pup.handlers.orderSurveys.wizard.next);

            wizardContainer.wizard({ 'init-step': step_with_errors });
          });
        }, // init

        'getSubmitRow': function (wizardContainer) {
          return $('.submit-block .submit-row', wizardContainer);
        } // getSubmitRow
      }, // wizard

      'overlay': {
        'initSurveyLinks': function () {
          $('.as-overlay:not(.as-overlay-initialized)').on(
            'click',
            pup.handlers.overlayTrigger.orderSurvey
          ).addClass('as-overlay-initialized');
        },
        'init': function (target_url) {
          var overlay = pup.views.orderSurveys.overlay.get();

          overlay.on('overlay-contentLoaded',
                     pup.handlers.orderSurveys.overlay.contentLoaded);

          if ( target_url && overlay.length ) {

            // remove content from previous surveys
            overlay.empty();

            // init overlay
            overlay.modalWindow({
              'overlay-top': 10,
              'overlay-width': 1020
            });

            pup.views.orderSurveys.overlay.fetchContent(target_url);
          }
        }, // init
        'addAnalyticsEvents': function () {
          $(document).on('overlay-contentLoaded', function (event, data, textStatus, jqXHR) {
            if ( pup.views.orderSurveys.hasThankYouContent(data) ) {
              if ( ! pup.views.orderSurveys.hasShippingContent(data) ) {
                $(document).trigger('review-modal-finished');
              }
            } else if ( pup.views.orderSurveys.hasSurveyContent(data) ) {
              $(document).trigger('review-modal-started');
            }
          });
        }, // addAnalyticsEvents
        'fetchContent': function (target_url) {
          var overlay = pup.views.orderSurveys.overlay.get();

          $.ajax({
            'url': target_url
          }).done(function (data, textStatus, jqXHR) {
            overlay.trigger('overlay-contentLoaded', [ data, textStatus, jqXHR ]);
          });

        }, // fetchContent
        'replaceContent': function (newContent, target_url) {
          var overlay = pup.views.orderSurveys.overlay.get();

          // pasting new content into DOM
          newContent = pup.views.orderSurveys.overlay.getOverlayContent(newContent);
          overlay.empty()
                 .append(newContent);

          // initializing wizard
          var wizard_container = pup.views.orderSurveys.overlay.getOverlayContent(overlay);
          wizard_container.addClass('wizard');

          pup.views.orderSurveys.wizard.init(wizard_container);
          overlay.modalWindow('resize');
          overlay.styleRadioButtons();

          pup.views.orderSurveys.overlay.getForm(overlay).on(
            'submit',
            pup.handlers.orderSurveys.overlay.submitted
          );

          var form = pup.views.orderSurveys.overlay.getForm(overlay);
          form.attr('action', form.attr('action') || target_url);
        }, // replaceContent

        'submitSurvey': function (form) {
          var overlay = pup.views.orderSurveys.overlay.get();
          $.ajax({
            'url': form.attr('action'),
            'type': 'POST',
            'data': form.serialize()
          }).done(function (data, textStatus, jqXHR) {
            overlay.trigger('overlay-contentLoaded', [ data, textStatus, jqXHR ]);
          });
        }, // submitSurvey


        'get': function () {
          return $('.overlay-order-survey');
        }, // get
        'getForm': function (overlay) {
          return $('form', overlay);
        },
        'getOverlayContent': function (overlay) {
          return $('.overlay-content', overlay);
        },
      }, // overlay

      'hasThankYouContent': function (element) {
        return ( $('.order-survey-thankyou', element).length > 0 );
      },
      'hasShippingContent': function (element) {
        return ( $('form.order-survey-shipping', element).length > 0 );
      },
      'hasSurveyContent': function (element) {
        return ( $('.order-survey', element).length > 0 );
      }

    }, // orderSurveys
    'orderHistory': {
      'init': function () {
        $(document).on('overlay-close',
                       pup.handlers.orderHistory.overlay.closed);
        pup.views.orderSurveys.initSurveyLinks();
      } // init
    }, // orderHistory
    'analytics': {
      'init': function () {
        var _kmq = _kmq || [];

        $.each(pup.settings.analytics.logEvents, function (key, value) {
          $(document).on(key, function (event) {
            if ( typeof(_kmq) !== 'undefined' ) {
              _kmq.push(['record', value]);
            }
          });
        });
      } // init
    } // analytics
  };

}) ();

/**
http://ozkatz.github.com/structuring-client-side-javascript-code.html

The last file is app.js.
This is where we kick things off, connecting events to their handlers,
and running any startup logic our app might have.

We try to guess the logic part of the application based on top-level
dom-elements.
If we find some specific top-level element, we run the corresponding
startup-code.
*/

(function () {
  "use strict";

  pup.app = {};

  $(document).ready(function () {

    pup.views.analytics.init();

    if ( $('.order-survey').length ) {
      pup.views.orderSurveys.init();
    }

    if ( $('#orderhistory').length ) {
      pup.views.orderHistory.init();
    }

    pup.views.orderSurveys.overlay.addAnalyticsEvents();
  });

}) ();
