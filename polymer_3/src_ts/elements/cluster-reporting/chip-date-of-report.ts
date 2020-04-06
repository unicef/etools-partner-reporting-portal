import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import ChipMixin from '../../mixins/chip-mixin';
import dateFormat from '../../settings';
import {buttonsStyles} from '../../styles/buttons-styles';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';
declare const moment: any;

/**
* @polymer
* @customElement
* @appliesMixin ChipMixin
*/
class ChipDateOfReport extends ChipMixin(PolymerElement) {
  public static get template() {
    // language=HTML
    return html`
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
        min-date="[[minDate]]">
      </datepicker-lite>

      <!--
      <paper-date-picker
          id="picker"
          date="{{_date}}"
          min-date="[[minDate]]"
          force-narrow>
      </paper-date-picker>
      -->

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

  @property({type: Object})
  _date!: GenericObject;

  @property({type: Date})
  minDate!: Date;


  _add() {
    var formatted = moment(this._date).format(dateFormat);

    fireEvent(this, 'chip-add', formatted);
    this._close();
  }

  _setDefaults(adding: any) {
    var today;

    if (!adding) {
      return;
    }

    today = new Date();

    this.set('_date', today < this.minDate ? this.minDate : today);
  }

  connectedCallback() {
    super.connectedCallback();

    (this.$.dialog as PaperDialogElement).positionTarget = this.$.add;
  }

}

window.customElements.define('chip-date-of-report', ChipDateOfReport);
