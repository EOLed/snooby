var rateLimiter = {
  requestAction: function(action, onaccepted, onrateexceeded) {
    if (this.canPerformAction(action)) {
      this._addAction(action);
      onaccepted();
    } else {
      onrateexceeded();
    }
  },

  canPerformAction: function(action) {
    return JSON.parse(_cache.getPersistedItem('snooby.gold')) === true ||
        (this.tokensUsed() + action.tokens) <= this._limit;
  },

  _addAction: function(action) {
    action.expiryDate = moment().add('days', 1).toDate();
    var actions = this._getActions();
    actions.push(action);

    _cache.persistItem('rateLimiter.actions', JSON.stringify(actions));
  },

  _getActions: function() {
    var actions = _cache.getPersistedItem('rateLimiter.actions');

    if (typeof actions === 'undefined' || actions === null) {
      actions = [];
    } else {
      var actualActions = [];
      JSON.parse(actions).forEach(function(action) {
        var now = new Date();
        if (moment(action.expiryDate).isAfter(moment())) {
          actualActions.push(action);
        }
      });

      actions = actualActions;
    }

    return actions;
  },

  tokensUsed: function() {
    var actions = this._getActions();

    var total = 0;
    actions.forEach(function(action) {
      total += action.tokens;
    });

    return total;
  },

  _limit: 50,

  VOTE: { action: 'vote', tokens: 1 },
  COMMENT: { action: 'comment', tokens: 3 },
  VIEW_INBOX: { action: 'viewInbox', tokens: 5 }
};
