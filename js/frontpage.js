function frontPageScreenReady(element, params) {
  subreddits(function(subreddit) {
    createSubredditTabOption(subreddit, function(subredditTab) {
      element.getElementById('frontPageActionBar').appendChild(subredditTab);
    });
  });
}
