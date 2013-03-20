describe('Comments', function() {
  var getPersistedItem = null;
  var getItem = null;
  var cache = null;

  beforeEach(function() {
    getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.user').returns(JSON.stringify({ username: 'magnanamos', 
                                                                      modhash: 'ae25323c52f' }));
    getPersistedItem.withArgs('snooby.gold').returns('true');

    getItem = sinon.stub(_cache, 'getItem');

    cache = sinon.mock(_cache);
  });

  afterEach(function() {
    _cache.getPersistedItem.restore();
    _cache.getItem.restore();
    cache.restore();
  });

  it('passes top-level comment to comment composer', function() {
    var commentsLong = responses.reddit.commentsLong[1];
    getItem.withArgs('comments.listing').returns(responses.reddit.commentsLong[1]);
    var mockBb = sinon.mock(bb);
    mockBb.expects('pushScreen').withArgs('comment.html', 
                                          'comment', 
                                          { parentThing: commentsLong.data.children[2] });
    
    _comments.replyToComment('t1_c8gomru');
    mockBb.verify();
  });

  it('passes nested comment when given a name', function() {
    var commentsLong = responses.reddit.commentsLong[1];
    getItem.withArgs('comments.listing').returns(responses.reddit.commentsLong[1]);
    var mockBb = sinon.mock(bb);
    mockBb.expects('pushScreen').withArgs('comment.html', 
                                          'comment', 
                                          { parentThing: commentsLong.data.children[3].data.replies.data.children[0] });
    
    _comments.replyToComment('t1_c8gr5zu');
    mockBb.verify();
  });

  it('passes multi-nested comment when given a name', function() {
    var commentsLong = responses.reddit.commentsLong[1];
    getItem.withArgs('comments.listing').returns(responses.reddit.commentsLong[1]);
    var mockBb = sinon.mock(bb);
    mockBb.expects('pushScreen').withArgs('comment.html', 
                                          'comment', 
                                          { parentThing: commentsLong.data.children[0].data.replies.data.children[0].data.replies.data.children[0] });
    
    _comments.replyToComment('t1_c8gqurh');
    mockBb.verify();
  });
});
