var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import ChipMixin from '../../mixins/chip-mixin';
import Settings from '../../settings';
import { buttonsStyles } from '../../styles/buttons-styles';
import { fireEvent } from '../../utils/fire-custom-event';
/**
* @polymer
* @customElement
* @appliesMixin ChipMixin
*/
class ChipDateOfReport extends ChipMixin(PolymerElement) {
    constructor() {
        super(...arguments);
        this.dateFormat = Settings.dateFormat;
    }
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles}
    <style include="iron-flex iron-flex-reverse">
      :host {
        display: block;

        --default-primary-color: var(--theme-primary-color);

        --paper-dialog: {
          width: auto;
          max-width: none !important; /* :( */
          max-height: none !important; /* :( */
          margin: 0;
        }

      }

      .add-chip {
        text-decoration: none;
        color: var(--theme-primary-color);
      }

      .buttons {
        padding: 10px;
      }
    </style>

    <a
        id="add"
        class="add-chip"
        on-tap="_open"
        href="#">
      &plus; Add
    </a>

     <paper-dialog
        id="dialog"
        class="paper-date-picker-dialog"
        opened="{{_adding}}"
        horizontal-align="right"
        vertical-align="bottom">

      <datepicker-lite
        id="picker"
        value="{{_date}}"
        min-date="[[minDate]]"
        selected-date-display-format="[[dateFormat]]">
      </datepicker-lite>

      <div class="buttons layout horizontal-reverse">
        <paper-button
            class="btn-primary"
            on-tap="_add">
          Add
        </paper-button>

        <paper-button
            on-tap="_close">
          Cancel
        </paper-button>
      </div>
    </paper-dialog>
  `;
    }
    _add() {
        const formatted = moment(this._date).format(this.dateFormat);
        fireEvent(this, 'chip-add', formatted);
        this._close();
    }
    _setDefaults(adding) {
        if (!adding) {
            return;
        }
        const today = new Date();
        this.set('_date', moment(today < this.minDate ? this.minDate : today).format(Settings.datepickerFormat));
    }
    connectedCallback() {
        super.connectedCallback();
        this.$.dialog.positionTarget = this.$.add;
    }
}
__decorate([
    property({ type: String })
], ChipDateOfReport.prototype, "_date", void 0);
__decorate([
    property({ type: Date })
], ChipDateOfReport.prototype, "minDate", void 0);
__decorate([
    property({ type: String })
], ChipDateOfReport.prototype, "dateFormat", void 0);
window.customElements.define('chip-date-of-report', ChipDateOfReport);
