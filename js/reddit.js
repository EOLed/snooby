function listing(subreddits, callback) {
  if (!subreddits) { 
    $($.get('http://reddit.com/.json', function(listing) {
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });
    }));
  } else {
    alert('subreddit posts not supported yet.');
  }
}
