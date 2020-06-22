import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-repeat';
import {DomRepeat} from '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import RoutingMixin from '../mixins/routing-mixin';
import {setWorkspace} from '../redux/actions';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 */
class WorkspaceDropdown extends RoutingMixin(ReduxConnectedElement) {
  public static get template() {
    return html` <style>
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
          }

          --paper-input-container-underline-focus: {
            display: none;
          }

          --paper-input-container-underline-disabled: {
            display: none;
          }

          --paper-input-container-input: {
            color: var(--theme-primary-text-color-medium);
          }

          --paper-dropdown-menu-icon: {
            color: var(--theme-primary-text-color-medium);
          }

          --paper-input-container-label: {
            top: 4px;
            color: var(--theme-primary-text-color-medium);
          }

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
        <paper-listbox
          slot="dropdown-content"
          class="dropdown-content"
          on-iron-select="_workspaceSelected"
          selected="[[selected]]"
        >
          <template id="repeat" is="dom-repeat" items="[[data]]">
            <paper-item>[[item.name]]</paper-item>
          </template>
        </paper-listbox>
      </paper-dropdown-menu>`;
  }

  @property({type: Object, computed: '_computeWorkspace(data, current)'})
  workspace!: GenericObject;

  @property({type: Number, computed: '_computeSelected(data, current)'})
  selected = 0;

  @property({
    type: String,
    computed: 'getReduxStateValue(rootState.workspaces.current)',
    observer: '_currentWorkspaceChanged'
  })
  current!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  data!: any[];

  private prevWorkspace!: string;

  _currentWorkspaceChanged() {
    if (this.current) {
      if (!this.prevWorkspace) {
        this.prevWorkspace = this.current;
      } else if (this.prevWorkspace != this.current) {
        window.location.href = this.buildUrl(this._baseUrl, '/');
      }
    }
  }

  _workspaceSelected(e: CustomEvent) {
    const newCode = (this.$.repeat as DomRepeat).itemForElement(e.detail.item).code;
    if (newCode === this.current) {
      return;
    }

    this.reduxStore.dispatch(setWorkspace(newCode));
  }

  _computeWorkspace(data: any[], code: string) {
    if (data) {
      return data.filter(function (workspace) {
        return workspace.code === code;
      })[0];
    }
  }

  _computeSelected(data: any[], workspace: string) {
    if (!data) {
      return;
    }
    return data.findIndex((x) => x.code === workspace);
  }
}

window.customElements.define('workspace-dropdown', WorkspaceDropdown);
