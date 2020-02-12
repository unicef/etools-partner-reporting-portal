import {property} from '@polymer/decorators';
import {Constructor} from '../typings/globals.types';
import {store} from '../redux/store';
import {ReduxConnectedElement} from '../ReduxConnectedElement';

/**
 * @polymer
 * @mixinFunction
 */
function RoutingMixin<T extends Constructor<ReduxConnectedElement>>(baseClass: T) {
  class RoutingClass extends baseClass {

    @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
    _$currentWorkspace!: string;

    @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
    _$currentApp!: string;

    @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
    _$currentPlan!: string;

    @property({type: String, computed: '_$computeBaseUrl(_$currentWorkspace, _$currentApp)'})
    _baseUrl!: string;

    @property({type: String, computed: '_$computeBaseUrlCluster(_$currentWorkspace, _$currentApp, _$currentPlan)'})
    _baseUrlCluster!: string;

    private BEHAVIOR_NAME = 'RoutingBehavior';


    public _$computeBaseUrl(workspace: string, app: string) {
      return '/app_poly3/' + workspace + '/' + app;
    }

    public _$computeBaseUrlCluster(workspace: string, app: string, planId: string) {
      return this._$computeBaseUrl(workspace, app) + '/plan/' + planId;
    }

    public buildBaseUrl() {
      return this._$computeBaseUrl.apply(this, arguments);
    }

    /**
     * Need pass baseUrl so polymer knew when to update the
     * expression within the template.
     */
    public buildUrl(baseUrl: string, tail: string) {
      if (tail.length && tail[0] !== '/') {
        tail = '/' + tail;
      }

      return baseUrl + tail;
    }

    connectedCallback() {
      super.connectedCallback();

      const self = this;
      setTimeout(function () {
        if (typeof store.dispatch !== 'function') { // Duck typing
          throw new Error(self.BEHAVIOR_NAME + ' requires ReduxBehavior');
        }
      });
    }

  }
  return RoutingClass;
}

export default RoutingMixin;
