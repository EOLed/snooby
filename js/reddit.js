function listing(subreddits, callback) {
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
  var frontpage = { data: { display_name: 'frontpage' } };
  reddits.unshift(frontpage);
  $.each(reddits, function(index, value) {
    if (typeof callback == 'function')
      callback(value);
  });

  if (typeof done == 'function')
    done();
}
