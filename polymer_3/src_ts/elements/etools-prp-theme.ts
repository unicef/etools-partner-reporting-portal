import {PolymerElement} from '@polymer/polymer';
import Constants from '../etools-prp-common/constants';
import {property} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 */
class EtoolsPrpTheme extends PolymerElement {
  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  _app!: string;

  @property({type: String, notify: true})
  primaryColor = Constants.THEME_PRIMARY_COLOR_IP;
}

export default EtoolsPrpTheme;
