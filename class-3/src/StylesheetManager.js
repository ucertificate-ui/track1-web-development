/** Allows to dynamically enable or disable stylesheets in a document.
 * @constructor
 */
StylesheetManager = function () {

  /** Map of existing stylesheets in the document.
   * @type Object[String => Object]
   * @fieldOf StylesheetManager
   */
  var stylesheets = (function () {
    var stylesheetsMap = {};

    jQuery("link[rel=stylesheet]").each(function (index, link) {
      stylesheetsMap[link.href] = {
        link: jQuery(link),
        enable: true
      };
    });
    return stylesheetsMap;
  }());

  /** Returns a plain list of <link> elements from stylesheets in a specific
   * state.
   *
   * @param {Boolean} enabled Determines whether to list link elements from
   *   enabled stylesheets.
   * @return {Element[]} A list of link elements. Never returns null.
   * @methodOf StylesheetManager
   */
  var list = function (enabled) {
    var links = [];

    for (var url in stylesheets) {
      if (stylesheets.hasOwnProperty(url) &&
          stylesheets[url].enabled === enabled) {
        links.push(stylesheets[url].link);
      }
    }
    return links;
  };

  /** Finds a stylesheet by url.
   * @param {String} url Url of the required stylesheet. Cannot be null or
   *   empty.
   * @return {Object} Returns the object that represents the required
   *    stylesheet, or null if it isn't found.
   * @methodOf StylesheetManager
   */
  var find = function (url, enabled) {
    if (stylesheets.hasOwnProperty(url)) {
      return stylesheets[url];
    }
    return null;
  };

  return {
    /** Enables the specified stylesheet. It's loaded if it doesn't exist.
     * @param {String} url Url of the stylesheet to enable. Cannot be null or
     *   empty.
     * @return {Element[]} Returns the list of enabled stylesheets. Never
     *   returns null.
     */
    enable: function (url) {
      var stylesheet = find(url);
      var link;

      if (stylesheet === null) {
        // It doesn't exist, loads the stylesheet.
        link = jQuery("<link />", {
          rel: "stylesheet",
          type: "text/css",
          href: url
        });
        stylesheet = {
          link: link,
          enabled: false
        };
        stylesheets[url] = stylesheet;
      }

      if (stylesheet.enabled === false) {
        stylesheet.link.appendTo(jQuery("head"));
        stylesheet.enabled = true;
      }

      return list(true);
    },

    /** Disables the specified stylesheet. If the stylesheet doesn't exist or
     * it's already disabled this method does nothing.
     *
     * @param {String} url Url of the stylesheet to disable. Cannot be null or
     *    empty.
     * @return {Element[]} Returns the list of disabled stylesheets. Never
     *   returns null.
     */
    disable: function (url) {
      var stylesheet = find(url);

      if (stylesheet !== null && stylesheet.enabled) {
        stylesheet.enabled = false;
        stylesheet.link.remove();
      }
      return list(false);
    }
  };
};

