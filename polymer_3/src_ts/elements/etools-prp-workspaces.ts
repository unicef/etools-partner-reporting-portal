import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';


/**
 * @polymer
 * @customElement
 */
class EtoolsPrpWorkspaces extends PolymerElement{

  @property({type: String})
  _current!: string;
  // statePath: 'workspaces.current'

  @property({type: Array})
  _all!: any[];
  // statePath: 'workspaces.all'

  @property({type: String, notify: true, computed: '_computeCurrent(_current)'})
  current!: string;

  @property({type: Array, notify: true, computed: '_computeAll(_all)'})
  all!: any[];

  _computeCurrent(_current: string) {
    return _current;
  }

  _computeAll(_all: any[]) {
    return _all.slice();
  }

}

window.customElements.define('etools-prp-workspaces', EtoolsPrpWorkspaces);
