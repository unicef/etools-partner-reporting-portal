import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import {property} from '@polymer/decorators';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {PaperDialogElement} from '@polymer/paper-dialog';

/**
 * @polymer
 * @mixinFunction
 */
function ModalMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ModalClass extends baseClass {
    @property({type: Boolean, notify: true})
    opened!: boolean;

    _adjustPositionDebouncer!: Debouncer | null;

    close() {
      this.set('opened', false);
    }

    open() {
      this.set('opened', true);
    }

    adjustPosition(e: CustomEvent) {
      if (!e) {
        return;
      }
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      this._adjustPositionDebouncer = Debouncer.debounce(this._adjustPositionDebouncer, timeOut.after(100), () => {
        (this.$.dialog as PaperDialogElement).refit();
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._adjustPositionDebouncer && this._adjustPositionDebouncer.isActive()) {
        this._adjustPositionDebouncer.cancel();
      }
    }
  }

  return ModalClass;
}

export default ModalMixin;
