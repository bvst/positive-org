  $(function () {
    var extractToken = function(hash) {
      var match = hash.match(/access_token=([\w-]+)/);
      return !!match && match[1];
    };

    var CLIENT_ID = YOUR_CLIENT_ID;
    var AUTHORIZATION_ENDPOINT = "https://slack.com/oauth/authorize";
    var RESOURCE_ENDPOINT = "https://slack.com/api/channels.history";

    var token = extractToken(document.location.hash);
    if (token) {
      $('div.authenticated').show();

      $('span.token').text(token);

      $.ajax({
          url: RESOURCE_ENDPOINT
        , beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', "OAuth " + token);
            xhr.setRequestHeader('Accept',        "application/json");
          }
        , success: function (response) {
            var container = $('span.user');
            if (response) {
              container.text(response.username);
            } else {
              container.text("An error occurred.");
            }
          }
      });
    } else {
      $('div.authenticate').show();

      var authUrl = AUTHORIZATION_ENDPOINT + 
        "?response_type=token" +
        "&client_id="    + clientId +
        "&redirect_uri=" + window.location;

      $("a.connect").attr("href", authUrl);
    }
  });