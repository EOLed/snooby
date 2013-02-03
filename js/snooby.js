var snooby = {
  login: function(username, password, onsuccess, onfailure) {
    $.post('https://ssl.reddit.com/api/login', 
           { user: username, passwd: password, rem: true, api_type: 'json' },
           onsuccess);
  },

  logout: function(modhash, onsuccess) {
    $.post('https://ssl.reddit.com/logout', { uh: modhash, top: 'off' }, onsuccess);
  },
};
