var snooby = {
  login: function(username, password, onsuccess, onfailure) {
    $.post('https://ssl.reddit.com/api/login', 
           { user: username, passwd: password, rem: true, api_type: 'json' },
           onsuccess);
  },

  logout: function(modhash, onsuccess) {
    $.post('https://ssl.reddit.com/logout', { uh: modhash, top: 'off' }, onsuccess);
  },

  listing: function(subreddits, callback) {
    $('#loading').show();
    if (subreddits == 'frontpage') { 
      $($.get('http://reddit.com/.json', function(listing) {
        window.subredditState.listing = listing;    
        window.subredditState.subreddit = subreddits;
        $.each(listing.data.children, function(index, value) {
          callback(value);
        });
      }));
    } else { 
      $($.get('http://reddit.com/r/' + subreddits + '.json', function(listing) {
        window.subredditState.listing = listing;    
        window.subredditState.subreddit = subreddits;
        $.each(listing.data.children, function(index, value) {
          callback(value);
        });
      }));
    }
  },

  comments: function(permalink, op, callback) {
    $('#loading').show();
    $.get('http://reddit.com' + permalink + '.json', function(comments) {
      comments.shift();
      $.each(comments, function(index, comment) {
        $.each(comment.data.children, function(commentIndex, value) {
          callback(value, op);
        });
      });
    });
  },

  subreddits: function(callback, done) {
    console.log('loading subreddits...');
    var cachedSubreddits = JSON.parse(localStorage.getItem('subreddits'));
    if (cachedSubreddits === null) {
      console.log('no cached subreddits, must get from reddit...');
      var user = localStorage.getItem('snooby.user');
      if (user !== null)
        user = JSON.parse(user);

      if (user === null) {
        console.log('getting default reddits...');
        $.get('http://reddit.com/reddits.json', function(listing) {
          var sortedSubreddits = [];
          listing.data.children.sort(function(a, b) {
            return a.data.display_name.localeCompare(b.data.display_name);
          });
          console.log('caching subreddits...');
          localStorage.setItem('subreddits', JSON.stringify(listing.data.children));
          this._processSubreddits(listing.data.children, callback, done);
        });
      } else {
        console.log('getting subreddits for user: ' + user.username);
        _getUserSubreddits(callback, {}, [], done);
      }
    } else {
      console.log('using cached subreddits...');
      this._processSubreddits(cachedSubreddits, callback, done);
    }
  },

  _getUserSubreddits: function(callback, data, reddits, done) {
    $.get('http://reddit.com/reddits/mine.json', data, function(listing) {
      reddits = reddits.concat(listing.data.children);

      if (listing.data.after !== null) {
        return getUserSubreddits(callback, { after: listing.data.after }, reddits, done);
      }
      var sortedSubreddits = [];
      reddits.sort(function(a, b) {
        return a.data.display_name.localeCompare(b.data.display_name);
      });
      console.log('caching subreddits...');
      localStorage.setItem('subreddits', JSON.stringify(reddits));
      this._processSubreddits(reddits, callback, done);
    });
  },

  _processSubreddits: function(reddits, callback, done) {
    var frontpage = { data: { display_name: 'frontpage' } };
    reddits.unshift(frontpage);
    $.each(reddits, function(index, value) {
      if (typeof callback == 'function')
        callback(value);
    });

    if (typeof done == 'function')
      done();
  }
};
