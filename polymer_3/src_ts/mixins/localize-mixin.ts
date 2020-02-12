import {Constructor, GenericObject} from '../typings/globals.types';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../ReduxConnectedElement';

/**
 * @polymer
 * @mixinFunction
 */
function LocalizeMixin<T extends Constructor<ReduxConnectedElement>>(baseClass: T) {
  class LocalizeClass extends baseClass {

    //DONE statePath: 'localize.language'
    @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
    language!: string;

    //DONE statePath: 'localize.resources'
    @property({type: Object, computed: 'getReduxStateArray(rootState.localize.resources)'})
    resources!: GenericObject;

    localize(text: string) {
      return this.capitalize(text.split('_').join(' '));
    }

    capitalize(s: string) {
      if (typeof s !== 'string') return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
    }

  }

  return LocalizeClass;
}

export default LocalizeMixin;

