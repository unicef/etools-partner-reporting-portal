import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-input/paper-input';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import DisaggregationFieldMixin from '../../mixins/disaggregation-field-mixin';
import {fireEvent} from '../../utils/fire-custom-event';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationFieldMixin
 */
class DisaggregationField extends DisaggregationFieldMixin(ReduxConnectedElement) {
  public static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;

          --paper-input-container: {
            padding: 0;
          }

          --paper-input-container-input: {
            font-size: 13px;
          }

          --paper-input-container-input-webkit-spinner: {
            display: none;
          }
        }
      </style>

      <paper-input
        id="field"
        value="[[value]]"
        allowed-pattern="^\\d*\\.?\\d*$"
        invalid="{{invalid}}"
        validator="[[validator]]"
        min="[[min]]"
        on-value-changed="_inputValueChanged"
        no-label-float
        required
      >
      </paper-input>
    `;
  }

  @property({type: String})
  key!: string;

  @property({type: String})
  coords!: string;

  @property({type: String})
  validator!: string;

  @property({type: Number})
  min!: number;

  @property({type: Number, notify: true})
  value!: number;

  @property({type: Boolean, notify: true})
  invalid!: boolean;

  connectedCallback() {
    super.connectedCallback();

    (this.$.field as PaperInputElement).validate();
    fireEvent(this, 'register-field', this);
  }

  validate() {
    return (this.$.field as PaperInputElement).validate();
  }

  getField() {
    return this.$.field;
  }

  _inputValueChanged(e: CustomEvent) {
    const change: GenericObject = {};

    change[this.key] = (e.target as any).value;

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: this._toNumericValues(change)
    });
  }
}

window.customElements.define('disaggregation-field', DisaggregationField);

export {DisaggregationField as DisaggregationFieldEl};
