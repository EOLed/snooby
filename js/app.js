var app = {
  login: function(username, password, onsuccess) {
    snooby.login(username, password, onsuccess);
  },

  logout: function(modhash, onsuccess) {
    snooby.logout(modhash, onsuccess);
  },

  listing: function(options) {
    if (typeof options.sort === 'undefined' || options.sort === null)
      options.sort = '';

    var callback = function(subreddits, listing) {
      _cache.setItem('subreddit.listing', listing);
      _cache.setItem('subreddit.selected', subreddits);
      _cache.setItem('subreddit.sort', options.sort);
      $.each(listing.data.children, function(index, value) {
        if (typeof options.callback === 'function')
          options.callback(value);
      });

      if (typeof options.oncomplete === 'function')
        options.oncomplete(listing);

      app.me();
    };

    snooby.listing({ subreddits: options.subreddits, 
                     data: options.data, 
                     sort: options.sort, 
                     callback: callback }); 
  },

  hasMail: function() {
    var hasMail = _cache.getPersistedItem('me.hasMail');
    return hasMail !== null && JSON.parse(hasMail).clientHasMail;
  },

  readMail: function() {
    var hasMail = JSON.parse(_cache.getPersistedItem('me.hasMail'));
    hasMail.clientHasMail = false;

    _cache.persistItem('me.hasMail', JSON.stringify(hasMail));
  },

  me: function(onsuccess) {
    snooby.me(function(me) {
      _cache.persistItem('me', JSON.stringify(me));

      var hasMail = JSON.parse(_cache.getPersistedItem('me.hasMail'));
      if (hasMail === null) {
        hasMail = { clientHasMail: false, serverHasMail: false };
        _cache.persistItem('me.hasMail', JSON.stringify(hasMail));
      }

      if (!hasMail.serverHasMail && me.data.has_mail) {
        hasMail.serverHasMail = true;
        hasMail.clientHasMail = true;
      } else if (!me.data.has_mail) {
        hasMail.serverHasMail = false;
        hasMail.clientHasMail = false;
      }

      _cache.persistItem('me.hasMail', JSON.stringify(hasMail));

      if (typeof onsuccess === 'function')
        onsuccess(me);
    });
  },

  comments: function(permalink, callback, oncomplete, opcallback) {
    var length = 0;
    var CHUNK_LENGTH = 50000;
    if (typeof resume === 'undefined')
      resume = 0;

    snooby.comments(permalink, function(comments) {
      var op = comments[0].data.children[0];
      if (typeof opcallback === 'function')
        opcallback(op);

      comments.shift();

      _cache.setItem('comments.listing', comments[0]);

      // seperate comments in chunks
      var chunkIndex = 0;

      $.each(comments[0].data.children, function(commentIndex, value) {
        if (commentIndex < resume) 
          return;

        if (length > CHUNK_LENGTH) {
          chunkIndex++;
          length = 0;
          _cache.setItem('comments.resume', commentIndex);
        }

        length += JSON.stringify(value).length;
        callback(value, op, chunkIndex);
      });

      if (typeof oncomplete === 'function')
        oncomplete();
    });
  },

  subreddits: function(callback, oncomplete) {
    var cachedSubreddits = JSON.parse(_cache.getPersistedItem('snooby.subreddits'));
    var thiz = this;
    
    if (cachedSubreddits === null) {
      var loggedUser = _cache.getPersistedItem('snooby.user');

      if (loggedUser === null) {
        snooby.defaultSubreddits(function(subreddits) {
          thiz._processSubreddits(subreddits, callback, oncomplete);
        });
      } else {
        snooby.userSubreddits(function(subreddits) {
          thiz._processSubreddits(subreddits, callback, oncomplete);
        });
      }
    } else {
      thiz._processSubreddits(cachedSubreddits, callback, oncomplete);
    }
  },

  unvote: function(id, modhash, onsuccess, onrateexceeded) {
    if (typeof onrateexceeded === 'undefined') {
      onrateexceeded = this._rateExceededToast;
    }

    var doUnvote = function() {
      snooby.vote(0, id, modhash, onsuccess);
    };

    rateLimiter.requestAction(rateLimiter.VOTE, doUnvote, onrateexceeded);
  },

  upvote: function(id, modhash, onsuccess, onrateexceeded) {
    if (typeof onrateexceeded === 'undefined') {
      onrateexceeded = this._rateExceededToast;
    }

    var doUpvote = function() {
      snooby.vote(1, id, modhash, onsuccess);
    };

    rateLimiter.requestAction(rateLimiter.VOTE, doUpvote, onrateexceeded);
  },

  downvote: function(id, modhash, onsuccess, onrateexceeded) {
    if (typeof onrateexceeded === 'undefined') {
      onrateexceeded = this._rateExceededToast;
    }

    var doDownvote = function() {
      snooby.vote(-1, id, modhash, onsuccess);
    };

    rateLimiter.requestAction(rateLimiter.VOTE, doDownvote, onrateexceeded);
  },

  mailbox: function(where, data, callback, oncomplete, onrateexceeded) {
    if (typeof onrateexceeded === 'undefined') {
      onrateexceeded = this._rateExceededToast;
    }

    snooby.mailbox(where, data, function(mailbox, listing) {
      _cache.setItem('mailbox.listing', listing);
      _cache.setItem('mailbox.selected', mailbox);
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });

      if (typeof oncomplete === 'function')
        oncomplete(listing);
    }); 
  },

  _processSubreddits: function(subreddits, callback, oncomplete) {
    _cache.persistItem('snooby.subreddits', JSON.stringify(subreddits));
    var frontpage = { data: { display_name: 'frontpage' } };
    subreddits.unshift(frontpage);

    $.each(subreddits, function(index, value) {
      if (typeof callback === 'function')
        callback(value);
    });

    if (typeof oncomplete === 'function')
      oncomplete();
  },

  _rateExceededToast: function() {
    blackberry.ui.toast.show('You have exceeded today\'s free rate limit. Please wait a little or purchase Snooby Gold for unlimited access.', { timeout: 9000 });
  },

  comment: function(text, thingId, modhash, onsuccess, onrateexceeded) {
    if (typeof onrateexceeded === 'undefined') {
      onrateexceeded = this._rateExceededToast;
    }

    var postComment = function() {
      snooby.comment(text, thingId, modhash, onsuccess);
    };

    rateLimiter.requestAction(rateLimiter.COMMENT, postComment, onrateexceeded);
  },

  markAsUnread: function(id, modhash, onsuccess) {
    snooby.markAsUnread(id, modhash, onsuccess);
  },

  markAsRead: function(id, modhash, onsuccess) {
    snooby.markAsRead(id, modhash, onsuccess);
  }
};
