# Handover session question

## **There is a component for every filter \(checkbox-filter, cluster-activity-filter, etc\). What’s the approach there?**

Our codebase has a selection of preliminary Polymer components, which implement filtering interaction and behaviors in UI: checkbox-filter, text-filter, dropdown-filter, etc. On top of these filter UI components, we build each specific implementation of data filtering that is in demand on certain pages or subpages, with Ajax and/or Redux modules: cluster-activity-filter, cluster-filter, partner-filter, etc.

Some of the above data filter Polymer components may call a full-fledge REST API in order to achieve filtering action or simply may add a GET query parameter for other data filter Polymer component to call its API.

## Form-fields folder. What’s going on in there, why are there separate components and what issues do they handle?

`form-fields` folder has both Ajax-only/Ajax+UI components for API data to list them as dropdown UI. `*-content.html` files are Polymer components that only has Ajax behavior to target cluster API data such as Cluster list, Location list, and Partner list within a cluster. `*-input.html` files are Polymer components that has both Ajax and input Polymer component to interact with.

Depending on the frontend UI\(s\) related to cluster, location, or partner listing action, the developer can choose to borrow ajax capabilities into the UI component or to implement a dropdown interface with Ajax action right away.

We can rename or reorganize these files in `form-field` as we see fit in the future.

## cluster-report-proxy.html. what does it do, what issues does it solve?

We have no idea.

## google-chart, analysis-chart, analysis-widget . For what functionality are these? What data are you showing in a chart?

`google-chart` is the Polymer web component we are using to implement visualization such as bar and graph charts. `analysis-chart` is a Polymer Behavior component that has stylings and few component methods that we implement for charts to render. `analysis-widget` is a container component for any `google-chart` component which handles loading state animation before rendering.

For the contents PRP-Cluster are displaying for analysis, please go to [Analysis of results](../product-end-user-documentation/cluster-reporting/analysis-of-results.md).

## what are ‘chips’? Etools-prp-chips

"Chips" are a UI container for text display in a single text input UI. This is usually to show multiple values in a text field, such as comma-delimited text.

We are using this component for custom specific dates in indicator modals for example.

## Tell us about the build process. Any reason for not using ‘polymer build’?

PRP frontend app is using gulp to initiate build process. You can check out `gulpfile.js` in polymer folder for the details. PRP gulp build process is inspired by PMP frontend app build process. There should be a lot of similarities from there. PRP app is linted, is minified, and is bundled to serve the folder for any deployment.

We are not using `polymer build` command to do this in alignment with PMP app processes.

## What does the Refresh button on the Report do \(in the code\) ?

I'm assuming this is Refresh button in PRP-IP for QPR Progress Report. Refresh button in QPR report allows to regenerate current QPR report based on current state of PD. The use case for this goes as the following:

* PD got loaded into PRP from PMP data sync in scheduled manner
* PRP creates a suite of Progress Reports after PD sync
* UNICEF officer recognized some errors or mistakes in the PD locations or UNICEF indicators, therefore makes an amendment in PMP application.
* PRP gets synced from PMP next time for PD data
* PRP still has a set of old reports generated.
* IP Authorized Officer in PRP goes to find an old QPR report and hit Refresh button in order to regenerate indicator reports from refreshed PD sync data.

## In the video tutorial it says that hitting refresh will clear out Reports in Draft status /that were not submitted. What happens in the code exactly?

I'm assuming this is related to above question. PRP cannot allow submitted/accepted QPR report to be refreshed, since they are committed now and it has now contributed a progress to PD. That's why we can only refresh QPR report if it's due, overdue, or sent back.

When the refresh button is clicked after confirmation dialog confirms the user's action, Polymer component sends a REST API call to `ReportRefreshAPIView` backend API. This API will iterate each IndicatorReport instance from target ProgressReport instance. For each IndicatorReport instance we iterate, we delete all of its underlying IndicatorLocationData instances and recreate them back.

## What is the use of labelled-item component? Seen it wrapped around paper-input, why?

labelled-item is a simple UI component to show primary/secondary texts at the same time according to Material Design. The component itself is not strictly following Material Design styling, therefore you can override secondary text styling to be bolder than primary.

## Paper-input being used in places where 2000 characters expected. Any reason for not using paper-textarea?

It was a decision that the multi-column UI behavior on such long text was not adopted. Therefore, we chose paper-input instead to achieve this.

## What’s the difference between `Progress Report` file downloaded from `Download Report in standard Template Format` and `Progress Summary` downloaded from `XLS/PDF` links? At first glance they seem very similar.

I feel this question is more appropriate towards business owners. However my understanding Standard template format is Annex-C PDF report which displays high-level progress\(es\) being made for the PD. XLS/PDF export is for progress summary on current Progress Report, showing indicator progress\(es\) per target location.

## How are permissions handled?

Permissions are handled in both frontend manifests and backend permission matrix. Backend has a permission matrix implemented as Python dictionary fixture, and it also has a set of Python mixin classes onto API view classes to impose permission check.

Frontend has `etools-prp-permissions` component that handles every aspect of permission enforcement on frontend UI. It is designed so that permission check will begin immediately the moment it is imported into the target UI component with passing permissions property. `etools-prp-permissions` component would compute the permission for embedded UI component and the UI component may use this result to show/hide UI action.

