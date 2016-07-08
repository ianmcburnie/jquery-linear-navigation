/**
* @file jQuery collection plugin that implements one-dimensional keyboard navigation
* @author Ian McBurnie <ianmcburnie@hotmail.com>
* @version 0.0.1
* @requires jquery
* @requires jquery-common-keydown
*/
(function($, window, document, undefined) {
    var pluginName = 'jquery-linear-navigation';

    /**
    * @method "jQuery.fn.linearNavigation"
    * @param {Object} delegateEl - delegate key events to this element
    * @param {Object} [options]
    * @param {string} [options.axis] - set arrow key axis to x, y or both (default: both)
    * @param {boolean} [options.wrap] - keyboard focus wraps from last to first & vice versa (default: true)
    * @param {string} [options.activeIndex] - specify the initial active item by index position (default: 0)
    * @param {string} [options.clickDelegate] - specify an alternate delegate for click events (default: delegateEl)
    * @param {string} [options.setFocus] - set focus when roving tab index changes (default: true)
    * @fires linearNavigationChange - when the current item changes
    * @return {Object} chainable jQuery class
    */
    $.fn.linearNavigation = function linearNavigation(delegateEl, options) {
        options = $.extend({
            activeIndex: 0,
            clickable: true,
            clickDelegate: delegateEl,
            axis: 'both',
            wrap: true
        }, options);

        if ($.data(delegateEl, pluginName) === undefined) {
            var $collection = $(this);
            var numItems = $collection.length;
            var $delegateEl = $(delegateEl);
            var $clickDelegate = $(options.clickDelegate);
            var currentItemIndex = options.activeIndex;

            var updateModel = function(goToIndex) {
                $delegateEl.trigger("linearNavigationChange", {fromIndex: currentItemIndex, toIndex: goToIndex});

                currentItemIndex = goToIndex;
            };

            var goToNextItem = function(e) {
                var isOnLastEl = (currentItemIndex === jQuery.data(delegateEl, pluginName).length - 1);
                var goToIndex;

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
                var goToIndex;

                if (isOnFirstEl) {
                    if (options.wrap === true) {
                        goToIndex = jQuery.data(delegateEl, pluginName).length - 1;
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
            $delegateEl.commonKeyDown();

            // handle arrow keys
            if (options.axis === 'x') {
                $delegateEl.on('leftArrowKeyDown', goToPrevItem);
                $delegateEl.on('rightArrowKeyDown', goToNextItem);
            } else if (options.axis === 'y') {
                $delegateEl.on('upArrowKeyDown', goToPrevItem);
                $delegateEl.on('downArrowKeyDown', goToNextItem);
            } else {
                $delegateEl.on('leftArrowKeyDown upArrowKeyDown', goToPrevItem);
                $delegateEl.on('rightArrowKeyDown downArrowKeyDown', goToNextItem);
            }

            // listen for click events on the click delegate
            $clickDelegate.on('click', function(e) {
                updateModel($(e.target).data(pluginName).idx);
            });

            // store data on delegate element
            jQuery.data(delegateEl, pluginName, {installed: 'true', length: numItems});

        } else {
            // if plugin gets called again, update number of items
            jQuery.data(delegateEl, pluginName).length = $(this).length;
        }

        return this.each(function onEachMatchedEl(index) {
            // store index position on each collection item
            $(this).data(pluginName, {idx: index});
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
