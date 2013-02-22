describe('App', function() {
  it('logs in through snooby', function() {
    sinon.stub(snooby, 'login');
    app.login('username', 'password', sinon.spy());
    expect(snooby.login.called).toBeTruthy();
    snooby.login.restore();
  });

  it('logs out through snooby', function() {
    sinon.stub(snooby, 'logout');
    app.logout(sinon.spy(), sinon.spy());
    expect(snooby.logout.called).toBeTruthy();
    snooby.logout.restore();
  });
});

describe('app.listing()', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('gets subreddit listings from snooby', function() {
    sinon.spy(snooby, 'listing');
    app.listing(sinon.spy(), sinon.spy());
    expect(snooby.listing.called).toBeTruthy();
    snooby.listing.restore();
  });

  it('stores the current subreddit listing (object) in memory', function() {
    var blackopsListing = responses.reddit.listings.blackops2;
    sinon.spy(_cache, 'setItem');
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(blackopsListing)]);
    app.listing('blackops2', {}, sinon.spy());
    server.respond();
    expect(_cache.setItem.calledWith('subreddit.listing', blackopsListing)).toBeTruthy();
    _cache.setItem.restore();
  });

  it('stores the selected subreddit in memory', function() {
    var blackopsListing = responses.reddit.listings.blackops2;
    sinon.spy(_cache, 'setItem');
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(blackopsListing)]);
    app.listing('blackops2', {}, sinon.spy());
    server.respond();
    expect(_cache.setItem.calledWith('subreddit.selected', 'blackops2')).toBeTruthy();
    _cache.setItem.restore();
  });

  it('passes every link to the callback', function() {
    var blackopsListing = responses.reddit.listings.blackops2;
    var callback = sinon.spy();
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(blackopsListing)]);
    app.listing('blackops2', {}, callback);
    server.respond();
    for (var i = 0; i < blackopsListing.data.children.length; i++)
      expect(JSON.stringify(callback.args[i][0])).toBe(JSON.stringify(blackopsListing.data.children[i]));
  });

  it('passes listing to oncomplete callback', function() {
    var blackopsListing = responses.reddit.listings.blackops2;
    var callback = sinon.spy();
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(blackopsListing)]);
    app.listing('blackops2', {}, sinon.spy(), callback);
    server.respond();

    expect(JSON.stringify(callback.args[0][0])).toBe(JSON.stringify(blackopsListing));
  });
});

describe('app.comments()', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('gets comments through snooby', function() {
    sinon.spy(snooby, 'comments');
    app.comments(sinon.spy(), sinon.spy(), sinon.spy());
    expect(snooby.comments.called).toBeTruthy();
    snooby.comments.restore();
  });

  it('passes the every comment with op to the callback', function() {
    var commentListing = responses.reddit.comments;
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2/comments/187oca/when_did_aftermath_get_so_popular/.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(commentListing)]);
    var callback = sinon.spy();
    app.comments('/r/blackops2/comments/187oca/when_did_aftermath_get_so_popular/', sinon.spy(), callback);
    server.respond();
    expect(callback.called).toBeTruthy();
  });
  
  it('never passes the first comment (OP) to the callback', function() {
    var commentListing = responses.reddit.comments;
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2/comments/187oca/when_did_aftermath_get_so_popular/.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(commentListing)]);
    var callback = sinon.spy();
    var op = sinon.spy();
    app.comments('/r/blackops2/comments/187oca/when_did_aftermath_get_so_popular/', 
                 op, 
                 callback);
    server.respond();
    expect(callback.neverCalledWith(commentListing[0].data.children[0], op)).toBeTruthy();
  });
});

describe('app.subreddits()', function() {
  it('gets default subreddits if there\'s no logged user and no cached reddits', function() {
    var getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.user').returns(null);
    getPersistedItem.withArgs('snooby.subreddits').returns(null);
    
    var callback = sinon.spy();
    var oncomplete = sinon.spy();
    sinon.spy(snooby, 'defaultSubreddits');
    app.subreddits(callback, oncomplete);

    expect(snooby.defaultSubreddits.called).toBeTruthy();
    _cache.getPersistedItem.restore();
    snooby.defaultSubreddits.restore();
  });

  it('gets custom subreddits if there\'s a logged user', function() {
    var getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.user')
                    .returns('{ "username": "achan", "password": "pw", "modhash": "modhash" }');
    getPersistedItem.withArgs('snooby.subreddits').returns(null);
    
    var callback = sinon.spy();
    var oncomplete = sinon.spy();
    sinon.spy(snooby, 'userSubreddits');
    app.subreddits(callback, oncomplete);

    expect(snooby.userSubreddits.called).toBeTruthy();
    _cache.getPersistedItem.restore();
    snooby.userSubreddits.restore();
  });

  it('callbacks are called after retrieving default subreddits', function() {
    var defaultSubs = responses.reddit.subreddits.default;

    sinon.stub(snooby, 'defaultSubreddits', function(callback) {
      callback(defaultSubs.data.children);
    });

    var getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.user').returns(null);
    getPersistedItem.withArgs('snooby.subreddits').returns(null);

    var callback = sinon.spy();
    var oncomplete = sinon.spy();
    app.subreddits(callback, oncomplete);

    expect(callback.alwaysCalledWithMatch({ data: { display_name: sinon.match.string } })).toBeTruthy();
    expect(oncomplete.called).toBeTruthy();
    _cache.getPersistedItem.restore();
    snooby.defaultSubreddits.restore();
  });

  it('subreddits are cached after retrieved', function() {
    var defaultSubs = responses.reddit.subreddits.default;

    sinon.stub(snooby, 'defaultSubreddits', function(callback) {
      callback(defaultSubs.data.children);
    });
    var getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.user').returns(null);
    getPersistedItem.withArgs('snooby.subreddits').returns(JSON.stringify(defaultSubs.data.children));
    sinon.spy(_cache, 'persistItem');

    var callback = sinon.spy();
    var oncomplete = sinon.spy();
    app.subreddits(callback, oncomplete);

    expect(_cache.persistItem.calledWith('snooby.subreddits', 
                                         JSON.stringify(defaultSubs.data.children))).toBeTruthy();
    _cache.getPersistedItem.restore();
    _cache.persistItem.restore();
    snooby.defaultSubreddits.restore();
  });
});
