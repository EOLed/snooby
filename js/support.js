var _support = {
  onDomReady: function(element, params) {
    var onsuccess = function(data) {
      if (data.subscriptionExists) {
        document.getElementById('supportSnooby').style.display = 'none';
        document.getElementById('snoobyGoldPurchased').style.display = 'block';
      } else {
        document.getElementById('supportSnooby').style.display = 'block';
        document.getElementById('snoobyGoldPurchased').style.display = 'none';
      }
    };

    var onfailure = function(error) {
      document.getElementById('supportSnooby').style.display = 'block';
      document.getElementById('snoobyGoldPurchased').style.display = 'none';
    };

    blackberry.payment.checkExisting({ sku: 'SNBY-002' }, onsuccess, onfailure);
  },

  purchaseSnoobyGold: function() {
    document.getElementById('snoobyGoldButton')
            .setCaption('<i class="icon-trophy"></i> I want Snooby Gold! <i class="icon-spinner icon-spin"></i>');
    blackberry.payment.purchase({ digitalGoodSKU: 'SNBY-002',
                                  purchaseAppName: 'Snooby',
                                  metaData: 'v1.0.2 - Settings screen' }, 
                                 this.onSnoobyGoldPurchase,
                                 this.onSnoobyGoldPurchaseFailed);
  },

  onSnoobyGoldPurchase: function(data) {
    document.getElementById('snoobyGoldButton').setCaption('<i class="icon-trophy"></i> I want Snooby Gold!');
    document.getElementById('supportSnooby').style.display = 'none';
    document.getElementById('snoobyGoldPurchased').style.display = 'block';
  },

  onSnoobyGoldPurchaseFailed: function(error) {
    document.getElementById('snoobyGoldButton').setCaption('<i class="icon-trophy"></i> I want Snooby Gold!');

    if (error.errorID !== 1) {
        blackberry.ui.dialog.customAskAsync('An error occurred and Snooby Gold was not purchased.',
                                            ['OK'],
                                            null,
                                            { title: 'Payment Error' });

    }
  }
};
