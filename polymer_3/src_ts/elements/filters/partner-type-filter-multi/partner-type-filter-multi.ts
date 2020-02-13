<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/dropdown-filter-multi.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="partner-type-filter-multi">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter-multi
        label="[[localize('partner_type')]]"
        name="partner_types"
        value="[[value]]"
        data="[[data]]"
        hide-search>
    </dropdown-filter-multi>
  </template>

  <script>
    Polymer({
      is: 'partner-type-filter-multi',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        data: {
          type: Array,
          value: [
            {
              id: 'B/M',
              title: 'Bilateral / Multilateral',
            },
            {
              id: 'CSO',
              title: 'Civil Society Organization',
            },
            {
              id: 'Gov',
              title: 'Government',
            },
            {
              id: 'UNA',
              title: 'UN Agency',
            },
          ],
        },

        value: String,
      },
    });
  </script>
</dom-module>
