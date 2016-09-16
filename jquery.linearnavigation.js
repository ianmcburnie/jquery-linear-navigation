/**
* @file jQuery collection plugin that implements the input and model for
* one-dimensional keyboard navigation
* @author Ian McBurnie <ianmcburnie@hotmail.com>
* @version 0.0.4
* @requires jquery
* @requires jquery-common-keydown
*/
(function($, window, document, undefined) {
    var pluginName = 'jquery-linear-navigation';

    /**
    * @method "jQuery.fn.linearNavigation"
    * @param {Object} itemsSelector - collection of navigable elements
    * @param {Object} [options]
    * @param {string} [options.axis] - set arrow key axis to x, y or both (default: both)
    * @param {boolean} [options.wrap] - keyboard focus wraps from last to first & vice versa (default: true)
    * @param {string} [options.activeIndex] - specify the initial active item by index position (default: 0)
    * @param {string} [options.clickDelegate] - specify an alternate delegate for click events (default: delegateEl)
    * @param {string} [options.setFocus] - set focus when roving tab index changes (default: true)
    * @fires linearNavigationChange - when the current item changes
    * @return {Object} chainable jQuery class
    */
    $.fn.linearNavigation = function linearNavigation(itemsSelector, options) {
        options = $.extend({
            activeIndex: 0,
            clickable: true,
            clickDelegate: this,
            axis: 'both',
            wrap: true
        }, options);

        return this.each(function onEachMatchedEl() {
            var $this = $(this);
            var $collection = $this.find(itemsSelector);
            var numItems = $collection.length;

            if ($.data(this, pluginName) === undefined) {
                var $clickDelegate = $(options.clickDelegate);
                var currentItemIndex = options.activeIndex;

                var updateModel = function(goToIndex) {
                    $this.trigger("linearNavigationChange", {fromIndex: currentItemIndex, toIndex: goToIndex});

                    currentItemIndex = goToIndex;
                };

                var goToNextItem = function(e) {
                    var isOnLastEl = (currentItemIndex === jQuery.data(e.delegateTarget, pluginName).length - 1);
                    var goToIndex = currentItemIndex;

                    if (isOnLastEl) {
                        if (options.wrap === true) {
                            goToIndex = 0;
                        }
                    } else {
                        goToIndex = currentItemIndex + 1;
                    }

                    updateModel(goToIndex);
                };

                var goToPrevItem = function(e) {
                    var isOnFirstEl = (currentItemIndex === 0 || currentItemIndex === -1);
                    var goToIndex = currentItemIndex;

                    if (isOnFirstEl) {
                        if (options.wrap === true) {
                            goToIndex = jQuery.data(e.delegateTarget, pluginName).length - 1;
                        }
                    } else {
                        goToIndex = currentItemIndex - 1;
                    }

                    updateModel(goToIndex);
                };

                // ensure item index is not out of bounds
                if (currentItemIndex >= numItems) {
                    currentItemIndex = 0;
                }

                // install commonKeyDown plugin on main delegate element
                $this.commonKeyDown();

                // handle arrow keys
                if (options.axis === 'x') {
                    $this.on('leftArrowKeyDown', goToPrevItem);
                    $this.on('rightArrowKeyDown', goToNextItem);
                } else if (options.axis === 'y') {
                    $this.on('upArrowKeyDown', goToPrevItem);
                    $this.on('downArrowKeyDown', goToNextItem);
                } else {
                    $this.on('leftArrowKeyDown upArrowKeyDown', goToPrevItem);
                    $this.on('rightArrowKeyDown downArrowKeyDown', goToNextItem);
                }

                // delegate item click events, event bound to each item
                $clickDelegate.on('click', itemsSelector, function(e) {
                    updateModel($(this).data(pluginName).idx);
                });

                // store data on delegate element
                jQuery.data(this, pluginName, {installed: 'true', length: numItems});
            } else {
                // if plugin gets called again, update number of items
                jQuery.data(this, pluginName).length = numItems;
            }

            $collection.each(function onEachMatchedEl(index) {
                // store index position on each collection item
                $(this).data(pluginName, {idx: index});
            });
        });
    };
}(jQuery, window, document));

/**
* The jQuery plugin namespace.
* @external "jQuery.fn"
* @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
*/

/**
* linearNavigationChange event
* @event linearNavigationChange
* @type {object}
* @property {object} event - event object
* @property {object} data - event data params
* @param {string} [data.fromIndex] - old collection idx position
* @param {string} [data.toIndex] - new collection idx position
*/
