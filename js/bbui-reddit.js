function bbifyPost(link, callback) {
  var linkTemplate = $('#linkTemplate').html();
  var html = Mustache.to_html(linkTemplate, 
                              { title: link.data.title,
                                numComments: link.data.num_comments,
                                subreddit: link.data.subreddit,
                                score: link.data.score,
                                domain: link.data.domain,
                                author: link.data.author });
  var div = $('<div/>');
  div.html(html);
  div.click(function() {
    bb.pushScreen('comments.html', 'comments', { link: link });
  });

  callback(div);
}

function bbifyComment(comment, callback) {
  if (typeof comment.data.body === 'undefined')
    return;

  // var div = $('<div/>');
  // div.attr('id', comment.data.name);
  // div.addClass('comment');
  // var commentTemplate = $('#commentTemplate').html();
  // var html = Mustache.to_html(commentTemplate,
  //                             { body: SnuOwnd.getParser().render(comment.data.body),
  //                               author: comment.data.author,
  //                               score: comment.data.ups - comment.data.downs, 
  //                               time: moment.unix(comment.data.created_utc * 1000).fromNow() });

  // div.html(html);

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
  var html = Mustache.to_html(commentTemplate,
                              { body: SnuOwnd.getParser().render(comment.data.body),
                                author: comment.data.author,
                                score: comment.data.ups - comment.data.downs,
                                time: moment.unix(comment.data.created_utc).fromNow() });

  div.html(html);
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
