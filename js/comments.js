var _comments = {
  onScreenReady: function(element, params) {
    var visited = _cache.itemExists('comments.visited');

    if (!visited) {
      _cache.setItem('comments.visited', true);
      _cache.setItem('comments.screenReady', true);
      _cache.setItem('comments.domReady', false);
      _cache.setItem('comments.scrollTop', 0);
    } else {
      element.getElementById('commentsScreen').style.visibility = 'hidden';
    }

    if (typeof params.link.data.domain === 'undefined')
      return;

    this._populateOp(element, params.link);
  },

  _setupContextMenu: function() {
    blackberry.ui.contextmenu.enabled = true;

    var options = {};

    blackberry.ui.contextmenu.defineCustomContext('commentContext', options);

    var reply = { actionId: 'replyAction',
                     label: 'Reply',
                     icon: '../img/icons/ic_edit.png' };

    blackberry.ui.contextmenu.addItem(['commentContext'], reply, this.replyToComment);
  },

  _launchCommentComposer: function(comment) {
    if (rateLimiter.canPerformAction(rateLimiter.COMMENT)) {
      var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
      if (user === null) {
        blackberry.ui.toast.show('You must login before you can comment.');
        return;
      }

      bb.pushScreen('comment.html', 'comment', { parentThing: comment });
    } else {
      app._rateExceededToast();
    }
  },

  replyToComment: function(sourceId) {
    var cachedListing = _cache.getItem('comments.listing');
    var comment = _comments._findComment(cachedListing, sourceId);

    _comments._launchCommentComposer(comment);
  },

  replyToPost: function(post) {
    _comments._launchCommentComposer(post);
  },

  _findComment: function(comments, name) {
    var children = comments.data.children;
    var matchingComment = null;
    var thiz = this;
    children.some(function(comment) {
      if (comment.data.name === name) {
        matchingComment = comment;
        return true;
      } else if (typeof comment.data.replies !== 'undefined' && comment.data.replies !== '') {
        matchingComment = thiz._findComment(comment.data.replies, name);
        if (matchingComment !== null)
          return true;
      }
    });

    return matchingComment;
  },

  _populateOp: function(element, op) {
    _cache.setItem('comment.op', op);
    var selfPost = op.data.domain === 'self.' + op.data.subreddit;
    var linkScoreClass = '';
    if (op.data.likes === true)
      linkScoreClass = 'upvoted';
    else if (op.data.likes === false)
      linkScoreClass = 'downvoted';

    var headerTemplate = element.getElementById(selfPost ? 'selfPostHeaderTemplate' : 
                                                           'linkHeaderTemplate').innerHTML;
    var html = Mustache.to_html(headerTemplate,
                                { title: selfPost ? op.data.title : 
                                                    '<a href="' + op.data.url + '">' + op.data.title + '</a>',
                                  body: selfPost ? SnuOwnd.getParser().render(op.data.selftext) : null,
                                  domain: op.data.domain,
                                  numComments: op.data.num_comments });
    element.getElementById('linkHeader').innerHTML = html;

    html = Mustache.to_html(element.getElementById('linkHeaderDetailsTemplate').innerHTML,
                            { author: op.data.author,
                              score: op.data.score,
                              linkScoreClass: linkScoreClass,
                              time: moment.unix(op.data.created_utc).fromNow() });
    element.getElementById('linkDetails').innerHTML = html;

    element.getElementById('linkHeader').style.display = 'block';
    element.getElementById('linkDetails').style.display = 'block';
  },

  onUnload: function() {
    _cache.setItem('comments.container', $('#commentsContainer').html());
    _cache.setItem('comments.scrollTop', $('#commentsScreen').children('div').eq(1).scrollTop());
  },

  onDomReady: function(element, params) {
    var thiz = this;

    if (_cache.getItem('comments.domReady') === true) {
      $('#loading').hide();
      console.log('getting comments from memory');
      $('#commentsContainer').html(_cache.getItem('comments.container'));
      setTimeout(function() { 
        thiz.scrollback(); 
      }, 0);
    } else {
      this._loadCommentsInChunks(element, params);
    }

    this._saveQueuedComment();

    this._setupPullToRefresh();
    this._setupContextMenu();
  },

  _loadCommentsInChunks: function(element, params) {
    $('#loading').show();

    var currentChunkIndex = 0;
    var chunk = $('<div id="commentChunk' + currentChunkIndex + '" class="chunk"></div>');
    chunk.appendTo('#inner');

    var opcallback = element.getElementById('linkHeader').style.display === 'none' ?
                     function(op) {
                       _comments._populateOp(element, op);
                     } : null;

    console.log('getting comments from reddit');
    app.comments(params.link.data.permalink, 
                 function(comment, op, chunkIndex) {
      bbr.formatComment(comment, op, function(bbComment) {
        if (chunkIndex !== currentChunkIndex) {
          currentChunkIndex = chunkIndex;
          chunk = $('<div id="commentChunk' + currentChunkIndex + '" class="chunk"></div>');
          chunk.hide();
          chunk.appendTo('#inner');
          document.getElementById('pull-to-refresh').style.display = 'block';
        }

        bbComment.appendTo(chunk);
      }, chunkIndex);
    }, function() {
      $('#loading').hide();
      $('#inner').show();
      _cache.setItem('comments.domReady', true);
    }, opcallback);
  },

  _saveQueuedComment: function() {
    if (_cache.itemExists('comment.created')) {
      var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
      var comment = _cache.getItem('comment.created');
      var commentDiv = bbr._createCommentDiv(comment, { data: { author: null } }, 'reply');
      var op = _cache.getItem('comment.op');

      commentDiv.removeAttr('data-webworks-context');

      // no parent comment, go back to first chunk
      if ($('#' + comment.data.parent_id).length === 0) {
        $('.chunk').css({ display: 'none' });
        var firstChunk = $('.chunk:first');
        firstChunk.css({ display: 'block' });
        commentDiv.prependTo(firstChunk);
      } else {
        commentDiv.appendTo('#' + comment.data.parent_id);
      }

      _cache.removeItem('comment.created');
      app.comment(comment.data.body, comment.data.parent_id, user.modhash, function() {});
      setTimeout(function() { 
        $('#numComments').text(op.data.num_comments);
        document.getElementById('commentsScreen').scrollToElement(commentDiv.get(0));
        commentDiv.hide();
        commentDiv.fadeIn(1800);
      }, 0);
    }
  },

  scrollback: function() {
    $('#linkHeader').hide();
    $('#linkDetails').hide();
    $('#commentsContainer').css({ visibility: 'hidden' });
    $('#commentsContainer').show();
    $('#commentsScreen').children('div').eq(1).scrollTop(_cache.getItem('comments.scrollTop'));
    $('#commentsScreen').css({ visibility: 'visible' });
    $('#linkHeader').show();
    $('#linkDetails').show();
    $('#commentsContainer').css({ visibility: 'visible' });
  },

  _setupPullToRefresh: function() {
    document.getElementById('commentsScreen').addEventListener('touchend', function (evt) {
      if (document.getElementById('pull-to-refresh').classList.contains('pulling')) {
        setTimeout(function() {
          document.getElementById('pull-to-refresh').classList.remove('pulling');
          var chunks = document.getElementsByClassName('chunk');
          var numChunks = chunks.length - 1;
          for (var i = 0; i < numChunks; i++) {
            var currentChunk = chunks[i];
            if (currentChunk.style.display !== 'none') {
              currentChunk.style.display = 'none';
              chunks[i+1].style.display = 'block';

              if (i >= (numChunks - 1)) {
                document.getElementById('pull-to-refresh').style.display = 'none';
              }

              document.getElementById('commentsScreen')
                      .scrollToElement(document.getElementById('linkDetails'));
              break;
            }
          }
        }, 350);
      }
    });
  },

  onScroll: function(element) {
    var scroller = element.children[1];
    if (scroller.scrollTop + $(scroller).height() >= $(scroller.children[0]).height() + 79 + 75) {
      document.getElementById('pull-to-refresh').classList.add('pulling');
    } else if ($('#linkScore').visible() && this._postScoreOutdated) {
      this._postScoreOutdated = false;
      $('#linkScore').hide().fadeIn('fast');
    }
  },

  upvotePost: function() {
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    var scoreElement = $('#linkScore');
    var score = parseInt(scoreElement.html(), 10);
    var op = _cache.getItem('comment.op');
    var subreddit = op.data.subreddit;
    var link = null;
    var thiz = this;

    if (user === null) {
      blackberry.ui.toast.show('You must login before you can vote.');
      return;
    }

    _cache.getItem('subreddit.listing').data.children.forEach(function(currentLink) {
      if (currentLink.data.name === op.data.name) {
        link = currentLink;
        return false;
      }
    });

    if (scoreElement.hasClass('upvoted')) {
      app.unvote(op.data.name, user.modhash, function() {
        scoreElement.removeClass('upvoted');
        scoreElement.html(--score);
        if (link !== null) {
          link.data.score = score;
          link.data.likes = null;
        }

        thiz._postScoreOutdated = !scoreElement.visible();
      });

      return;
    }

    app.upvote(op.data.name, user.modhash, function() {
      if (scoreElement.hasClass('downvoted')) {
        scoreElement.removeClass('downvoted');
        score++;
      }

      scoreElement.addClass('upvoted');
      scoreElement.html(++score);
      if (link !== null) {
        link.data.score = score;
        link.data.likes = true;
      }

      thiz._postScoreOutdated = !scoreElement.visible();
    });
  },

  _postScoreOutdated: false,

  downvotePost: function() {
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    var scoreElement = $('#linkScore');
    var score = parseInt(scoreElement.html(), 10);
    var op = _cache.getItem('comment.op');
    var subreddit = op.data.subreddit;
    var link = null;
    var thiz = this;

    if (user === null) {
      blackberry.ui.toast.show('You must login before you can vote.');
      return;
    }

    _cache.getItem('subreddit.listing').data.children.forEach(function(currentLink) {
      if (currentLink.data.name === op.data.name) {
        link = currentLink;
        return false;
      }
    });

    if (scoreElement.hasClass('downvoted')) {
      app.unvote(op.data.name, user.modhash, function() {
        scoreElement.removeClass('downvoted');
        scoreElement.html(++score);
        if (link !== null) {
          link.data.score = score;
          link.data.likes = null;
        }

        thiz._postScoreOutdated = !scoreElement.visible();
      });

      return;
    }

    app.downvote(op.data.name, user.modhash, function() {
      if (scoreElement.hasClass('upvoted')) {
        scoreElement.removeClass('upvoted');
        score--;
      }

      scoreElement.addClass('downvoted');
      scoreElement.html(--score);
      if (link !== null) {
        link.data.score = score;
        link.data.likes = false;
      }

      thiz._postScoreOutdated = !scoreElement.visible();
    });
  }
};
