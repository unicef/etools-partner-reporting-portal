var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../mixins/localize-mixin';
class ListPlaceholder extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.data = [];
        this.loading = false;
        this.message = 'no_results_found';
    }
    static get template() {
        return html `
      <style>
        .msg {
          text-align: center;
          padding: 1em 0;
        }
      </style>

      <div class="msg">[[localize(message)]]</div>
      `;
    }
    _computeHidden(data, loading) {
        return loading || (data && !!data.length);
    }
    _computeAriaHidden(hidden) {
        return hidden ? 'true' : 'false';
    }
}
__decorate([
    property({ type: Array })
], ListPlaceholder.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], ListPlaceholder.prototype, "loading", void 0);
__decorate([
    property({ type: String })
], ListPlaceholder.prototype, "message", void 0);
__decorate([
    property({ type: Boolean, reflectToAttribute: true, computed: '_computeHidden(data, loading)' })
], ListPlaceholder.prototype, "hidden", void 0);
__decorate([
    property({ type: Boolean, reflectToAttribute: true, computed: '_computeAriaHidden(hidden)' })
], ListPlaceholder.prototype, "ariaHidden", void 0);
window.customElements.define('list-placeholder', ListPlaceholder);
