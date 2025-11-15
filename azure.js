var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        }
        else {
            last = now;
            callback.apply(context, args);
        }
    };
}
var advThrottle = function (func, delay, options) {
    if (options === void 0) { options = { leading: true, trailing: false }; }
    var timer = null, lastRan = null, trailingArgs = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) { //called within cooldown period
            lastRan = this; //update context
            trailingArgs = args; //save for later
            return;
        }
        if (options.leading) { // if leading
            func.call.apply(// if leading
            func, __spreadArray([this], args, false)); //call the 1st instance
        }
        else { // else it's trailing
            lastRan = this; //update context
            trailingArgs = args; //save for later
        }
        var coolDownPeriodComplete = function () {
            if (options.trailing && trailingArgs) { // if trailing and the trailing args exist
                func.call.apply(// if trailing and the trailing args exist
                func, __spreadArray([lastRan], trailingArgs, false)); //invoke the instance with stored context "lastRan"
                lastRan = null; //reset the status of lastRan
                trailingArgs = null; //reset trailing arguments
                timer = setTimeout(coolDownPeriodComplete, delay); //clear the timout
            }
            else {
                timer = null; // reset timer
            }
        };
        timer = setTimeout(coolDownPeriodComplete, delay);
    };
};
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.settings = settings;
        /**
         * Everytime the element dimensions changes, we update the style. And call the optional callback.
         * Unsafe method as this is not protected by throttle. Surround with  `advThrottle(() => this.zoomOrDimensionChanged(), this.throttleTime, { leading: true, trailing: true, })` to avoid spamming recomputation.
         */
        this.zoomUpdateScheduled = false;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, }));
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        this.throttleTime = (_e = settings.throttleTime) !== null && _e !== void 0 ? _e : 100;
        window.addEventListener('resize', advThrottle(function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        }, this.throttleTime, { leading: true, trailing: true, }));
        if (window.ResizeObserver) {
            new ResizeObserver(advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, })).observe(settings.element);
        }
        if ((_f = this.settings.autoZoom) === null || _f === void 0 ? void 0 : _f.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        /**
         * Returns the zoom levels
         */
        get: function () {
            return this._zoomLevels;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Sets the available zoomLevels and new zoom to the provided values.
     * @param zoomLevels the new array of zoomLevels that can be used.
     * @param newZoom if provided the zoom will be set to this value, if not the last element of the zoomLevels array will be set as the new zoom
     */
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        var targetElement = this.settings.element;
        var wrapper = this.wrapper;
        var currentZoom = this._zoom;
        // --- Width ---
        var expectedWidth = wrapper.offsetWidth / currentZoom;
        var currentStyledWidth = parseFloat(targetElement.style.width);
        if (isNaN(currentStyledWidth) || Math.abs(currentStyledWidth - expectedWidth) >= 0.5) {
            targetElement.style.width = "".concat(expectedWidth, "px");
        }
        // --- Height ---
        var expectedHeight = targetElement.offsetHeight * currentZoom;
        var currentWrapperHeight = parseFloat(wrapper.style.height);
        if (isNaN(currentWrapperHeight) || Math.abs(currentWrapperHeight - expectedHeight) >= 0.5) {
            wrapper.style.height = "".concat(expectedHeight, "px");
        }
        // --- Callback ---
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, currentZoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BgaHelpButton = /** @class */ (function () {
    function BgaHelpButton() {
    }
    return BgaHelpButton;
}());
var BgaHelpPopinButton = /** @class */ (function (_super) {
    __extends(BgaHelpPopinButton, _super);
    function BgaHelpPopinButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpPopinButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var button = document.createElement('button');
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_popin-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "?";
        if (this.settings.buttonBackground) {
            button.style.setProperty('--background', this.settings.buttonBackground);
        }
        if (this.settings.buttonColor) {
            button.style.setProperty('--color', this.settings.buttonColor);
        }
        toElement.appendChild(button);
        button.addEventListener('click', function () { return _this.showHelp(); });
    };
    BgaHelpPopinButton.prototype.showHelp = function () {
        var _a, _b, _c;
        var popinDialog = new window.ebg.popindialog();
        popinDialog.create('bgaHelpDialog');
        popinDialog.setTitle(this.settings.title);
        popinDialog.setContent("<div id=\"help-dialog-content\">".concat((_a = this.settings.html) !== null && _a !== void 0 ? _a : '', "</div>"));
        (_c = (_b = this.settings).onPopinCreated) === null || _c === void 0 ? void 0 : _c.call(_b, document.getElementById('help-dialog-content'));
        popinDialog.show();
    };
    return BgaHelpPopinButton;
}(BgaHelpButton));
var BgaHelpExpandableButton = /** @class */ (function (_super) {
    __extends(BgaHelpExpandableButton, _super);
    function BgaHelpExpandableButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpExpandableButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var folded = (_b = this.settings.defaultFolded) !== null && _b !== void 0 ? _b : true;
        if (this.settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(this.settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        var button = document.createElement('button');
        button.dataset.folded = folded.toString();
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_expandable-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "\n            <div class=\"bga-help_folded-content ".concat(((_c = this.settings.foldedContentExtraClasses) !== null && _c !== void 0 ? _c : '').split(/\s+/g), "\">").concat((_d = this.settings.foldedHtml) !== null && _d !== void 0 ? _d : '', "</div>\n            <div class=\"bga-help_unfolded-content  ").concat(((_e = this.settings.unfoldedContentExtraClasses) !== null && _e !== void 0 ? _e : '').split(/\s+/g), "\">").concat((_f = this.settings.unfoldedHtml) !== null && _f !== void 0 ? _f : '', "</div>\n        ");
        button.style.setProperty('--expanded-width', (_g = this.settings.expandedWidth) !== null && _g !== void 0 ? _g : 'auto');
        button.style.setProperty('--expanded-height', (_h = this.settings.expandedHeight) !== null && _h !== void 0 ? _h : 'auto');
        button.style.setProperty('--expanded-radius', (_j = this.settings.expandedRadius) !== null && _j !== void 0 ? _j : '10px');
        toElement.appendChild(button);
        button.addEventListener('click', function () {
            button.dataset.folded = button.dataset.folded == 'true' ? 'false' : 'true';
            if (_this.settings.localStorageFoldedKey) {
                localStorage.setItem(_this.settings.localStorageFoldedKey, button.dataset.folded);
            }
        });
    };
    return BgaHelpExpandableButton;
}(BgaHelpButton));
var HelpManager = /** @class */ (function () {
    function HelpManager(game, settings) {
        this.game = game;
        if (!(settings === null || settings === void 0 ? void 0 : settings.buttons)) {
            throw new Error('HelpManager need a `buttons` list in the settings.');
        }
        var leftSide = document.getElementById('left-side');
        var buttons = document.createElement('div');
        buttons.id = "bga-help_buttons";
        leftSide.appendChild(buttons);
        settings.buttons.forEach(function (button) { return button.add(buttons); });
    }
    return HelpManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Just does nothing for the duration
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = /** @class */ (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
}(BgaAnimation));
/**
 * Show the element at the center of the screen
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function showScreenCenterAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var elementBR = element.getBoundingClientRect();
        var xCenter = (elementBR.left + elementBR.right) / 2;
        var yCenter = (elementBR.top + elementBR.bottom) / 2;
        var x = xCenter - (window.innerWidth / 2);
        var y = yCenter - (window.innerHeight / 2);
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaShowScreenCenterAnimation = /** @class */ (function (_super) {
    __extends(BgaShowScreenCenterAnimation, _super);
    function BgaShowScreenCenterAnimation(settings) {
        return _super.call(this, showScreenCenterAnimation, settings) || this;
    }
    return BgaShowScreenCenterAnimation;
}(BgaAnimation));
/**
 * Slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
/**
 * Slide of the element from destination to origin.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg) scale(").concat((_e = settings.scale) !== null && _e !== void 0 ? _e : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, _a;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_b = settings.animationStart) === null || _b === void 0 ? void 0 : _b.call(settings, animation);
                        (_c = settings.element) === null || _c === void 0 ? void 0 : _c.classList.add((_d = settings.animationClass) !== null && _d !== void 0 ? _d : 'bga-animations_animated');
                        animation.settings = __assign({ duration: (_h = (_f = (_e = animation.settings) === null || _e === void 0 ? void 0 : _e.duration) !== null && _f !== void 0 ? _f : (_g = this.settings) === null || _g === void 0 ? void 0 : _g.duration) !== null && _h !== void 0 ? _h : 500, scale: (_m = (_k = (_j = animation.settings) === null || _j === void 0 ? void 0 : _j.scale) !== null && _k !== void 0 ? _k : (_l = this.zoomManager) === null || _l === void 0 ? void 0 : _l.zoom) !== null && _m !== void 0 ? _m : undefined }, animation.settings);
                        _a = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _a.result = _s.sent();
                        (_p = (_o = animation.settings).animationEnd) === null || _p === void 0 ? void 0 : _p.call(_o, animation);
                        (_q = settings.element) === null || _q === void 0 ? void 0 : _q.classList.remove((_r = settings.animationClass) !== null && _r !== void 0 ? _r : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * Creates the stock and register it on the manager.
     *
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * Removes the stock and unregister it on the manager.
     */
    CardStock.prototype.remove = function () {
        var _a;
        this.manager.removeStock(this);
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    };
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        var needsCreation = true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
                needsCreation = false;
                if (!updateInformations) {
                    element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
                }
            }
        }
        else if ((_c = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _c === void 0 ? void 0 : _c.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
                needsCreation = false;
            }
        }
        if (needsCreation) {
            var element = this.getCardElement(card);
            if (needsCreation && element) {
                console.warn("Card ".concat(this.manager.getId(card), " already exists, not re-created."));
            }
            // if the card comes from a stock but is not found in this stock, the card is probably hudden (deck with a fake top card)
            var fromBackSide = !(settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) && !(animation === null || animation === void 0 ? void 0 : animation.originalSide) && (animation === null || animation === void 0 ? void 0 : animation.fromStock) && !((_d = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _d === void 0 ? void 0 : _d.contains(card));
            var createdVisible = fromBackSide ? false : (_e = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _e !== void 0 ? _e : this.manager.isCardVisible(card);
            var newElement = element !== null && element !== void 0 ? element : this.manager.createCardElement(card, createdVisible);
            promise = this.moveFromElement(card, newElement, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = fromRect ? this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        }) : Promise.resolve(false);
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards_1, animation_1, settings_1) {
        return __awaiter(this, arguments, void 0, function (cards, animation, settings, shift) {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            if (shift === void 0) { shift = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                promises.push(new Promise(function (resolve) {
                                    setTimeout(function () { return _this.addCard(cards[i], animation, settings).then(function (result) { return resolve(result); }); }, i * shift);
                                }));
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        var promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);
        return promise;
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = cards.map(function (card) { return _this.removeCard(card, settings); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var cards;
            return __generator(this, function (_a) {
                cards = this.getCards();
                return [2 /*return*/, this.removeCards(cards, settings)];
            });
        });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var HandStock = /** @class */ (function (_super) {
    __extends(HandStock, _super);
    function HandStock(manager, element, settings) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('hand-stock');
        element.style.setProperty('--card-overlap', (_a = settings.cardOverlap) !== null && _a !== void 0 ? _a : '60px');
        element.style.setProperty('--card-shift', (_b = settings.cardShift) !== null && _b !== void 0 ? _b : '15px');
        element.style.setProperty('--card-inclination', "".concat((_c = settings.inclination) !== null && _c !== void 0 ? _c : 12, "deg"));
        _this.inclination = (_d = settings.inclination) !== null && _d !== void 0 ? _d : 4;
        return _this;
    }
    HandStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateAngles();
        return promise;
    };
    HandStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateAngles();
    };
    HandStock.prototype.updateAngles = function () {
        var _this = this;
        var middle = (this.cards.length - 1) / 2;
        this.cards.forEach(function (card, index) {
            var middleIndex = index - middle;
            var cardElement = _this.getCardElement(card);
            cardElement.style.setProperty('--hand-stock-middle-index', "".concat(middleIndex));
            cardElement.style.setProperty('--hand-stock-middle-index-abs', "".concat(Math.abs(middleIndex)));
        });
    };
    return HandStock;
}(CardStock));
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.fakeCardGenerator = (_a = settings === null || settings === void 0 ? void 0 : settings.fakeCardGenerator) !== null && _a !== void 0 ? _a : manager.getFakeCardGenerator();
        _this.thicknesses = (_b = settings.thicknesses) !== null && _b !== void 0 ? _b : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_c = settings.cardNumber) !== null && _c !== void 0 ? _c : 0);
        _this.autoUpdateCardNumber = (_d = settings.autoUpdateCardNumber) !== null && _d !== void 0 ? _d : true;
        _this.autoRemovePreviousCards = (_e = settings.autoRemovePreviousCards) !== null && _e !== void 0 ? _e : true;
        var shadowDirection = (_f = settings.shadowDirection) !== null && _f !== void 0 ? _f : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard);
        }
        else if (settings.cardNumber > 0) {
            _this.addCard(_this.getFakeCard());
        }
        if (settings.counter && ((_g = settings.counter.show) !== null && _g !== void 0 ? _g : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                console.warn("Deck card counter created without a cardNumber");
            }
            _this.createCounter((_h = settings.counter.position) !== null && _h !== void 0 ? _h : 'bottom', (_j = settings.counter.extraClasses) !== null && _j !== void 0 ? _j : 'round', settings.counter.counterId);
            if ((_k = settings.counter) === null || _k === void 0 ? void 0 : _k.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
            }
        }
        _this.setCardNumber((_l = settings.cardNumber) !== null && _l !== void 0 ? _l : 0);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     * @param topCard the deck top card. If unset, will generated a fake card (default). Set it to null to not generate a new topCard.
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = undefined; }
        var promise = Promise.resolve(false);
        var oldTopCard = this.getTopCard();
        if (topCard !== null && cardNumber > 0) {
            var newTopCard = topCard || this.getFakeCard();
            if (!oldTopCard || this.manager.getId(newTopCard) != this.manager.getId(oldTopCard)) {
                promise = this.addCard(newTopCard, undefined, { autoUpdateCardNumber: false });
            }
        }
        else if (cardNumber == 0 && oldTopCard) {
            promise = this.removeCard(oldTopCard, { autoUpdateCardNumber: false });
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
        return promise;
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1, null);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.removeAll = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _a, _b;
            return __generator(this, function (_c) {
                promise = _super.prototype.removeAll.call(this, __assign(__assign({}, settings), { autoUpdateCardNumber: (_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : false }));
                if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _b !== void 0 ? _b : true) {
                    this.setCardNumber(0, null);
                }
                return [2 /*return*/, promise];
            });
        });
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var animatedCardsMax, animatedCards, elements, getFakeCard, uid, i, newCard, newElement, pauseDelayAfterAnimation;
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        animatedCardsMax = (_a = settings === null || settings === void 0 ? void 0 : settings.animatedCardsMax) !== null && _a !== void 0 ? _a : 10;
                        this.addCard((_b = settings === null || settings === void 0 ? void 0 : settings.newTopCard) !== null && _b !== void 0 ? _b : this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 4];
                        elements = [this.getCardElement(this.getTopCard())];
                        getFakeCard = function (uid) {
                            var newCard;
                            if (settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter) {
                                newCard = {};
                                settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter(newCard, uid);
                            }
                            else {
                                newCard = _this.fakeCardGenerator("".concat(_this.element.id, "-shuffle-").concat(uid));
                            }
                            return newCard;
                        };
                        uid = 0;
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = void 0;
                            do {
                                newCard = getFakeCard(uid++);
                            } while (this.manager.getCardElement(newCard)); // To make sure there isn't a fake card remaining with the same uid
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _d.sent();
                        pauseDelayAfterAnimation = (_c = settings === null || settings === void 0 ? void 0 : settings.pauseDelayAfterAnimation) !== null && _c !== void 0 ? _c : 500;
                        if (!(pauseDelayAfterAnimation > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.manager.animationManager.play(new BgaPauseAnimation({ duration: pauseDelayAfterAnimation }))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2 /*return*/, true];
                    case 4: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    Deck.prototype.getFakeCard = function () {
        return this.fakeCardGenerator(this.element.id);
    };
    return Deck;
}(CardStock));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck', (_a = settings.direction) !== null && _a !== void 0 ? _a : 'vertical');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        element.style.setProperty('--vertical-shift', (_c = (_b = settings.verticalShift) !== null && _b !== void 0 ? _b : settings.shift) !== null && _c !== void 0 ? _c : '3px');
        element.style.setProperty('--horizontal-shift', (_e = (_d = settings.horizontalShift) !== null && _d !== void 0 ? _d : settings.shift) !== null && _e !== void 0 ? _e : '3px');
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
            if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                _this.element.dataset.empty = 'true';
            }
        }
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.cardNumberUpdated();
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.cardNumberUpdated();
    };
    AllVisibleDeck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Updates the cards number, if the counter is visible.
     */
    AllVisibleDeck.prototype.cardNumberUpdated = function () {
        var cardNumber = this.cards.length;
        this.element.style.setProperty('--tile-count', '' + cardNumber);
        this.element.dataset.empty = (cardNumber == 0).toString();
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    return AllVisibleDeck;
}(CardStock));
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _a, _b;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     *
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    SlotStock.prototype.addSlotsIds = function (newSlotsIds) {
        var _a;
        var _this = this;
        if (newSlotsIds.length == 0) {
            // no change
            return;
        }
        (_a = this.slotsIds).push.apply(_a, newSlotsIds);
        newSlotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var closestSlot = this.getCardElement(card).closest('.slot');
            if (closestSlot) {
                var currentCardSlot = closestSlot.dataset.slotId;
                var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
                return currentCardSlot != slotId;
            }
            else {
                return true;
            }
        }
    };
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) { // after splice/push
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotStock;
}(LineStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function () {
                return _this.removeCard(card);
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateMainTimeoutId = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    CardManager.prototype.removeStock = function (stock) {
        var index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return Promise.resolve(false);
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            var updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.animationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardManager.prototype.getFakeCardGenerator = function () {
        var _this = this;
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.fakeCardGenerator) !== null && _b !== void 0 ? _b : (function (deckId) { return ({ id: _this.getId({ id: "".concat(deckId, "-fake-top-card") }) }); });
    };
    return CardManager;
}());
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
// @ts-ignore
GameGui = (function () {
    // this hack required so we fake extend Game
    function Game() { }
    return Game;
})();
// Note: it does not really extend it in es6 way, you cannot call super you have to use dojo way
var Azure = /** @class */ (function (_super) {
    __extends(Azure, _super);
    // @ts-ignore
    function Azure() {
        var _this = this;
        // @ts-ignore
        _this.utils = new Utils(_this);
        return _this;
    }
    Azure.prototype.setup = function (gamedatas) {
        var template = new AzureTemplate(this, gamedatas);
        this.gamedatas.managers = {};
        this.gamedatas.stocks = {};
        template.setup();
        this.setupNotifications();
    };
    Azure.prototype.onEnteringState = function (stateName, args) {
        var stateManager = new StateManager(this);
        stateManager.onEntering(stateName, args.args);
    };
    Azure.prototype.onLeavingState = function (stateName) {
        var stateManager = new StateManager(this);
        stateManager.onLeaving(stateName);
    };
    Azure.prototype.onUpdateActionButtons = function (stateName, args) { };
    Azure.prototype.setupNotifications = function () {
        this.bgaSetupPromiseNotifications({ handlers: [new NotifManager(this)] });
    };
    Azure.prototype.bgaFormatText = function (log, args) {
        return this.utils.bgaFormatText(log, args);
    };
    return Azure;
}(GameGui));
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl("bga-autofit", "1.x"),
], function (dojo, declare, counter, gamegui, BgaAutofit) {
    window.BgaAutofit = BgaAutofit;
    return declare("bgagame.azure", ebg.core.gamegui, new Azure());
});
var NotifManager = /** @class */ (function () {
    function NotifManager(game) {
        var _this = this;
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        game.notifqueue.setIgnoreNotificationCheck("drawQi", function (notif) {
            var _a = notif.args, player_id = _a.player_id, isPrivate = _a.isPrivate;
            return player_id === _this.game.player_id;
        });
    }
    NotifManager.prototype.notif_discardQi = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, cards, handCount, qiManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, cards = args.cards, handCount = args.handCount;
                        qiManager = new QiManager(this.game);
                        return [4 /*yield*/, qiManager.discard(player_id, cards, handCount)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_gatherQi = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, cards, handCount, qiManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, cards = args.cards, handCount = args.handCount;
                        qiManager = new QiManager(this.game);
                        return [4 /*yield*/, qiManager.gather(player_id, cards, handCount)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_drawQi = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, nbr, handCount, qiManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, nbr = args.nbr, handCount = args.handCount;
                        qiManager = new QiManager(this.game);
                        return [4 /*yield*/, qiManager.draw(player_id, nbr, handCount)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_drawQiPrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, cards, handCount, qiManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, cards = args.cards, handCount = args.handCount;
                        qiManager = new QiManager(this.game);
                        return [4 /*yield*/, qiManager.drawPrivate(player_id, cards, handCount)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_placeStone = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, space_id, card, lastPlaced, stone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, space_id = args.space_id, card = args.card, lastPlaced = args.lastPlaced;
                        stone = new Stone(this.game, card);
                        return [4 /*yield*/, stone.place(player_id, space_id, lastPlaced)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_removeStone = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, card, stone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, card = args.card;
                        stone = new Stone(this.game, card);
                        return [4 /*yield*/, stone.remove(player_id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_gainFavor = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var card, player_id, beast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = args.card, player_id = args.player_id;
                        beast = new Beast(this.game, card);
                        beast.playSound();
                        return [4 /*yield*/, beast.gainFavor(player_id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.game.wait(1000)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_setScore = function (args) {
        var player_id = args.player_id, score = args.score;
        this.game.scoreCtrl[player_id].toValue(score);
    };
    NotifManager.prototype.notif_gatherWisdom = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, initialWisdom, finalWisdom, wisdomManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, initialWisdom = args.initialWisdom, finalWisdom = args.finalWisdom;
                        wisdomManager = new WisdomManager(this.game);
                        return [4 /*yield*/, wisdomManager.set(player_id, initialWisdom, finalWisdom)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_reshuffleQi = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cardCounts, qiManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cardCounts = args.cardCounts;
                        qiManager = new QiManager(this.game);
                        return [4 /*yield*/, qiManager.reshuffle(cardCounts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return NotifManager;
}());
var AzureTemplate = /** @class */ (function () {
    function AzureTemplate(game, gamedatas) {
        this.game = game;
        this.gamedatas = gamedatas;
        this.utils = new Utils(this.game);
    }
    AzureTemplate.prototype.setupZoom = function () {
        new ZoomManager({
            element: document.getElementById("azr_gameArea"),
            localStorageZoomKey: "bga-zoom_azure",
            zoomLevels: [
                0.35, 0.4, 0.5, 0.625, 0.75, 0.875, 1, 1.125, 1.25, 1.375, 1.5,
            ],
            zoomControls: {
                color: "white",
            },
            defaultZoom: window.innerWidth <= 400 ? 0.35 : 1,
        });
    };
    AzureTemplate.prototype.setupRealm = function () {
        var _a = this.gamedatas, domainsOrder = _a.domainsOrder, domainsRotations = _a.domainsRotations, domainsSides = _a.domainsSides, decksCounts = _a.decksCounts;
        var domainsElement = document.getElementById("azr_domains");
        domainsOrder.forEach(function (domain_id) {
            var rotation = domainsRotations[domain_id] * 90;
            var side = domainsSides[domain_id];
            domainsElement.insertAdjacentHTML("beforeend", "<div id=\"azr_domain-".concat(domain_id, "\" class=\"azr_domain\" \n        style=\"background-image: url(").concat(g_gamethemeurl, "img/domain_").concat(domain_id).concat(side, ".jpg); --rotation: ").concat(rotation, "deg; --side: ").concat(side, "; --domain: ").concat(domain_id, "\"></div>\n      "));
        });
        var decksElement = document.getElementById("azr_decks");
        for (var domain_id in decksCounts) {
            decksElement.insertAdjacentHTML("beforeend", "<div id=\"azr_deck-".concat(domain_id, "\" class=\"azr_deck\"></div>"));
        }
    };
    AzureTemplate.prototype.setupHand = function () {
        if (this.game.isSpectator) {
            document.getElementById("azr_handContainer").remove();
            return;
        }
        var handTitle = document.getElementById("azr_handTitle");
        handTitle.textContent = _("Your hand");
    };
    AzureTemplate.prototype.setupWisdomTrack = function () {
        var wisdomTrack = document.getElementById("azr_wisdomTrack");
        for (var i = 1; i <= 25; i++) {
            wisdomTrack.insertAdjacentHTML("beforeend", "<div id=\"azr_wisdomTrack-".concat(i, "\" class=\"azr_wisdomTrack-number\"></div>"));
        }
    };
    AzureTemplate.prototype.setupFavors = function () {
        var favorsElement = document.getElementById("azr_favorsContainer");
        var titleElement = document.getElementById("azr_favorsTitle");
        titleElement.textContent = _("active favors");
        var utils = this.utils;
        for (var p_id in this.gamedatas.players) {
            var player_id = Number(p_id);
            var _a = this.gamedatas.players[player_id], color = _a.color, name_1 = _a.name;
            var title = player_id === this.game.player_id ? _("You") : name_1;
            var opp_color = utils.getOppColor(color);
            var order = player_id === this.game.player_id ? 0 : 1;
            if (player_id === this.game.player_id) {
                titleElement.style.setProperty("--color", "#".concat(color));
                titleElement.style.setProperty("--opp-color", "#".concat(opp_color));
            }
            favorsElement.insertAdjacentHTML("beforeend", "<div id=\"azr_favors-".concat(player_id, "\" class=\"azr_favors\" \n        style=\"--color: #").concat(color, "; --opp-color: #").concat(opp_color, "; --color-transparent: #").concat(color, "aa; order: ").concat(order, "\">\n        <div id=\"azr_favorBeasts-").concat(player_id, "\" class=\"azr_favorBeasts\"></div>\n        <h4 class=\"playername\">").concat(title, "</h4>\n        </div>"));
        }
    };
    AzureTemplate.prototype.setupStocks = function () {
        var spaceManager = new SpaceManager(this.game);
        spaceManager.setup();
        var beastManager = new BeastManager(this.game);
        beastManager.setup();
        var stoneManager = new StoneManager(this.game);
        stoneManager.setup();
        var qiManager = new QiManager(this.game);
        qiManager.setup();
        var wisdomManager = new WisdomManager(this.game);
        wisdomManager.setup();
        var giftedManager = new GiftedManager(this.game);
        giftedManager.setup();
    };
    AzureTemplate.prototype.setupPanels = function () {
        var _a;
        var _b = this.gamedatas, handsCounts = _b.handsCounts, stoneCounts = _b.stoneCounts;
        for (var p_id in this.gamedatas.players) {
            var player_id = Number(p_id);
            var _c = this.gamedatas.players[player_id], player_color = _c.color, player_name = _c.name;
            var playerPanel = this.game.getPlayerPanelElement(player_id);
            playerPanel.insertAdjacentHTML("beforeend", "<div id=\"azr_giftedStone-".concat(player_id, "\" class=\"azr_giftedStone\"></div>\n        <div id=\"azr_stoneCounter-").concat(player_id, "\" class=\"azr_counter azr_stoneCounter\">\n          <div id=\"azr_stoneIcon-").concat(player_id, "\" class=\" azr_counterIcon azr_stone azr_stone-").concat(player_color, " azr_stoneCounterIcon\" \n          style=\"--color: #").concat(player_color, ";\"></div>\n          <span id=\"azr_stoneCount-").concat(player_id, "\" class=\"azr_customFont-title azr_counterCount\">0</span>\n        </div>\n        <div id=\"azr_handCounter-").concat(player_id, "\" class=\"azr_counter azr_handCounter\">\n          <div id=\"azr_handIcon-").concat(player_id, "\" class=\"azr_qi azr_counterIcon azr_handCounterIcon\"></div>\n          <span id=\"azr_handCount-").concat(player_id, "\" class=\"azr_customFont-title azr_counterCount\">0</span>\n        </div>"));
            this.game.addTooltipHtml("azr_stoneCounter-".concat(player_id), "<span class=\"azr_tooltip\">\n                ".concat(this.game.format_string_recursive("${player_name}'s common stones", { player_name: player_name }), "\n        </span>"));
            this.game.addTooltipHtml("azr_handCounter-".concat(player_id), "<span class=\"azr_tooltip\">\n                ".concat(this.game.format_string_recursive("${player_name}'s cards", {
                player_name: player_name,
            }), "\n        </span>"));
            this.gamedatas.counters = __assign(__assign({}, this.gamedatas.counters), (_a = {}, _a[player_id] = {
                hand: new ebg.counter(),
                stones: new ebg.counter(),
            }, _a));
            var _d = this.gamedatas.counters[player_id], hand = _d.hand, stones = _d.stones;
            hand.create("azr_handCount-".concat(player_id));
            hand.setValue(handsCounts[player_id]);
            stones.create("azr_stoneCount-".concat(player_id));
            stones.setValue(stoneCounts[player_id]);
            var playerNameElement = document
                .getElementById("player_name_".concat(player_id))
                .querySelector("a");
            this.utils.stylePlayerName(playerNameElement);
        }
    };
    AzureTemplate.prototype.initObserver = function () {
        var _this = this;
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                var addedNodes = mutation.addedNodes;
                addedNodes.forEach(function (target) {
                    if (target.nodeType !== 1) {
                        return;
                    }
                    var utils = _this.utils;
                    if (target.classList.contains("playername")) {
                        utils.stylePlayerName(target);
                        return;
                    }
                    target
                        .querySelectorAll(".playername")
                        .forEach(function (child) {
                        utils.stylePlayerName(child);
                    });
                });
            });
        });
        var observable = ["logs", "maintitlebar_content", "chatbardock"];
        observable.forEach(function (observable) {
            var observableElement = document.getElementById(observable);
            observer.observe(observableElement, {
                childList: true,
                subtree: true,
            });
        });
    };
    AzureTemplate.prototype.setupColors = function () {
        var color = this.game.isSpectator
            ? "003a4f"
            : this.gamedatas.players[this.game.player_id].color;
        var opp_color = this.utils.getOppColor(color);
        var html = document.querySelector("html");
        html.style.setProperty("--color", "#".concat(color));
        html.style.setProperty("--opp-color", "#".concat(opp_color));
        html.style.setProperty("--color-transparent", "#".concat(color, "aa"));
        html.style.setProperty("--opp-color-transparent", "#".concat(opp_color, "aa"));
    };
    AzureTemplate.prototype.loadSounds = function () {
        for (var domain_id in this.gamedatas.BEASTS) {
            this.game.sounds.load("beast_".concat(domain_id), "sounds/beast_".concat(domain_id));
        }
    };
    AzureTemplate.prototype.setup = function () {
        this.setupColors();
        this.loadSounds();
        this.setupZoom();
        this.setupRealm();
        this.setupHand();
        this.setupWisdomTrack();
        this.setupFavors();
        this.setupPanels();
        this.setupStocks();
        this.initObserver();
        BgaAutofit.init();
    };
    return AzureTemplate;
}());
var Utils = /** @class */ (function () {
    function Utils(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
    }
    Utils.prototype.performAction = function (actionName, args, params) {
        var _this = this;
        this.game.bgaPerformAction(actionName, args, params).catch(function () {
            _this.game.restoreServerGameState();
        });
    };
    Utils.prototype.addConfirmationButton = function (label, callback, params) {
        this.game.statusBar.addActionButton(label, function () {
            callback();
        }, __assign({ id: "azr_confirmationBtn" }, params));
    };
    Utils.prototype.removeConfirmationButton = function () {
        var _a;
        (_a = document.getElementById("azr_confirmationBtn")) === null || _a === void 0 ? void 0 : _a.remove();
    };
    Utils.prototype.rgbToHex = function (color) {
        if (color.includes("rbg")) {
            return color;
        }
        return color === "rgb(0, 58, 79)" ? "003a4f" : "c1e8fb";
    };
    Utils.prototype.getOppColor = function (color) {
        return color === "003a4f" ? "c1e8fb" : "003a4f";
    };
    Utils.prototype.stylePlayerName = function (element) {
        var color = this.rgbToHex(element.style.color);
        var opp_color = this.getOppColor(color);
        element.style.setProperty("--color", "#".concat(color));
        element.style.setProperty("--opp-color", "#".concat(opp_color));
    };
    Utils.prototype.bgaFormatText = function (log, args) {
        var _a;
        try {
            if (log && args && !args.processed) {
                if (args.space_icon !== undefined && args.space_id !== undefined) {
                    var backgroundImage = "url(".concat(g_gamethemeurl, "img/spaces/space_").concat(args.space_id, ".jpg)");
                    args.space_icon = "<span class=\"azr_logIcon azr_spaceIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
                }
                if (args.qi_icon !== undefined && args.domain_id !== undefined) {
                    var backgroundImage = "url(".concat(g_gamethemeurl, "img/qi_").concat(args.domain_id, ".jpg)");
                    args.qi_icon = "<div class=\"azr_logIcon azr_qiIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></div>");
                }
                for (var key in args) {
                    if (key.includes("_label") ||
                        (key.includes("_log") && key !== "change_log")) {
                        var value = ((_a = args.i18n) === null || _a === void 0 ? void 0 : _a.includes("key"))
                            ? _(args[key])
                            : args[key];
                        args[key] = "<span class=\"azr_logHighlight\">".concat(value, "</span>");
                    }
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return { log: log, args: args };
    };
    Utils.prototype.playSound = function (id) {
        if (this.game.getGameUserPreference(103) === 0 ||
            typeof g_replayFrom !== "undefined" ||
            g_archive_mode) {
            return;
        }
        this.game.disableNextMoveSound();
        this.game.sounds.play(id);
    };
    return Utils;
}());
var AzureCard = /** @class */ (function () {
    function AzureCard(card) {
        this.id = card.id;
        this.type = card.type;
        this.type_arg = Number(card.type_arg);
        this.location = card.location;
        this.location_arg = Number(card.location_arg);
    }
    return AzureCard;
}());
var BeastManager = /** @class */ (function () {
    function BeastManager(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        this.manager = this.gamedatas.managers.beasts;
        this.stocks = this.gamedatas.stocks.beasts;
    }
    BeastManager.prototype.create = function () {
        var _this = this;
        var manager = new CardManager(this.game, {
            getId: function (_a) {
                var type_arg = _a.type_arg;
                return "azr_beast-".concat(type_arg);
            },
            selectedCardClass: "azr_selected",
            selectableCardClass: "azr_selectable",
            unselectableCardClass: "azr_unselectable",
            setupDiv: function (card, element) {
                element.classList.add("azr_beast");
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/beast_").concat(card.type_arg, ".png)");
                var beast = new Beast(_this.game, card);
                var tooltip = beast.buildTooltip();
                _this.game.addTooltipHtml(element.id, tooltip);
            },
        });
        var stocks = {
            realm: new CardStock(manager, document.getElementById("azr_beasts"), {}),
        };
        for (var p_id in this.gamedatas.players) {
            var player_id = Number(p_id);
            stocks[player_id] = {
                favors: new CardStock(manager, document.getElementById("azr_favorBeasts-".concat(player_id)), { sort: sortFunction("type") }),
            };
        }
        this.gamedatas.stocks.beasts = stocks;
        this.gamedatas.managers.beasts = manager;
    };
    BeastManager.prototype.setupStocks = function () {
        var _this = this;
        var _a = this.gamedatas, placedBeasts = _a.placedBeasts, activeBeasts = _a.activeBeasts;
        placedBeasts.forEach(function (card) {
            var beast = new Beast(_this.game, card);
            beast.setup();
        });
        activeBeasts.forEach(function (card) {
            var beast = new Beast(_this.game, card);
            beast.setup();
        });
    };
    BeastManager.prototype.setup = function () {
        this.create();
        this.setupStocks();
    };
    return BeastManager;
}());
var Beast = /** @class */ (function (_super) {
    __extends(Beast, _super);
    function Beast(game, card) {
        var _this = _super.call(this, game) || this;
        _this.card = new AzureCard(card);
        _this.id = _this.card.type_arg;
        _this.space_id = Number(_this.card.type);
        var info = _this.gamedatas.BEASTS[_this.id];
        info.label = _(info.label);
        info.guard = _(info.guard);
        info.favor = _(info.favor);
        _this.info = info;
        _this.utils = new Utils(_this.game);
        return _this;
    }
    Beast.prototype.setup = function () {
        var _a = this.card, location = _a.location, player_id = _a.location_arg;
        if (location === "favors") {
            this.gainFavor(player_id);
        }
        if (location === "realm") {
            this.stocks.realm.addCard(this.card, {}, {
                forceToElement: document.getElementById("azr_space-".concat(this.space_id)),
            });
            return;
        }
    };
    Beast.prototype.gainFavor = function (player_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.stocks[player_id].favors.addCard(this.card)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Beast.prototype.playSound = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.utils.playSound("beast_".concat(this.id));
                return [2 /*return*/];
            });
        });
    };
    Beast.prototype.buildTooltip = function () {
        var _a = this.info, label = _a.label, guard = _a.guard, favor = _a.favor;
        var formattedGuard = this.game.format_string_recursive(_("Guarded by ${guard}"), {
            guard: guard,
        });
        var formattedFavor = this.game.format_string_recursive(_("Favor: ${favor}"), {
            favor: favor,
        });
        var tooltip = "<div class=\"azr_tooltip azr_beastTooltip\">\n    <span class=\"azr_beastTooltipTitle azr_customFont-title\">".concat(label, "</span>\n    <span>").concat(formattedGuard, "</span>\n    <span>").concat(formattedFavor, "</span>\n    </div>");
        return tooltip;
    };
    return Beast;
}(BeastManager));
var GiftedManager = /** @class */ (function () {
    function GiftedManager(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        this.manager = this.gamedatas.managers.gifted;
        this.stocks = this.gamedatas.stocks.gifted;
        this.card = this.gamedatas.giftedCard;
    }
    GiftedManager.prototype.create = function () {
        var _this = this;
        var manager = new CardManager(this.game, {
            getId: function (_a) {
                var id = _a.id;
                return "azr_giftedCard-".concat(id);
            },
            setupDiv: function (_a, element) {
                var id = _a.id;
                element.classList.add("azr_card", "azr_giftedCard");
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/giftedCard_").concat(id, ".jpg)");
                var _b = _this.card, label = _b.label, description = _b.description;
                element.insertAdjacentHTML("beforeend", "<span class=\"bga-autofit azr_giftedCardTitle\">".concat(_(label), "</span>\n          <span class=\"bga-autofit azr_giftedCardDescription\">").concat(_(description), "</span>"));
                var cloneElement = element.cloneNode(true);
                cloneElement.removeAttribute("id");
                _this.game.addTooltipHtml(element.id, "<div class=\"azr_tooltip azr_giftedCardTooltip\">".concat(cloneElement.outerHTML, "</div>"));
            },
        });
        this.gamedatas.managers.gifted = manager;
        this.manager = manager;
        var stocks = {
            table: new CardStock(manager, document.getElementById("azr_giftedContainer")),
        };
        this.gamedatas.stocks.gifted = stocks;
        this.stocks = stocks;
    };
    GiftedManager.prototype.setupStocks = function () {
        if (!this.card) {
            return;
        }
        this.stocks.table.addCard(this.card);
    };
    GiftedManager.prototype.setup = function () {
        this.create();
        this.setupStocks();
    };
    GiftedManager.prototype.highlight = function (highlight) {
        this.stocks.table
            .getCardElement(this.card)
            .classList.toggle("azr_giftedCard-highlight", highlight);
    };
    return GiftedManager;
}());
var QiManager = /** @class */ (function () {
    function QiManager(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        this.stocks = this.gamedatas.stocks.qi;
        this.manager = this.gamedatas.managers.qi;
        this.utils = new Utils(this.game);
    }
    QiManager.prototype.create = function () {
        var _a;
        var _this = this;
        var manager = new CardManager(this.game, {
            cardHeight: 111 * 1.52,
            cardWidth: 111,
            getId: function (_a) {
                var id = _a.id;
                return "azr_qi-".concat(id);
            },
            selectedCardClass: "azr_selected",
            selectableCardClass: "azr_selectable",
            unselectableCardClass: "azr_unselectable",
            setupDiv: function (card, element) {
                element.classList.add("azr_qi");
                var qi = new Qi(_this.game, card);
                var tooltip = qi.buildTooltip();
                _this.game.addTooltipHtml(element.id, tooltip);
            },
            setupFrontDiv: function (_a, element) {
                var type_arg = _a.type_arg;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/qi_").concat(type_arg, ".jpg)");
            },
            setupBackDiv: function (_a, element) {
                var type_arg = _a.type_arg;
                if (!type_arg) {
                    type_arg = 0;
                }
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/qi_").concat(type_arg, ".jpg)");
            },
        });
        var _b = this.gamedatas, decksCounts = _b.decksCounts, hand = _b.hand;
        var decks = {};
        var _loop_3 = function (d_id) {
            var _c;
            var domain_id = Number(d_id);
            var deck = new Deck(manager, document.getElementById("azr_deck-".concat(domain_id)), {
                fakeCardGenerator: function (deck_id) {
                    var fakeCard = {
                        id: -domain_id,
                        type_arg: domain_id,
                        type: "",
                        location: deck_id,
                        location_arg: 0,
                    };
                    return fakeCard;
                },
                cardNumber: decksCounts[domain_id],
                counter: {
                    extraClasses: "azr_customFont-title azr_deckCounter",
                    position: "bottom",
                },
            });
            decks = __assign(__assign({}, decks), (_c = {}, _c["deck-".concat(domain_id)] = deck, _c));
        };
        for (var d_id in decksCounts) {
            _loop_3(d_id);
        }
        var stocks = {
            decks: decks,
            hand: new CardStock(manager, document.getElementById("azr_hand"), {
                sort: sortFunction("type_arg"),
            }),
        };
        for (var p_id in this.gamedatas.players) {
            var player_id = Number(p_id);
            stocks = __assign(__assign({}, stocks), (_a = {}, _a[player_id] = {
                void: new VoidStock(manager, document.getElementById("azr_handIcon-".concat(player_id))),
            }, _a));
        }
        this.gamedatas.stocks.qi = stocks;
        this.gamedatas.managers.qi = manager;
        this.stocks = this.gamedatas.stocks.qi;
        this.manager = manager;
    };
    QiManager.prototype.setupStocks = function () {
        var hand = this.gamedatas.hand;
        if (!this.game.isSpectator) {
            this.stocks.hand.addCards(hand);
        }
    };
    QiManager.prototype.setup = function () {
        this.create();
        this.setupStocks();
    };
    QiManager.prototype.gather = function (player_id, cards, handCount) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, cards_1, card, qi;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, cards_1 = cards;
                        _a.label = 1;
                    case 1:
                        if (!(_i < cards_1.length)) return [3 /*break*/, 4];
                        card = cards_1[_i];
                        qi = new Qi(this.game, card);
                        return [4 /*yield*/, qi.gather(player_id)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.updateHandCounter(player_id, handCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    QiManager.prototype.updateHandCounter = function (player_id, handCount) {
        this.gamedatas.counters[player_id].hand.toValue(handCount);
    };
    QiManager.prototype.draw = function (player_id, nbr, handCount) {
        return __awaiter(this, void 0, void 0, function () {
            var i, fakeCard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 1;
                        _a.label = 1;
                    case 1:
                        if (!(i <= nbr)) return [3 /*break*/, 4];
                        fakeCard = this.manager.getFakeCardGenerator()("fake-".concat(i));
                        return [4 /*yield*/, this.stocks[player_id].void.addCard(fakeCard, {
                                fromStock: this.stocks.decks["deck-0"],
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.updateHandCounter(player_id, handCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    QiManager.prototype.drawPrivate = function (player_id, cards, handCount) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, cards_2, card, qi;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, cards_2 = cards;
                        _a.label = 1;
                    case 1:
                        if (!(_i < cards_2.length)) return [3 /*break*/, 4];
                        card = cards_2[_i];
                        qi = new Qi(this.game, card);
                        return [4 /*yield*/, qi.drawPrivate()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.updateHandCounter(player_id, handCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    QiManager.prototype.discard = function (player_id, cards, handCount) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, cards_3, card, qi;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, cards_3 = cards;
                        _a.label = 1;
                    case 1:
                        if (!(_i < cards_3.length)) return [3 /*break*/, 4];
                        card = cards_3[_i];
                        qi = new Qi(this.game, card);
                        return [4 /*yield*/, qi.discard(player_id)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.updateHandCounter(player_id, handCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    QiManager.prototype.makeSelectable = function () {
        var _this = this;
        this.stocks.hand.setSelectionMode("multiple");
        this.stocks.hand.onSelectionChange = function (selection) {
            var utils = _this.utils;
            utils.removeConfirmationButton();
            if (selection.length === 2) {
                utils.addConfirmationButton(_("confirm cards"), function () {
                    utils.performAction("act_birdDiscard", {
                        cards: JSON.stringify(selection),
                    });
                });
                return;
            }
            if (selection.length > 2) {
                _this.game.showMessage(_("You must discard exactly 2 cards"), "error");
                return;
            }
        };
    };
    QiManager.prototype.makeUnselectable = function () {
        this.stocks.hand.setSelectionMode("none");
    };
    QiManager.prototype.reshuffle = function (cardCounts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _i, domain_id, cardCount, i, fakeCard;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = cardCounts;
                        _b = [];
                        for (_c in _a)
                            _b.push(_c);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        _c = _b[_i];
                        if (!(_c in _a)) return [3 /*break*/, 5];
                        domain_id = _c;
                        cardCount = cardCounts[domain_id];
                        i = 1;
                        _d.label = 2;
                    case 2:
                        if (!(i <= cardCount)) return [3 /*break*/, 5];
                        fakeCard = this.manager.getFakeCardGenerator()("deck-".concat(domain_id, "-").concat(i));
                        return [4 /*yield*/, this.stocks.decks["deck-0"].addCard(fakeCard, {
                                fromStock: this.stocks.decks["deck-".concat(domain_id)],
                            })];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return QiManager;
}());
var Qi = /** @class */ (function (_super) {
    __extends(Qi, _super);
    function Qi(game, card) {
        var _this = _super.call(this, game) || this;
        _this.card = new AzureCard(card);
        _this.domain_id = _this.card.type_arg;
        _this.deck_id = "deck-".concat(_this.domain_id);
        if (_this.domain_id > 0) {
            var info = _this.gamedatas.QI[_this.domain_id];
            info.label = _(info.label);
            _this.info = info;
        }
        return _this;
    }
    Qi.prototype.discard = function (player_id) {
        return __awaiter(this, void 0, void 0, function () {
            var fromElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromElement = player_id === this.game.player_id
                            ? undefined
                            : document.getElementById("azr_handIcon-".concat(player_id));
                        return [4 /*yield*/, this.stocks.decks[this.deck_id].addCard(this.card, {
                                fromElement: fromElement,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Qi.prototype.gather = function (player_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(player_id === this.game.player_id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.stocks.hand.addCard(this.card, {
                                fromStock: this.stocks.decks[this.deck_id],
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.stocks.decks[this.deck_id].removeCard(this.card, {
                            slideTo: document.getElementById("azr_handIcon-".concat(player_id)),
                        })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Qi.prototype.drawPrivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.stocks.hand.addCard(this.card, {
                            fromStock: this.stocks.decks["deck-0"],
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Qi.prototype.buildTooltip = function () {
        var domain_id = this.domain_id;
        if (Number.isNaN(domain_id)) {
            domain_id = 0;
        }
        var label = domain_id === 0
            ? _("Hidden deck")
            : this.game.format_string_recursive(_("${qi_label} card"), {
                i18n: "qi_label",
                qi_label: this.info.label,
            });
        var tooltip = "\n      <div class=\"azr_tooltip azr_qiTooltip\"><span class=\"azr_qiTooltipTitle\">".concat(label, "</span></div>\n    ");
        return tooltip;
    };
    return Qi;
}(QiManager));
var SpaceManager = /** @class */ (function () {
    function SpaceManager(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        this.manager = this.gamedatas.managers.spaces;
        this.stocks = this.gamedatas.stocks.spaces;
        this.bonds = this.gamedatas.bonds;
        this.utils = new Utils(this.game);
    }
    SpaceManager.prototype.create = function () {
        var _this = this;
        var manager = new CardManager(this.game, {
            getId: function (_a) {
                var id = _a.id;
                return "azr_space-".concat(id);
            },
            selectedCardClass: "azr_selected",
            selectableCardClass: "azr_selectable",
            unselectableCardClass: "azr_unselectable",
            setupDiv: function (card, element) {
                var x = card.x, y = card.y;
                element.classList.add("azr_space");
                element.style.setProperty("--x", x.toString());
                element.style.setProperty("--y", y.toString());
                var space = new Space(_this.game, card);
                space.highlightBonds();
            },
        });
        this.gamedatas.stocks.spaces = {
            realm: new CardStock(manager, document.getElementById("azr_spaces"), {}),
        };
        this.gamedatas.managers.spaces = manager;
    };
    SpaceManager.prototype.setupStocks = function () {
        var realm = this.gamedatas.realm;
        for (var x in realm) {
            for (var y in realm[x]) {
                var space_id = realm[x][y];
                var spaceCard = {
                    id: space_id,
                    x: Number(x),
                    y: Number(y),
                };
                var space = new Space(this.game, spaceCard);
                space.setup();
            }
        }
    };
    SpaceManager.prototype.setup = function () {
        this.create();
        this.setupStocks();
    };
    SpaceManager.prototype.makeSelectable = function (selectableSpaces, action) {
        var _this = this;
        if (action === void 0) { action = "act_placeStone"; }
        this.stocks.realm.setSelectionMode("single");
        this.stocks.realm.setSelectableCards(selectableSpaces);
        this.stocks.realm.onSelectionChange = function (selection, card) {
            var utils = _this.utils;
            utils.removeConfirmationButton();
            if (selection.length === 0) {
                return;
            }
            var x = card.x, y = card.y, space_id = card.id;
            if (_this.game.getGameUserPreference(101) === 0) {
                utils.performAction(action, { x: x, y: y });
                return;
            }
            utils.addConfirmationButton(_this.game.format_string_recursive("${space_icon}", {
                space_icon: "",
                space_id: space_id,
            }), function () {
                utils.performAction(action, { x: x, y: y });
            });
        };
    };
    SpaceManager.prototype.makeUnselectable = function () {
        this.stocks.realm.setSelectionMode("none");
    };
    SpaceManager.prototype.highlightBonds = function () {
        for (var sp_id in this.bonds) {
            var space_id = Number(sp_id);
            var space = new Space(this.game, { id: space_id });
            space.highlightBonds();
        }
    };
    return SpaceManager;
}());
var Space = /** @class */ (function (_super) {
    __extends(Space, _super);
    function Space(game, card) {
        var _this = _super.call(this, game) || this;
        _this.card = card;
        _this.id = _this.card.id;
        _this.timeout = null;
        return _this;
    }
    Space.prototype.setup = function () {
        this.stocks.realm.addCard(this.card, {}, {});
    };
    Space.prototype.enterHover = function () {
        var _this = this;
        if (this.game.getGameUserPreference(102) === 0) {
            return;
        }
        clearTimeout(this.timeout);
        var bonds = this.bonds[this.id];
        this.timeout = setTimeout(function () {
            var _loop_4 = function (p_id) {
                var player_id = Number(p_id);
                bonds[player_id].forEach(function (space_id) {
                    var card = { id: space_id };
                    var element = _this.manager.getCardElement(card);
                    var className = player_id === _this.game.player_id
                        ? "azr_space-bonded"
                        : "azr_space-opponent";
                    element.classList.add(className);
                });
            };
            for (var p_id in bonds) {
                _loop_4(p_id);
            }
        }, 100);
    };
    Space.prototype.leaveHover = function () {
        var _this = this;
        if (this.game.getGameUserPreference(102) === 0) {
            return;
        }
        clearTimeout(this.timeout);
        this.timeout = null;
        var bonds = this.bonds[this.id];
        for (var p_id in bonds) {
            var player_id = Number(p_id);
            bonds[player_id].forEach(function (space_id) {
                var card = { id: space_id };
                var element = _this.manager.getCardElement(card);
                element.classList.remove("azr_space-bonded", "azr_space-opponent");
            });
        }
    };
    Space.prototype.highlightBonds = function () {
        var _this = this;
        var cardElement = this.manager.getCardElement(this.card);
        cardElement.addEventListener("pointerdown", function () {
            _this.enterHover();
        });
        cardElement.addEventListener("pointerenter", function () {
            _this.enterHover();
        });
        cardElement.addEventListener("pointerup", function () {
            _this.leaveHover();
        });
        cardElement.addEventListener("pointerleave", function () {
            _this.leaveHover();
        });
    };
    return Space;
}(SpaceManager));
var StoneManager = /** @class */ (function () {
    function StoneManager(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        this.manager = this.gamedatas.managers.stones;
        this.stocks = this.gamedatas.stocks.stones;
    }
    StoneManager.prototype.create = function () {
        var _a;
        var _this = this;
        var manager = new CardManager(this.game, {
            getId: function (_a) {
                var type = _a.type, type_arg = _a.type_arg, id = _a.id;
                if (type === "gifted") {
                    return "azr_stone-".concat(type_arg);
                }
                return "azr_stone-".concat(id);
            },
            selectedCardClass: "azr_selected",
            selectableCardClass: "azr_selectable",
            unselectableCardClass: "azr_unselectable",
            setupDiv: function (card, element) {
                element.classList.add("azr_card", "azr_stone");
                var player_id = card.type_arg, type = card.type;
                var color = _this.gamedatas.players[player_id].color;
                element.classList.add("azr_stone-".concat(color));
                if (type === "gifted") {
                    element.classList.add("azr_stone-gifted");
                    element.style.setProperty("--gifted-bg", "url(".concat(g_gamethemeurl, "img/giftedStone_").concat(color, ".png)"));
                }
                var stone = new Stone(_this.game, card);
                var tooltip = stone.buildTooltip();
                _this.game.addTooltipHtml(element.id, tooltip);
            },
        });
        var stocks = {
            realm: new CardStock(manager, document.getElementById("azr_stones")),
            void: new VoidStock(manager, document.getElementById("azr_stonesVoid")),
        };
        for (var player_id in this.gamedatas.players) {
            stocks = __assign(__assign({}, stocks), (_a = {}, _a[player_id] = {
                gifted: new CardStock(manager, document.getElementById("azr_giftedStone-".concat(player_id))),
            }, _a));
        }
        this.gamedatas.stocks.stones = stocks;
        this.gamedatas.managers.stones = manager;
    };
    StoneManager.prototype.setupStocks = function () {
        var _this = this;
        var _a = this.gamedatas, placedStones = _a.placedStones, giftedStones = _a.giftedStones;
        __spreadArray(__spreadArray([], placedStones, true), giftedStones, true).forEach(function (stoneCard) {
            var stone = new Stone(_this.game, stoneCard);
            stone.setup();
        });
    };
    StoneManager.prototype.setup = function () {
        this.create();
        this.setupStocks();
    };
    StoneManager.prototype.highlightGifted = function (player_id, highlight) {
        document
            .getElementById("azr_stone-".concat(player_id))
            .classList.toggle("azr_stone-gifted-highlight", highlight);
    };
    return StoneManager;
}());
var Stone = /** @class */ (function (_super) {
    __extends(Stone, _super);
    function Stone(game, card) {
        var _this = _super.call(this, game) || this;
        _this.card = new AzureCard(card);
        _this.player_id = _this.card.type_arg;
        _this.utils = new Utils(_this.game);
        return _this;
    }
    Stone.prototype.setup = function () {
        var _a = this.card, location = _a.location, space_id = _a.location_arg;
        if (location === "realm") {
            this.stocks.realm.addCard(this.card, {}, {
                forceToElement: document.getElementById("azr_space-".concat(space_id)),
            });
        }
        else {
            this.stocks[this.player_id].gifted.addCard(this.card);
        }
        var lastPlaced = this.game.gamedatas.lastPlaced;
        if ((lastPlaced === null || lastPlaced === void 0 ? void 0 : lastPlaced.id) == this.card.id) {
            this.setLastPlaced();
        }
    };
    Stone.prototype.place = function (player_id_1, space_id_1) {
        return __awaiter(this, arguments, void 0, function (player_id, space_id, lastPlaced) {
            var isGifted, fromElement;
            if (lastPlaced === void 0) { lastPlaced = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isGifted = this.card.type === "gifted";
                        fromElement = isGifted
                            ? document.getElementById("azr_giftedStone-".concat(player_id))
                            : document.getElementById("azr_stoneIcon-".concat(player_id));
                        if (!isGifted) {
                            this.gamedatas.counters[player_id].stones.incValue(-1);
                        }
                        return [4 /*yield*/, this.stocks.realm.addCard(this.card, { fromElement: fromElement }, { forceToElement: document.getElementById("azr_space-".concat(space_id)) })];
                    case 1:
                        _a.sent();
                        if (lastPlaced) {
                            this.setLastPlaced();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Stone.prototype.remove = function (player_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.gamedatas.counters[player_id].stones.incValue(1);
                        return [4 /*yield*/, this.stocks.void.addCard(this.card)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Stone.prototype.buildTooltip = function () {
        var _a = this.gamedatas.players[this.player_id], name = _a.name, color = _a.color;
        var label = this.game.format_string_recursive(_("${player_name}'s ${common_or_gifted} stone"), {
            common_or_gifted: this.card.type === "common" ? _("common") : _("gifted"),
            player_name: name,
        });
        var opp_color = this.utils.getOppColor(color);
        var tooltip = "<div class=\"azr_tooltip azr_stoneTooltip\" style=\"--color: #".concat(color, "; --opp-color: #").concat(opp_color, "\">\n    <span>").concat(label, "</span></div>");
        return tooltip;
    };
    Stone.prototype.setLastPlaced = function () {
        var _a;
        var lastPlacedClass = "azr_stone-lastPlaced";
        (_a = document
            .querySelector(".".concat(lastPlacedClass))) === null || _a === void 0 ? void 0 : _a.classList.remove(lastPlacedClass);
        var cardElement = this.stocks.realm.getCardElement(this.card);
        cardElement.classList.add(lastPlacedClass);
    };
    return Stone;
}(StoneManager));
var WisdomManager = /** @class */ (function () {
    function WisdomManager(game) {
        this.game = game;
        this.gamedatas = this.game.gamedatas;
        this.manager = this.gamedatas.managers.wisdom;
        this.stocks = this.gamedatas.stocks.wisdom;
    }
    WisdomManager.prototype.create = function () {
        var _this = this;
        var manager = new CardManager(this.game, {
            getId: function (_a) {
                var id = _a.id;
                return "azr_wisdom-".concat(id);
            },
            setupDiv: function (_a, element) {
                var id = _a.id;
                var color = _this.gamedatas.players[id].color;
                element.classList.add("azr_stone", "azr_stone-".concat(color), "azr_wisdom");
            },
        });
        this.gamedatas.stocks.wisdom = {};
        for (var i = 1; i <= 25; i++) {
            this.gamedatas.stocks.wisdom[i] = new CardStock(manager, document.getElementById("azr_wisdomTrack-".concat(i)), {});
        }
        this.gamedatas.managers.wisdom = manager;
    };
    WisdomManager.prototype.setupStocks = function () {
        for (var p_id in this.gamedatas.players) {
            var player_id = Number(p_id);
            var scr = this.gamedatas.players[player_id].score;
            var score = Number(scr);
            if (!score) {
                continue;
            }
            this.gamedatas.stocks.wisdom[score].addCard({ id: player_id });
        }
    };
    WisdomManager.prototype.setup = function () {
        this.create();
        this.setupStocks();
    };
    WisdomManager.prototype.set = function (player_id, initialWisdom, finalWisdom) {
        return __awaiter(this, void 0, void 0, function () {
            var iconElement, card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iconElement = document.getElementById("azr_stoneIcon-".concat(player_id));
                        card = { id: player_id };
                        if (!(finalWisdom === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.stocks[initialWisdom].removeCard(card, {
                                slideTo: iconElement,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.stocks[finalWisdom].addCard(card, {
                            fromElement: initialWisdom === 0 ? iconElement : undefined,
                        })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WisdomManager;
}());
var StateManager = /** @class */ (function () {
    function StateManager(game) {
        this.game = game;
    }
    StateManager.prototype.onEntering = function (stateName, args) {
        if (stateName === "playerTurn") {
            new StPlayerTurn(this.game).enter(args);
            return;
        }
        if (!this.game.isCurrentPlayerActive()) {
            return;
        }
        switch (stateName) {
            case "birdDiscard":
                new StBirdDiscard(this.game).enter(args);
                break;
            case "gatherBountiful":
                new StGatherBountiful(this.game).enter(args);
                break;
            case "client_placeGifted":
                new StPlaceGifted(this.game).enter(args);
                break;
        }
    };
    StateManager.prototype.onLeaving = function (stateName) {
        if (!this.game.isCurrentPlayerActive()) {
            return;
        }
        switch (stateName) {
            case "playerTurn":
                new StPlayerTurn(this.game).leave();
                break;
            case "birdDiscard":
                new StBirdDiscard(this.game).leave();
                break;
            case "gatherBountiful":
                new StGatherBountiful(this.game).leave();
                break;
            case "client_placeGifted":
                new StPlaceGifted(this.game).leave();
                break;
        }
    };
    return StateManager;
}());
var StBirdDiscard = /** @class */ (function (_super) {
    __extends(StBirdDiscard, _super);
    function StBirdDiscard(game) {
        return _super.call(this, game) || this;
    }
    StBirdDiscard.prototype.enter = function (args) {
        var qiManager = new QiManager(this.game);
        qiManager.makeSelectable();
    };
    StBirdDiscard.prototype.leave = function () {
        var qiManager = new QiManager(this.game);
        qiManager.makeUnselectable();
    };
    return StBirdDiscard;
}(StateManager));
var StGatherBountiful = /** @class */ (function (_super) {
    __extends(StGatherBountiful, _super);
    function StGatherBountiful(game) {
        var _this = _super.call(this, game) || this;
        _this.utils = new Utils(_this.game);
        return _this;
    }
    StGatherBountiful.prototype.enter = function (args) {
        var giftedManager = new GiftedManager(this.game);
        giftedManager.highlight(true);
        var utils = this.utils;
        this.game.statusBar.addActionButton(_("card"), function () {
            utils.performAction("act_gatherBountiful", {
                boon: "qi",
            });
        });
        this.game.statusBar.addActionButton(_("point"), function () {
            utils.performAction("act_gatherBountiful", {
                boon: "wisdom",
            });
        });
    };
    StGatherBountiful.prototype.leave = function () {
        var giftedManager = new GiftedManager(this.game);
        giftedManager.highlight(false);
    };
    return StGatherBountiful;
}(StateManager));
var StPlayerTurn = /** @class */ (function (_super) {
    __extends(StPlayerTurn, _super);
    function StPlayerTurn(game) {
        return _super.call(this, game) || this;
    }
    StPlayerTurn.prototype.enter = function (args) {
        var _this = this;
        var _private = args._private, bonds = args.bonds;
        this.game.gamedatas.bonds = bonds;
        var spaceManager = new SpaceManager(this.game);
        spaceManager.highlightBonds();
        if (!this.game.isCurrentPlayerActive()) {
            return;
        }
        var selectableSpaces = _private.selectableSpaces, canPlayGifted = _private.canPlayGifted;
        spaceManager.makeSelectable(selectableSpaces);
        if (canPlayGifted) {
            this.game.statusBar.addActionButton(_("play gifted stone instead"), function () {
                _this.game.setClientState("client_placeGifted", {
                    descriptionmyturn: _("${you} must place your gifted stone"),
                });
            }, { color: "secondary" });
        }
    };
    StPlayerTurn.prototype.leave = function () {
        var spaceManager = new SpaceManager(this.game);
        spaceManager.makeUnselectable();
    };
    return StPlayerTurn;
}(StateManager));
var StPlaceGifted = /** @class */ (function (_super) {
    __extends(StPlaceGifted, _super);
    function StPlaceGifted(game) {
        return _super.call(this, game) || this;
    }
    StPlaceGifted.prototype.enter = function (args) {
        var _this = this;
        var _private = args._private;
        this.game.statusBar.addActionButton(_("cancel"), function () {
            _this.game.restoreServerGameState();
        }, {
            color: "alert",
        });
        var player_id = Number(this.game.getActivePlayerId());
        var spaceManager = new SpaceManager(this.game);
        spaceManager.makeSelectable(_private.selectableGifted, "act_placeGifted");
        var giftedManager = new GiftedManager(this.game);
        giftedManager.highlight(true);
        var stoneManager = new StoneManager(this.game);
        stoneManager.highlightGifted(player_id, true);
    };
    StPlaceGifted.prototype.leave = function () {
        var player_id = this.game.getActivePlayerId();
        var spaceManager = new SpaceManager(this.game);
        spaceManager.makeUnselectable();
        var giftedManager = new GiftedManager(this.game);
        giftedManager.highlight(false);
        var stoneManager = new StoneManager(this.game);
        stoneManager.highlightGifted(player_id, false);
    };
    return StPlaceGifted;
}(StateManager));
