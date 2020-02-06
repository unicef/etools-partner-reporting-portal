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
      setTimeout(function() {
        this._forEach('paper-submenu', function(submenu) {
          let isSelected = !!this.shadowRoot.querySelector('[name="' + selected + '"]');

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
      });
    }

    public attached() {
      // Don't toggle submenus
      this._forEach('.menu-trigger', function(trigger) {
        trigger.addEventListener('tap', function(e) {
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
