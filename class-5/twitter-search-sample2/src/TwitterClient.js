TwitterClient = function (parent) {

  /** Widget DOM container.
   * @type Element
   * @fieldOf TwitterClient
   * @private
   */
  var container = jQuery(parent);

  /** Search used to retrieve tweets.
   * @type TwitterSearch
   * @fieldOf TwitterClient
   * @private
   */
  var twitterSearch = new TwitterSearch();

  /** Retrieves the next page in the current search.
   * @type Function
   * @fieldOf TwitterClient
   * @private
   */
  var searchNext;

  /** Current page.
   * @type Number
   * @private
   * @fieldOf TwitterClient
   */
  var currentPage = 0;

  /** Template to render tweets.
   * @type UCERT.Template
   * @fieldOf TwitterClient
   * @private
   */
  var template = new UCERT.Template(container.find(".tweet").text());

  /** Adds the separator line after the current page.
   */
  var addPageSeparator = function () {
    var separator = jQuery("<div />");
    var pager = container.find(".pager");
    var index = container.find(".index");
    currentPage += 1;
    separator.append(jQuery("<a />", {
      name: "page-" + currentPage
    }).html("Page " + currentPage + " "));
    separator.append(jQuery("<hr />"));
    separator.append(jQuery("<a />", {
      href: "#top"
    }).html("Back to top"));
    separator.insertBefore(pager);
    index.append(jQuery("<a />", {
      href: "#page-" + currentPage
    }).html(currentPage + " "));
  };

  /** Adds a new message to the feed.
   * @param {Object} tweet Twitter message as it comes from search. Cannot
   *   be null.
   * @methodOf TwitterClient
   * @private
   */
  var addMessage = function (tweet) {
    var pager = container.find(".pager");
    var message = template.parse(tweet);
    jQuery(message).insertBefore(pager);
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
    twitterSearch.search(criteria, options, function (tweets, next) {
      var i;

      addPageSeparator();

      for (i = 0; i < tweets.length; i++) {
        addMessage(tweets[i]);
      }
      searchNext = next;

      if (tweets.length) {
        container.find(".pager").show();
      } else {
        container.find(".pager").hide();
      }
    });
  };

  /** Initializes DOM event listeners.
   * @methodOf TwitterClient
   * @private
   */
  var initEventListeners = function () {
    container.find("form").submit(function () {
      currentPage = 0;
      container.find(".feed p").remove();
      container.find(".feed div").remove();
      container.find(".index a").remove();
      search();
      return false;
    });
    container.find(".pager").click(function () {
      searchNext();
    });
  };

  return {
    /** Renders the twitter client. */
    render: function () {
      initEventListeners();
    }
  };
};

