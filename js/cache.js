var _cache = {
  setItem: function(key, value) {
    this[key] = value;
  },

  removeItem: function(key) {
    delete this[key];
  },

  getItem: function(key) {
    return this[key];
  },

  itemExists: function(key) {
    var value = this.getItem(key);
    return typeof value !== 'undefined' && value !== null;
  },

  persistItem: function(key, value) {
    localStorage.setItem(key, value);
  },

  removePersistedItem: function(key) {
    localStorage.removeItem(key);
  },

  getPersistedItem: function(key) {
    return localStorage.getItem(key);
  }
};
