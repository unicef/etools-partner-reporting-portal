var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import RoutingMixin from '../mixins/routing-mixin';
import { setWorkspace } from '../redux/actions';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 */
class WorkspaceDropdown extends RoutingMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.selected = 0;
    }
    static get template() {
        return html `
      <style>
        :host {
            display: block;
            position: relative;
            cursor: pointer;
            @apply --select-plan-workspaces-offset;
        }

        paper-dropdown-menu {
            width: 160px;
            @apply --workspaces-dropdown-width;


            --paper-input-container-underline: {
            display: none;
            @apply --underline-shown;
            };

            --paper-input-container-underline-focus: {
            display: none;
            };

            --paper-input-container-underline-disabled: {
            display: none;
            };

            --paper-input-container-input: {
            color: var(--theme-primary-text-color-medium);
            };

            --paper-dropdown-menu-icon: {
            color: var(--theme-primary-text-color-medium);
            };

            --paper-input-container-label: {
            top: 4px;
            color: var(--theme-primary-text-color-medium);
            };

            --paper-input-container-input: {
            margin-bottom: 2px;
            color: var(--theme-primary-text-color-medium);
            @apply --workspace-dropdown-input;
            }
        }

        paper-item {
          font-size: 15px;
          white-space: nowrap;
          cursor: pointer;
          padding: 0px 16px;
          min-height: 48px;
        }
      </style>

      <paper-dropdown-menu label="[[workspace.name]]" noink no-label-float>
        <paper-listbox slot="dropdown-content"
          class="dropdown-content"
          on-iron-select="_workspaceSelected"
          selected="[[selected]]">
          <template id="repeat" is="dom-repeat" items="[[data]]">
            <paper-item>[[item.name]]</paper-item>
          </template>
        </paper-listbox>
      </paper-dropdown-menu>`;
    }
    _workspaceSelected(e) {
        const newCode = this.$.repeat.itemForElement(e.detail.item).code;
        if (newCode === this.current) {
            return;
        }
        this.reduxStore.dispatch(setWorkspace(newCode));
        setTimeout(() => {
            window.location.href = this.buildUrl(this._baseUrl, '/');
        }, 100);
    }
    _computeWorkspace(data, code) {
        if (data) {
            return data.filter(function (workspace) {
                return workspace.code === code;
            })[0];
        }
    }
    _computeSelected(data, workspace) {
        return data.findIndex(x => x.code === workspace);
    }
}
__decorate([
    property({ type: Object, computed: '_computeWorkspace(data, current)' })
], WorkspaceDropdown.prototype, "workspace", void 0);
__decorate([
    property({ type: Number, computed: '_computeSelected(data, current)' })
], WorkspaceDropdown.prototype, "selected", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.workspaces.current)' })
], WorkspaceDropdown.prototype, "current", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)' })
], WorkspaceDropdown.prototype, "data", void 0);
window.customElements.define('workspace-dropdown', WorkspaceDropdown);
