import {html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input'
import Endpoints from "../../../endpoints";
import FilterMixin from '../../../mixins/filter-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';

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

  _filterValueChanged() {
    this._debouncer = Polymer.Debouncer.debounce('input',
      Polymer.Async.timeOut.after(250),
      function propagateChange() {
        if (this.$.field.value) {
          var newValue = this.$.field.value.trim();

          if (newValue !== this.lastValue) {
            this.fire('filter-changed', {
              name: this.name,
              value: newValue,
            });
          }
        }
      }, this._debounceDelay);
  };

  attached() {
    this._filterReady();
  };

  detached() {
    if (Debouncer.isActive('input')) {
      Debouncer.cancel('input');
    }
  };
}

window.customElements.define('text-filter', TextFilter);
