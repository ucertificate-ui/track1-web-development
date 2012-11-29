/** Displays Super Mario!
 *
 * @param {Element} parent Mario's container element. Cannot be null.
 * @constructor
 */
UCERT.SuperMario = function (parent) {

  /** Super Mario DOM container.
   * @type Element
   * @private
   * @fieldOf UCERT.SuperMario#
   */
  var container = jQuery(parent);

  /** Mario walk animation steps.
   * @type String[]
   * @private
   * @fieldOf UCERT.SuperMario#
   */
  var steps = ["one", "two", "three"];

  /** Composes the CSS class for the specified action.
   * @private
   * @methodOf UCERT.SuperMario#
   */
  var changeAction = function (action) {
    container.attr("class", "super-mario " + action);
  };

  /** Makes Mario to walk.
   * @private
   * @methodOf UCERT.SuperMario#
   */
  var walk = function () {
    container.removeClass(steps[steps.length - 1]);
    container.addClass(steps[0]);
    // Rotates walk animation.
    steps.push(steps.shift());
  };

  /** Mapping of actions that need additional behaviour.
   * @namespace
   * @private
   * @fieldOf UCERT.SuperMario#
   */
  var Actions = {
    /** Walk left.
     */
    "walk left": walk,

    /** Walk right.
     */
    "walk right": walk
  };

  /** Mapping of keyboard key events to Mario actions.
   *
   * @namespace
   * @private
   * @fieldOf UCERT.SuperMario#
   */
  var KeyBindings = {
    "37:D": "walk left",
    "39:D": "walk right",
    "37:U": "stand left",
    "39:U": "stand right"
  };

  /** Initializes Mario's actions.
   * @private
   * @methodOf UCERT.SuperMario
   */
  var initEventListeners = function () {

    var processAction = function (keyCode, virtualEvent) {
      var actionName = KeyBindings[String(keyCode) + virtualEvent];
      var action;

      if (actionName) {
        changeAction(actionName);
      }

      if (Actions.hasOwnProperty(actionName)) {
        action = Actions[actionName];
        action();
      }    
    };

    container.keydown(function (event) {
      processAction(event.which, ":D");
    });
    container.keyup(function (event) {
      processAction(event.which, ":U");
    });
  };

  return {
    /** Renders Super Mario!
     */
    render: function () {
      initEventListeners();
    }
  };
};

