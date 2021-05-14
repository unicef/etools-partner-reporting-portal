import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function FilterDependenciesMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class FilterDependenciesClass extends baseClass {
    @property({type: String})
    lastParams!: string;

    @property({type: Object})
    params!: GenericObject;

    @property({type: String})
    dependencies = '';

    @property({type: Object})
    defaultParams: GenericObject = {};

    static get observers() {
      return ['_computeParams(dependencies, queryParams)'];
    }

    _computeParams(dependencies: string, queryParams: GenericObject) {
      if (!queryParams) {
        return;
      }

      const newParams = dependencies
        .split(',')
        .filter(Boolean)
        .reduce(function (acc, key) {
          if (typeof queryParams[key] !== 'undefined') {
            acc[key] = queryParams[key];
          }

          return acc;
        }, Object.assign({}, this.defaultParams));

      const serialized = this._serializeParams(newParams);

      if (serialized !== this.get('lastParams')) {
        this.set('lastParams', serialized);
        this.set('params', newParams);
      }
    }

    _serializeParams(params: GenericObject) {
      return JSON.stringify(params);
    }
  }

  return FilterDependenciesClass;
}

export default FilterDependenciesMixin;
