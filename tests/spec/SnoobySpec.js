describe('Login', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('uses https', function() {
    snooby.login('mrlamb', 'mrlamb', function() {});
    expect(server.requests.length).toEqual(1);
    expect(server.requests[0].url).toEqual('https://ssl.reddit.com/api/login');
  });

  it('passes the correct parameters', function() {
    snooby.login('mrlamb', 'mrlamb', function() {});
    expect(server.requests[0].requestBody).toEqual('user=mrlamb&passwd=mrlamb&rem=true&api_type=json');
  });

  it('calls onsuccess callback upon successful login', function() {
    var response = '{"json": {"errors": [], "data": {"modhash": "mr0z3ffd6503006095d3019bbe048c332cf67845a47e36890f", "cookie": "6249076,2013-02-08T20:22:57,005400297108ae62f886191a126b8bd992a293de"}}}';
    server.respondWith('POST',
                       'https://ssl.reddit.com/api/login',
                       [200, { "Content-Type": "application/json" }, response]);
    var onsuccess = sinon.spy();
    snooby.login('mrlamb', 'mrlamb', onsuccess);
    server.respond();
    expect(onsuccess.withArgs(JSON.parse(response)).calledOnce).toBeTruthy();
  });
});

describe('Logout', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('passes the correct parameters', function() {
    snooby.logout('42324acbed', function() {});
    expect(server.requests[0].requestBody).toEqual('uh=42324acbed&top=off');
  });

  it('calls onsuccess callback upon successful logout', function() {
    var response = '{"errors":[]}';
    server.respondWith('POST',
                       'https://ssl.reddit.com/logout',
                       [200, { "Content-Type": "application/json" }, response]);
    var onsuccess = sinon.spy();
    snooby.logout('modhash', onsuccess);
    server.respond();
    expect(onsuccess.calledOnce).toBeTruthy();
  });
});

describe('Listing', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('requests frontpage listings from reddit if frontpage is specified', function() {
    snooby.listing('frontpage', sinon.spy());
    expect(server.requests[0].url).toBe('http://reddit.com/.json');
  });

  it('requests subreddit listings from reddit if subreddit is specified', function() {
    snooby.listing('blackops2', sinon.spy());
    expect(server.requests[0].url).toBe('http://reddit.com/r/blackops2.json');
  });

  it('passes the selected subreddit and its listings to the callback', function() {
    var blackopsListing = responses.reddit.listings.blackops2;
    server.respondWith('GET',
                       'http://reddit.com/r/blackops2.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(blackopsListing)]);
    var callback = sinon.spy();
    snooby.listing('blackops2', {}, callback);
    server.respond();
    expect(callback.calledWith('blackops2', blackopsListing)).toBeTruthy();
  });
});

describe('Comments', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('requests for comments from reddit', function() {
    snooby.comments('/r/blackops2/comments/187oca/when_did_aftermath_get_so_popular/', sinon.spy());
    expect(server.requests[0].url).toBe('http://reddit.com/r/blackops2/comments/187oca/when_did_aftermath_get_so_popular/.json');
  });
});

describe('Subreddits', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('requests for default subreddits from reddit', function() {
    snooby.defaultSubreddits(sinon.spy());
    expect(server.requests[0].url).toBe('http://reddit.com/reddits.json');
  });

  it('requests for user subreddits from reddit', function() {
    snooby.userSubreddits(sinon.spy());
    expect(server.requests[0].url).toBe('http://reddit.com/reddits/mine.json');
  });

  it('gets all user subreddits before calling callback', function() {
    var subreddits = responses.reddit.subreddits.user;
    server.respondWith('GET',
                       'http://reddit.com/reddits/mine.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(subreddits[0])]);
    server.respondWith('GET',
                       'http://reddit.com/reddits/mine.json?after=rb_hi2w8',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(subreddits[1])]);
    server.respondWith('GET',
                       'http://reddit.com/reddits/mine.json?after=rb_11zxt9',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(subreddits[2])]);
    var callback = sinon.spy();
    snooby.userSubreddits(callback);
    server.respond();
    expect(callback.called).toBeTruthy();
    expect(callback.args[0][0].length).toBe(75);
  });

  it('sorts all user subreddits before calling callback', function() {
    var subreddits = responses.reddit.subreddits.user;
    server.respondWith('GET',
                       'http://reddit.com/reddits/mine.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(subreddits[0])]);
    server.respondWith('GET',
                       'http://reddit.com/reddits/mine.json?after=rb_hi2w8',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(subreddits[1])]);
    server.respondWith('GET',
                       'http://reddit.com/reddits/mine.json?after=rb_11zxt9',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(subreddits[2])]);
    var callback = sinon.spy();
    snooby.userSubreddits(callback);
    server.respond();

    for (var i = 0; i < callback.args[0][0].length - 1; i++) {
      expect(callback.args[0][0][i]
                     .data
                     .display_name
                     .localeCompare(callback.args[0][0][i+1].data.display_name) < 0).toBeTruthy();
    }
  });

  it('sorts all default subreddits before calling callback', function() {
    var defaultSubs = responses.reddit.subreddits.default;
    server.respondWith('GET',
                       'http://reddit.com/reddits.json',
                       [200, { "Content-Type": "application/json" }, JSON.stringify(defaultSubs)]);
    var callback = sinon.spy();
    snooby.defaultSubreddits(callback);
    server.respond();

    expect(callback.args[0][0].length).toBeGreaterThan(0);

    for (var i = 0; i < callback.args[0][0].length - 1; i++) {
      expect(callback.args[0][0][i]
                     .data
                     .display_name
                     .localeCompare(callback.args[0][0][i+1].data.display_name) < 0).toBeTruthy();
    }
  });
});

