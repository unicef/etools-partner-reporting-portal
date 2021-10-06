var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '../etools-prp-common/elements/etools-prp-progress-bar';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 */
class EtoolsPrpProgressBarCluster extends PolymerElement {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
          width: 100%;

          --paper-progress-active-color: #88c245;
        }

        etools-prp-progress-bar {
          @apply --etools-prp-progress-bar;
        }
      </style>

      <etools-prp-progress-bar display-type="[[displayType]]" number="[[number]]"></etools-prp-progress-bar>
    `;
    }
}
__decorate([
    property({ type: String })
], EtoolsPrpProgressBarCluster.prototype, "displayType", void 0);
__decorate([
    property({ type: Number })
], EtoolsPrpProgressBarCluster.prototype, "number", void 0);
window.customElements.define('etools-prp-progress-bar-cluster', EtoolsPrpProgressBarCluster);
