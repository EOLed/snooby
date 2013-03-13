var _comment = {
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
  }
};
