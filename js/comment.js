var _comment = {
  onScreenReady: function(element, params) {
    _cache.setItem('comment.parent', params.parentThing);
  },

  onDomReady: function(element, params) {
    $('#commentTextarea').autosize();
  },

  showEditor: function() {
    $('#commentPreviewPane').hide();
    $('#commentEditorPane').show();
  },

  showPreview: function() {
    $('#commentPreviewPane').html(SnuOwnd.getParser().render($('#commentTextarea').val()));
    $('#commentEditorPane').hide();
    $('#commentPreviewPane').show();
  },

  save: function(textarea) {
    var link = _cache.getItem('comment.parent');
    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));

    link.data.num_comments++;
    _cache.setItem('comment.created', 
                   { kind: 't1',
                     data: { subreddit_id: link.data.subreddit_id,
                             subreddit: link.data.subreddit,
                             likes: true,
                             id: 'reply' + link.data.name,
                             author: user.username,
                             parent_id: link.data.name,
                             edited: false,
                             body: textarea.val(),
                             downs: 0,
                             ups: 1 } } );
          
               
    bb.popScreen();
  }
};