describe('Voting', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('passes the correct parameters', function() {
    snooby.vote(1, '23423423', '342342323', function() {});
    expect(server.requests[0].requestBody).toEqual('dir=1&id=23423423&uh=342342323');
  });

  it('calls onsuccess callback upon successful vote', function() {
    var response = '{"errors":[]}';
    server.respondWith('POST',
                       'http://www.reddit.com/api/vote',
                       [200, { "Content-Type": "application/json" }, response]);
    var onsuccess = sinon.spy();
    snooby.vote(1, 'asdf', 'asdf', onsuccess);
    server.respond();
    expect(onsuccess.calledOnce).toBeTruthy();
  });
});

describe('Commenting', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('uses POST', function() {
    snooby.comment('thisistext', 'thingId', 'modhash', function() {});
    expect(server.getHTTPMethod(server.requests[0])).toEqual('POST');
  });

  it('passes the correct parameters', function() {
    snooby.comment('thisistext', 'thingId', 'modhash', function() {});
    expect(server.requests[0].requestBody).toEqual('text=thisistext&thing_id=thingId&uh=modhash');
  });

  it('calls onsuccess callback upon successful post', function() {
    var response = '{"errors":[]}';
    server.respondWith('POST',
                       'http://www.reddit.com/api/comment',
                       [200, { "Content-Type": "application/json" }, response]);
    var onsuccess = sinon.spy();
    snooby.comment('iwantcomment', 'adsfs', 'asdf', onsuccess);
    server.respond();
    expect(onsuccess.calledOnce).toBeTruthy();
  });
});

describe('Mailbox', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('hits the correct url for inbox', function() {
    snooby.mailbox('inbox', { before: 't1_before', after: 't1_after' });
    expect(server.requests[0].url).toEqual('http://reddit.com/message/inbox.json?before=t1_before&after=t1_after');
  });

  it('mark as uread passes the correct parameters', function() {
    snooby.markAsUnread('thingid', 'modhash', function() {});
    expect(server.requests[0].requestBody).toEqual('id=thingid&uh=modhash');
  });

  it('mark as uread calls onsuccess callback upon successful marking', function() {
    var response = '{"errors":[]}';
    server.respondWith('POST',
                       'http://www.reddit.com/api/unread_message',
                       [200, { "Content-Type": "application/json" }, response]);
    var onsuccess = sinon.spy();
    snooby.markAsUnread('thingid', 'asdf', onsuccess);
    server.respond();
    expect(onsuccess.calledOnce).toBeTruthy();
  });

  it('mark as read passes the correct parameters', function() {
    snooby.markAsRead('thingid', 'modhash', function() {});
    expect(server.requests[0].requestBody).toEqual('id=thingid&uh=modhash');
  });

  it('mark as read calls onsuccess callback upon successful marking', function() {
    var response = '{"errors":[]}';
    server.respondWith('POST',
                       'http://www.reddit.com/api/read_message',
                       [200, { "Content-Type": "application/json" }, response]);
    var onsuccess = sinon.spy();
    snooby.markAsRead('thingid', 'asdf', onsuccess);
    server.respond();
    expect(onsuccess.calledOnce).toBeTruthy();
  });
});
