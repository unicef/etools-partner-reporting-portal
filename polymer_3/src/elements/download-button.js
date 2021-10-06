var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 */
class DownloadButton extends PolymerElement {
    static get template() {
        return html `
      <style>
        a {
          text-decoration: none;
          color: var(--theme-primary-color);
        }
      </style>

      <a
          href="[[url]]"
          tabindex="-1"
          target="_blank">
        <paper-button class="btn-primary">
          <iron-icon icon="icons:file-download"></iron-icon>
          <slot></slot>
        </paper-button>
      </a>

    `;
    }
}
__decorate([
    property({ type: String })
], DownloadButton.prototype, "url", void 0);
window.customElements.define('download-button', DownloadButton);
