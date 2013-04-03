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
    
    var selectedSubreddit = _cache.getItem('subreddit.selected');
    var selectedTab = element.getElementById(this.getSubredditTabId(selectedSubreddit));
    if (selectedTab === null) {
      bbr.createSubredditTabOption({ data: { display_name: selectedSubreddit } }, 
                                   function(subredditTab) {
        selectedTab = element.getElementById('actionBar').appendChild(subredditTab);
        selectedTab.setAttribute('data-bb-selected', true);
      });
    }

    element.getElementById('pull-to-refresh').style.display = 'none';

    selectedTab.setAttribute('data-bb-selected', true);
  },

  onDomReady: function(element, params) {
    if (_cache.getItem('subreddit.domReady') === true) {
      $('#loading').hide();
      console.log('loading subreddit listings from memory');

      var thiz = this;
      var cachedListing = _cache.getItem('subreddit.listing');
      $.each(cachedListing.data.children, function(index, value) {
        bbr.formatPost(value, function(bbPost) {
          $(bbPost).attr('data-snooby-index', index);
          $(bbPost).appendTo('#listing');
        });
      });

      setTimeout(function() { 
        thiz.scrollback(cachedListing); 
      }, 0);
    } else {
      console.log('loading subreddit listings from reddit');
      _cache.setItem('subreddit.domReady', true);
      this._updateListing(params.subreddit);
    }

    this._saveQueuedComment();

    this._setupPullToRefresh();

    this._setupContextMenu();
  },

  _saveQueuedComment: function() {
    if (_cache.itemExists('comment.created')) {
      var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
      var comment = _cache.getItem('comment.created');
      var commentDiv = bbr._createCommentDiv(comment, { data: { author: null } }, 'reply');

      _cache.removeItem('comment.created');
      app.comment(comment.data.body, comment.data.parent_id, user.modhash, function() {});
    }
  },

  _doDownvote: function(sourceId) {
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    var subreddit = _cache.getItem('subreddit.selected');
    var scoreElement = $('#score-' + sourceId);
    var score = parseInt(scoreElement.html());
    var link = _cache.getItem('subreddit.listing')
                     .data
                     .children[$('#link-' + sourceId).attr('data-snooby-index')];
    var onrateexceeded = function() {
      app.rateExceededToast();
    };

    if (user === null) {
      blackberry.ui.toast.show('You must login before you can vote.');
      return;
    }

    if (scoreElement.hasClass('downvoted')) {
      app.unvote(sourceId, user.modhash, function() {
        scoreElement.removeClass('downvoted');
        scoreElement.html(++score);
        link.data.score = score;
        link.data.likes = null;
      });

      return;
    }

    app.downvote(sourceId, user.modhash, function() {
      if (scoreElement.hasClass('upvoted')) {
        scoreElement.removeClass('upvoted');
        score--;
      }

      scoreElement.addClass('downvoted');
      scoreElement.html(--score);
      link.data.score = score;
      link.data.likes = false;
    });
  },

  _doUpvote: function(sourceId) {
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    var subreddit = _cache.getItem('subreddit.selected');
    var scoreElement = $('#score-' + sourceId);
    var score = parseInt(scoreElement.html());
    var link = _cache.getItem('subreddit.listing')
                     .data
                     .children[$('#link-' + sourceId).attr('data-snooby-index')];

    if (user === null) {
      blackberry.ui.toast.show('You must login before you can vote.');
      return;
    }

    if (scoreElement.hasClass('upvoted')) {
      app.unvote(sourceId, user.modhash, function() {
        scoreElement.removeClass('upvoted');
        scoreElement.html(--score);
        link.data.score = score;
        link.data.likes = null;
      });

      return;
    }

    app.upvote(sourceId, user.modhash, function() {
      if (scoreElement.hasClass('downvoted')) {
        scoreElement.removeClass('downvoted');
        score++;
      }

      scoreElement.addClass('upvoted');
      scoreElement.html(++score);
      link.data.score = score;
      link.data.likes = true;
    });
  },

  _doComment: function(sourceId) {
    if (rateLimiter.canPerformAction(rateLimiter.COMMENT)) {
      var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
      var subreddit = _cache.getItem('subreddit.selected');
      var link = _cache.getItem('subreddit.listing')
                       .data
                       .children[$('#link-' + sourceId).attr('data-snooby-index')];

      if (user === null) {
        blackberry.ui.toast.show('You must login before you can comment.');
        return;
      }

      bb.pushScreen('comment.html', 'comment', { parentThing: link });
    } else {
      app._rateExceededToast();
    }
  },

  pushMailbox: function() {
    if (JSON.parse(_cache.getPersistedItem('snooby.user')) === null) {
      blackberry.ui.toast.show('You must login before you can check your mail.');
      return;
    }

    if (rateLimiter.canPerformAction(rateLimiter.VIEW_INBOX)) {
      _cache.removeItem('mailbox.visited');
      bb.pushScreen('mailbox.html', 'mailbox', { mailbox: 'inbox' });
    } else {
      app._rateExceededToast();
    }
  },

  _setupContextMenu: function() {
    blackberry.ui.contextmenu.enabled = true;

    var options = {};

    blackberry.ui.contextmenu.defineCustomContext('linkContext', options);

    var upvote = { actionId: 'upvoteAction',
                   label: 'Upvote',
                   icon: '../img/icons/ic_up.png' };

    var downvote = { actionId: 'downvoteAction',
                     label: 'Downvote',
                     icon: '../img/icons/ic_down.png' };

    var comment = { actionId: 'commentAction',
                     label: 'Add a comment',
                     icon: '../img/icons/ic_edit.png' };

    blackberry.ui.contextmenu.addItem(['linkContext'], comment, this._doComment);

    blackberry.ui.contextmenu.addItem(['linkContext'], downvote, this._doDownvote);

    blackberry.ui.contextmenu.addItem(['linkContext'], upvote, this._doUpvote);
  },

  getSubredditTabId: function(subreddit) {
    return 'tab-' + subreddit.toLowerCase();
  },

  _updateListing: function(subreddit, data) {
    $('#pull-to-refresh').hide();
    $('#subredditSortPanel').hide();
    $('#loading').show();
    $('#listing').hide();
    $('#listing').empty();
    var index = 0;
    var callback = function(post) {
      bbr.formatPost(post, function(bbPost) {
        $(bbPost).attr('data-snooby-index', index++);
        $(bbPost).appendTo('#listing');
      });
    };

    var oncomplete = function(listing) {
      $('#loading').hide();
      $('#listing').show();
      $('#subredditSortPanel').show();
      $('#subreddit').children('div').eq(1).scrollTop(168);

      if (listing.data.after === null) {
        _cache.removeItem('subreddit.after');
        $('#pull-to-refresh').hide();
      } else {
        _cache.setItem('subreddit.after', listing.data.after);
        $('#pull-to-refresh').show();
      }
    };

    var sort = _cache.getPersistedItem('subreddit.sort');
    if (typeof sort === 'undefined' || sort === null) {
      _cache.persistItem('subreddit.sort', 'hot');
      sort = 'hot';
    }

    app.listing({ subreddits: subreddit, data: data, sort: sort, callback: callback, oncomplete: oncomplete });
  },

  onUnload: function(element) {
    _cache.setItem('subreddit.scrollTop', $('#subreddit').children('div').eq(1).scrollTop());
  },

  scrollback: function(listing) {
    $('#listing').css('visibility: hidden');
    $('#subredditSortPanel').css('visibility: hidden');
    $('#listing').show();
    $('#subredditSortPanel').show();
    $('#subreddit').children('div').eq(1).scrollTop(_cache.getItem('subreddit.scrollTop'));
    $('#listing').css('visibility: visible');
    $('#subredditSortPanel').css('visibility: visible');

    if (listing.data.after === null)
      $('#pull-to-refresh').hide();
    else
      $('#pull-to-refresh').show();
  },

  refresh: function() {
    var selectedSubreddit = _cache.getItem('subreddit.selected');
    _cache.removeItem('subreddit.selected');

    var selectedTab = document.getElementById(this.getSubredditTabId(selectedSubreddit));
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
  },

  promptSubreddit: function() {
    blackberry.ui.dialog.standardAskAsync('Enter subreddit name:',
                                          blackberry.ui.dialog.D_PROMPT,
                                          function(selection) {
                                            if (selection.return === 'Ok') {
                                              var promptText = selection.promptText.trim();
                                              if (promptText !== '')
                                                bbr.pushSubredditScreen(promptText); 
                                            }
                                          },
                                          { title: 'Go to Subreddit...' });

  },

  sortOptionClicked: function(e) {
    var target = e.target;
    return target && $(target).closest('.sort-option').length > 0;
  },

  onSortOptionClicked: function(target) {
    var sort = $(target).closest('.sort-option').data('snooby-sort');
    _cache.persistItem('subreddit.sort', sort);
    _subreddits.refresh();
  }
};
