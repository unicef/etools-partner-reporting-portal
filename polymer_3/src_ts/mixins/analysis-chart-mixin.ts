import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {property} from '@polymer/decorators';
import Constants from '../constants';
declare const numeral: any;

/**
 * @polymer
 * @mixinFunction
 */
function AnalysisChartMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class AnalysisChartClass extends baseClass {
    private tooltipStyles = [
      '.google-visualization-tooltip {',
      'padding: 10px;',
      'position: absolute;',
      'border-radius: 3px;',
      'font: 11px/1.5 Roboto, Noto, sans-serif;',
      'color: rgba(255, 255, 255, .9);',
      'background: #424242;',
      'box-shadow: 0 3px 14px rgba(0, 0, 0, .4);',
      'opacity: .7;',
      'z-index: 1000',
      '}',
      '.tooltip-content {',
      'max-width: 200px;',
      '}',
      '.number-of-partners {',
      'margin: .5em 0;',
      'font-size: 2.5em;',
      'line-height: 1;',
      'color: #fff;',
      '}',
      '.number-of-partners:last-child {',
      'margin-bottom: 0;',
      '}',
      '.progress {',
      'color: #fff;',
      '}',
      '.number-of-partners + .progress {',
      'margin-top: -.75em;',
      '}',
      '.project-value {',
      'font-size: 2.5em;',
      'line-height: 1.75;',
      'color: #fff;',
      '}',
      '.partner-value {',
      'font-size: 1.15em;',
      'line-height: 1;',
      'color: #fff;',
      '}'
    ].join('\n');

    @property({type: Object})
    _baseOptions = {
      bar: {
        groupWidth: 20
      },
      chartArea: {
        top: 0
      },
      legend: 'none',
      tooltip: {
        isHtml: true,
        ignoreBounds: true
      }
    };

    @property({type: Object, computed: '_computeOptions(rows)'})
    options: GenericObject = {};

    _buildTooltipContent(title: string, data: any) {
      return [
        '<div class="tooltip-content">',
        '<div>' + title + '</div>',
        '<div class="number-of-partners">',
        numeral(data.length).format(Constants.FORMAT_NUMBER_DEFAULT),
        '</div>',
        '<div>' + this._joinWithComma(data) + '</div>',
        '</div>'
      ].join('\n');
    }

    _joinWithComma(items: any) {
      if (!items) {
        return '';
      }
      return items.join(', ');
    }

    _computeRows(data: GenericObject[]) {
      return Object.keys(data).map((key: any) => {
        return [key, data[key].length, this._buildTooltipContent(key, data[key])];
      }, this);
    }

    _fromJSON(obj?: GenericObject) {
      return obj ? obj.v / obj.d : 0;
    }

    connectedCallback() {
      super.connectedCallback();

      this.addChartStyle();
    }

    addChartStyle() {
      const style = document.createElement('style');
      style.innerHTML = this.tooltipStyles;

      const googleChart = this.shadowRoot!.querySelector('google-chart');
      if (googleChart) {
        googleChart.shadowRoot!.appendChild(style);
      }
    }
  }
  return AnalysisChartClass;
}

export default AnalysisChartMixin;
