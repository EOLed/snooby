var _settings = {
  doLogin: function() {
    document.getElementById('loginButton').setCaption('Logging in... <i class="icon-spinner icon-spin"></i>');
    var username = $('#username').val();
    var password = $('#password').val();
    snooby.login(username, password, function(data, status, xhr) {
      var user = { username: username, password: password, modhash: data.json.data.modhash };
      localStorage.setItem('snooby.user', JSON.stringify(user));

      var html = Mustache.to_html($('loggedUserTemplate').html(), { username: username });
      $('#currentLogin').html(html);
      $('#loginPanel').hide();
      $('#accountPanel').show();
    });
  },

  doLogout: function() {
    alert('sorry cannot logout');
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
