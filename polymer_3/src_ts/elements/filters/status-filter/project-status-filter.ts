import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ProjectStatusFilter extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
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

  @property({type: String})
  value!: string;

  @property({type: Array, computed: '_computeLocalizedStatuses(resources)'})
  data = [];

  _computeLocalizedStatuses() {
    return [
      {title: this.localize('all'), id: ''},
      {title: this.localize('ongoing'), id: 'Ong'},
      {title: this.localize('planned'), id: 'Pla'},
      {title: this.localize('completed'), id: 'Com'}
    ];
  }
}

window.customElements.define('project-status-filter', ProjectStatusFilter);
