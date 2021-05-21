import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {property} from '@polymer/decorators';
import 'leaflet/dist/leaflet-src.esm.js';
import {leafletStyles} from '../../../styles/leaflet-styles';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import './analysis-widget';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
// @ts-ignore
import {map, tileLayer, polygon, marker, latLng} from 'leaflet/dist/leaflet-src.esm.js';

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
      ${leafletStyles}
      <style>
        :host {
          display: block;
        }
        #map {
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
          opacity: 0.7;
        }
        .legend li {
          display: table-cell;
        }
        .legend span {
          position: relative;
          top: 2em;
        }
      </style>

      <analysis-widget widget-title="[[localize('operational_presence_map')]]" loading="[[loading]]">
        <template is="dom-if" if="[[showMap]]" restamp="true">
          <div id="map" slot="map"></div>
        </template>

        <div class="legend" slot="map">
          <h4>[[localize('number_of_partners')]]:</h4>
          <ol>
            <template is="dom-repeat" items="[[legend]]">
              <li style="background: [[item.color]];">
                <span>[[item.threshold]]<template is="dom-if" if="[[_equals(index, 4)]]">+</template></span>
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

  @property({
    type: Object,
    computed: 'getReduxStateObject(rootState.analysis.operationalPresence.map)',
    observer: '_refresh'
  })
  map!: GenericObject;

  @property({type: Number})
  zoom = 5; // Admin level?

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
    '}'
  ].join('\n');

  @property({type: Array})
  legend = [
    {
      threshold: 0,
      color: '#e7f2fd'
    },
    {
      threshold: 5,
      color: '#93b6e6'
    },
    {
      threshold: 10,
      color: '#5e84d0'
    },
    {
      threshold: 15,
      color: '#355ab8'
    },
    {
      threshold: 20,
      color: '#123666'
    }
  ];

  @property({type: Boolean})
  showMap = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  currentWorkspaceCode!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  allWorkspaces!: any;

  @property({type: Array})
  currentWorkspaceCoords!: any;

  presenceMap: GenericObject | null = null;

  static get observers() {
    return ['_setCurrentWorkspaceCoords(allWorkspaces, currentWorkspaceCode)'];
  }

  _computeTileUrl(accessToken: string) {
    return [
      'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}',
      '?access_token=',
      accessToken
    ].join('');
  }

  _setCurrentWorkspaceCoords(all: any, currentCode: string) {
    const currentWorkspace = all.find(function (workspace: any) {
      return workspace.code === currentCode;
    });

    this.set('currentWorkspaceCoords', [currentWorkspace.longitude, currentWorkspace.latitude]);
  }

  _getLegendIndex(properties: GenericObject, legend: any) {
    const partnersCount = properties.partners.all.length;
    let index = 0;

    while (partnersCount >= legend[index].threshold) {
      index++;
    }

    return index;
  }

  _computePolygonColor(properties: GenericObject, legend: any) {
    const index = this._getLegendIndex(properties, legend);

    return legend[index].color;
  }

  _computeMarkerIcon(properties: GenericObject, legend: any) {
    const index = this._getLegendIndex(properties, legend);

    return '/app/images/marker' + index + '.png';
  }

  _isPoint(node: any) {
    return (
      Array.isArray(node) &&
      node.length === 2 &&
      node.every(function (child) {
        return typeof child === 'number';
      })
    );
  }

  _computeCenter(map: GenericObject) {
    let minLon = 180;
    let maxLon = -180;
    let minLat = 90;
    let maxLat = -90;

    const traverse = (node: any) => {
      if (this._isPoint(node)) {
        minLon = Math.min(node[0], minLon);
        maxLon = Math.max(node[0], maxLon);
        minLat = Math.min(node[1], minLat);
        maxLat = Math.max(node[1], maxLat);
      } else {
        node.forEach(traverse);
      }
    };

    map.features
      .filter(function (feature: any) {
        return !!feature.geometry;
      })
      .map(function (feature: any) {
        return feature.geometry.coordinates;
      })
      .forEach(traverse);

    if (map.features.length === 0) {
      return this.currentWorkspaceCoords;
    }
    return [minLon + (maxLon - minLon) / 2, minLat + (maxLat - minLat) / 2];
  }

  _getPartnersCount(partners: any) {
    return partners.length;
  }

  _refresh() {
    if (!this.center) {
      this.set('showMap', false);
      return;
    }
    this.set('showMap', true);

    setTimeout(() => {
      this._setupMap();
    }, 200);
  }

  _setupMap() {
    const mapCtrl = this.shadowRoot!.querySelector('#map') as Element;

    if (!mapCtrl) {
      return;
    }

    if (this.presenceMap) {
      this.presenceMap.remove();
    }

    this.presenceMap = map(mapCtrl, {
      center: [this.center[0], this.center[1]],
      zoom: this.zoom,
      scrollWheelZoom: false
    });

    tileLayer(this.tileUrl, {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,Imagery © <a href="http://mapbox.com">Mapbox</a>'
    }).addTo(this.presenceMap);

    const style = document.createElement('style');
    style.innerHTML = this.mapStyles;
    mapCtrl.appendChild(style);

    (this.map.features || []).forEach((feature: any) => {
      if (feature.geometry.type === 'MultiPolygon') {
        (feature.geometry.coordinates || []).forEach((coords: any) => {
          polygon(coords, {
            color: '#fff',
            'fill-color': this._computePolygonColor(feature.properties, this.legend),
            'fill-opacity': '0.7',
            weight: '2'
          })
            .bindTooltip(this.getFeatureTooltip(feature.properties), {sticky: true})
            .addTo(this.presenceMap);

          // (dci) cannot test this but I think the points (in the old app) were polygon coordinates actually,
          //  need to be checked (coords || []).forEach((coord: any) => {
          //   featurePolygon.feature.
          //     point(coord[0], coord[1]).addTo(featurePolygon);
          // })
        });
      } else if (feature.geometry.type === 'Point') {
        marker(latLng(feature.geometry.coordinates[0], feature.geometry.coordinates[1]), {
          icon: {iconUrl: this._computeMarkerIcon(feature.properties, this.legend)}
        })
          .bindTooltip(this.getFeatureTooltip(feature.properties), {sticky: true})
          .addTo(this.presenceMap);
      }
    });
  }

  getFeatureTooltip(properties: any) {
    const partnersCount = this._getPartnersCount(properties.partners.all);
    const partners = this._commaSeparated(properties.partners.all);
    return `<div>${properties.title}</div>
            <div class="number-of-partners">${partnersCount}</div>
            <div>${partners}</div>`;
  }
}

window.customElements.define('operational-presence-map', OperationalPresenceMap);
