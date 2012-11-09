;(function (global) {
    
    /* Widget Bussiness Logic 
       -------------------------------------------------------------- 
       Orchestrates interaction between the Service Logic and the View Logic.
       Provides the public programatic API to interact with the widget.
    */
    var doc = global["document"],
        defaults = {
            template: "resources/templates/twitter-search.tmpl",
            count:15
        };

    var TwitterSearchWidget = function (element, options) {
        var self = this;

        // Set and process options.
        this.options = options;
        for (var key in defaults) {
            this.options[key] = this.options[key] || defaults[key];
        }

        this.view = new TwitterSearchWidgetView(element, this.options.template);

        if(this.options.query) {
            self.search(this.options.query);
        }

        this.view.onSearchRequest = function (query) {
            self.search(query);
        }

        this.view.init();
    };

    TwitterSearchWidget.prototype = {
        search: function (query) {
            var self = this;

            if(!this.view.ready){
                this.view.onTemplateReady = function () {
                    self.search(query);
                }
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

    /* DOM Helper Methods */

    function getElementsByAttribute (attrName, attrValue, tagName) {
        var elements  = doc.getElementsByTagName(tagName || "*"),
            results = [];

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if(element.hasAttribute(attrName) && element.getAttribute(attrName) == (attrValue || "")){
                results.push(element);
            }
        };

        return results;
    }

    function getElementData (element) {
        var data = {};
        if(element) {
            var attrs = element.attributes, attr;
            for (var i = 0; i < attrs.length; i++) {
                attr = attrs[i];
                if(attr.nodeName.indexOf("data-") === 0){
                    data[attr.nodeName.substring(5)] = attr.nodeValue;
                }
            }
        }
        return data;
    }

    var TwitterSearchWidgetView = function (element, template) {
        this.element = element || doc.createElement("div");
        this.template = template;
    };

    TwitterSearchWidgetView.prototype = {
        init: function () {
            //add root css class
            if(!this.element.className.match(/(\s)*twitter-search-widget(\s)*/)){
                this.element.className += " twitter-search-widget";
            }
            this.loadTemplate();
        },

        loadTemplate: function () {
            var self = this,
                element = this.element,
                xhr = new XMLHttpRequest();

            xhr.addEventListener("load", function () {
                element.innerHTML = xhr.responseText;

                // give innerHTML a little breath to process...
                setTimeout(function() {

                    self.queryInput = getElementsByAttribute("name", "query", "input")[0];
                    self.submitInput = getElementsByAttribute("name", "submit", "input")[0];
                    self.resultsList = element.getElementsByClassName("search-results")[0];
                    self.searchItemTemplate = self.resultsList.getElementsByClassName("search-item")[0];
                    self.errorMessage = element.getElementsByClassName("error-message")[0];
                    self.resultsList.removeChild(self.searchItemTemplate);

                    self.ready = true;

                    self.registerEvents();

                    if(typeof self.onTemplateReady == "function") {
                        self.onTemplateReady();
                    }
                }, 0);

            });

            xhr.addEventListener("error", function () {
                throw new Error("Could not load widget template file.");
            });

            xhr.open("GET", this.template);
            xhr.send();
        },

        registerEvents: function () {
            if(this.ready) {
                var self = this;

                function doRequestSearch () {
                    if(typeof self.onSearchRequest == "function") {
                        self.onSearchRequest(self.queryInput.value);
                    }
                }

                this.submitInput.addEventListener("click", doRequestSearch);
                this.queryInput.addEventListener("keyup", function (event) {
                    if(event.keyCode == 13 /*ENTER*/) {
                        doRequestSearch();
                    }
                });
            }
        },

        setQueryValue: function (value) {
            if(this.queryInput && this.queryInput.value != value){
                this.queryInput.value = value;
            }
        },

        renderResults: function (data) {
            if(this.ready && data) {
                this.resultsList.innerHTML = "";
                this.errorMessage.style.display ="none";

                if(data.length) {
                    for (var i = 0; i < data.length; i++) {
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
            if(this.ready && error) {
                this.resultsList.innerHTML = "";
                this.errorMessage.textContent = error;
                this.errorMessage.style.display = "";
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
    var head = doc.head,
        searchEndpoint = "//search.twitter.com/search.json";

    function searchTweets (params, success, error) {
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

    /* Automatic instantiation */

    global.addEventListener("load", function () { 
        var elements = getElementsByAttribute("data-twitter-search-widget");

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i],
                options = getElementData(element);

            element.twitterSearchWidget = new TwitterSearchWidget(element, options);
        };
    });

    /* Public API */

    global["TwitterSearchWidget"] = TwitterSearchWidget;

})(this);