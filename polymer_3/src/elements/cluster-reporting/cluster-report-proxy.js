var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import './cluster-report';
/**
 * @polymer
 * @customElement
 */
class ClusterReportProxy extends PolymerElement {
    constructor() {
        super(...arguments);
        this.active = false;
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
          margin: 0 -24px;
        }
      </style>

      <template
          is="dom-if"
          if="[[active]]"
          restamp="true">
        <cluster-report
            data="[[data]]"
            mode="[[mode]]">
        </cluster-report>
      </template>
    `;
    }
    static get observers() {
        return ['_render(data.id)'];
    }
    _computeCurrentId(data) {
        return data.id;
    }
    _render(id) {
        if (typeof id === 'undefined') {
            return;
        }
        if (this.currentId === id) {
            return;
        }
        setTimeout(() => {
            this.set('currentId', id);
        });
        // Force re-render:
        this.set('active', false);
        setTimeout(() => {
            this.set('active', true);
        });
    }
}
__decorate([
    property({ type: Object })
], ClusterReportProxy.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterReportProxy.prototype, "mode", void 0);
__decorate([
    property({ type: Number })
], ClusterReportProxy.prototype, "currentId", void 0);
__decorate([
    property({ type: Boolean })
], ClusterReportProxy.prototype, "active", void 0);
window.customElements.define('cluster-report-proxy', ClusterReportProxy);
