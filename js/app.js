var app = {
  login: function(username, password, onsuccess) {
    snooby.login(username, password, onsuccess);
  },

  logout: function(modhash, onsuccess) {
    snooby.logout(modhash, onsuccess);
  },

  listing: function(subreddits, callback) {
    snooby.listing(subreddits, function(subreddits, listing) {
      _cache.setItem('subreddit.listing', listing);
      _cache.setItem('subreddit.selected', subreddits);
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });
    }); 
  },

  comments: function(permalink, op, callback) {
    snooby.comments(permalink, op, function(comments) {
      comments.shift();
      $.each(comments, function(index, comment) {
        $.each(comment.data.children, function(commentIndex, value) {
          callback(value, op);
        });
      });
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

  _processSubreddits: function(listing, callback, oncomplete) {
    _cache.persistItem('snooby.subreddits', JSON.stringify(listing));
    var frontpage = { data: { display_name: 'frontpage' } };
    var subreddits = listing.data.children;
    subreddits.unshift(frontpage);

    $.each(subreddits, function(index, value) {
      if (typeof callback === 'function')
        callback(value);
    });

    if (typeof oncomplete === 'function')
      oncomplete();
  }
};
