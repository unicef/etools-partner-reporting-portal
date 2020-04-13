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

    // @ts-ignore
    public _selectedChanged(selected: string) {
      const self = this;
      setTimeout(function() {
        const normalMenuItemOpened = self.shadowRoot!.querySelectorAll(".nav-menu-item.iron-selected").length > 0;
        // @ts-ignore
        self.subMenuOpened = !normalMenuItemOpened;
      }, 200);
    }


  }
  return PageNavClass;
}

export default PageNavMixin;
