import {PolymerElement} from '@polymer/polymer';
import UtilsMixin from '../mixins/utils-mixin';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../typings/globals.types';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpReset extends UtilsMixin(PolymerElement) {
  @property({type: Object, notify: true})
  reset!: GenericObject;

  @property({type: Boolean})
  skipInitial = false;

  @property({type: Boolean})
  isInitial = true;

  @property({type: String, observer: '_trigerred'})
  trigger!: string;

  private _debouncer: Debouncer | null = null;

  _trigerred() {
    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(10), () => {
      if (this.get('skipInitial') && this.get('isInitial')) {
        this.set('isInitial', false);

        return;
      }
      this.set('reset', undefined);
    });
  }
}

window.customElements.define('etools-prp-reset', EtoolsPrpReset);
