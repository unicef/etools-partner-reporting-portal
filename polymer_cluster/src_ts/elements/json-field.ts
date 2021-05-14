import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import './labelled-item';
import {GenericObject} from '../typings/globals.types';
import UtilsMixin from '../mixins/utils-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class JsonField extends UtilsMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="app-grid-style">
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 16px;
          --app-grid-item-height: auto;

          --labelled-item-label: {
            position: relative;
            top: 1px;

            @apply --json-field-label;
          }
        }

        .app-grid {
          margin: -var(--app-grid-gutter);
          position: relative;
        }

        .app-grid::before {
          content: '/';
          position: absolute;
          left: 50%;
          top: 27px;
          color: var(--theme-secondary-text-color);
          transform: translateX(-50%);
        }

        labelled-item {
          padding-top: 8px;
        }

        paper-input.item {
          margin-top: -8px;
        }
      </style>

      <template is="dom-if" if="[[!isRatio]]" restamp="true">
        <paper-input
          class="validate"
          label="[[label]]"
          value="[[value.v]]"
          on-input="_onInput"
          data-field="v"
          type="number"
          allowed-pattern="[[allowedPattern]]"
          required="[[required]]"
          disabled="[[disabled]]"
          no-label-float="[[hideLabel]]"
          always-float-label="[[!hideLabel]]"
        >
        </paper-input>
      </template>

      <template is="dom-if" if="[[isRatio]]" restamp="true">
        <labelled-item label="[[label]]">
          <div class="app-grid">
            <paper-input
              class="item validate"
              value="[[value.v]]"
              on-input="_onInput"
              data-field="v"
              type="number"
              allowed-pattern="[[allowedPattern]]"
              required="[[_computeRequired(required, value, 'd')]]"
              disabled="[[disabled]]"
              placeholder="Numerator"
              no-label-float
            >
            </paper-input>

            <paper-input
              class="item validate"
              value="[[value.d]]"
              on-input="_onInput"
              data-field="d"
              type="number"
              allowed-pattern="[[allowedPattern]]"
              required="[[_computeRequired(required, value, 'v')]]"
              disabled="[[_computeDisabled(disabled, disableDenominator)]]"
              placeholder="Denominator"
              no-label-float
            >
            </paper-input>
          </div>
        </labelled-item>
      </template>
    `;
  }

  @property({type: String})
  allowedPattern!: string;

  @property({type: String})
  label!: string;

  @property({type: String})
  type!: string;

  @property({type: Boolean})
  disableDenominator = false;

  @property({type: Boolean})
  required = false;

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  hideLabel = false;

  @property({type: Object, notify: true})
  value!: GenericObject;

  @property({type: Boolean, computed: '_computeIsRatio(type)', observer: '_resetDenominator'})
  isRatio = false;

  @property({type: Boolean, notify: true, computed: '_computeInvalid(required, isRatio, value)'})
  invalid = false;

  _computeDisabled(disabled: boolean, disableDenominator: boolean) {
    return disabled || disableDenominator;
  }

  validate() {
    this._fieldsAreValid();
  }

  _onInput(e: CustomEvent) {
    const change: GenericObject = {};

    change[(e.target as any).dataset.field] = (e.target as any)!.value;

    this.set('value', Object.assign({}, this.get('value'), change));
  }

  _computeIsRatio(type: string) {
    return type === 'ratio';
  }

  _computeInvalid(required: boolean, isRatio: boolean, value: GenericObject) {
    if (!value) {
      return true;
    }

    if (required) {
      if (isRatio) {
        return typeof value.v === 'undefined' || typeof value.d === 'undefined';
      } else {
        return typeof value.v === 'undefined';
      }
    } else {
      if (isRatio) {
        return typeof value.v !== 'undefined' ? typeof value.d === 'undefined' : typeof value.d !== 'undefined'; // xor
      } else {
        return false;
      }
    }
  }

  _resetDenominator(isRatio: boolean) {
    if (isRatio) {
      return;
    }

    const newValue = Object.assign({}, this.get('value'));

    delete newValue.d;

    this.set('value', newValue);
  }

  _computeRequired(required: boolean, value: GenericObject, key: string) {
    // May not be required yet still we need a valid value.
    return required || (value ? !!value[key] : false);
  }

  _onValueChanged(e: CustomEvent) {
    e.stopPropagation();
  }

  _addEventListeners() {
    this._onValueChanged = this._onValueChanged.bind(this);
    this.addEventListener('value-changed', this._onValueChanged as any);
  }

  _removeEventListeners() {
    this.removeEventListener('value-changed', this._onValueChanged as any);
  }

  connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }
}
window.customElements.define('json-field', JsonField);

export {JsonField as JsonFieldEl};
