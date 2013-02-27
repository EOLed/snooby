var blackberry = { ui: { dialog: { customAskAsync: function() {} } },
                   payment: { developmentMode: false, 
                              checkExisting: function(data,onsuccess, onfail) {}, 
                              purchase: function(data, onsuccess, onfail) {} } };
describe('Support page', function() {
  it('No error dialog is displayed when Snooby Gold purchase is canceled by user', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('snoobyGoldButton').returns({ setCaption: function(s) {} });

    var errorDialog = sinon.spy(blackberry.ui.dialog, 'customAskAsync');

    var purchase = sinon.stub(blackberry.payment, 'purchase', function(data, onsuccess, onfail) {
      onfail({ errorID: 1 });
    });

    _support.purchaseSnoobyGold();
    expect(errorDialog.called).toBeFalsy();
    blackberry.payment.purchase.restore();
    document.getElementById.restore();
    blackberry.ui.dialog.customAskAsync.restore();
  });

  it('An error dialog is displayed when failing to purchase Snooby Gold', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('snoobyGoldButton').returns({ setCaption: function(s) {} });

    var errorDialog = sinon.spy(blackberry.ui.dialog, 'customAskAsync');

    var purchase = sinon.stub(blackberry.payment, 'purchase', function(data, onsuccess, onfail) {
      onfail({ errorID: 12 });
    });

    _support.purchaseSnoobyGold();
    expect(errorDialog.called).toBeTruthy();
    blackberry.payment.purchase.restore();
    document.getElementById.restore();
    blackberry.ui.dialog.customAskAsync.restore();
  });

  it('calls onSnoobyGoldFailed() when failing to purchase Snooby Gold', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('snoobyGoldButton').returns({ setCaption: function(s) {} });

    var snoobyPurchase = sinon.stub(_support, 'onSnoobyGoldPurchaseFailed');
    var purchase = sinon.stub(blackberry.payment, 'purchase', function(data, onsuccess, onfail) {
      onfail();
    });

    _support.purchaseSnoobyGold();
    expect(snoobyPurchase.called).toBeTruthy();
    blackberry.payment.purchase.restore();
    document.getElementById.restore();
  });

  it('calls onSnoobyGoldPurchase() when successfully purchasing Snooby Gold', function() {
    var getElementById = sinon.stub(document, 'getElementById');
    getElementById.withArgs('snoobyGoldButton').returns({ setCaption: function(s) {} });

    var snoobyPurchase = sinon.stub(_support, 'onSnoobyGoldPurchase');
    var purchase = sinon.stub(blackberry.payment, 'purchase', function(data, onsuccess, onfail) {
      onsuccess();
    });

    _support.purchaseSnoobyGold();
    expect(snoobyPurchase.called).toBeTruthy();
    blackberry.payment.purchase.restore();
    document.getElementById.restore();
  });

  it('show support snooby form is displayed if Snooby Gold not purchased', function() {
    var element = document; //{ getElementById: function(id) { return { style: { display: false } }; } };
    var getElementById = sinon.stub(element, 'getElementById');
    var supportSnoobyDisplay = sinon.spy();
    getElementById.withArgs('supportSnooby').returns({ style: { display: false } });
    getElementById.withArgs('snoobyGoldPurchased').returns({ style: { display: false } });

    var getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.gold').returns('false');

    // var purchase = sinon.stub(blackberry.payment, 'checkExisting', function(data, onsuccess, onfail) {
    //   onsuccess({ subscriptionExists: false });
    // });

    _support.onDomReady(element);
    expect(element.getElementById('supportSnooby').style.display).toBe('block');
    expect(element.getElementById('snoobyGoldPurchased').style.display).toBe('none');
    // blackberry.payment.checkExisting.restore();
    element.getElementById.restore();
    _cache.getPersistedItem.restore();
  });

  it('Thank you panel is displayed if Snooby Gold is purchased', function() {
    var element = document;
    var getElementById = sinon.stub(element, 'getElementById');
    var supportSnoobyDisplay = sinon.spy();
    getElementById.withArgs('supportSnooby').returns({ style: { display: false } });
    getElementById.withArgs('snoobyGoldPurchased').returns({ style: { display: false } });

    var getPersistedItem = sinon.stub(_cache, 'getPersistedItem');
    getPersistedItem.withArgs('snooby.gold').returns('true');

    _support.onDomReady(element);
    expect(element.getElementById('supportSnooby').style.display).toBe('none');
    expect(element.getElementById('snoobyGoldPurchased').style.display).toBe('block');
    element.getElementById.restore();
    _cache.getPersistedItem.restore();
  });
});
