;(function (global, $) {
    
    /* Widget Bussiness Logic 
       -------------------------------------------------------------- 
       Orchestrates interaction between the Service Logic and the View Logic.
       Provides the public programatic API to interact with the widget.
    */
    var defaults = {
            template: "resources/templates/twitter-search.tmpl",
            count:15
        };

    var TwitterSearchWidget = function (element, options) {
        var self = this;

        // Set and process options.
        this.options = {};
        $.extend(this.options, defaults, options);

        this.view = new TwitterSearchWidgetView(element, this.options.template);

        if(this.options.query) {
            self.search(this.options.query);
        }

        $(this.view).bind("search-request", function (event) {
            self.search(event.query);
        });

        this.view.init();
    };

    TwitterSearchWidget.prototype = {
        search: function (query) {
            var self = this;

            if(!this.view.ready){
                $(this.view).bind("template-ready", function () {
                    self.search(query);
                });
            }
            else {
                this.view.setQueryValue(query);

                searchTweets({q:query, rpp:this.options.count}, function (resultData) {
                    self.view.renderResults(resultData.results);
                }, function (error) {
                    self.view.renderError(error);
                });
            }
        }
    };

    /* Widget View Logic 
       -------------------------------------------------------------- 
       Handles rendering information on the view.
       Handles detection of user interaction.
    */

    var TwitterSearchWidgetView = function (element, template) {
        this.element = $(element || "<div>");
        this.template = template;
    };

    TwitterSearchWidgetView.prototype = {
        init: function () {
            //add root css class
            this.element.addClass("twitter-search-widget");
            this.loadTemplate();
        },

        loadTemplate: function () {
            var self = this,
                element = this.element;

            element.load(this.template, function () {

                self.queryInput = element.find("input[name=query]");
                self.submitInput = element.find("input[name=submit]");
                self.resultsList = element.find(".search-results");
                self.searchItemTemplate = self.resultsList.find(".search-item").detach();
                self.errorMessage = element.find(".error-message");

                self.ready = true;

                self.registerEvents();

                $(self).trigger("template-ready");

            }, function () {
                throw new Error("Could not load widget template file.");
            });
        },

        registerEvents: function () {
            if(this.ready) {
                var self = this;

                function doRequestSearch () {
                    $(self).trigger({
                        type:"search-request",
                        query: self.queryInput.val()
                    });
                }

                this.submitInput.bind("click", doRequestSearch);
                this.queryInput.bind("keyup", function (event) {
                    if(event.keyCode == 13 /*ENTER*/) {
                        doRequestSearch();
                    }
                });
            }
        },

        setQueryValue: function (value) {
            this.queryInput.val(value);
        },

        renderResults: function (data) {
            if(this.ready && data) {
                var self = this;

                this.resultsList.empty();
                this.errorMessage.hide();

                if(data.length) {
                    $(data).each(function (_, result) {
                        self.searchItemTemplate
                                  .clone(true)
                                  .find(".profile-image").css("background-image", "url("+result.profile_image_url+")").end()
                                  .find(".profile-username").text(result.from_user_name).end()
                                  .find(".profile-user").text("@"+result.from_user).end()
                                  .find(".item-content").text(result.text).end()
                                  .find(".item-time").text(result.created_at).end()
                                  .appendTo(self.resultsList);
                    });
                }
                else {
                    this.renderError("No results found.")
                }
            }
        },

        renderError: function (error) {
            if(this.ready && error) {
                this.resultsList.empty();
                this.errorMessage.text(error).show();
            }
        }
    }

    /* Widget Service Logic 
       -------------------------------------------------------------- 
       Handles requesting information to the twitter api.
        Useful Links:
        - https://dev.twitter.com/docs/api/1/get/search
        - https://dev.twitter.com/docs/using-search
    */
    var searchEndpoint = "//search.twitter.com/search.json";

    function searchTweets (params, success, error) {
        $.ajax({
            url: searchEndpoint,
            data: params,
            dataType:"jsonp",
            success: success,
            error: error
        });
    }

    /* Automatic instantiation */

    $(function () { 
        $("[data-twitter-search-widget]").each(function (_, element) { 
            $(element).data("twitterSearchWidget", new TwitterSearchWidget(element, $(element).data()));
        });
    });

    /* Public API */

    global["TwitterSearchWidget"] = TwitterSearchWidget;

})(this, jQuery);