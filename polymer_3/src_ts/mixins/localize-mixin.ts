import {Constructor, GenericObject} from '../typings/globals.types';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';
import {setL11NResources} from '../redux/actions';
import IntlMessageFormat from 'intl-messageformat';

/**
 * @polymer
 * @mixinFunction
 * Mixin it's based on the logic from https://github.com/rpapeters/app-localize-behavior which was used in the previous version of PRP,
 * it requires this package to be installed: https://www.npmjs.com/package/intl-messageformat
 */
function LocalizeMixin<T extends Constructor<ReduxConnectedElement>>(baseClass: T) {
  class LocalizeClass extends baseClass {
    __localizationCache = {
      messages: {} /* Unique localized strings. Invalidated when the language,
                      formats or resources change. */
    };

    @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
    language!: string;

    @property({type: Object, computed: 'getReduxStateObject(rootState.localize.resources)'})
    resources!: GenericObject;

    @property({type: Object})
    formats = {};

    @property({type: Boolean})
    useKeyIfMissing = false;

    @property({type: Object, computed: '__computeLocalize(language, resources, formats)'})
    localize!: (x: string) => string;

    @property({type: Boolean})
    bubbleEvent = false;

    /**
     Returns a computed `localize` method, based on the current `language`.
     */
    __computeLocalize(language?: string, resources?: GenericObject, formats?: any) {
      const proto = this.constructor.prototype;

      // Everytime any of the parameters change, invalidate the strings cache.
      if (!proto.__localizationCache) {
        proto['__localizationCache'] = {messages: {}};
      }
      proto.__localizationCache.messages = {};

      return (...args: any[]) => {
        const key = args[0];
        if (!key || !resources || !language || !resources[language]) {
          return;
        }

        // Cache the key/value pairs for the same language, so that we don't
        // do extra work if we're just reusing strings across an application.
        const translatedValue = resources[language][key];

        if (!translatedValue) {
          return this.useKeyIfMissing ? key : '';
        }

        const messageKey = key + translatedValue;
        let translatedMessage = proto.__localizationCache.messages[messageKey];

        if (!translatedMessage) {
          translatedMessage = new IntlMessageFormat(translatedValue, language, formats);
          proto.__localizationCache.messages[messageKey] = translatedMessage;
        }

        const argsChanged: GenericObject = {};
        for (let i = 1; i < args.length; i += 2) {
          argsChanged[args[i]] = args[i + 1];
        }

        return translatedMessage.format(argsChanged);
      };
    }

    dispatchResources(locales: GenericObject) {
      this.reduxStore.dispatch(setL11NResources(locales));
      fireEvent(this, 'app-localize-resources-loaded', event);
    }
  }

  return LocalizeClass;
}

export default LocalizeMixin;
