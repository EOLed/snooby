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
    chunk.appendTo('#comments');

    app.comments(params.link.data.permalink, 
                 params.link.data.author, 
                 function(comment, op, chunkIndex) {
      bbr.formatComment(comment, op, function(bbComment) {
        $('#loading').hide();
        $('#comments').show();

        if (chunkIndex !== currentChunkIndex) {
          currentChunkIndex = chunkIndex;
          chunk = $("<div id='commentChunk" + currentChunkIndex + "'></div>");
          chunk.hide();
          chunk.appendTo('#comments');
        }

        bbComment.appendTo(chunk);
      }, chunkIndex);
    });
  },

  _chunkIndex: 1,

  onScroll: function(element) {
    var scrollPanel = element.children[1];

    if ($(scrollPanel).scrollTop() > ($(scrollPanel).height() - 100) ) { 
      $('#commentChunk' + this._chunkIndex).show();
      this._chunkIndex++;
    } 
  }
};
