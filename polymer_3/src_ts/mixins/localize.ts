import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function LocalizeMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class LocalizeClass extends baseClass {

    //statePath: 'localize.language'
    @property({type: String})
    language!: string;

    //statePath: 'localize.resources'
    @property({type: Object})
    resources!: GenericObject;

  }
  return LocalizeClass;
}

export default LocalizeMixin;

