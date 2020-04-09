import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input';
import {property} from '@polymer/decorators';
import FilterMixin from '../../../mixins/filter-mixin';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {fireEvent} from '../../../utils/fire-custom-event';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 */
class TextFilter extends FilterMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <paper-input
        id="field"
        type="[[type]]"
        label="[[label]]"
        value="[[value]]"
        on-value-changed="_filterValueChanged"
        always-float-label>
    </paper-input>
  `;
  }

  @property({type: String})
  properties!: string;

  @property({type: String})
  type = 'text';

  private _debouncer!: Debouncer;

  _filterValueChanged() {
    const self = this;
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(250),
      function propagateChange() {
        if ((self.$.field as PaperInputElement).value) {
          const newValue = (self.$.field as PaperInputElement).value!.trim();

          if (newValue !== self.lastValue) {
            fireEvent(self, 'filter-changed', {
              name: self.name,
              value: newValue
            });
          }
        }
      });
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

window.customElements.define('text-filter', TextFilter);
