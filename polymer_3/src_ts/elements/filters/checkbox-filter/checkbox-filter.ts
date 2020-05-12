import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox';
import UtilsMixin from '../../../mixins/utils-mixin';
import FilterMixin from '../../../mixins/filter-mixin';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {property} from '@polymer/decorators';
import {fireEvent} from '../../../utils/fire-custom-event';
import {timeOut} from '@polymer/polymer/lib/utils/async';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 */
class CheckboxFilter extends UtilsMixin(FilterMixin(PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      ::slotted() .checkbox-label {
        font-size: 12px;
      }
    </style>

    <paper-checkbox
        id="field"
        name="[[name]]"
        checked="{{checked}}"
        on-tap="_handleInput">
      <slot></slot>
    </paper-checkbox>
  `;
  }

  @property({type: Boolean, notify: true, computed: '_computeChecked(value)'})
  checked!: boolean;

  @property({type: String})
  value: string = '';

  private _debouncer!: Debouncer;

  _handleInput() {
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(250),
      () => {
        const newValue = this._toNumber((this.$.field as any).checked);

        if (newValue !== parseInt(this.lastValue)) {
          fireEvent(this, 'filter-changed', {
            name: this.name,
            value: newValue.toString()
          });
        }
      });
  }

  _computeChecked(value: string) {
    return value ? !!this._toNumber(value) : false;
  }

  connectedCallback() {
    super.connectedCallback();

    this._filterReady();
  }

  disconnectedCallback() {
    super.connectedCallback();

    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }
}

window.customElements.define('checkbox-filter', CheckboxFilter);

export {CheckboxFilter as CheckboxFilterEl};
