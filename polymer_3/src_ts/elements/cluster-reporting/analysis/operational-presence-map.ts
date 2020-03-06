import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
// <link rel="import" href = "../../../../bower_components/leaflet-map/leaflet-map.html" >
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import './analysis-widget';
import {GenericObject} from '../../../typings/globals.types';

/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
*/
class OperationalPresenceMap extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      leaflet-map {
        height: 400px;
        width: calc(100% - 180px);
      }

      .legend {
        width: 150px;
        position: absolute;
        right: 0;
        top: 0;
      }

      .legend h4 {
        margin: 0 0 1em;
        font-weight: normal;
      }

      .legend ol {
        display: table;
        table-layout: fixed;
        width: 100%;
        padding: 0;
        margin: 0;
        text-align: center;
        font-size: 11px;
        line-height: 1.75em;
        opacity: .7;
      }

      .legend li {
        display: table-cell;
      }

      .legend span {
        position: relative;
        top: 2em;
      }

    </style>

    <analysis-widget
        widget-title="[[localize('operational_presence_map')]]"
        loading="[[loading]]">
      <template
          is="dom-if"
          if="[[showMap]]"
          restamp="true">
        <leaflet-map
            longitude="[[center.0]]"
            latitude="[[center.1]]"
            zoom="[[zoom]]"
            no-scroll-wheel-zoom>
          <leaflet-tilelayer url="[[tileUrl]]">
            Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
            <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
            Imagery © <a href="http://mapbox.com">Mapbox</a>
          </leaflet-tilelayer>

          <template
              is="dom-repeat"
              items="[[map.features]]"
              as="feature">
            <template
                is="dom-if"
                if="[[_equals(feature.geometry.type, 'MultiPolygon')]]">
              <template
                  is="dom-repeat"
                  items="[[feature.geometry.coordinates]]"
                  as="coords_lvl1">
                <template
                    is="dom-repeat"
                    items="[[coords_lvl1]]"
                    as="coords_lvl2">
                  <leaflet-polygon
                      color="#fff"
                      fill-color="[[_computePolygonColor(feature.properties, legend)]]"
                      fill-opacity="0.7"
                      weight="2">
                    <template
                        is="dom-repeat"
                        items="[[coords_lvl2]]"
                        as="point">
                      <leaflet-point
                          longitude="[[point.0]]"
                          latitude="[[point.1]]">
                      </leaflet-point>
                    </template>

                    <div>[[feature.properties.title]]</div>
                    <div class="number-of-partners">
                      [[_getPartnersCount(feature.properties.partners.all)]]
                    </div>
                    <div>[[_commaSeparated(feature.properties.partners.all)]]</div>
                  </leaflet-polygon>
                </template>
              </template>
            </template>

            <template
                is="dom-if"
                if="[[_equals(feature.geometry.type, 'Point')]]">
              <leaflet-marker
                  longitude="[[feature.geometry.coordinates.0]]"
                  latitude="[[feature.geometry.coordinates.1]]"
                  icon='{"iconUrl": "[[_computeMarkerIcon(feature.properties, legend)]]"}'>
                <div>[[feature.properties.title]]</div>
                <div class="number-of-partners">
                  [[_getPartnersCount(feature.properties.partners.all)]]
                </div>
                <div>[[_commaSeparated(feature.properties.partners.all)]]</div>
              </leaflet-marker>
            </template>
          </template>
        </leaflet-map>
      </template>

      <div class="legend">
        <h4>[[localize('number_of_partners')]]:</h4>
        <ol>
          <template
              is="dom-repeat"
              items="[[legend]]">
            <li style="background: [[item.color]];">
              <span>[[item.threshold]]<template
                  is="dom-if"
                  if="[[_equals(index, 4)]]">+</template></span>
            </li>
          </template>
        </ol>
      </div>
    </analysis-widget><style>
      :host {
        display: block;
      }

      leaflet-map {
        height: 400px;
        width: calc(100% - 180px);
      }

      .legend {
        width: 150px;
        position: absolute;
        right: 0;
        top: 0;
      }

      .legend h4 {
        margin: 0 0 1em;
        font-weight: normal;
      }

      .legend ol {
        display: table;
        table-layout: fixed;
        width: 100%;
        padding: 0;
        margin: 0;
        text-align: center;
        font-size: 11px;
        line-height: 1.75em;
        opacity: .7;
      }

      .legend li {
        display: table-cell;
      }

      .legend span {
        position: relative;
        top: 2em;
      }

    </style>

    <analysis-widget
        widget-title="[[localize('operational_presence_map')]]"
        loading="[[loading]]">
      <template
          is="dom-if"
          if="[[showMap]]"
          restamp="true">
        <leaflet-map
            longitude="[[center.0]]"
            latitude="[[center.1]]"
            zoom="[[zoom]]"
            no-scroll-wheel-zoom>
          <leaflet-tilelayer url="[[tileUrl]]">
            Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
            <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
            Imagery © <a href="http://mapbox.com">Mapbox</a>
          </leaflet-tilelayer>

          <template
              is="dom-repeat"
              items="[[map.features]]"
              as="feature">
            <template
                is="dom-if"
                if="[[_equals(feature.geometry.type, 'MultiPolygon')]]">
              <template
                  is="dom-repeat"
                  items="[[feature.geometry.coordinates]]"
                  as="coords_lvl1">
                <template
                    is="dom-repeat"
                    items="[[coords_lvl1]]"
                    as="coords_lvl2">
                  <leaflet-polygon
                      color="#fff"
                      fill-color="[[_computePolygonColor(feature.properties, legend)]]"
                      fill-opacity="0.7"
                      weight="2">
                    <template
                        is="dom-repeat"
                        items="[[coords_lvl2]]"
                        as="point">
                      <leaflet-point
                          longitude="[[point.0]]"
                          latitude="[[point.1]]">
                      </leaflet-point>
                    </template>

                    <div>[[feature.properties.title]]</div>
                    <div class="number-of-partners">
                      [[_getPartnersCount(feature.properties.partners.all)]]
                    </div>
                    <div>[[_commaSeparated(feature.properties.partners.all)]]</div>
                  </leaflet-polygon>
                </template>
              </template>
            </template>

            <template
                is="dom-if"
                if="[[_equals(feature.geometry.type, 'Point')]]">
              <leaflet-marker
                  longitude="[[feature.geometry.coordinates.0]]"
                  latitude="[[feature.geometry.coordinates.1]]"
                  icon='{"iconUrl": "[[_computeMarkerIcon(feature.properties, legend)]]"}'>
                <div>[[feature.properties.title]]</div>
                <div class="number-of-partners">
                  [[_getPartnersCount(feature.properties.partners.all)]]
                </div>
                <div>[[_commaSeparated(feature.properties.partners.all)]]</div>
              </leaflet-marker>
            </template>
          </template>
        </leaflet-map>
      </template>

      <div class="legend">
        <h4>[[localize('number_of_partners')]]:</h4>
        <ol>
          <template
              is="dom-repeat"
              items="[[legend]]">
            <li style="background: [[item.color]];">
              <span>[[item.threshold]]<template
                  is="dom-if"
                  if="[[_equals(index, 4)]]">+</template></span>
            </li>
          </template>
        </ol>
      </div>
    </analysis-widget>
    `;
  }

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.mapLoading)'})
  loading!: boolean;

  @property({type: String})
  accessToken = 'pk.eyJ1IjoiZXRvb2xzIiwiYSI6ImNqMGw4N3NtejAyMDIzMnBocHBsYjBsbXoifQ.VA-gzjqtTu-vr-8Ex9oEpA';

  @property({type: String, computed: '_computeTileUrl(accessToken)'})
  tileUrl!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.analysis.operationalPresence.map)', observer: '_refresh'})
  map!: GenericObject;

  @property({type: Number})
  zoom = 5;//Admin level?

  @property({type: Array, computed: '_computeCenter(map)'})
  center!: any;

  @property({type: String})
  mapStyles = [
    '.leaflet-popup-content-wrapper {',
    'max-width: 250px;',
    'padding: 10px;',
    'border-radius: 3px;',
    'font: 11px/1.5 Roboto, Noto, sans-serif;',
    'color: rgba(255, 255, 255, .9);',
    'background: #424242;',
    'opacity: .7;',
    '}',
    '.leaflet-popup-content {',
    'margin: 0;',
    'line-height: inherit;',
    '}',
    '.leaflet-popup-close-button,',
    '.leaflet-popup-tip {',
    'display: none;',
    '}',
    '.number-of-partners {',
    'font-size: 2.5em;',
    'line-height: 2;',
    'color: #fff;',
    '}',
  ].join('\n');

  @property({type: Array})
  legend = [
    {
      threshold: 0,
      color: '#e7f2fd',
    },
    {
      threshold: 5,
      color: '#93b6e6',
    },
    {
      threshold: 10,
      color: '#5e84d0',
    },
    {
      threshold: 15,
      color: '#355ab8',
    },
    {
      threshold: 20,
      color: '#123666',
    },
  ];

  @property({type: Boolean})
  showMap = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  currentWorkspaceCode!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  allWorkspaces!: any;

  @property({type: Array})
  currentWorkspaceCoords!: any;

  static get observers() {
    return ['_setCurrentWorkspaceCoords(allWorkspaces, currentWorkspaceCode)'];
  }

  _computeTileUrl(accessToken: string) {
    return [
      'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}',
      '?access_token=',
      accessToken,
    ].join('');
  }

  _setCurrentWorkspaceCoords(all: any, currentCode: string) {
    var currentWorkspace = all.find(function(workspace: any) {
      return workspace.code === currentCode;
    });

    this.set('currentWorkspaceCoords', [currentWorkspace.longitude, currentWorkspace.latitude]);
  }

  _getLegendIndex(properties: GenericObject, legend: any) {
    var partnersCount = properties.partners.all.length;
    var index = 0;

    while (partnersCount >= legend[index].threshold) {
      index++;
    }

    return index;
  }

  _computePolygonColor(properties: GenericObject, legend: any) {
    var index = this._getLegendIndex(properties, legend);

    return legend[index].color;
  }

  _computeMarkerIcon(properties: GenericObject, legend: any) {
    var index = this._getLegendIndex(properties, legend);

    return '/app/images/marker' + index + '.png';
  }

  _isPoint(node: any) {
    return Array.isArray(node) &&
      node.length === 2 &&
      node.every(function(child) {
        return typeof (child) === 'number';
      });
  }

  _computeCenter(map: GenericObject) {
    var minLon = 180;
    var maxLon = -180;
    var minLat = 90;
    var maxLat = -90;
    var self = this;

    function traverse(node: any) {
      if (self._isPoint(node)) {
        minLon = Math.min(node[0], minLon);
        maxLon = Math.max(node[0], maxLon);
        minLat = Math.min(node[1], minLat);
        maxLat = Math.max(node[1], maxLat);
      } else {
        node.forEach(traverse);
      }
    }

    map.features
      .filter(function(feature: any) {
        return !!feature.geometry;
      })
      .map(function(feature: any) {
        return feature.geometry.coordinates;
      })
      .forEach(traverse);

    if (map.features.length === 0) {
      return this.currentWorkspaceCoords;
    }
    return [
      minLon + (maxLon - minLon) / 2,
      minLat + (maxLat - minLat) / 2,
    ];
  }

  _getPartnersCount(partners: any) {
    return partners.length;
  }

  _refresh() {
    this.set('showMap', false);

    setTimeout(() => {
      this.set('showMap', true);

      setTimeout(() => {
        var style = document.createElement('style');

        style.innerHTML = this.mapStyles;
        (this.shadowRoot!.querySelector('leaflet-map') as Element).appendChild(style);
      });
    });
  }
}

window.customElements.define('operational-presence-map', OperationalPresenceMap);
