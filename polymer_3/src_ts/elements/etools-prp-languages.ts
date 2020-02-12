
import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {GenericObject} from '../typings/globals.types';

//(dci)
//<link rel="import" href="../redux/store.html">
// behaviors: [
//   App.Behaviors.ReduxBehavior,
// ],

/**
 * Why the fuck is this components needed????!!!FUCKKKKKKKKKKKKKKK
 * @polymer
 * @customElement
 */
class EtoolsPrpLanguages extends PolymerElement {

  static get template() {
    return html``;
  }

  // statePath: 'localize.language',
  @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
  _current!: string;

  // statePath: 'localize.resources',
  @property({type: Object, computed: 'getReduxStateArray(rootState.localize.resources)'})
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
