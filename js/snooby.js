var snooby = {
  login: function(username, password, onsuccess) {
    $.post('https://ssl.reddit.com/api/login', 
           { user: username, passwd: password, rem: true, api_type: 'json' },
           onsuccess);
  },

  logout: function(modhash, onsuccess) {
    $.post('https://ssl.reddit.com/logout', { uh: modhash, top: 'off' }, onsuccess);
  },

  listing: function(options) {
    var thiz = this,
        sort = options.sort,
        subreddits = options.subreddits;

    if (typeof sort === 'undefined' || sort === 'hot')
      sort = '';

    var url = subreddits === 'frontpage' ? 'http://reddit.com/' + sort + '.json' : 
                                           'http://reddit.com/r/' + subreddits + '/' + sort + '.json';
    $.get(url, options.data, function(listing) {
      options.callback(subreddits, listing);
    });
  },

  comments: function(permalink, onsuccess) {
    $.get('http://reddit.com' + permalink + '.json', onsuccess);
  },

  /**
   * Retrieves user account information.
   *
   * @param onsuccess <function> success callback
   */
  me: function(onsuccess) {
    $.get('http://www.reddit.com/api/me.json', onsuccess);
  },

  mailbox: function(where, data, callback) {
    $.get('http://reddit.com/message/' + where + '.json', data, function(listing) {
      callback(where, listing);
    });
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

  vote: function(dir, id, modhash, onsuccess) {
    $.post('http://www.reddit.com/api/vote',
           { dir: dir, id: id, uh: modhash },
           onsuccess);
  },

  _sortSubreddits: function(subreddits, callback) {
    subreddits.sort(function(a, b) {
      return a.data.display_name.localeCompare(b.data.display_name);
    });

    callback(subreddits);
  },

  comment: function(text, thingId, modhash, onsuccess) {
    $.post('http://www.reddit.com/api/comment', { text: text, thing_id: thingId, uh: modhash }, onsuccess);
  },

  markAsUnread: function(id, modhash, onsuccess) {
    $.post('http://www.reddit.com/api/unread_message', { id: id, uh: modhash }, onsuccess);
  },

  markAsRead: function(id, modhash, onsuccess) {
    $.post('http://www.reddit.com/api/read_message', { id: id, uh: modhash }, onsuccess);
  }
};
