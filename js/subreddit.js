var _subreddits = {
  onScreenReady: function(element, params) {
    var visited = _cache.itemExists('subreddit.visited');

    if (!visited) {
      _cache.setItem('subreddit.visited', true);
      _cache.setItem('subreddit.screenReady', true);
      _cache.setItem('subreddit.domReady', false);
      _cache.setItem('subreddit.selected', params.subreddit);
      _cache.setItem('subreddit.scrollTop', 0);
    }

    var actionBar = _cache.getPersistedItem('snooby.subreddits.actionBar');
    if (typeof actionBar === 'undefined' || actionBar === null) {
      app.subreddits(function(subreddit) {
        bbr.createSubredditTabOption(subreddit, function(subredditTab) {
          element.getElementById('actionBar').appendChild(subredditTab);
        });
      }, function() {
        _cache.persistItem('snooby.subreddits.actionBar', element.getElementById('actionBar').innerHTML);
      });
    } else {
      element.getElementById('actionBar').innerHTML = actionBar;
    }
    
    element.getElementById('tab-' + _cache.getItem('subreddit.selected')).setAttribute('data-bb-selected', true);
  },

  onDomReady: function(element, params) {
    if (_cache.getItem('subreddit.domReady') === true) {
      $('#loading').hide();
      console.log('loading subreddit listings from memory');

      var thiz = this;
      var cachedListing = _cache.getItem('subreddit.listing');
      $.each(cachedListing.data.children, function(index, value) {
        setTimeout(function() { thiz.scrollback(); }, 0);
        bbr.formatPost(value, function(bbPost) {
          $(bbPost).appendTo('#listing');
        });
      });

      if (cachedListing.data.after === null)
        $('#pull-to-refresh').hide();
      else
        $('#pull-to-refresh').show();
    } else {
      console.log('loading subreddit listings from reddit');
      _cache.setItem('subreddit.domReady', true);
      this._updateListing(params.subreddit);
    }

    this._setupPullToRefresh();
  },

  _updateListing: function(subreddit, data) {
    $('#pull-to-refresh').hide();
    $('#loading').show();
    $('#listing').hide();
    $('#listing').empty();
    app.listing(subreddit, data, function(post) {
      bbr.formatPost(post, function(bbPost) {
        $(bbPost).appendTo('#listing');
      });
    }, function(listing) {
      $('#loading').hide();
      $('#listing').show();

      if (listing.data.after === null) {
        _cache.removeItem('subreddit.after');
        $('#pull-to-refresh').hide();
      } else {
        _cache.setItem('subreddit.after', listing.data.after);
        $('#pull-to-refresh').show();
      }
    });
  },

  onUnload: function(element) {
    _cache.setItem('subreddit.scrollTop', $('#subreddit').children('div').eq(1).scrollTop());
  },

  scrollback: function() {
    $('#subreddit').children('div').eq(1).scrollTop(_cache.getItem('subreddit.scrollTop'));
    $('#listing').show();
  },

  refresh: function() {
    var selectedSubreddit = _cache.getItem('subreddit.selected');
    _cache.removeItem('subreddit.selected');

    var selectedTab = document.getElementById('tab-' + selectedSubreddit);
    document.getElementById('actionBar').setSelectedTab(selectedTab);
  },

  _setupPullToRefresh: function() {
    var thiz = this;
    document.getElementById('subreddit').addEventListener('touchend', function (evt) {
      if (document.getElementById('pull-to-refresh').classList.contains('pulling')) {
        setTimeout(function() {
          document.getElementById('pull-to-refresh').classList.remove('pulling');
          thiz._updateListing(_cache.getItem('subreddit.selected'),
                              { after: _cache.getItem('subreddit.after') });
        }, 350);
      }
    });
  },

  onScroll: function(element) {
    var ptr = document.getElementById('pull-to-refresh');
    
    if ((ptr.style.display === '' || ptr.style.display === 'block') && 
        _cache.getItem('subreddit.after') !== null) {
      var scroller = element.children[1];
      if (scroller.scrollTop + $(scroller).height() >= $(scroller.children[0]).height() + 79 + 75) {
        ptr.classList.add('pulling');
      }
    }
  }
};
