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
  //   if (_cache.getItem('mailbox.domReady') === true) {
  //     $('#loading').hide();
  //     console.log('loading mailbox listings from memory');

  //     var thiz = this;
  //     var cachedListing = _cache.getItem('mailbox.listing');
  //     $.each(cachedListing.data.children, function(index, value) {
  //       bbr.formatMessage(value, function(bbMessage) {
  //         $(bbMessage).attr('data-snooby-index', index);
  //         $(bbMessage).appendTo('#listing');
  //       });
  //     });

  //     setTimeout(function() { 
  //       thiz.scrollback(cachedListing); 
  //     }, 0);
  //   } else {
      console.log('loading mailbox listings from reddit');
      _cache.setItem('mailbox.domReady', true);
      this._updateListing(params.mailbox);
  //   }

    this._setupContextMenu();
  },

  _setupContextMenu: function() {
    blackberry.ui.contextmenu.enabled = true;

    var options = {};

    blackberry.ui.contextmenu.defineCustomContext('messageContext', options);

    var reply = { actionId: 'replyAction',
                  label: 'Reply',
                  icon: '../img/icons/ic_edit.png' };

    var markAsRead = { actionId: 'markAsReadAction',
                       label: 'Mark as read',
                       icon: '../img/icons/ic_email_read.png' };

    var comments = { actionId: 'contextAction',
                     label: 'Full comments',
                     icon: '../img/icons/ic_textmessage.png' };

    blackberry.ui.contextmenu.addItem(['messageContext'], comments, this._doFullComments);
    blackberry.ui.contextmenu.addItem(['messageContext'], reply, this._doComment);
    blackberry.ui.contextmenu.addItem(['messageContext'], markAsRead, this._doMarkAsRead);
  },

  _doMarkAsRead: function(sourceId) {
    var $status = $('#message-' + sourceId + ' .status').first();
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    app.markAsRead(sourceId, user.modhash);

    $status.removeClass('unread');
  },

  _doFullComments: function(sourceId) {
    var $message = $('#message-' + sourceId);
    var context = $message.data('snooby-context');
    _mailbox.pushCommentsScreen(context);
  },

  pushCommentsScreen: function(context) {
    bbr._handleRedditCommentLink({ pathname: context.substring(0, context.lastIndexOf('/')) });
  },

  scrollback: function(listing) {
    $('#listing').css('visibility: hidden');
    $('#listing').show();
    $('#mailbox').children('div').eq(1).scrollTop(_cache.getItem('mailbox.scrollTop'));
    $('#listing').css('visibility: visible');
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
