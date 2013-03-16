var _comment = {
  onScreenReady: function(element, params) {
    _cache.setItem('comment.link', params.link);
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

  save: function(callback) {
    var link = _cache.getItem('comment.link');

    var onsuccess = function() {
      var cachedListing = _cache.getItem('subreddit.listing').data.children;
      cachedListing.forEach(function(cachedLink, index) {
        if (cachedLink.data.name === link.data.name) {
          cachedLink.data.num_comments++;
          return false;
        }
      });
      bb.popScreen();
    };

    var user = JSON.parse(_cache.getPersistedItem('snooby.user'));
    app.comment($('#commentTextarea').val(), link.data.name, user.modhash, onsuccess);
  }
};
