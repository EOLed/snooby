function bbifyPost(post, callback) {
  var linkTemplate = $('#linkTemplate').html();
  var html = Mustache.to_html(linkTemplate, post.data);
  var div = $('<div/>');
  div.html(html);
  callback(div);
}
