# Response Plan Import

## High level overview

* Importing happens into an existing Workspace
* Response Plan list to choose from should be retrieved for workspace countries
* OCHA provided cluster names **can be used directly**
* With the exception of disaggregations, only **V1 API** is being used in this import
* Only initial RP info is being pulled when the import request happens, a **background task** to retrieve other information is started afterwards

{% hint style="warning" %}
Cluster names in OCHA are not validated in any way
{% endhint %}

## Implementation Details

{% hint style="warning" %}
Workspace countries in PRP are currently not validated,  it is possible for a workspace to exists, that cannot have plans retrieved for it
{% endhint %}

To account for this workspace endpoint had a `can_import_ocha_response_plans` boolean flag added, which indicates lack of valid countries.

### Response Plan

`https://api.hpc.tools/v1/public/rpm/plan/id/<pk>` Is the base URL to retrieve basic Response Plan information.

| **Response Plan Model** | **OCHA Source** |
| --- | --- | --- | --- | --- |
| title | name |
| start | startDate |
| end | endDate |
| plan\_type | Can be detected from `categories` list in the response |

{% hint style="info" %}
For categories id 4 maps to HRP, 5 to FA, there are other types that are ignored and HRP is used as default.
{% endhint %}

### Clusters

Cluster list is located under `governingEntities` key in the response, where `entityPrototype.refCode` is equal to **CL**.

| **Cluster Model** | **OCHA Source** |
| --- | --- | --- |
| type | Manually set to **Imported** |
| imported\_type | name |

Code generating how cluster type is displayed has been changed to display based off of those values.

### Cluster Objectives and Activities

{% hint style="warning" %}
In OCHA there's a concept of Strategic Objective - related to multiple Clusters, in PRP we save those as Cluster Objectives
{% endhint %}

Those are somewhat oddly split between an _entities_ response:  
`https://api.hpc.tools/v1/public/rpm/plan/id/<pk>?format=json&content=entities`   
and _measurements_ response:  
`https://api.hpc.tools/v1/public/rpm/plan/id/<pk>?format=json&content=measurements`

So to get them all both responses need to be retrieved and combined. They are contained with the same `governingEntities` list as Clusters, but with `entityPrototype.refCode` as follows.

| Strategic Objective | SO |
| --- | --- | --- |
| Cluster Objective | CO |
| Cluster Activity | CA |

To find which Cluster an Objective belongs to we need to look for `parentId.`

{% hint style="info" %}
Some Objective don't seem to have `parent_id`, in which case we get the info from child Activities
{% endhint %}

| **Cluster Objective Model** | **OCHA Source** |
| --- | --- | --- |
| cluster | parentId |
| title | value.description |

List under `value.support.planEntityIds` ties Cluster Activities to Cluster Objectives.

{% hint style="warning" %}
In OCHA single Activity **can support multiple Objectives, this is not the case in PRP,** we only save the first one on the list.
{% endhint %}

| **Cluster Activity Model** | **OCHA Source** |
| --- | --- | --- |
| cluster\_objective | value.support.planEntityIds\[0\] |
| title | value.description |

### Reportables

Indicators are stored under `attachments` key in the objective / activity payload, they are further distinguished by key `type` with value `indicator`.

First we create the `IndicatorBlueprint` object:

| **IndicatorBlueprint Model** | **OCHA Source** |
| --- | --- | --- |
| title | value.description |
| disaggregatable | disaggregated |

And with that we can make the `Reportable`

| **Reportable Model** | **OCHA Source** |
| --- | --- | --- | --- | --- | --- | --- |
| blueprint | IndicatorBlueprint as created above |
| content\_object | Cluster Objective or Activity it comes from. |
| target | value.metrics.values.totals\[type=target\] |
| baseline | value.metrics.values.totals\[type=baseline\] |
| in\_need | value.metrics.values.totals\[type=inNeed\] |
| locations | value.metrics.values.disaggregated.locations |

At this point locations are also populated to the parent `content_object`.

### Disaggregations

Global disaggregation groups and categories can be retrieved from https://api.hpc.tools/v2/public/disaggregation-category-group

Name of the category \(eg. Age\) is saved as follows.

| **Disaggregation Model** | **OCHA Source** |
| --- | --- |
| name | label |

Then we save values \(eg. Children, Elderly, Adult\)

| **Disaggregation Value Model** | **OCHA Source** |
| --- | --- | --- |
| value | label |
| disaggregation | _as saved above_ |

