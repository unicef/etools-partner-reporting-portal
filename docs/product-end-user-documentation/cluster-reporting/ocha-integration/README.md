# OCHA Integration

High level we'll be integrating with [OCHA](https://www.unocha.org/) systems to import:

* Response plan and its details \(RPM\):
  * Response plan
  * Associated clusters
  * Cluster objectives and indicators 
  * Cluster activities and indicators
  * Partners associated with the response plan - are available under `organizations` key in the [response](https://api.hpc.tools/v2/public/project/47561).
* Partner Projects and Partner activities \(OPS?\):
  * Projects and their indicators
  * Activities and their indicators
* FTS - funding to be retrieved from `originalAmount` field in the [FTS response](https://api.hpc.tools/v1/public/fts/flow?projectId=47564)

{% hint style="warning" %}
A lot of projects don't appear to have info there.
{% endhint %}

IMO and partner users will still be able to add custom response plan, or new cluster objectives/activities, partner projects/activities etc. as per usual.

Platform allows to search all active Response Plans stored in RPM API in selected Workspace. Basic information is dynamically pulled out from API:

* Plan Type
* Clusters
* Start Date
* End Date

{% hint style="info" %}
API returning response plans for workspace is done \(not yet live on staging\). It doesn't do any filtering, but it should be enough to do it on the frontend.
{% endhint %}

Saving Response Plan triggers background synchronization of:

* Cluster activities
* Cluster objectives
* Indicators

{% hint style="warning" %}
For **indicators** -** **waiting on RPM to finish disaggregations and locations info. Promised to be rolled out with March 15th release
{% endhint %}



