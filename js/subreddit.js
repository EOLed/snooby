var _subreddits = {
  onScreenReady: function(element, params) {
    var visited = typeof window.subredditState !== 'undefined' && window.subredditState !== null;

    if (!visited) {
      window.subredditState = {};
      window.subredditState.screenReady = true;
      window.subredditState.domReady = false;
      window.subredditState.subreddit = params.subreddit;
      window.subredditState.scrollTop = 0;
    }

    snooby.subreddits(function(subreddit) {
      bbr.createSubredditTabOption(subreddit, function(subredditTab) {
        element.getElementById('actionBar').appendChild(subredditTab);
      });
    });
  },

  onDomReady: function(element, params) {
    document.getElementById('actionBar').setSelectedTab(document.getElementById('tab-' + params.subreddit));
    if (window.subredditState.domReady === true) {
      $('#loading').hide();
      console.log('loading subreddit listings from memory');

      var thiz = this;
      $.each(window.subredditState.listing.data.children, function(index, value) {
        bbr.formatPost(value, function(bbPost) {
          $(bbPost).appendTo('#listing');
        });
        setTimeout(function() { thiz.scrollback(); }, 0);
      });

    } else {
      console.log('loading subreddit listings from reddit');
      window.subredditState.domReady = true;
      snooby.listing(params.subreddit, function(post) {
        $('#loading').hide();
        $('#listing').show();
        bbr.formatPost(post, function(bbPost) {
          $(bbPost).appendTo('#listing');
        });
      });
    }
  },

  onUnload: function(element) {
    window.subredditState.scrollTop = $('#subreddit').children('div').eq(1).scrollTop();
  },

  scrollback: function() {
    $('#subreddit').children('div').eq(1).scrollTop(window.subredditState.scrollTop);
    $('#listing').show();
  }
};
