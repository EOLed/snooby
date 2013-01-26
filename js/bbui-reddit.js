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
