import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import {IronOverlayBackdropElement} from '@polymer/iron-overlay-behavior/iron-overlay-backdrop';

/**
 * @polymer
 * @mixinFunction
 */
function OverlayHelperMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class OverlayHelperClass extends baseClass {
    tagsToExclude = ['CHIP-DISAGG-VALUE', 'CHIP-DATE-OF-REPORT', 'MESSAGE-IMO-MODAL'];

    connectedCallback() {
      super.connectedCallback();
      this._addOverlayEventListeners();
    }

    _addOverlayEventListeners() {
      this.addEventListener('iron-overlay-opened', this._dialogOpening as any);
      this.addEventListener('iron-overlay-closed', this._dialogClosing as any);
    }

    _dialogOpening(event: CustomEvent & any) {
      const dialogOverlays = document.querySelectorAll('iron-overlay-backdrop[opened]');
      if (!dialogOverlays.length) {
        return;
      }

      // in order to see correctly the profile dialog, must set zIndex to 100 (as in app-header elements)
      const paths = event.path || [{id: ''}];
      const zIndex = paths[0].id === 'userProfileDialog' ? '100' : (dialogOverlays[0] as any).style.zIndex;
      this._closeOverlays(dialogOverlays);

      if (this.$.drawer) {
        (this.$.drawer as any).style.zIndex = '0';
      }
      const pageOverlay = this.$.pageOverlay as IronOverlayBackdropElement;
      if (!pageOverlay.classList.contains('opened')) {
        pageOverlay.style.zIndex = zIndex;
        pageOverlay.classList.add('opened');
      }
    }

    _dialogClosing(event: CustomEvent & any) {
      this._closeOverlays(document.querySelectorAll('iron-overlay-backdrop[opened]'));

      const paths = event.path || [];
      if (paths.length) {
        if (
          paths[0].tagName.toLowerCase().indexOf('dropdown') > -1 ||
          paths.filter((x: any) => this.tagsToExclude.includes(x.tagName)).length
        ) {
          return;
        }
      }
      // edge
      if (event.__target && event.__target.is && event.__target.is.toLowerCase().indexOf('dropdown') > -1) {
        return;
      }

      const pageOverlay = this.$.pageOverlay as IronOverlayBackdropElement;
      pageOverlay.style.zIndex = '';
      pageOverlay.classList.remove('opened');
      if (this.$.drawer) {
        (this.$.drawer as any).style.zIndex = '1';
      }
    }

    _closeOverlays(overlays: NodeListOf<Element>) {
      Array.from(overlays || []).forEach((overlay) => {
        if (overlay.parentElement) {
          overlay.parentElement.removeChild(overlay);
        }
      });
    }
  }
  return OverlayHelperClass;
}

export default OverlayHelperMixin;
