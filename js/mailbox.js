var _mailbox = {
  onScreenReady: function(element, params) {
    var visited = _cache.itemExists('mailbox.visited');

    if (!visited) {
      _cache.setItem('mailbox.visited', true);
      _cache.setItem('mailbox.screenReady', true);
      _cache.setItem('mailbox.domReady', false);
      _cache.setItem('mailbox.selected', params.mailbox);
      _cache.setItem('mailbox.scrollTop', 0);
    }
  },

  onDomReady: function(element, params) {
    if (_cache.getItem('mailbox.domReady') === true) {
      $('#loading').hide();
      console.log('loading mailbox listings from memory');

      var thiz = this;
      var cachedListing = _cache.getItem('mailbox.listing');
      $.each(cachedListing.data.children, function(index, value) {
        bbr.formatMessage(value, function(bbMessage) {
          $(bbMessage).attr('data-snooby-index', index);
          $(bbMessage).appendTo('#listing');
        });
      });

      setTimeout(function() { 
        thiz.scrollback(cachedListing); 
      }, 0);
    } else {
      console.log('loading mailbox listings from reddit');
      _cache.setItem('mailbox.domReady', true);
      this._updateListing(params.mailbox);
    }
  },

  _updateListing: function(mailbox, data) {
    $('#loading').show();
    $('#listing').hide();
    $('#listing').empty();
    var index = 0;
    app.mailbox(mailbox, data, function(message) {
      bbr.formatMessage(message, function(bbMessage) {
        $(bbMessage).attr('data-snooby-index', index++);
        $(bbMessage).appendTo('#listing');
      });
    }, function(listing) {
      $('#loading').hide();
      $('#listing').show();
    });
  }
};
