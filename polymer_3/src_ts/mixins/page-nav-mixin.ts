import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function PageNavMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class PageNavClass extends baseClass {
    static get observers() {
      return ['_selectedChanged(selected)'];
    }

    public _selectedChanged() {
      setTimeout(() => {
        const normalMenuItemOpened = this.shadowRoot!.querySelectorAll('.nav-menu-item.iron-selected').length > 0;
        // @ts-ignore
        this.subMenuOpened = !normalMenuItemOpened;
      }, 200);
    }
  }
  return PageNavClass;
}

export default PageNavMixin;
