import {PolymerElement} from '@polymer/polymer';
import UtilsMixin from '../mixins/utils-mixin';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpReset extends (UtilsMixin(PolymerElement)){

  @property({type: Object, notify: true})
  reset!: GenericObject;

  @property({type: Boolean})
  skipInitial: boolean = false;

  @property({type: Boolean})
  isInitial: boolean = true;

  @property({type: String, observer: '_trigerred'})
  trigger!: string;

  _trigerred() {

    Debouncer.debounce( this.trigger, () => {
      if (this.get('skipInitial') && this.get('isInitial')) {
        this.set('isInitial', false);

        return;
      }

      this.set('reset', undefined);
    }, 10);
  }

}

export default EtoolsPrpReset;
