var app = {
  login: function(username, password, onsuccess) {
    snooby.login(username, password, onsuccess);
  },

  logout: function(modhash, onsuccess) {
    snooby.logout(modhash, onsuccess);
  },

  listing: function(subreddits, data, callback, oncomplete) {
    snooby.listing(subreddits, data, function(subreddits, listing) {
      _cache.setItem('subreddit.listing', listing);
      _cache.setItem('subreddit.selected', subreddits);
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });

      if (typeof oncomplete === 'function')
        oncomplete(listing);
    }); 
  },

  comments: function(permalink, callback, oncomplete, opcallback) {
    var length = 0;
    var CHUNK_LENGTH = 30000;
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

    var doMailbox = function() {
      snooby.mailbox(where, data, function(mailbox, listing) {
        _cache.setItem('mailbox.listing', listing);
        _cache.setItem('mailbox.selected', mailbox);
        $.each(listing.data.children, function(index, value) {
          callback(value);
        });

        if (typeof oncomplete === 'function')
          oncomplete(listing);
      }); 
    }

    rateLimiter.requestAction(rateLimiter.VIEW_INBOX, doMailbox, onrateexceeded);
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

  markAsRead: function(id, modhash, onsuccess, onrateexceeded) {
    if (typeof onrateexceeded === 'undefined') {
      onrateexceeded = this._rateExceededToast;
    }

    var mark = function() {
      snooby.markAsRead(id, modhash, onsuccess);
    };

    rateLimiter.requestAction(rateLimiter.MARK_AS_READ, mark, onrateexceeded);
  }
};
