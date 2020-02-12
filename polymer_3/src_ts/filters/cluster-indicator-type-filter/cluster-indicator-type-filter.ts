<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../../../behaviors/utils.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../dropdown-filter/dropdown-filter.html">
<link rel="import" href="../../../redux/store.html">

<dom-module id="cluster-indicator-type-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      label="[[localize('indicator_type')]]"
      name="indicator_type"
      value="[[_withDefault(value, '')]]"
      data="[[data]]">
    </dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'cluster-indicator-type-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.UtilsBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        isPartner: {
          type: Boolean,
          computed: '_computeRole(currentUserRoles)',
        },

        currentUserRoles: {
          type: Array,
          statePath: 'userProfile.profile.prp_roles'
        },

        options: {
          type: Array,
          computed: '_computeLocalizedOptions(localize)'
        },

        data: {
          type: Array,
          computed: '_computeData(isPartner, options)',
        },

        value: String,
      },

      _computeLocalizedOptions: function (localize) {
        var options = [
          {title: localize('all'), id: ''},
          {title: localize('partner_activity'), id: 'partner_activity'},
          {title: localize('partner_project'), id: 'partner_project'},
          {title: localize('cluster_objective'), id: 'cluster_objective'},
          {title: localize('cluster_activity'), id: 'cluster_activity'},
        ];

        return options;
      },

      _computeData: function (isPartner, options) {
        if (isPartner) {
          return options.filter(function (option) {
            return option.id !== 'cluster_objective';
          });
        }

        return options;
      },

      _computeRole: function (roles) {
        return roles.every(function (role) {
          return role.role !== 'CLUSTER_IMO';
        });
      },
    });
  </script>
</dom-module>
