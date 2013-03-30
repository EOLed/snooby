describe('bbr.dispatchLink', function() {
  var e;

  beforeEach(function() {
    e = { target: { pathname: '', hostname: '',  href: '', nodeName: 'A' }, 
          preventDefault: function() {} };
  });

  it('does nothing if event target is not a link', function() {
    e.target.nodeName = '';
    var messageClicked = sinon.stub(_mailbox, 'messageClicked');
    messageClicked.returns(false);
    var mock = sinon.mock(bb);
    mock.expects('pushScreen').never();
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
    messageClicked.restore();
  });

  it('handles comment context links natively', function() {
    var mock = sinon.mock(bb);
    mock.expects('pushScreen')
        .withArgs('comments.html', 
                  'comments',
                  { link: { data: { permalink: '/r/test/comments/190i6b/testing_opening_links_for_res/c8jnn3c' } } })
        .once();

    e.target.hostname = 'www.reddit.com';
    e.target.pathname = '/r/test/comments/190i6b/testing_opening_links_for_res/c8jnn3c';
    e.target.href = 'http://www.reddit.com/r/test/comments/190i6b/testing_opening_links_for_res/c8jnn3c';
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
  });

  it('handles comment links natively', function() {
    var mock = sinon.mock(bb);
    mock.expects('pushScreen')
        .withArgs('comments.html', 
                  'comments',
                  { link: { data: { permalink: '/r/test/comments/190t6j/test_posting_url' } } })
        .once();

    e.target.hostname = 'www.reddit.com';
    e.target.pathname = '/r/test/comments/190t6j/test_posting_url';
    e.target.href = 'http://www.reddit.com/r/test/comments/190t6j/test_posting_url'
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
  });

  it('handles comment links natively (trailing slash)', function() {
    var mock = sinon.mock(bb);
    mock.expects('pushScreen')
        .withArgs('comments.html', 
                  'comments',
                  { link: { data: { permalink: '/r/test/comments/190t6j/test_posting_url/' } } })
        .once();

    e.target.hostname = 'www.reddit.com';
    e.target.pathname = '/r/test/comments/190t6j/test_posting_url/';
    e.target.href = 'http://www.reddit.com/r/test/comments/190t6j/test_posting_url/'
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
  });

  /*it('handles comment links natively with context', function() {
    var mock = sinon.mock(bb);
    mock.expects('pushScreen')
        .withArgs('comments.html', 
                  'comments',
                  { link: { data: { permalink: '/r/blackberry/comments/1b0a45/is_blackberry_ripe_for_a_comeback/c92krj4?context=3' } } })
        .once();

    e.target.hostname = 'www.reddit.com';
    e.target.pathname = '/r/test/comments/190t6j/test_posting_url/';
    e.target.href = 'http://www.reddit.com/r/test/comments/190t6j/test_posting_url/'
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
  });*/

  it('handles subreddit links natively', function() {
    var mock = sinon.mock(bb);
    mock.expects('pushScreen').withArgs('subreddit.html', 'subreddit', { subreddit: 'test' }).once();
    e.target.hostname = 'www.reddit.com';
    e.target.pathname = '/r/test';
    e.target.href = 'http://www.reddit.com/r/test'
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
  });

  it('handles subreddit links natively (trailing slash)', function() {
    var mock = sinon.mock(bb);
    mock.expects('pushScreen').withArgs('subreddit.html', 'subreddit', { subreddit: 'test' }).once();
    e.target.hostname = 'www.reddit.com';
    e.target.pathname = '/r/test/';
    e.target.href = 'http://www.reddit.com/r/test/'
    bbr.dispatchLink(e);
    mock.verify();
    mock.restore();
  });

});
