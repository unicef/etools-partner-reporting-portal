# Project Import

## High level overview

* Importing happens for an existing Response Plan
* Response Plan needs to haveocha information set up \(to know where to look for projects\)
* **V1 and V2 APIs** are being used for this import
* Only initial Project info is being pulled when the import request happens, a **background task** to retrieve other information is started afterwards

## Implementation Details

Response Plan PRP endpoint has been updated with `can_import_ocha_projects` boolean flag to indicate whether all the information needed for import is present.

### Partner Project

Project list is retrieved from a **V1** endpoint `https://api.hpc.tools/v1/public/project/plan/<planId>`

That list is displayed by the frontend to the user, where after selection a request to import is made to the backend.

Project details are retrieved from a **V2** endpoint `https://api.hpc.tools/v2/public/project/<projectId>`

| **Partner Project model** | **OCHA Source** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| title | name |
| description | objective |
| start\_date | startDate |
| end\_date | endDate |
| partner | organizations\[0\] |
| code | code |
| locations | locations |
| clusters | governingEntities where entityPrototypeId = 9 |

{% hint style="warning" %}
One partner is allowed per project, projects with multiple entries under `organizations` key will not be imported
{% endhint %}

{% hint style="info" %}
Projects clustes will also be populated up to Partners clusters
{% endhint %}

### Funding Information

Funding information is pulled from `https://api.hpc.tools/v1/public/fts/flow?projectId=<projectId>`

| **Partner Project model** | **OCHA Source** |
| --- | --- | --- |
| total\_budget | amountUSD |
| funding\_source | sourceObjects\[name\] |

### Indicators and Reportables

Indicator / Reportable data is downloaded using currentPublishedVersionId of the project from a V2 endpoint `https://api.hpc.tools/v2/public/project-version/currentPublishedVersionId/attachments`

{% hint style="warning" %}
Parent Cluster Activity for an Indicator is referenced by `objectId`, some Indicators seem to reference Cluster directly, PRP **schema doesn't allow** for this so they will be **skipped when saving.**
{% endhint %}

| **Indicator Blueprint Model** | **OCHA Source** |
| --- | --- |
| title | value.description |

| **Reportable Model** | **OCHA Source** |
| --- | --- | --- | --- | --- | --- | --- |
| blueprint | _as saved above_ |
| target | value.metrics.values.totals _where_ `name.en = Target` |
| in\_need | value.metrics.values.totals _where_ `name.en = In Need` |
| baseline | value.metrics.values.totals _where_ `name.en = Baseline` |
| content\_object | parent Cluster Activity from `objectId` |
| locations | value.metrics.values.disaggregated.locations |

### Disaggregations

Imported same as in [Response Plan Import](https://unicef.gitbook.io/prp/technical-documentation/ocha-integration-api-and-model-documentation/response-plan-import#disaggregations)

