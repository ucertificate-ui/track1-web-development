/** Parses HTML templates.
 * @param {String} template Template string. Cannot be null or empty.
 * @constructor
 */
UCERT.Template = function (template) {

  return {
    /** Parses the template and replaces placeholders with properties in the
     * specified object.
     * @param {Object} placeholders Object containing template replacements.
     *   Cannot be null.
     */
    parse: function (placeholders) {
      var html = template;
      var property;

      for (property in placeholders) {
        html = html.replace(new RegExp("\\$\\[" + property + "\\]", "igm"),
          placeholders[property]);
      }

      return html;
    }
  };
};

