function listing(subreddits, callback) {
  if (!subreddits) { 
    $($.get('http://reddit.com/.json', function(listing) {
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });
    }));
  } else if (typeof subreddits == 'string') {
    $('#loading').show();
    $($.get('http://reddit.com/r/' + subreddits + '.json', function(listing) {
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });
    }));
  } else {
    console.error('subreddit posts not supported yet.');
  }
}

function subreddits(callback, done) {
  var cachedSubreddits = JSON.parse(localStorage.getItem('subreddits'));
  if (cachedSubreddits === null) {
    $.get('http://reddit.com/reddits.json', function(listing) {
      var sortedSubreddits = [];
      listing.data.children.sort(function(a, b) {
        return a.data.display_name.localeCompare(b.data.display_name);
      });
      console.log('caching subreddits...');
      localStorage.setItem('subreddits', JSON.stringify(listing.data.children));
      _processSubreddits(listing.data.children, callback, done);
    });
  } else {
    console.log('using cached subreddits...');
    _processSubreddits(cachedSubreddits, callback, done);
  }
}

function _processSubreddits(reddits, callback, done) {
  $.each(reddits, function(index, value) {
    if (typeof callback == 'function')
      callback(value);
  });

  if (typeof done == 'function')
    done();
}
