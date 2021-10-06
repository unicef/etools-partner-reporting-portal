var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
import { fireEvent } from '../utils/fire-custom-event';
import { setL11NResources } from '../redux/actions';
import IntlMessageFormat from 'intl-messageformat';
/**
 * @polymer
 * @mixinFunction
 * Mixin it's based on the logic from https://github.com/rpapeters/app-localize-behavior which was used in the previous version of PRP,
 * it requires this package to be installed: https://www.npmjs.com/package/intl-messageformat
 */
function LocalizeMixin(baseClass) {
    class LocalizeClass extends baseClass {
        constructor() {
            super(...arguments);
            this.__localizationCache = {
                messages: {} /* Unique localized strings. Invalidated when the language,
                                formats or resources change. */
            };
            this.formats = {};
            this.useKeyIfMissing = false;
            this.bubbleEvent = false;
        }
        /**
         Returns a computed `localize` method, based on the current `language`.
         */
        __computeLocalize(language, resources, formats) {
            const proto = this.constructor.prototype;
            // Everytime any of the parameters change, invalidate the strings cache.
            if (!proto.__localizationCache) {
                proto['__localizationCache'] = { messages: {} };
            }
            proto.__localizationCache.messages = {};
            const self = this;
            return function () {
                const key = arguments[0];
                if (!key || !resources || !language || !resources[language]) {
                    return;
                }
                // Cache the key/value pairs for the same language, so that we don't
                // do extra work if we're just reusing strings across an application.
                const translatedValue = resources[language][key];
                if (!translatedValue) {
                    return self.useKeyIfMissing ? key : '';
                }
                const messageKey = key + translatedValue;
                let translatedMessage = proto.__localizationCache.messages[messageKey];
                if (!translatedMessage) {
                    translatedMessage =
                        new IntlMessageFormat(translatedValue, language, formats);
                    proto.__localizationCache.messages[messageKey] = translatedMessage;
                }
                const args = {};
                for (let i = 1; i < arguments.length; i += 2) {
                    args[arguments[i]] = arguments[i + 1];
                }
                return translatedMessage.format(args);
            }.bind(this);
        }
        dispatchResources(locales) {
            this.reduxStore.dispatch(setL11NResources(locales));
            fireEvent(this, 'app-localize-resources-loaded', event);
        }
    }
    __decorate([
        property({ type: String, computed: 'getReduxStateValue(rootState.localize.language)' })
    ], LocalizeClass.prototype, "language", void 0);
    __decorate([
        property({ type: Object, computed: 'getReduxStateObject(rootState.localize.resources)' })
    ], LocalizeClass.prototype, "resources", void 0);
    __decorate([
        property({ type: Object })
    ], LocalizeClass.prototype, "formats", void 0);
    __decorate([
        property({ type: Boolean })
    ], LocalizeClass.prototype, "useKeyIfMissing", void 0);
    __decorate([
        property({ type: Object, computed: '__computeLocalize(language, resources, formats)' })
    ], LocalizeClass.prototype, "localize", void 0);
    __decorate([
        property({ type: Boolean })
    ], LocalizeClass.prototype, "bubbleEvent", void 0);
    return LocalizeClass;
}
export default LocalizeMixin;
