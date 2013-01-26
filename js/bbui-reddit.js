function bbifyPost(post, callback) {
  var div = $('<div/>');
  var postTitleContainer = $('<div/>').addClass('container').addClass('post');
  var row = $('<div/>').addClass('row');
  row.appendTo(postTitleContainer);
  var thread = $('<div/>', { text: post.data.title }).addClass('span12');
  thread.appendTo(row);
  postTitleContainer.appendTo(div);

  var detailsContainer = $('<div/>').addClass('container').addClass('details');
  var details = $('<div/>').addClass('row');
  var detailsText = post.data.subreddit + " • " + 
                    post.data.score + " • " + 
                    post.data.domain + " • " + 
                    post.data.author;
  $('<div/>', { text: detailsText }).addClass('span12').appendTo(details);
  details.appendTo(detailsContainer);
  detailsContainer.appendTo(div);
  callback(div);
}
