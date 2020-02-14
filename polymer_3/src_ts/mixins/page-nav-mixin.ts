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

    public _selectedChanged(selected: any) {
      const self = this;
      setTimeout(function() {
        self.shadowRoot!.querySelectorAll('paper-submenu').forEach((submenu: any) => {
          let isSelected = !!self.shadowRoot.querySelector('[name="' + selected + '"]');

          switch (true) {
            case !submenu.opened && isSelected:
              submenu.open();
              break;
            case submenu.opened && !isSelected:
              submenu.close();
              break;
            default:
              // Do nothing
              break;
          }
        });
      }, 200);
    }

    connectedCallback() {
      super.connectedCallback();

      // Don't toggle submenus
      this.shadowRoot!.querySelectorAll('.menu-trigger').forEach((trigger: any) => {
        trigger.addEventListener('tap', function(e: CustomEvent) {
          if (trigger.parentNode.opened) {
            e.stopPropagation();
          }
        });
      });
    }

  }
  return PageNavClass;
}

export default PageNavMixin;
