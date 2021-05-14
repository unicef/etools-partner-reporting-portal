import {PolymerElement} from '@polymer/polymer';
import Constants from '../constants';
import {property} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 */
class EtoolsPrpTheme extends PolymerElement {
  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  _app!: string;

  @property({type: String, notify: true, computed: '_computePrimaryColor(_app)'})
  primaryColor!: string;

  _computePrimaryColor(app: string) {
    switch (app) {
      case 'cluster-reporting':
        return Constants.THEME_PRIMARY_COLOR_CLUSTER;
      case 'ip-reporting':
      default:
        return Constants.THEME_PRIMARY_COLOR_IP;
    }
  }
}

export default EtoolsPrpTheme;
