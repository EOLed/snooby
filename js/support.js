var _support = {
  onDomReady: function(element, params) {
    if (_cache.getPersistedItem('snooby.gold') === 'true') {
      document.getElementById('supportSnooby').style.display = 'none';
      document.getElementById('snoobyGoldPurchased').style.display = 'block';
    } else {
      document.getElementById('supportSnooby').style.display = 'block';
      document.getElementById('snoobyGoldPurchased').style.display = 'none';
    }
  },

  purchaseSnoobyGold: function() {
    blackberry.payment.purchase({ digitalGoodSKU: 'SNBY-002',
                                  purchaseAppName: 'Snooby',
                                  metaData: 'v1.0.2 - Settings screen' }, 
                                 this.onSnoobyGoldPurchase,
                                 this.onSnoobyGoldPurchaseFailed);
  },

  restoreSnoobyGold: function() {
    var onsuccess = function(data) {
      if (data.subscriptionExists) {
        _cache.persistItem('snooby.gold', 'true');
        document.getElementById('supportSnooby').style.display = 'none';
        document.getElementById('snoobyGoldPurchased').style.display = 'block';
      }
    };

    var onfailure = function(error) {
      blackberry.ui.dialog.customAskAsync(error.errorText,
                                          ['OK'],
                                          null,
                                          { title: 'Could not restore Snooby Gold' });
    };

    blackberry.payment.checkExisting({ sku: 'SNBY-002' }, onsuccess, onfailure);
  },

  onSnoobyGoldPurchase: function(data) {
    _cache.persistItem('snooby.gold', 'true');
    document.getElementById('supportSnooby').style.display = 'none';
    document.getElementById('snoobyGoldPurchased').style.display = 'block';
  },

  onSnoobyGoldPurchaseFailed: function(error) {
    if (error.errorID !== 1) {
        blackberry.ui.dialog.customAskAsync('An error occurred and Snooby Gold was not purchased.',
                                            ['OK'],
                                            null,
                                            { title: 'Payment Error' });

    }
  }
};
