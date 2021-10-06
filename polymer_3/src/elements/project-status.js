var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import './status-badge';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProjectStatus extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      <style>
        :host {
            display: inline-block;
        }

        status-badge {
            position: relative;
            top: -2px;
        }
      </style>
      <status-badge type="[[type]]" hide-icon></status-badge> [[_localizeLowerCased(label, localize)]]
      `;
    }
    _computeType(status) {
        switch (status) {
            case 'Ong':
                return 'default';
            case 'Pla':
                return 'warning';
            case 'Com':
                return 'success';
        }
        return;
    }
    _computeLabel(status) {
        switch (status) {
            case 'Ong':
                return 'Ongoing';
            case 'Pla':
                return 'Planned';
            case 'Com':
                return 'Completed';
        }
        return;
    }
}
__decorate([
    property({ type: String })
], ProjectStatus.prototype, "status", void 0);
__decorate([
    property({ type: String, computed: '_computeType(status)' })
], ProjectStatus.prototype, "type", void 0);
__decorate([
    property({ type: String, computed: '_computeLabel(status)' })
], ProjectStatus.prototype, "label", void 0);
window.customElements.define('project-status', ProjectStatus);
