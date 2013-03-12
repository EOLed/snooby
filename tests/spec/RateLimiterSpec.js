describe('Rate Limiter', function() {
  it('allows you to request actions', function() {
    rateLimiter.requestAction(5, sinon.spy(), sinon.spy());
  });

  it('automatically calls onaccepted() if user has snooby gold', function() {
    var cache = sinon.stub(_cache, 'getPersistedItem');
    cache.withArgs('snooby.gold').returns(true);

    var onaccepted = sinon.spy();

    rateLimiter._limit = 5;
    _cache.removePersistedItem('rateLimiter.actions');
    rateLimiter.requestAction({ tokens: 10, action: 'test' }, onaccepted, sinon.spy());

    expect(onaccepted.called).toBeTruthy();
    
    _cache.getPersistedItem.restore();
  });

  it('calls onaccepted() callback if the user has enough tokens', function() {
    rateLimiter._limit = 5;
    _cache.removePersistedItem('rateLimiter.actions');
    var onaccepted = sinon.spy();
    rateLimiter.requestAction({ tokens: 5, action: 'test' }, onaccepted, sinon.spy());
    expect(onaccepted.called).toBeTruthy();
  });

  it('handles multiple calls within the limit properly', function() {
    rateLimiter._limit = 5;
    _cache.removePersistedItem('rateLimiter.actions');
    var onrateexceeded = sinon.spy();
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    expect(onrateexceeded.called).toBeFalsy();
  });

  it('handles multiple calls exceeding the limit properly', function() {
    rateLimiter._limit = 4;
    _cache.removePersistedItem('snooby.gold');
    _cache.removePersistedItem('rateLimiter.actions');
    var onrateexceeded = sinon.spy();
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    rateLimiter.requestAction({ tokens: 1, action: 'test' }, sinon.spy(), onrateexceeded);
    expect(onrateexceeded.calledTwice).toBeTruthy();
  });

  it('onrateexceed() callback not called if the user has enough tokens', function() {
    rateLimiter._limit = 10;
    _cache.removePersistedItem('rateLimiter.actions');
    var onrateexceeded = sinon.spy();
    rateLimiter.requestAction({ tokens: 5, action: 'test' }, sinon.spy(), onrateexceeded);
    expect(onrateexceeded.called).toBeFalsy();
  });

  it('calls onrateexceed() callback if the user has no more tokens available', function() {
    rateLimiter._limit = 4;
    _cache.removePersistedItem('rateLimiter.actions');
    var onrateexceeded = sinon.spy();
    rateLimiter.requestAction({ tokens: 5, action: 'test' }, sinon.spy(), onrateexceeded);
    expect(onrateexceeded.called).toBeTruthy();
  });

  it('actions expire after 24h', function() {
    var clock = sinon.useFakeTimers();
    rateLimiter._limit = 4;
    _cache.removePersistedItem('rateLimiter.actions');
    var onrateexceeded = sinon.spy();
    rateLimiter.requestAction({ tokens: 4, action: 'test' }, sinon.spy(), onrateexceeded);
    clock.tick((24*60*60*1000) + 1);
    rateLimiter.requestAction({ tokens: 4, action: 'test' }, sinon.spy(), onrateexceeded);
    expect(onrateexceeded.called).toBeFalsy();
    clock.restore();
  });
});
