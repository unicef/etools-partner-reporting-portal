import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor} from '../typings/globals.types';


/**
 * @polymer
 * @mixinFunction
 */
function RoutingMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class RoutingClass extends baseClass{

    @property({type: String})
    _$currentWorkspace!: string;

    @property({type: String})
    _$currentApp!: string;

    @property({type: String})
    _$currentPlan!: string;

    @property({type: String, computed: '_$computeBaseUrl(_$currentWorkspace, _$currentApp)'})
    _baseUrl!: string;

    @property({type: String, computed: '_$computeBaseUrlCluster(_$currentWorkspace, _$currentApp, _$currentPlan)'})
    _baseUrlCluster!: string;


    public _$computeBaseUrl(workspace: string, app: string) {
      return '/app/' + workspace + '/' + app;
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

    public attached() {
      this.async(function () {
        if (typeof this.dispatch !== 'function') { // Duck typing
          throw new Error(BEHAVIOR_NAME + ' requires ReduxBehavior');
        }
      });
    }

  }
}

export default RoutingMixin;
