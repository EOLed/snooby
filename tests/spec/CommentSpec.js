describe('Comment Composer', function() {
  var getPersistedItem = null;
  var getItem = null;
  var cache = null;
  var saveComment = null;

  beforeEach(function() {
    getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.user').returns(JSON.stringify({ username: 'magnanamos', 
                                                                      modhash: 'ae25323c52f' }));
    getPersistedItem.withArgs('snooby.gold').returns('true');

    getItem = sinon.stub(_cache, 'getItem');

    saveComment = sinon.stub(app, 'comment', function(text, name, uh, onsuccess) { onsuccess(); });

    cache = sinon.mock(_cache);
  });

  afterEach(function() {
    _cache.getPersistedItem.restore();
    _cache.getItem.restore();
    cache.restore();

    saveComment.restore();
  });

  it('persists the current link on screen ready', function() {
    var params = { parentThing: 'this is a link' };
    cache.expects('setItem').withArgs('comment.parent', params.parentThing);
    _comment.onScreenReady(null, params);
    cache.verify();
  });

  it('pops screen upon saving comment', function() {
    getItem.withArgs('comment.parent').returns(responses.reddit.listings.frontpage.data.children[0]);
    var comment = { kind: "t1", 
                    data: { subreddit_id: responses.reddit.listings.frontpage.data.children[0].data.subreddit_id,
                            subreddit: responses.reddit.listings.frontpage.data.children[0].data.subreddit,
                            likes: true,
                            id: 'reply' + responses.reddit.listings.frontpage.data.children[0].data.name,
                            author: JSON.parse(_cache.getPersistedItem('snooby.user')).username,
                            parent_id: responses.reddit.listings.frontpage.data.children[0].data.name,
                            edited: false,
                            downs: 0,
                            ups: 1 } }; 
                            
    var mockBb = sinon.mock(bb);
    mockBb.expects('popScreen').once();

    var textarea = { val: function() {} };
    var val = sinon.stub(textarea, 'val');
    val.returns('your markdown comment');
    _comment.save(textarea);
    mockBb.verify();
    mockBb.restore();
    val.restore();
  });

  it('caches the new comment', function() {
    getItem.withArgs('comment.parent').returns(responses.reddit.listings.frontpage.data.children[0]);
    var comment = { kind: "t1", 
                    data: { subreddit_id: responses.reddit.listings.frontpage.data.children[0].data.subreddit_id,
                            subreddit: responses.reddit.listings.frontpage.data.children[0].data.subreddit,
                            likes: true,
                            id: 'reply' + responses.reddit.listings.frontpage.data.children[0].data.name,
                            author: JSON.parse(_cache.getPersistedItem('snooby.user')).username,
                            parent_id: responses.reddit.listings.frontpage.data.children[0].data.name,
                            edited: false,
                            downs: 0,
                            ups: 1 } }; 
                            
    var popScreen = sinon.stub(bb, 'popScreen');

    cache.expects('setItem').withArgs('comment.created', comment);

    var textarea = { val: function() {} };
    var val = sinon.stub(textarea, 'val');
    val.returns('your markdown comment');
    _comment.save(textarea);
    cache.verify();
    popScreen.restore();
    val.restore();
  });
});
