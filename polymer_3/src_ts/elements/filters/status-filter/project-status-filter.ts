import {html} from '@polymer/polymer';
import '../dropdown-filter/searchable - dropdown - filter';
import '../elements/etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import '../../../redux/selectors/llos';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ProjectStatusFilter extends LocalizeMixin(ReduxConnectedElement) {
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

  @property({type: Array, computed: '_computeLocalizedStatuses(localize)'})
  data = [];

  _computeLocalizedStatuses(localize: any) {
    return [
      {title: localize('all'), id: ''},
      {title: localize('ongoing'), id: 'Ong'},
      {title: localize('planned'), id: 'Pla'},
      {title: localize('completed'), id: 'Com'},
    ];
  };
}

window.customElements.define('project-status-filter', ProjectStatusFilter);
