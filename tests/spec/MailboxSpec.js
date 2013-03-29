describe('Mailbox', function() {
  it('extracts the comments URL from a context permalink', function() {
    var mockBbr = sinon.mock(bbr);
    mockBbr.expects('_handleRedditCommentLink')
           .withArgs({ pathname: '/r/SnoobyApp/comments/1b0cbw/snooby_107_submitted_to_app_world' });

    _mailbox.pushCommentsScreen('/r/SnoobyApp/comments/1b0cbw/snooby_107_submitted_to_app_world/c92h8tg?context=3');

    mockBbr.verify();
  });
});
