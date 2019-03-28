# OCHA Integration

High level we'll be integrating with[ OCHA](https://www.unocha.org/) systems to import:

* Response plan and its details \(RPM\):
  * Response plan
  * Associated clusters
  * Cluster objectives and indicators
  * Cluster activities and indicators
  * Partners associated with the response plan - are available under organizations key in the[ response](https://api.hpc.tools/v2/public/project/47561).
* Partner Projects and Partner activities \(OPS\):
  * Projects and their funding details
  * Activities and their indicators for each Project
* FTS - funding to be retrieved from originalAmount field in the[ FTS response](https://api.hpc.tools/v1/public/fts/flow?projectId=47564)

IMO and partner users will still be able to add custom response plan, or new cluster objectives/activities, partner projects/activities etc. as per usual.

Platform allows to search all active Response Plans stored in RPM API in selected Workspace. Basic information is dynamically pulled out from API:

* Plan Type
* Clusters
* Start Date
* End Date

Saving Response Plan triggers background synchronization of:

* Cluster activities
* Cluster objectives
* Indicators

NEW OPS provides us with project details \(including activities, activity indicators, targets, baselines, in-need, where available\). It is only rolled out in Chad and Libya, those will have the highest level of detail available.  


For the remaining projects a basic level of details \(Title, Code, Start, End, etc.\) has been imported and is available through new APIs.  




