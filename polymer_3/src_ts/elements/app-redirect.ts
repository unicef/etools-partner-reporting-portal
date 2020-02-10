import {property} from '@polymer/decorators';
import RoutingMixin from '../mixins/routing-mixin';
import {GenericObject} from '../typings/globals.types';
import {ReduxConnectedElement} from '../ReduxConnectedElement';

//<link rel="import" href="../redux/store.html">
// behaviors: [
//   App.Behaviors.ReduxBehavior,
//   App.Behaviors.RoutingBehavior,
// ],

/**
 * @polymer
 * @customElement
 * @appliesMixin RoutingMixin
 */
class AppRedirect extends RoutingMixin(ReduxConnectedElement) {

  //DONE statePath: 'app.current',
  @property({type: String, computed: 'getReduxStateValue(state.app.current)'})
  app!: string;

  // statePath: 'workspaces.current',
  @property({type: String, computed: 'getReduxStateValue(state.workspaces.current)'})
  workspace!: string;

  // statePath: 'userProfile.profile',
  @property({type: Object, computed: 'getReduxStateObject(state.userProfile.profile)'})
  profile!: GenericObject;


  public static get observers() {
    return [
      '_redirectIfNeeded(app, workspace, profile.access)',
    ]
  }

  _redirectIfNeeded(app: string, workspace: string, access: string[]) {
    if (!access.length) {
      location.href = '/unauthorized';
    } else if (access.indexOf(app) === -1) {
      location.href = this.buildBaseUrl(workspace, access[0]);
    }
  }
}

window.customElements.define('app-redirect', AppRedirect);

export {AppRedirect as AppRedirectEl};
