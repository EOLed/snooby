var bbr = {
  formatPost: function(link, callback) {
    var thiz = this;
    var linkTemplate = $('#linkTemplate').html();
    var domain = link.data.domain;
    var selfPost = domain === 'self.' + link.data.subreddit;
    if (selfPost) {
      domain = 'self';
    } else {
      var len = domain.length;
      if (len > 20) {
        domain = domain.substring(0, domain.lastIndexOf('.'));
        var lastIndex = domain.lastIndexOf('.');
        if (lastIndex != -1)
          domain = domain.substring(lastIndex + 1);
      } else if (len > 10) {
        domain = domain.substring(0, domain.lastIndexOf('.'));
      }
    }

    var hasThumbnail = link.data.thumbnail !== '' && 
                       link.data.thumbnail !== 'nsfw' && 
                       link.data.thumbnail !== 'self' &&
                       link.data.thumbnail !== 'default';

    var linkTitle = link.data.title;

    if (link.data.over_18) 
      linkTitle += ' <span class="label label-important nsfw">nsfw</span>';

    var linkDescription = Mustache.to_html(hasThumbnail ? $('#titleWithThumbnail').html() : 
                                                          $('#titleWithoutThumbnail').html(),
                                           { title: linkTitle,
                                             numComments: link.data.num_comments,
                                             thumbnail: link.data.thumbnail });

    var scoreClass = '';

    if (link.data.likes === true)
      scoreClass = 'upvoted';
    else if (link.data.likes === false)
      scoreClass = 'downvoted';

    var html = Mustache.to_html(linkTemplate, 
                                { linkDescription: linkDescription,
                                  subreddit: link.data.subreddit,
                                  score: link.data.score,
                                  domain: domain,
                                  time: moment.unix(link.data.created_utc).fromNow(),
                                  name: link.data.name,
                                  scoreClass: scoreClass,
                                  authorFlair: link.data.author_flair_text,
                                  author: link.data.author });
    var div = $('<div/>');
    div.html(html);

    div.attr('id', 'link-' + link.data.name);
    div.attr('data-webworks-context',
             JSON.stringify({ id: link.data.name,
                              type: 'linkContext',
                              header: link.data.title,
                              subheader: link.data.author }));

    $('.comments', div).click(function() {
      bbr.pushCommentsScreen(link);
    });

    $('.link-title', div).click(function() {
      // self-post goes straight to comments
      if (selfPost) {
        bbr.pushCommentsScreen(link);
      } else {
        var url = link.data.url;
        if (url.substring(0, 1) === '/')
          url = 'http://reddit.com' + url;

        var a = document.createElement('a');
        a.href = url;

        thiz._handleLink(a);
      }
    });

    callback(div);
  },

  formatMessage: function(message, callback) {
    var thiz = this;
    var messageTemplate = $('#messageTemplate').html();

    var html = Mustache.to_html(messageTemplate, 
                                { time: moment.unix(message.data.created_utc).fromNow(),
                                  subject: message.data.subject,
                                  body: message.data.body,
                                  author: message.data.author });
    var $div = $('<div/>');
    $div.html(html);

    $div.attr('id', 'message-' + message.data.name);

    callback($div);
  },

  formatComment: function(comment, op, callback) {
    if (typeof comment.data.body === 'undefined')
      return;

    var div = this._createCommentDiv(comment, op, 'comment');

    callback(div);

    this._appendReplies(comment, op);
  },

  _createCommentDiv: function(comment, op, className) {
    var user = _cache.getPersistedItem('snooby.user');
    if (user !== null)
      user = JSON.parse(user);

    var titleSnippet = comment.data.body;
    titleSnippet = titleSnippet.substring(0, Math.min(40, titleSnippet.length));
    var $div = $('<div/>');
    $div.attr('id', comment.data.name);
    $div.attr('data-webworks-context',
             JSON.stringify({ id: comment.data.name,
                              type: 'commentContext',
                              header: titleSnippet,
                              subheader: comment.data.author }));
    $div.addClass(className);

    var commentTemplate = $('#commentTemplate').html();
    var score = comment.data.ups - comment.data.downs;

    var html = Mustache.to_html(commentTemplate,
                                { body: SnuOwnd.getParser().render(comment.data.body),
                                  author: comment.data.author,
                                  authorFlair: comment.data.author_flair_text,
                                  score: (score > 0 ? "+" : "") + score,
                                  time: moment.unix(comment.data.created_utc).fromNow() });

    $div.html(html);

    var $author = $div.find('.author');
    var $score = $div.find('.score');

    if (user !== null && comment.data.author === user.username) {
      $author.addClass('me');
    } else if (comment.data.author == op.data.author) {
      $author.addClass('op');
    }  

    if (comment.data.likes) {
      $score.addClass('upvoted');
    } else if (comment.data.likes !== null) {
      $score.addClass('downvoted');
    }

    if (score < -4)
      this.toggleComment($div.children()[0]);

    return $div;
  },

  toggleComment: function(div) {
    var icon = $(div).children().children('i')[0];
    if (icon.className === 'icon-angle-right') {
      icon.className = 'icon-angle-down';
      $(div).next().show();
    } else {
      icon.className = 'icon-angle-right';
      $(div).next().hide();
    }
  },

  _appendReplies: function(comment, op) {
    var hasReplies = typeof comment.data.replies.data !== 'undefined';
    var thiz = this;

    if (hasReplies) {
      $.each(comment.data.replies.data.children, function(key, value) {
        if (typeof value.data.body === 'undefined')
          return;

        var div = thiz._createCommentDiv(value, op, 'reply');

        if (value.data.parent_id !== '') {
          div.appendTo('#' + value.data.parent_id);
        }

        thiz._appendReplies(value, op);
      });
    }
  },

  createSubredditTabOption: function(subreddit, callback) {
    var tab = document.createElement('div');
    tab.setAttribute('data-bb-type', 'action');
    tab.setAttribute('data-bb-style', 'tab');
    tab.setAttribute('data-bb-overflow', true);
    tab.setAttribute('data-bb-img', 'img/icons/ic_view_list.png');
    tab.setAttribute('id', _subreddits.getSubredditTabId(subreddit.data.display_name));
    tab.innerHTML = subreddit.data.display_name;
    tab.setAttribute('onclick', 'bbr.switchSubreddit(\'' + subreddit.data.display_name +  '\');');

    callback(tab);
  },

  switchSubreddit: function(subreddit) {
    var selectedSubreddit = _cache.getItem('subreddit.selected');
    if (typeof selectedSubreddit === 'undefined' || selectedSubreddit !== subreddit)
      _subreddits._updateListing(subreddit, {});
  },

  dispatchLink: function(e) {
    var target = e.target;
    if (target && target.nodeName === 'A') {
      console.log('anchor clicked');
      e.preventDefault();

      this._handleLink(target);
    }
  },

  _handleLink: function(a) {
    var redditMatch = /^([\w]*\.)*reddit\.com/;
    if (a.hostname.match(redditMatch)) 
      return this._handleRedditLink(a);

    window.open(a.href);
  },

  _handleRedditLink: function(a) {
    var subredditMatch = /^\/r\/(\w)*(\/)*$/;
    var commentMatch = /^\/r\/(\w)*\/comments\/(\w)*\/.*$/;

    if (a.pathname.match(commentMatch))
      return this._handleRedditCommentLink(a);

    if (a.pathname.match(subredditMatch))
      return this._handleSubredditLink(a);
  },

  _handleRedditCommentLink: function(a) {
    bbr.pushCommentsScreen({ data: { permalink: a.pathname } });
  },

  _handleSubredditLink: function(a) {
    var pathname = a.pathname;
    var suffix = '/';
    var length = pathname.indexOf(suffix, pathname.length - suffix.length) !== -1 ? pathname.length - 1 : 
                                                                                    pathname.length;
    this.pushSubredditScreen(pathname.substring(3, length));
  },

  pushCommentsScreen: function(link) {
    _cache.removeItem('comments.visited');
    bb.pushScreen('comments.html', 'comments', { link: link });
  },

  pushSubredditScreen: function(subreddit) {
    _cache.removeItem('subreddit.visited');
    bb.pushScreen('subreddit.html', 'subreddit', { subreddit: subreddit });
  }
};
