<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../redux/selectors/llos.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">

<dom-module id="reportable-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <searchable-dropdown-filter
        class="item"
        label="[[localize('pd_output')]]"
        name="llo"
        value="[[value]]"
        data="[[options]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'reportable-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        value: String,

        data: {
          type: Array,
          statePath: App.Selectors.LLOs.all,
        },

        options: {
          type: Array,
          value: [],
          computed: '_computeOptions(data)',
        },
      },

      _computeOptions: function (data) {
        var other = data.map(function (item) {
          return {
            id: String(item.id),
            title: item.title,
          };
        });

        return [{
          id: '',
          title: 'All',
        }].concat(other);
      },
    });
  </script>
</dom-module>
