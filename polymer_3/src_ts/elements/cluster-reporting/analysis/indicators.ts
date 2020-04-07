import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import './indicator-bucket';

/**
* @polymer
* @customElement
* @mixinFunction
*/
class Indicators extends ReduxConnectedElement {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
        min-height: 100px;
        position: relative;
      }
    </style>

    <template
        is="dom-if"
        if="[[render]]"
        restamp="true">
      <template
          is="dom-repeat"
          items="[[data]]"
          as="bucket">
        <analysis-indicator-bucket data="[[bucket]]"></analysis-indicator-bucket>
      </template>
    </template>

    <etools-loading active="[[loading]]"></etools-loading>
    `;
  }

  @property({type: Array, computed: 'getReduxStateArray(rootState.analysis.indicators.data)'})
  rawData!: any;

  @property({type: Array, computed: '_computeData(rawData)', observer: '_refresh'})
  data!: any;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.analysis.indicators.dataLoading)'})
  loading!: boolean;

  @property({type: Boolean})
  render = false;

  _refresh() {
    this.set('render', false);

    setTimeout(() => {
      this.set('render', true);
    });
  }

  _computeData(rawData: any) {
    return rawData.reduce(function(acc: any, curr: any) {
      var bucket = acc.find(function(_bucket: any) {
        return _bucket.id === curr.content_object.id;
      });

      if (!bucket) {
        bucket = Object.assign({}, curr.content_object, {
          type: curr.content_type,
          indicators: [],
        });

        acc.push(bucket);
      }

      bucket.indicators.push({
        id: curr.id,
        title: curr.blueprint.title,
        display_type: curr.blueprint.display_type,
        total_against_in_need: curr.total_against_in_need,
        total_against_target: curr.total_against_target,
      });

      return acc;
    }, []);
  }
}

window.customElements.define('analysis-indicators', Indicators);
