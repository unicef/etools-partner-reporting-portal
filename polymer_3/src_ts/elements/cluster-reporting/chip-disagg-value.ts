import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import ChipMixin from '../../mixins/chip-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {fireEvent} from '../../utils/fire-custom-event';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

/**
 * @polymer
 * @customElement
 * @appliesMixin ChipMixin
 * @appliesMixin LocalizeMixin
 */
class ChipDisaggValue extends ChipMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
      ${buttonsStyles}
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;

          --paper-dialog: {
            width: 175px;
            max-width: none !important;
            padding: 10px;
            margin: 0;
          }

          --paper-input-container: {
            padding: 0;
          }
        }

        .add-chip {
          text-decoration: none;
          color: var(--theme-primary-color);
        }

        .row:not(:last-child) {
          margin-bottom: 0.5em;
        }

        paper-input {
          width: 100%;
        }

        paper-button {
          margin: 0;
        }
      </style>

      <a id="add" class="add-chip" on-tap="_open" href="#">
        &plus; [[localize('add')]]
      </a>

      <paper-dialog id="dialog" opened="{{_adding}}" horizontal-align="left" vertical-align="top">
        <div class="row layout horizontal">
          <paper-input
            id="field"
            value="{{_value}}"
            on-keyup="_handleKeyup"
            maxlength="128"
            no-label-float
            required
            autofocus
          >
          </paper-input>
        </div>
        <div class="row layout horizontal justified">
          <paper-button on-tap="_add" class="btn-primary">
            [[localize('add')]]
          </paper-button>

          <paper-button on-tap="_close">
            [[localize('cancel')]]
          </paper-button>
        </div>
      </paper-dialog>
    `;
  }

  @property({type: String})
  _value!: string;

  @property({type: String, computed: '_computeFormattedValue(_value)'})
  _formattedValue!: string;

  _setDefaults(adding: any) {
    if (!adding) {
      return;
    }

    this.set('_value', '');
  }

  _add() {
    (this.$.field as PaperInputElement)!.validate();

    if ((this.$.field as PaperInputElement).invalid) {
      return;
    }

    if (!this._formattedValue.length) {
      (this.$.field as PaperInputElement).invalid = true;

      return;
    }

    fireEvent(this, 'chip-add', this._formattedValue);
    this._close();
  }

  _computeFormattedValue(value: string) {
    return value.trim();
  }

  _handleKeyup(e: CustomEvent) {
    const key = (e as any).which;

    if (key === 13) {
      this._add();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    (this.$.dialog as PaperDialogElement).positionTarget = this.$.add;
  }
}

window.customElements.define('chip-disagg-value', ChipDisaggValue);
