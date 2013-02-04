function commentsScreenReady(element, params) {
  var domain = params.link.data.domain;
  var selfPost = domain === 'self.' + params.link.data.subreddit;
  var headerTemplate = $('#linkHeaderTemplate').html();
  var html = Mustache.to_html(headerTemplate,
                              { title: selfPost ? params.link.data.title : 
                                                  '<a href="' + params.link.data.url + '">' + params.link.data.title + '</a>',
                                domain: params.link.data.domain,
                                numComments: params.link.data.num_comments });
  var header = $('<div/>');
  header.html(html);

  html = Mustache.to_html($('#linkHeaderDetailsTemplate').html(),
                          { author: params.link.data.author,
                            score: params.link.data.score,
                            time: moment.unix(params.link.data.created_utc).fromNow() });
  var details = $('<div/>');
  details.html(html);

  $('#linkHeader').append(header);
  $('#linkDetails').append(details);
  $('#loading').show();
}

function toggleComment(div) {
  var icon = $(div).children().children('i')[0];
  if (icon.className === 'icon-angle-right') {
    icon.className = 'icon-angle-down';
    $(div).next().show();
  } else {
    icon.className = 'icon-angle-right';
    $(div).next().hide();
  }
}

