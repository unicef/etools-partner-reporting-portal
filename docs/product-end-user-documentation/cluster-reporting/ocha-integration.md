# OCHA Integration

High level we'll be integrating with [OCHA](https://www.unocha.org/) systems to import:

* Response plan and its details \(RPM\):
  * Response plan
  * Associated clusters
  * Cluster objectives and indicators 
  * Cluster activities and indicators
  * Partners associated with the response plan - are available under `organizations` key in the [response](https://api.hpc.tools/v2/public/project/47561).
* Partner Projects and Partner activities \(OPS\):
  * Projects and their indicators
  * Activities and their indicators
* FTS - funding to be retrieved from `originalAmount` field in the [FTS response](https://api.hpc.tools/v1/public/fts/flow?projectId=47564)

{% hint style="warning" %}
A lot of projects don't appear to have info there.
{% endhint %}

IMO and partner users will still be able to add custom response plan, or new cluster objectives/activities, partner projects/activities etc. as per usual.

{% hint style="info" %}
On the initial import request only the basic entity \(Response Plan or Project\) is imported, since getting all the details can take a couple of minutes, it is delegated to a background task.
{% endhint %}

### Response Plan

Platform allows to search all active Response Plans stored in RPM API in selected Workspace. Basic information is dynamically pulled out from API:

* Plan Type
* Clusters
* Start Date
* End Date

Saving Response Plan triggers background synchronisation of:

* Cluster activities
* Cluster objectives
* Indicators
* Disaggregation Groups \(eg. Age\) and Categories \(eg. Children, Adult, Elderly\)
* Locations

To see detailed breakdown of how data structures are mapped go to [technical documentation](https://unicef.gitbook.io/prp/~/edit/primary/technical-documentation/ocha-integration-api-and-model-documentation/response-plan-import) page.

### Partner Project

Once a Response Plan has been selected, contained projects can be imported from OCHA.

Triggering an import downloads from API:

* Title
* Description
* Start date
* End date
* Partner
* Locations

Saving Response Plan triggers background synchronisation of:

* Clusters
* Funding \(when available\)
* Indicators
* Reportables
* Disaggregation Groups \(eg. Age\) and Categories \(eg. Children, Adult, Elderly\)
* Locations

Again, a detailed breakdown of how import works can be found in the [technical documentation](https://unicef.gitbook.io/prp/technical-documentation/ocha-integration-api-and-model-documentation/project-import).

