var _settings = {
  doLogin: function() {
    document.getElementById('loginButton').setCaption('Logging in... <i class="icon-spinner icon-spin"></i>');
    var username = $('#username').val();
    var password = $('#password').val();
    snooby.login(username, password, function(data, status, xhr) {
      var user = { username: username, password: password, modhash: data.json.data.modhash };
      _cache.setItem('subreddit.screenReady', false);
      _cache.setItem('subreddit.domReady', false);
      _cache.setItem('subreddit.selected', 'frontpage');
      localStorage.setItem('snooby.user', JSON.stringify(user));
      localStorage.removeItem('subreddits');

      snooby.subreddits(null, function() {
        var html = Mustache.to_html($('#loggedUserTemplate').html(), { username: username });
        $('#currentLogin').html(html);
        $('#loginPanel').hide();
        $('#accountPanel').show();
        $('#password').val('');
        document.getElementById('loginButton').setCaption('<i class="icon-signin"> Login</i>');
      });
    });
  },

  doLogout: function() {
    document.getElementById('logoutButton').setCaption('Logging out... <i class="icon-spinner icon-spin"></i>');
    var user = JSON.parse(localStorage.getItem('snooby.user'));
    snooby.logout(user.modhash, function() {
      _cache.setItem('subreddit.screenReady', false);
      _cache.setItem('subreddit.domReady', false);
      _cache.setItem('subreddit.selected', 'frontpage');
      localStorage.removeItem('subreddits');
      localStorage.removeItem('snooby.user');
      snooby.subreddits(null, function() {
        $('#loginPanel').show();
        $('#accountPanel').hide();
        document.getElementById('logoutButton').setCaption('<i class="icon-signout"> Log Out</i>');
      });
    });
  },
  
  onScreenReady: function(element, params) {
    var loggedUser = JSON.parse(localStorage.getItem("snooby.user"));
    if (loggedUser === null) {
      element.getElementById('loginPanel').style.display = 'block';
    } else {
      var html = Mustache.to_html(element.getElementById('loggedUserTemplate').innerHTML,
                                  { username: loggedUser.username });
      element.getElementById('currentLogin').innerHTML = html;
      element.getElementById('accountPanel').style.display = 'block';
    }
  }
};
