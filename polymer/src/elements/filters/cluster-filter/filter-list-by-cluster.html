<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../../../polyfills/es6-shim.html">
<link rel="import" href="../../../behaviors/utils.html">
<link rel="import" href="../../filters/cluster-filter/cluster-filter.html">

<dom-module id="filter-list-by-cluster">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <cluster-filter
        name="cluster_id"
        value="[[_withDefault(queryParams.cluster_id, '')]]">
    </cluster-filter>
  </template>

  <script>
    Polymer({
      is: 'filter-list-by-cluster',

      properties: {
        queryParams: Object,
      },

      behaviors: [
        App.Behaviors.UtilsBehavior,
      ],

      _onFilterChanged: function (e) {
        var change = {
          page: 1,
        };
        const data = e.detail;
        change[data.name] = data.value;

        e.stopPropagation();

        this.set('queryParams', Object.assign({}, this.queryParams, change));
      },

      _addEventListeners: function () {
        this._onFilterChanged = this._onFilterChanged.bind(this);
        this.addEventListener('filter-changed', this._onFilterChanged);
      },

      _removeEventListeners: function () {
        this.removeEventListener('filter-changed', this._onFilterChanged);
      },

      attached: function () {
        this._addEventListeners();
      },

      detached: function () {
        this._removeEventListeners();
      },
    });
  </script>
</dom-module>
