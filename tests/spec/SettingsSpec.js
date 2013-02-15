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
      callback({ json: { data: { modhash: 'asdfasdfsadfa' } } }, sinon.spy(), sinon.spy());
    });
    
    _settings.doLogin();
    expect(login.calledWith('achan', 'pw')).toBeTruthy();
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
      callback({ json: { data: { modhash: 'asdfasdfsadfa' } } }, sinon.spy(), sinon.spy());
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

    
