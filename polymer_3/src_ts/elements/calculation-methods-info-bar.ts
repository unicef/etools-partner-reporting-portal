import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-button/paper-button.js';
import './calculation-methods-demo-modal.js';
import {CalculationMethodsDemoModalEl} from './calculation-methods-demo-modal';
import LocalizeMixin from '../mixins/localize-mixin';

//(dci)
// < link rel = "import" href = "../styles/buttons.html" >
// <link rel="import" href = "../redux/store.html" >
// <link rel="import" href = "../redux/actions/localize.html" >
// behaviors: [
//   App.Behaviors.ReduxBehavior,
//   App.Behaviors.LocalizeBehavior,
//   Polymer.AppLocalizeBehavior,
// ],

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class CalculationMethodsInfoBar extends LocalizeMixin(PolymerElement) {

  static get template() {
    return html`
    <style include="button-styles data-table-styles table-styles iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        background: #FCFCFC;
        padding: 16px;
        margin-bottom: 25px;
      }

      iron-icon {
        color: var(--paper-grey-600);
      }

      span {
        color: var(--paper-grey-600);
      }

      iron-icon {
        margin-right: 5px;
      }

      .buttons {
        margin: 1em 0;
      }
    </style>
    <div class="layout horizontal justified center-aligned">
      <div class="layout horizontal center-center">
        <iron-icon icon="icons:info"></iron-icon>
        <span>[[localize('to_help_you_decide')]]:</span>
      </div>
      <div>
        <paper-button id="locations" on-tap="_openLocationsModal" class="btn-primary">
          [[localize('across_locations')]]
        </paper-button>

        <paper-button id="periods" on-tap="_openPeriodsModal" class="btn-primary">
          [[localize('across_reporting_periods')]]
        </paper-button>
      </div>
    </div>
    <calculation-methods-demo-modal id="locations-modal" domain="locations" items=3>
    </calculation-methods-demo-modal>
    <calculation-methods-demo-modal id="periods-modal" domain="reporting periods" items=2>
    </calculation-methods-demo-modal>

  `;
  }

  _openLocationsModal() {
    (this.shadowRoot!.querySelector('#locations-modal') as CalculationMethodsDemoModalEl).open();
  }

  _openPeriodsModal() {
    (this.shadowRoot!.querySelector('#periods-modal') as CalculationMethodsDemoModalEl).open();
  }

}
window.customElements.define('calculation-methods-info-bar', CalculationMethodsInfoBar);

export {CalculationMethodsInfoBar as CalculationMethodsInfoBarEl};
