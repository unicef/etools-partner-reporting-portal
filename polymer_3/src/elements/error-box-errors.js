var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
/**
 * @polymer
 * @customElement
 */
class ErrorBoxErrors extends PolymerElement {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }

        ul {
          padding-left: 2em;
          margin: 0;
          font-size: 12px;
        }
      </style>

      <ul>
        <template
            is="dom-repeat"
            items="[[errors]]"
            as="error">
          <li>
            <template
                is="dom-if"
                if="[[error.field]]"
                restamp="true">
              <span>[[error.field]]:</span>
            </template>

            <template
                is="dom-if"
                if="[[error.value]]"
                restamp="true">
              <span>[[error.value]]</span>
            </template>

            <template
                is="dom-if"
                if="[[error.details]]"
                restamp="true">
              <error-box-errors
                  errors="[[error.details]]">
              </error-box-errors>
            </template>
          </li>
        </template>
      </ul>


    `;
    }
}
__decorate([
    property({ type: Object })
], ErrorBoxErrors.prototype, "errors", void 0);
window.customElements.define('error-box-errors', ErrorBoxErrors);
