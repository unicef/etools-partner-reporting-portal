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
    @property({type: String, computed: 'getReduxStateValue(state.localize.language)'})
    language!: string;

    //DONE statePath: 'localize.resources'
    @property({type: Object, computed: 'getReduxStateArray(state.localize.resources)'})
    resources!: GenericObject;

  }

  return LocalizeClass;
}

export default LocalizeMixin;

