/** Manages layout examples views.
 *
 * @param {Element} container View container element. Cannot be null.
 * @constructor
 */
LayoutView = function (container) {

  /** Indicates that all layouts will be disabled.
   * @constant
   * @fieldOf LayoutView
   */
  var DISABLE_ALL = "none";

  /** Initializes event listeners in the view.
   * @methodOf LayoutView
   */
  var initEventListeners = function () {
    var stylesheetManager = new StylesheetManager();
    var layoutSwitchers = jQuery(container).find('input[name=layout]');

    layoutSwitchers.click(function (event) {
      var currentSwitcher = jQuery(event.target);
      var stylesheetUrl = currentSwitcher.val();

      // First disables all stylesheets.
      layoutSwitchers.each(function (index, switcher) {
        stylesheetManager.disable(jQuery(switcher).val());
      });

      if (stylesheetUrl !== DISABLE_ALL) {
        // Enables the selected layout.
        stylesheetManager.enable(stylesheetUrl);
      }
    });
  };

  return {
    /** Renders the layout example view.
     */
    render: function () {
      initEventListeners();
    }
  };
};

