var _comments = {
  onScreenReady: function(element, params) {
    var domain = params.link.data.domain;
    var selfPost = domain === 'self.' + params.link.data.subreddit;
    var headerTemplate = element.getElementById(selfPost ? 'selfPostHeaderTemplate' : 
                                                           'linkHeaderTemplate').innerHTML;
    var html = Mustache.to_html(headerTemplate,
                                { title: selfPost ? params.link.data.title : 
                                                    '<a href="' + params.link.data.url + '">' + params.link.data.title + '</a>',
                                  body: selfPost ? SnuOwnd.getParser().render(params.link.data.selftext) : null,
                                  domain: params.link.data.domain,
                                  numComments: params.link.data.num_comments });
    element.getElementById('linkHeader').innerHTML = html;

    html = Mustache.to_html(element.getElementById('linkHeaderDetailsTemplate').innerHTML,
                            { author: params.link.data.author,
                              score: params.link.data.score,
                              time: moment.unix(params.link.data.created_utc).fromNow() });
    element.getElementById('linkDetails').innerHTML = html;
  },

  onDomReady: function(element, params) {
    $('#loading').show();

    var currentChunkIndex = 0;
    var chunk = $("<div id='commentChunk" + currentChunkIndex + "'></div>");
    chunk.appendTo('#inner');

    app.comments(params.link.data.permalink, 
                 params.link.data.author, 
                 function(comment, op, chunkIndex) {
      bbr.formatComment(comment, op, function(bbComment) {
        $('#loading').hide();
        $('#inner').show();

        if (chunkIndex !== currentChunkIndex) {
          currentChunkIndex = chunkIndex;
          chunk = $("<div id='commentChunk" + currentChunkIndex + "'></div>");
          chunk.hide();
          chunk.appendTo('#inner');
          document.getElementById('pull-to-refresh').style.display = 'block';
        }

        bbComment.appendTo(chunk);
      }, chunkIndex);
    });

    this._setupPullToRefresh();
  },

  _setupPullToRefresh: function() {
    document.getElementById('commentsScreen').addEventListener('touchend', function (evt) {
      if (document.getElementById('pull-to-refresh').classList.contains('pulling')) {
        setTimeout(function() {
          document.getElementById('pull-to-refresh').classList.remove('pulling');
          console.log('do pull to refresh');
        }, 1);
      }
    });
  },

  onScroll: function(element) {
    var scroller = element.children[1];
    if (scroller.scrollTop + $(scroller).height() >= $(scroller.children[0]).height() + 79 + 100) {
      document.getElementById('pull-to-refresh').classList.add('pulling');
    }
  }
};

