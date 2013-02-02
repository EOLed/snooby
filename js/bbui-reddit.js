function bbifyPost(link, callback) {
  var linkTemplate = $('#linkTemplate').html();
  var domain = link.data.domain;
  var selfPost = domain === 'self.' + link.data.subreddit;
  if (!selfPost) {
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
  var linkDescription = Mustache.to_html(hasThumbnail ? $('#titleWithThumbnail').html() : $('#titleWithoutThumbnail').html(),
                                         { title: selfPost ? link.data.title : 
                                                             '<a href="' + link.data.url + '">' + link.data.title + '</a>',
                                           numComments: link.data.num_comments,
                                           thumbnail: link.data.thumbnail });

  var html = Mustache.to_html(linkTemplate, 
                              { linkDescription: linkDescription,
                                subreddit: link.data.subreddit,
                                score: link.data.score,
                                domain: domain,
                                time: moment.unix(link.data.created_utc).fromNow(),
                                author: link.data.author });
  var div = $('<div/>');
  div.html(html);
  $('.comments', div).click(function() {
    bb.pushScreen('comments.html', 'comments', { link: link });
  });

  $('.link-title', div).click(function() {
    // self-post goes straight to comments
    if (selfPost) {
      bb.pushScreen('comments.html', 'comments', { link: link });
    } else {
    }
  });

  callback(div);
}

function bbifyComment(comment, callback) {
  if (typeof comment.data.body === 'undefined')
    return;

  var div = createCommentDiv(comment, 'comment');

  console.log('creating div: ' + comment.data.name);

  callback(div);

  appendReplies(comment);
}

function createCommentDiv(comment, className) {
  var div = $('<div/>');
  div.attr('id', comment.data.name);
  div.addClass(className);
  var commentTemplate = $('#commentTemplate').html();
  var score = comment.data.ups - comment.data.downs;

  var html = Mustache.to_html(commentTemplate,
                              { body: SnuOwnd.getParser().render(comment.data.body),
                                author: comment.data.author,
                                score: (score > 0 ? "+" : "") + score,
                                time: moment.unix(comment.data.created_utc).fromNow() });

  div.html(html);
  if (score < -4)
    toggleComment(div.children()[0]);

  return div;
}

function appendReplies(comment) {
  var hasReplies = typeof comment.data.replies.data !== 'undefined';

  if (hasReplies) {
    $.each(comment.data.replies.data.children, function(key, value) {
      if (typeof value.data.body === 'undefined')
        return;

      var div = createCommentDiv(value, 'reply');

      if (value.data.parent_id !== '') {
        div.appendTo('#' + value.data.parent_id);
        console.log('appending to div: ' + value.data.parent_id);
      }

      appendReplies(value);
    });
  }
}

// function createCommentDiv(comment, parentDiv) {
//   var div = $('<div/>');
//   var commentTemplate = $('#commentTemplate').html();
//   var html = Mustache.to_html(commentTemplate,
//                               { body: SnuOwnd.getParser().render(comment.data.body),
//                                 author: comment.data.author,
//                                 score: comment.data.ups - comment.data.downs });
// 
//   div.html(html);
// 
//   var hasReplies = typeof comment.data.replies.data !== 'undefined';
// 
//   if (hasReplies) {
//     $.each(comment.data.replies.data.children, function(key, value) {
//       if (typeof value.data.body === 'undefined')
//         return;
// 
//       createCommentDiv(value, div);
//       if (typeof parentDiv !== 'undefined')
//         parentDiv.append(div.html());
//     });
//   }
// 
//   return div;
// }

function createSubredditTabOption(subreddit, callback) {
  var tab = document.createElement('div');
  tab.setAttribute('data-bb-type', 'action');
  tab.setAttribute('data-bb-style', 'tab');
  tab.setAttribute('data-bb-overflow', true);
  tab.setAttribute('data-bb-img', 'img/icons/ic_view_list.png');
  tab.setAttribute('id', 'tab-' + subreddit.data.display_name);
  tab.innerHTML = subreddit.data.display_name;
  tab.setAttribute('onclick', 'switchSubreddit(\'' + subreddit.data.display_name +  '\');');

  callback(tab);
}

function switchSubreddit(subreddit) {
  $('#loading').show();
  $('#listing').empty();
  listing(subreddit, function(post) {
    $('#loading').hide();
    $('#listing').show();
    bbifyPost(post, function(bbPost) {
      $(bbPost).appendTo('#listing');
    });
  });
}
