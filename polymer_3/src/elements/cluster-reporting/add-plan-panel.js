import { html, PolymerElement } from '@polymer/polymer';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import { buttonsStyles } from '../../styles/buttons-styles';
import './add-response-plan-modal';
/**
 * @polymer
 * @customElement
 */
class AddPlanPanel extends PolymerElement {
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles}
     <style include="iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        background: #FCFCFC;
        padding: 15px;
        margin-bottom: 10px;
      }

      span {
        color: var(--paper-grey-600);
      }

    </style>
    <div class="layout horizontal justified center-aligned">
      <div class="layout horizontal center-center">
        <span>Select Response Plan from the list below or add a new one if the needed one is not available.</span>
      </div>
      <div>
        <paper-button id="periods" on-tap="_openModal" class="btn-primary">
          Add new response plan
        </paper-button>
      </div>
    </div>
    <add-response-plan-modal id="modal">
    </add-response-plan-modal>
    `;
    }
    _openModal() {
        this.$.modal.open();
    }
}
window.customElements.define('add-plan-panel', AddPlanPanel);
