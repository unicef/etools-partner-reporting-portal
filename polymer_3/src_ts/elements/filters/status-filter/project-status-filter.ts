<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/dropdown-filter.html">
<link rel="import" href="../../../behaviors/utils.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">
<link rel="import" href="../../../redux/store.html">

<dom-module id="project-status-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      class="item"
      label="[[localize('status')]]"
      name="status"
      value="[[_withDefault(value, '')]]"
      data="[[data]]">
    </dropdown-filter>

  </template>

  <script>
    Polymer({
      is: 'project-status-filter',

      behaviors: [
        App.Behaviors.UtilsBehavior,
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        data: {
          type: Array,
          computed: '_computeLocalizedStatuses(localize)'
        },

        value: String,
      },

      _computeLocalizedStatuses: function (localize) {
        return [
          {title: localize('all'), id: ''},
          {title: localize('ongoing'), id: 'Ong'},
          {title: localize('planned'), id: 'Pla'},
          {title: localize('completed'), id: 'Com'},
        ];
      },
    });
  </script>
</dom-module>
