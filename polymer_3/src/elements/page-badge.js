var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 */
class PageBadge extends PolymerElement {
    static get template() {
        return html `
      <style>
        :host {
            display: inline-block;
            border-radius: 1px;
            padding: 1px 6px;
            font-size: 10px;
            text-transform: uppercase;
            background-color: var(--paper-grey-500);
            color: white;
        }
      </style>

      [[name]]`;
    }
}
__decorate([
    property({ type: String })
], PageBadge.prototype, "name", void 0);
window.customElements.define('page-badge', PageBadge);
