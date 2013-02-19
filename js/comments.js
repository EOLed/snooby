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

    app.comments(params.link.data.permalink, params.link.data.author, function(comment) {
      bbr.formatComment(comment, params.link.data.author, function(bbComment) {
        $('#loading').hide();
        $('#comments').show();
        $(bbComment).appendTo('#comments');
      });
    });
  }
};
