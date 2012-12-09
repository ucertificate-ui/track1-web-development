;(function (global) {

    /* Widget Bussiness Logic 
       -------------------------------------------------------------- 
       Orchestrates interaction between the Service Logic and the View Logic.
       Provides the public programatic API to interact with the widget.
       */
       var doc = global["document"],
       defaults = {
        count: 15
    };

    var TwitterSearchWidget = function (element, options) {
        var self = this;

        this.options = options;
        for (var key in defaults) {
            this.options[key] = this.options[key] || defaults[key];
        }

        this.view = new TwitterSearchWidgetView(element);
        
        this.view.onSearchRequest = function (query) {
            self.search(query);
        }

        this.view.init();

    };

    TwitterSearchWidget.prototype = {
        search: function (query) {
            var self = this;
            TwitterSearchService.searchTweets({q:query, rpp:this.options.count}, 
                function (data) {
                    self.view.renderResults(data.results);
                },function (error) {
                    self.view.renderError(error);
                });
        }
    };

    /* Widget View Logic 
       -------------------------------------------------------------- 
       Handles rendering information on the view.
       Handles detection of user interaction.
       */

       var TwitterSearchWidgetView = function (element) {
        this.element = element || doc.createElement("div");

    };

    TwitterSearchWidgetView.prototype = {
        init: function () {
            this.element.className += " twitter-search-widget";
            var inputs = this.element.getElementsByTagName("input");
            this.queryInput = inputs[0];
            this.submitInput = inputs[1];

            this.resultsList = this.element.getElementsByClassName("search-results")[0];
            this.searchItemTemplate = this.resultsList.getElementsByClassName("search-item")[0];
            this.resultsList.removeChild(this.searchItemTemplate);

            this.errorMessage = this.element.getElementsByClassName("error-message")[0];

            this.registerEvents();
        },

        registerEvents: function () {
            var self = this;

            function doRequestSearch () {
                if(typeof self.onSearchRequest == "function"){
                    self.onSearchRequest(self.queryInput.value);
                }
            }

            this.queryInput.addEventListener("keyup", function (e) {
                if(e.keyCode == 13 /*ENTER*/) {
                    doRequestSearch();
                }
            });

            this.submitInput.addEventListener("click", doRequestSearch);
        },

        renderResults: function (data) {
            var self = this;

            if(data) {
                this.resultsList.innerHTML = "";

                if(data.length){
                    for (var i = 0, l = data.length; i<l; i++){
                        var result = data[i],
                            resultItem = this.searchItemTemplate.cloneNode(true);

                        resultItem.getElementsByClassName("profile-image")[0].style.backgroundImage = "url("+result.profile_image_url+")";
                        resultItem.getElementsByClassName("profile-username")[0].textContent = result.from_user_name;
                        resultItem.getElementsByClassName("profile-user")[0].textContent = "@"+result.from_user;
                        resultItem.getElementsByClassName("item-content")[0].textContent = result.text;
                        resultItem.getElementsByClassName("item-time")[0].textContent = result.created_at;

                        this.resultsList.appendChild(resultItem);
                    }
                }
                else {
                    this.renderError("No results found.")
                }
            }
        },

        renderError: function (error) {
            var self = this;

            this.errorMessage.textContent = error;
            this.errorMessage.style.display = "";
        }
    };

    /* Widget Service Logic 
   -------------------------------------------------------------- 
   Handles requesting information to the twitter api.
    Useful Links:
    - https://dev.twitter.com/docs/api/1/get/search
    - https://dev.twitter.com/docs/using-search
    */
    var head = doc.head,
        searchEndpoint = "http://search.twitter.com/search.json";

    var TwitterSearchService = {
        searchTweets: function (params, success, error) {
            var script = doc.createElement("script"),
            ts = (new Date).getTime();
            script.type = "text/javascript";

            params = params || {};
            params._ts = ts;
            params.callback = "cb" + ts;

            var queryString = [];
            for (var param in params) {
                queryString.push(param + "=" + encodeURIComponent(params[param]));
            }
            queryString = queryString.join("&");

            function cleanUp () {
                script.onerror = null;
                head.removeChild(script);
            }

            function fail(cause) {
                if(error) {
                    error(cause);
                }
            };

            script.onerror = function () {
                cleanUp();
                fail("Search request failed...");
            }

            global ["cb"+ts] = function (data) {
                cleanUp();
                if(data.error) {
                    fail(data.error);
                }
                else if (success) {
                    success(data);
                }
            };

            script.src = searchEndpoint + "?" + queryString;

            head.appendChild(script);
        }
    };

    global.addEventListener("load", function () {
        var elements = document.getElementsByClassName("twitter-search-widget");

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i],
                options = {};

            element.twitterSearchWidget = new TwitterSearchWidget(element, options);
        };    
    });

    global.TwitterSearchWidget = TwitterSearchWidget;












})(this);