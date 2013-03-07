var _comments = {
  onScreenReady: function(element, params) {
    if (typeof params.link.data.domain === 'undefined')
      return;

    this._populateOp(element, params.link);
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

  onDomReady: function(element, params) {
    $('#loading').show();

    var currentChunkIndex = 0;
    var chunk = $('<div id="commentChunk' + currentChunkIndex + '" class="chunk"></div>');
    chunk.appendTo('#inner');

    var thiz = this;
    var opcallback = element.getElementById('linkHeader').style.display === 'none' ?
                     function(op) {
                       thiz._populateOp(element, op);
                     } : null;

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
    }, opcallback);

    this._setupPullToRefresh();
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
      app.unvote(op.data.name, user.modhash, subreddit);
      scoreElement.removeClass('upvoted');
      scoreElement.html(--score);
      if (link !== null) {
        link.data.score = score;
        link.data.likes = null;
      }

      this._postScoreOutdated = !scoreElement.visible();

      return;
    }

    app.upvote(op.data.name, user.modhash, subreddit);

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

    this._postScoreOutdated = !scoreElement.visible();
  },

  _postScoreOutdated: false,

  downvotePost: function() {
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    var scoreElement = $('#linkScore');
    var score = parseInt(scoreElement.html(), 10);
    var op = _cache.getItem('comment.op');
    var subreddit = op.data.subreddit;
    var link = null;

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
      app.unvote(op.data.name, user.modhash, subreddit);
      scoreElement.removeClass('downvoted');
      scoreElement.html(++score);
      if (link !== null) {
        link.data.score = score;
        link.data.likes = null;
      }

      this._postScoreOutdated = !scoreElement.visible();

      return;
    }

    app.downvote(op.data.name, user.modhash, subreddit);

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

    this._postScoreOutdated = !scoreElement.visible();
  }
};
