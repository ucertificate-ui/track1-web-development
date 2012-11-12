TwitterClient = function (parent) {

  /** Widget DOM container.
   * @type Element
   * @fieldOf TwitterClient
   * @private
   */
  var container = jQuery(parent);

  /** Adds a new message to the feed.
   * @param {Object} tweet Twitter message as it comes from search. Cannot
   *   be null.
   * @methodOf TwitterClient
   * @private
   */
  var addMessage = function (tweet) {
    var pager = container.find(".pager");
    var message = jQuery("<p />");
    var userInfo = jQuery("<span />");

    userInfo.append(jQuery("<img />", {
      src: tweet.profile_image_url
    }));
    userInfo.append("<span>@" + tweet.from_user + "</span>");

    message.append(userInfo);
    message.append("<span>" + tweet.text + "</span>");
    message.insertBefore(pager);
  };

  /** Search for the current input.
   *
   * @methodOf TwitterClient
   * @private
   */
  var search = function () {
    var form = container.find("form");
    var criteria = form.find("input[name='q']").val();
    var options = {
      "result_type": form.find("select[name='result_type']").val(),
      "show_user": form.find("input[name='show_user']").is(":checked"),
      "from": form.find("input[name='from']").val()
    };
    // Do Search
    addMessage({
      profile_image_url: "https://si0.twimg.com/profile_images/2819978817/" +
        "6ccec5fb5234b80d04ef8338fe16083b_normal.jpeg",
      from_user: "matias_mi",
      text: "Hello, world!"
    });
  };

  /** Initializes DOM event listeners.
   * @methodOf TwitterClient
   * @private
   */
  var initEventListeners = function () {
    container.find("form").submit(function () {
      search();
      return false;
    });
  };

  return {
    /** Renders the twitter client. */
    render: function () {
      initEventListeners();
    }
  };
};

