import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class EtoolsPrpLanguages extends ReduxConnectedElement {
  static get template() {
    return html``;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
  _current!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.localize.resources)'})
  _all!: GenericObject;

  @property({type: String, notify: true, computed: '_computeCurrent(_current)'})
  current!: string;

  @property({type: Array, notify: true, computed: '_computeAll(_all)'})
  all!: any[];

  _computeCurrent(_current: string) {
    return _current;
  }

  _computeAll(_all: GenericObject) {
    return Object.keys(_all).slice();
  }
}
window.customElements.define('etools-prp-languages', EtoolsPrpLanguages);

export {EtoolsPrpLanguages as EtoolsPrpLanguagesEl};
