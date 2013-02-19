var blackberry = { ui: { dialog: { customAskAsync: function() {} } },
                   payment: { developmentMode: false, 
                              checkExisting: function(data,onsuccess, onfail) {}, 
                              purchase: function(data, onsuccess, onfail) {} } };
describe('Settings', function() {
  it('logs in with the username and password provided from form', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('loginButton').returns({ setCaption: function(s) {} });

    $ = sinon.stub();
    $.withArgs('#username').returns({ val: function() { return 'achan'; } });
    $.withArgs('#password').returns({ val: function() { return 'pw'; } });

    var subreddits = sinon.stub(app, 'subreddits', function(noop, callback) {
    });

    var login = sinon.stub(app, 'login', function(username, pw, callback) {
      callback({"json": {"errors": [], 
                         "data": {"modhash": "dbwdgjf6nm67a54b81bb5cbc8164c6a650913bc0a3f9ca70d5", 
                                  "cookie": "6249076,2013-02-15T18:06:23,7caaa5dcc2b57eb7f1e3342e863d20eb52"}}},
               sinon.spy(),
               sinon.spy());
    });
    
    _settings.doLogin();
    expect(login.calledWith('achan', 'pw')).toBeTruthy();
    getElementById.restore();
    subreddits.restore();
    login.restore();
  });

  it('shows error message when user exceeds rate limit', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    var setCaption = sinon.spy();
    getElementById.withArgs('loginButton').returns({ setCaption: setCaption });

    var subreddits = sinon.stub(app, 'subreddits', function(noop, callback) {
    });

    var customAskAsync = sinon.stub(blackberry.ui.dialog, 'customAskAsync');

    var login = sinon.stub(app, 'login', function(username, pw, callback) {
      callback({"json": {"errors": [["RATELIMIT", 
                                     "you are doing that too much. try again in 1 minute.",
                                     "vdelay"]]}},
               sinon.spy(),
               sinon.spy());
    });

    _settings.doLogin();
    expect(blackberry.ui.dialog.customAskAsync.calledWith('you are doing that too much. try again in 1 minute.')).toBeTruthy();
    expect(setCaption.calledWith('<i class="icon-signin"> Login</i>')).toBeTruthy();
    getElementById.restore();
    subreddits.restore();
    blackberry.ui.dialog.customAskAsync.restore();
    app.login.restore();
  });

  it('shows error message when user enters bad credentials', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    var setCaption = sinon.spy();
    getElementById.withArgs('loginButton').returns({ setCaption: setCaption });

    var subreddits = sinon.stub(app, 'subreddits', function(noop, callback) {
    });

    var login = sinon.stub(app, 'login', function(username, pw, callback) {
      callback({"json": {"errors": [["WRONG_PASSWORD", "invalid password", "passwd"]]}},
               sinon.spy(),
               sinon.spy());
    });
    
    var customAskAsync = sinon.stub(blackberry.ui.dialog, 'customAskAsync');

    _settings.doLogin();
    expect(blackberry.ui.dialog.customAskAsync.calledWith(sinon.match.string)).toBeTruthy();
    expect(setCaption.calledWith('<i class="icon-signin"> Login</i>')).toBeTruthy();
    getElementById.restore();
    subreddits.restore();
    login.restore();
    blackberry.ui.dialog.customAskAsync.restore();
  });

  it('doesn\'t reload subreddits upon bad login', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('loginButton').returns({ setCaption: function(s) {} });

    var subreddits = sinon.stub(app, 'subreddits', function(noop, callback) {
    });

    var login = sinon.stub(app, 'login', function(username, pw, callback) {
      callback({"json": {"errors": [["WRONG_PASSWORD", "invalid password", "passwd"]]}},
               sinon.spy(),
               sinon.spy());
    });
    
    var blackberry = sinon.stub();

    _settings.doLogin();
    expect(app.subreddits.callCount).toBe(0);
    getElementById.restore();
    subreddits.restore();
    login.restore();
  });

  it('clears cached subreddits after successful login', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('loginButton').returns({ setCaption: function(s) {} });

    var subreddits = sinon.stub(app, 'subreddits', function(noop, callback) {
    });

    var login = sinon.stub(app, 'login', function(username, pw, callback) {
      callback({"json": {"errors": [], "data": {"modhash": "dbwdgjf6nm67a54b81bb5cbc8164c6a650913bc0a3f9ca70d5", "cookie": "6249076,2013-02-15T18:06:23,11b4817caaa5dcc2b57eb7f1e3342e863d20eb52"}}}, sinon.spy(), sinon.spy());
    });

    var removePersistedItem = sinon.spy(_cache, 'removePersistedItem');
    
    _settings.doLogin();
    expect(removePersistedItem.calledWith('snooby.subreddits')).toBeTruthy();
    removePersistedItem.restore();
    getElementById.restore();
    subreddits.restore();
    login.restore();
  });
  
  it('clears cached subreddits after successful logout', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('logoutButton').returns({ setCaption: function(s) {} });

    var subreddits = sinon.stub(app, 'subreddits', function(noop, callback) {
    });

    var logout = sinon.stub(app, 'logout', function(modhash, callback) {
      callback();
    });

    var removePersistedItem = sinon.spy(_cache, 'removePersistedItem');
    
    _settings.doLogout();
    expect(removePersistedItem.calledWith('snooby.subreddits')).toBeTruthy();
    removePersistedItem.restore();
    getElementById.restore();
    subreddits.restore();
    logout.restore();
  });
});
