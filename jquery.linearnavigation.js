/**
* @file jQuery collection plugin that implements the events and model for one-dimensional keyboard navigation
* @author Ian McBurnie <ianmcburnie@hotmail.com>
* @version 0.3.0
* @requires jquery
* @requires jquery-common-keydown
* @requires jquery-focus-exit
*/
(function($, window, document, undefined) {
    var pluginName = 'jquery-linear-navigation';

    /**
    * @method "jQuery.fn.linearNavigation"
    * @param {Object} itemsSelector - collection of navigable elements
    * @param {Object} [options]
    * @param {string} [options.axis] - set arrow key axis to x, y or both (default: both)
    * @param {string} [options.activeIndex] - specify the initial active item by index position (default: 0)
    * @param {string} [options.autoInit] - initialise the model before a key is pressed (default: false)
    * @param {string} [options.autoInitOnDomChange] - initialise the model when DOM changes (default: false)
    * @param {string} [options.autoReset] - reset the model when focus is lost (default: false)
    * @param {boolean} [options.autoWrap] - keyboard focus wraps from last to first & vice versa (default: false)
    * @param {boolean} [options.disableHomeAndEndKeys] - disable HOME and END key functionality (default: false)
    * @fires linearNavigationChange - when the current item changes
    * @fires linearNavigationReset - when the model resets
    * @fires linearNavigationInit - when the model inits
    * @fires linearNavigationItemsChange - when descendant items change
    * @listens domChange - for changes to widget DOM
    * @return {Object} chainable jQuery class
    */
    $.fn.linearNavigation = function linearNavigation(itemsSelector, options) {
        options = $.extend({
            activeIndex: 0,
            axis: 'both',
            autoReset: false,
            autoInit: false,
            autoInitOnDomChange: false,
            autoWrap: false,
            debug: false,
            disableHomeAndEndKeys: false
        }, options);

        return this.each(function onEachMatchedEl() {
            if ($.data(this, pluginName) === undefined) {
                var $widget = $(this);
                var $collection = $widget.find(itemsSelector);
                var numItems = $collection.length;
                var currentItemIndex = null;

                var hasDoneInit = function() {
                    return currentItemIndex !== null;
                };

                var needsInit = function() {
                    return options.autoInit === false && hasDoneInit() === false;
                };

                var storeData = function() {
                    $collection.each(function onEachMatchedEl(index) {
                        // store index position on each collection item
                        $.data(this, pluginName, {idx: index});
                    });
                };

                var resetModel = function() {
                    $($collection.get(currentItemIndex)).trigger("linearNavigationReset", {fromIndex: currentItemIndex, toIndex: null});
                    currentItemIndex = null;
                };

                var initModel = function() {
                    if (currentItemIndex !== options.activeIndex) {
                        $($collection.get(options.activeIndex)).trigger("linearNavigationInit", {fromIndex: currentItemIndex, toIndex: options.activeIndex});
                        currentItemIndex = options.activeIndex;
                    }
                };

                var onFocusExit = function(e) {
                    e.stopPropagation();
                    if (currentItemIndex !== null) {
                        if (options.autoInit === false) {
                            resetModel();
                        } else {
                            initModel();
                        }
                    }
                };

                var updateModel = function(goToIndex) {
                    if (goToIndex !== currentItemIndex) {
                        $($collection.get(goToIndex)).trigger("linearNavigationChange", {fromIndex: currentItemIndex, toIndex: goToIndex});
                        currentItemIndex = goToIndex;
                    }
                };

                var onDomChange = function(e) {
                    $collection = $widget.find(itemsSelector);
                    numItems = $collection.length;

                    storeData();

                    $widget.trigger('linearNavigationItemsChange');

                    if (options.autoInitOnDomChange === true) {
                        initModel();
                    }
                };

                var onClick = function() {
                    updateModel($.data(this, pluginName).idx);
                };

                var onKeyNext = function(e) {
                    var isShiftKeyDown = e.originalEvent ? e.originalEvent.shiftKey : false;
                    if (needsInit()) {
                        initModel();
                    } else if (isShiftKeyDown === false) {
                        var isOnLastEl = (currentItemIndex === numItems - 1);
                        var goToIndex = currentItemIndex;

                        if (currentItemIndex === null) {
                            goToIndex = options.activeIndex;
                        } else if (isOnLastEl) {
                            if (options.autoWrap === true) {
                                goToIndex = 0;
                            }
                        } else {
                            goToIndex = currentItemIndex + 1;
                        }

                        updateModel(goToIndex);
                    }
                };

                var onKeyPrevious = function(e) {
                    var isShiftKeyDown = e.originalEvent ? e.originalEvent.shiftKey : false;
                    if (needsInit()) {
                        initModel();
                    } else if (isShiftKeyDown === false) {
                        var isOnFirstEl = currentItemIndex === 0;
                        var goToIndex = currentItemIndex;

                        if (currentItemIndex === null) {
                            goToIndex = options.activeIndex;
                        } else if (isOnFirstEl) {
                            if (options.autoWrap === true) {
                                goToIndex = numItems - 1;
                            }
                        } else {
                            goToIndex = currentItemIndex - 1;
                        }

                        updateModel(goToIndex);
                    }
                };

                var onHomeKey = function(e) {
                    if (hasDoneInit()) {
                        updateModel(0);
                    }
                };

                var onEndKey = function(e) {
                    if (hasDoneInit()) {
                        updateModel(numItems - 1);
                    }
                };

                // install commonKeyDown plugin on main delegate element
                $widget.commonKeyDown();

                // handle arrow keys
                if (options.axis === 'x') {
                    $widget.on('leftArrowKeyDown', onKeyPrevious);
                    $widget.on('rightArrowKeyDown', onKeyNext);
                } else if (options.axis === 'y') {
                    $widget.on('upArrowKeyDown', onKeyPrevious);
                    $widget.on('downArrowKeyDown', onKeyNext);
                } else {
                    $widget.on('leftArrowKeyDown upArrowKeyDown', onKeyPrevious);
                    $widget.on('rightArrowKeyDown downArrowKeyDown', onKeyNext);
                }

                if (options.disableHomeAndEndKeys === false) {
                    $widget.on('homeKeyDown', onHomeKey);
                    $widget.on('endKeyDown', onEndKey);
                }

                // delegate item click events, event bound to each item
                $widget.on('click', itemsSelector, onClick);

                // update state when focus leaves the widget
                if (options.autoReset === true) {
                    $widget.focusExit();
                    $widget.on('focusExit', onFocusExit);
                }

                $widget.on('domChange', onDomChange);

                // store data on bound element
                jQuery.data(this, pluginName, {installed: 'true'});

                // we can set the intial active descendant if arrow key not required
                if (options.autoInit === true) {
                    setTimeout(function() {
                        initModel();
                    }, 0);
                }

                // store data on element
                storeData();
            } else if (options.debug === true) {
                console.log('debug: {pluginName} is already installed on {element}'.replace('{pluginName}', pluginName).replace('{element}', this));
            }
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

/**
* linearNavigationInit event
* @event linearNavigationInit
* @type {object}
* @property {object} event - event object
* @property {object} data - event data params
* @param {string} [data.fromIndex] - old collection idx position
* @param {string} [data.toIndex] - new collection idx position
*/

/**
* linearNavigationReset event
* @event linearNavigationReset
* @type {object}
* @property {object} event - event object
* @property {object} data - event data params
* @param {string} [data.fromIndex] - old collection idx position
* @param {string} [data.toIndex] - new collection idx position
*/

/**
* linearNavigationItemsChange event
*
* @event linearNavigationItemsChange
* @type {object}
* @property {object} event - event object
*/
