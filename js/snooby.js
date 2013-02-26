var snooby = {
  login: function(username, password, onsuccess) {
    $.post('https://ssl.reddit.com/api/login', 
           { user: username, passwd: password, rem: true, api_type: 'json' },
           onsuccess);
  },

  logout: function(modhash, onsuccess) {
    $.post('https://ssl.reddit.com/logout', { uh: modhash, top: 'off' }, onsuccess);
  },

  listing: function(subreddits, data, callback) {
    var thiz = this;
    var url = subreddits === 'frontpage' ? 'http://reddit.com/.json' : 
                                           'http://reddit.com/r/' + subreddits + '.json';
    $.get(url, data, function(listing) {
      callback(subreddits, listing);
    });
  },

  comments: function(permalink, onsuccess) {
    $.get('http://reddit.com' + permalink + '.json', onsuccess);
  },

  defaultSubreddits: function(onsuccess) {
    var thiz = this;
    $.get('http://reddit.com/reddits.json', function(listing) {
        thiz._sortSubreddits(listing.data.children, onsuccess);
    });
  },

  userSubreddits: function(callback) {
    var thiz = this;
    var reddits = [];
    var processSubreddits = function(listing) {
      reddits = reddits.concat(listing.data.children);
      if (listing.data.after !== null) {
        $.get('http://reddit.com/reddits/mine.json', 
              { after: listing.data.after }, 
              processSubreddits);
        return;
      }

      thiz._sortSubreddits(reddits, callback);
    };

    $.get('http://reddit.com/reddits/mine.json', {}, processSubreddits);
  },

  _sortSubreddits: function(subreddits, callback) {
    subreddits.sort(function(a, b) {
      return a.data.display_name.localeCompare(b.data.display_name);
    });

    callback(subreddits);
  }
};
