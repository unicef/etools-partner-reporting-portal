import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {property} from '@polymer/decorators';
import Settings from '../settings';

/**
 * @polymer
 * @mixinFunction
 */
function ResponsiveMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ResponsiveClass extends baseClass {
    @property({type: String, readOnly: true})
    desktopLayoutQuery: string = Settings.layout.threshold;

    @property({type: Object})
    isDesktop: GenericObject = {
      type: Boolean
    };

    static get observers() {
      return ['_isDesktopChanged(isDesktop)'];
    }

    _isDesktopChanged() {
      this.updateStyles();
    }
  }
  return ResponsiveClass;
}

export default ResponsiveMixin;
