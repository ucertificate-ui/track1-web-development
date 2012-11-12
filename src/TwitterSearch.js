/** Allows to search for tweets in Twitter.
 *
 * @constructor
 */
TwitterSearch = function () {

  /** Twitter search service url.
   * @constant
   * @memberOf TwitterClient
   * @private
   */
  var SEARCH_URL = "http://search.twitter.com/search.json?";

  /** Search for tweets using the specified query.
   *
   * @param {String} query Valid query string used to perform the request
   *   against Twitter API. Cannot be null.
   * @param {Function} callback Function invoked when new tweets are
   *   available from search. Cannot be null.
   * @memberOf TwitterSearch
   * @private
   */
  var search = function (query, callback) {
    var params = "callback=?&" + query;

    if (!query) {
      return callback([]);
    }

    jQuery.getJSON(SEARCH_URL + params, function (response) {
      var refreshUrl = response.next_page;

      if (refreshUrl) {
        refreshUrl = response.next_page.substr(1);
      }

      callback(response.results, refreshUrl);
    });
  };

  return {

    /** Search for tweets applying the specified criteria and options.
     *
     * @param {String} criteria Search expression to search for.
     *   Cannot be null or empty.
     * @param {Object} options Object containing supported search options.
     *   Can be null.
     * @param {Function} callback Function invoked to notify search results. It
     *   takes two parameters: the list of tweets and a function to fetch the
     *   next page. Cannot be null.
     * @return {Function} Returns a continuation function that can be invoked
     *   in order to fetch the next page of tweets for this search criteria.
     */
    search: function (criteria, options, callback) {
      var initialQuery = jQuery.param(jQuery.extend({
        q: criteria
      }, options || {}));

      var nextPage = function (query) {
        search(query, function (tweets, nextQuery) {
          callback(tweets, function () {
            nextPage(nextQuery);
          });
        });
      };

      nextPage(initialQuery);
    }
  };
};

