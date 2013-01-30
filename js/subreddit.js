function subredditScreenReady(element, params) {
  var visited = typeof window.subredditState !== 'undefined';

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
    $('#loading').hide();
    console.log('loading subreddit listings from memory');
    $.each(window.subredditState.listing.data.children, function(index, value) {
      bbifyPost(value, function(bbPost) {
        $(bbPost).appendTo('#listing');
      });
      setTimeout(function() { scrollback(); }, 0);
    });
  } else {
    console.log('loading subreddit listings from reddit');
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

function scrollback() {
  $('#subreddit').children('div').eq(1).scrollTop(window.subredditState.scrollTop);
  $('#listing').show();
}
