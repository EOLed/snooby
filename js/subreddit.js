function subredditScreenReady(element, params) {
  var visited = typeof window.subredditState !== 'undefined';
  alert('been here: ' + visited);

  if (!visited) {
    window.subredditState = {};
    window.subredditState.screenReady = true;
    window.subredditState.domReady = false;
    window.subredditState.subreddit = params.subreddit;
  }

  subreddits(function(subreddit) {
    createSubredditTabOption(subreddit, function(subredditTab) {
      element.getElementById('actionBar').appendChild(subredditTab);
    });
  });
}

function subredditDomReady(element, params) {
  if (window.subredditState.domReady) {
    alert('domready is ready');
    $('#loading').hide();
    $.each(window.subredditState.listing.data.children, function(index, value) {
      bbifyPost(value, function(bbPost) {
        $(bbPost).appendTo('#listing');
      });
    });
    $('#listing').show();
    $('#subreddit').children('div').eq(1).scrollTop(window.subredditState.scrollTop);
  } else {
    alert('here we go again');
    window.subredditState.domReady = true;
    listing(params.subreddit, function(post) {
      $('#loading').hide();
      $('#listing').show();
      bbifyPost(post, function(bbPost) {
        $(bbPost).appendTo('#listing');
      });
    });
  }
}

function subredditUnload(element) {
  window.subredditState.scrollTop = $('#subreddit').children('div').eq(1).scrollTop();
}
