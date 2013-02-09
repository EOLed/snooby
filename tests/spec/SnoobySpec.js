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
