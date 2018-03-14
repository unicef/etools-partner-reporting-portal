# Response Plan Import

## High level overview

* Importing happens into an existing Workspace
* Response Plan list to choose from should be retrieved for workspace countries
* OCHA provided cluster names **can be used directly**

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
For categories id 4 maps to HRP, 5 to FA, there are other typres that are ignored and HRP is used instead.
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
In OCHA there's a concept of Strategic Objective - related to multiple Clusters, in PRP we those as Cluster Objectives
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

To find which Cluster an Objective belongs to we need to look under `value.support.planEntityIds`, it's the same case for tying Activities to Objectives.

