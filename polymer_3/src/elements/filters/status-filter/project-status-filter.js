var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ProjectStatusFilter extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.data = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      class="item"
      label="[[localize('status')]]"
      name="status"
      value="[[_withDefault(value, '')]]"
      data="[[data]]">
    </dropdown-filter>
  `;
    }
    _computeLocalizedStatuses() {
        return [
            { title: this.localize('all'), id: '' },
            { title: this.localize('ongoing'), id: 'Ong' },
            { title: this.localize('planned'), id: 'Pla' },
            { title: this.localize('completed'), id: 'Com' }
        ];
    }
}
__decorate([
    property({ type: String })
], ProjectStatusFilter.prototype, "value", void 0);
__decorate([
    property({ type: Array, computed: '_computeLocalizedStatuses(resources)' })
], ProjectStatusFilter.prototype, "data", void 0);
window.customElements.define('project-status-filter', ProjectStatusFilter);
