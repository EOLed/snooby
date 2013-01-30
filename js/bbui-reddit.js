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
