function listing(subreddits, callback) {
  if (!subreddits) { 
    $($.get('http://reddit.com/.json', function(data) {
      var listing = JSON.parse(data);
      $.each(listing.data.children, function(index, value) {
        callback(value);
      });
    }));
  } else {
    alert('subreddit posts not supported yet.');
  }
}
