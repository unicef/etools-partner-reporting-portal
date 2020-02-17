import {Constructor, GenericObject} from '../typings/globals.types';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';
import '@polymer/iron-ajax/iron-ajax.js';
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
      requests: {}, /* One iron-request per unique resources path. */
      messages: {}, /* Unique localized strings. Invalidated when the language,
                      formats or resources change. */
      ajax: null    /* Global iron-ajax object used to request resource files. */
    }

    @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
    language!: string;

    @property({type: Object, computed: 'getReduxStateObject(rootState.localize.resources)'})
    resources!: GenericObject;

    @property({type: Object})
    formats = {};

    @property({type: Boolean})
    useKeyIfMissing = false;

    @property({type: Function, computed: '__computeLocalize(language, resources, formats)'})
    localize!: Function;

    @property({type: Boolean})
    bubbleEvent = false;

    loadResources(path: string) {
      const proto = this.constructor.prototype;

      // Check if localCache exist just in case.
      this.__checkLocalizationCache(proto);

      // If the global ajax object has not been initialized, initialize and cache it.
      let ajax = proto.__localizationCache.ajax;
      if (!ajax) {
        ajax = proto.__localizationCache.ajax =
          document.createElement('iron-ajax');
      }

      let request = proto.__localizationCache.requests[path];
      const self = this;
      function onRequestResponse(event: GenericObject) {
        self.__onRequestResponse(event);
      }

      if (!request) {
        ajax.url = path;
        request = ajax.generateRequest();

        request.completes.then(
          onRequestResponse.bind(this), this.__onRequestError.bind(this));

        // Cache the instance so that it can be reused if the same path is loaded.
        proto.__localizationCache.requests[path] = request;
      } else {
        request.completes.then(
          onRequestResponse.bind(this), this.__onRequestError.bind(this));
      }
    }

    /**
     Returns a computed `localize` method, based on the current `language`.
     */
    __computeLocalize(language?: string, resources?: GenericObject, formats?: any) {
      const proto = this.constructor.prototype;

      // Check if localCache exist just in case.
      this.__checkLocalizationCache(proto);

      // Everytime any of the parameters change, invalidate the strings cache.
      if (!proto.__localizationCache) {
        proto['__localizationCache'] = {requests: {}, messages: {}, ajax: null};
      }
      proto.__localizationCache.messages = {};
      const self = this;

      return function() {
        const key = arguments[0];
        if (!key || !resources || !language || !resources[language])
          return;

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

        let args: GenericObject = {};
        for (let i = 1; i < arguments.length; i += 2) {
          args[arguments[i]] = arguments[i + 1];
        }

        return translatedMessage.format(args);
      }.bind(this);
    }

    __onRequestResponse(event: GenericObject) {
      this.reduxStore.dispatch(setL11NResources(event.response));
      fireEvent(this, 'app-localize-resources-loaded', event);
    }

    __onRequestError(event: CustomEvent) {
      fireEvent(this, 'app-localize-resources-error', event);
    }

    __checkLocalizationCache(proto?: any) {
      // do nothing if proto is undefined.
      if (proto === undefined)
        return;

      // In the event proto not have __localizationCache object, create it.
      if (proto['__localizationCache'] === undefined) {
        proto['__localizationCache'] = {requests: {}, messages: {}, ajax: null};
      }
    }

  }

  return LocalizeClass;
}

export default LocalizeMixin;

