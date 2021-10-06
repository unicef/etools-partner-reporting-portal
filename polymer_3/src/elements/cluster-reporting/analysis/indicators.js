var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import './indicator-bucket';
/**
* @polymer
* @customElement
* @mixinFunction
*/
class Indicators extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.render = false;
    }
    static get template() {
        return html `
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
    _refresh() {
        this.set('render', false);
        setTimeout(() => {
            this.set('render', true);
        });
    }
    _computeData(rawData) {
        return rawData.reduce(function (acc, curr) {
            var bucket = acc.find(function (_bucket) {
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
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.analysis.indicators.data)' })
], Indicators.prototype, "rawData", void 0);
__decorate([
    property({ type: Array, computed: '_computeData(rawData)', observer: '_refresh' })
], Indicators.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.analysis.indicators.dataLoading)' })
], Indicators.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], Indicators.prototype, "render", void 0);
window.customElements.define('analysis-indicators', Indicators);
