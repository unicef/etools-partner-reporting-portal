import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-input/paper-input';
import DisaggregationMixin from '../../mixins/disaggregations-mixin';
import {fireEvent} from '../../utils/fire-custom-event';
//<link rel="import" href="../../behaviors/disaggregation-field.html">


/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 */
class DisaggregationField extends DisaggregationMixin(ReduxConnectedElement) {
  public static get template() {
    // language=HTML
    return html`
     <style>
      :host {
        display: block;

        --paper-input-container: {
          padding: 0;
        };

        --paper-input-container-input: {
          font-size: 13px;
        };

        --paper-input-container-input-webkit-spinner: {
          display: none;
        };
      }
    </style>

    <paper-input
        id="field"
        value="[[value]]"
        allowed-pattern="^\d*\.?\d*$"
        invalid="{{invalid}}"
        validator="[[validator]]"
        min="[[min]]"
        on-value-changed="_inputValueChanged"
        no-label-float
        required
        auto-validate>
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


  ready() {
    this.$.field.validate();
  };

  attached() {
    this.$.field.validate();
    fireEvent(this, 'register-field', this);
  };

  detached() {
  }

  // Cant deregister fields in lifecycle hooks due to:
  // https://github.com/Polymer/polymer/issues/1159
  // :( :( :(
  //
  // detached: function () {}

  validate() {
    return this.$.field.validate();
  };

  getField() {
    return this.$.field;
  };

  _inputValueChanged(e: CustomEvent) {
    var change = {};

    change[this.key] = e.target.value;

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: this._toNumericValues(change),
    });
  };

}

window.customElements.define('disaggregation-field', DisaggregationField);
