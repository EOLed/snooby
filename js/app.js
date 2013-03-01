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

  unvote: function(id, modhash, onsuccess) {
    if (typeof onsuccess !== 'function')
      onsuccess = function() {};

    snooby.vote(0, id, modhash, onsuccess);
  },

  upvote: function(id, modhash, onsuccess) {
    if (typeof onsuccess !== 'function')
      onsuccess = function() {};

    snooby.vote(1, id, modhash, onsuccess);
  },

  downvote: function(id, modhash, onsuccess) {
    if (typeof onsuccess !== 'function')
      onsuccess = function() {};

    snooby.vote(-1, id, modhash, onsuccess);
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
  }
};
