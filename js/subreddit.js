function subredditScreenReady(element, params) {
  subreddits(function(subreddit) {
    createSubredditTabOption(subreddit, function(subredditTab) {
      element.getElementById('actionBar').appendChild(subredditTab);
    });
  });
}

function subredditDomReady(element, params) {
  alert('here we go again');
  var subredditDefined = (typeof params !== "undefined" && typeof params.subreddit !== "undefined");
  var subreddit =  subredditDefined ? params.subreddit : false;

  var visited = element.getAttribute('data-snooby-visited');
  console.log('visited? ' + JSON.stringify(visited));
  if (typeof visited === 'undefined' || visited !== true) {
    element.setAttribute('data-snooby-visited', true);
    console.log('marked element as visited');
    listing(subreddit, function(post) {
      $('#loading').hide();
      $('#listing').show();
      bbifyPost(post, function(bbPost) {
        $(bbPost).appendTo('#listing');
      });
    });
  }
}
