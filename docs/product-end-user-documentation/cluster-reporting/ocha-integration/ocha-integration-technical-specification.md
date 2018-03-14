---
description: This page covers all technical specification needed for OCHA integration
---

# OCHA Integration - technical specification

## OCHA API's information

### Documentation

Detailed documentation is available here: [api.hpc.tools/docs/v1/](https://api.hpc.tools/docs/v1/)

This documentation is intended for users of the HPC Service public API, which provides data in JSON or XML formats. 

For the API v2 endpoints \(currently only data for Chad 2018 is available\), there isn’t yet any formal documentation on this.  OCHA developers are working on auto generating the docs, but this won’t be available until our next release in 2 weeks time.

Old OPS API does not provide any documentation.

### Authorization

Access to API is public, however there is limit to 1 request per second. Logged users does not have this limitation. API is using HTTP Basic Authentication.

```text
GET /v1/public/fts/flow?year=2016 HTTP/1.1
Host: api.hpc.tools
Content-Type: application/json
Authorization: Basic base64(clientABC:passwordXYZ)
```

### External ID

All PRP models related to this integration should be updated with two new columns:

| **Column** | **Type** |
| --- | --- | --- |
| `external_id` | _integer_ |
| `external_source` | _choice\_field_ |

All data pulled from OCHA should contains their orginal ID stored in `external_id` field and API source stored in `external_source `\(HPC or OPS\).

All further mappings includes those fields by default.

## Response Plan API

### List of available Response Plans

Endpoint get a list of current Response Plans in given country:

> https://api.hpc.tools/v1/public/plan/country/&lt;COUNTRY\_ISO&gt;

Example: [https://api.hpc.tools/v1/public/plan/country/UKR](https://api.hpc.tools/v1/public/plan/country/UKR)



#### Field mapping

| **PRP Response Plan** | **HPC Plan** |
| :--- | :--- | :--- |
| _`title`_ | _`name`_ |
| _`workspace`_ | _`emergencies[0] if present else use locations[0]`_ |
| _`start`_ | _`startDate`_ |
| _`end`_ | _`endDate`_ |
| _`plan_type`_ | _`categories -> name`_ |

### Sample JSON outputs 

OCHA provided sample JSON outputs for some plans:

[https://www.dropbox.com/sh/ogk4lrg4qyieyj7/AADlWxjBLyZHF5aszeCUrlwpa?dl=0](https://www.dropbox.com/sh/ogk4lrg4qyieyj7/AADlWxjBLyZHF5aszeCUrlwpa?dl=0)

### Response Plan Details

To get details of response plan, another endpoint is required:

> https://api.hpc.tools/v1/public/rpm/plan/id/&lt;plan\_id&gt;

Example: [https://api.hpc.tools/v1/public/rpm/plan/id/514](https://api.hpc.tools/v1/public/rpm/plan/id/514)

Same endpoints returns different values depends on _content _parameter:

{% hint style="info" %}
**content**: required \(one of basic, entities, measurements\)Specify the detail level for the content of the API response:

* basic : only basic content for a plan.
* entities : plan structure with entities and attachments.
* measurements : plan structure with monitoringPeriods, entities, attachments and measurements.
{% endhint %}

In summary - to get plan structure with monitoringPeriods, entities, attachments and measurements, endpoint looks like:  
[https://api.hpc.tools/v1/public/rpm/plan/id/514?format=json&content=measurements](https://api.hpc.tools/v1/public/rpm/plan/id/514?format=json&content=measurements)

{% hint style="info" %}
Within the API output, there is a `parentID` within the Clusters Objectives or Cluster Activities linking them back to the Cluster \(the parent\).

If the Cluster Objectives or Activities support a particular Strategic or Cluster Objective then the parameter to look for is the `value.support`.
{% endhint %}

### Clusters

There is a global cluster list, but then plans/responses can have their own cluster names sometimes as well.

However same Cluster name contains different ID's for different plans, example:

[https://api.hpc.tools/v1/public/rpm/plan/id/641?format=json&content=entities](https://api.hpc.tools/v1/public/rpm/plan/id/641?format=json&content=entities)

```text
{
    "id": 4042,
    "name": "Education",
    "customReference": "L5411",
    "value": {
        "description": null,
        "icon": null,
        "categories": []
    },
    "planId": 641,
    "entityPrototype": {
        "id": 2213,
        "refCode": "CL",
        "type": "GVE",
        "value": {
            "name": {
                "en": {
                    "singular": "Cluster",
                    "plural": "Clusters"
                }
            },
            "possibleChildren": [
                {
                    "refCode": "CO",
                    "cardinality": "0-N",
                    "id": 2215
                },
                {
                    "refCode": "CA",
                    "cardinality": "0-N",
                    "id": 2216
                }
            ]
        }
    },
    "attachments": [],
    "clusterNumber": "L5411"
}
```

[https://api.hpc.tools/v1/public/rpm/plan/id/475?format=json&content=entities](https://api.hpc.tools/v1/public/rpm/plan/id/475?format=json&content=entities)

```text
{
    "id": 1956,
    "name": "Education",
    "customReference": "1956",
    "value": {
        "description": null,
        "icon": null,
        "categories": []
    },
    "planId": 475,
    "entityPrototype": {
        "id": 2021,
        "refCode": "CL",
        "type": "GVE",
        "value": {
            "name": {
                "en": {
                    "singular": "Cluster",
                    "plural": "Clusters"
                }
            },
            "possibleChildren": [
                {
                    "refCode": "CO",
                    "cardinality": "0-N",
                    "id": 2023
                },
                {
                    "refCode": "CA",
                    "cardinality": "0-N",
                    "id": 2024
                }
            ]
        }
    },
    "attachments": [],
    "clusterNumber": "1956"
},
```

Endpoint for access global Clusters list:

> https://api.hpc.tools/v1/public/global-cluster

**Field mapping**

> https://api.hpc.tools/v1/public/rpm/plan/id/{id}?content=entities

| **PRP Cluster model fields** | **RPM Plan API fields** |
| --- | --- | --- |
| _`type`_ | _`governingEntities -> name`\(1\)_ |
| _`response_plan`_ | _`id`_ |

{% hint style="info" %}
\(1\) where _value-&gt;name-&gt;en-&gt;singular_ is _Cluster_
{% endhint %}

### Cluster activity

To retrieve cluster activities it has to be used _content=entities_ parameter:

> https://api.hpc.tools/v1/public/rpm/plan/id/&lt;plan\_id&gt;?content=entities

#### Field mapping

| **PRP Cluster Activity model fields** | **RPM Plan API fields** |
| --- | --- | --- | --- | --- |
| _`title`_ | _`planEntities -> value -> description` \(1\)_ |
| _`cluster_objective`_ | `support` \(2\)  |
| _**`locations`**_ | _`attachments`_ \(3\) |
| _**`reportables`**_ | _`attachments` \(4\)_ |

{% hint style="info" %}
\(1\) where `planEntities -> value -> name -> en -> singular = "Cluster Activity"`
{% endhint %}

{% hint style="info" %}
\(2\) There's either relation to Strategic Objective \(SO\) or Cluster Objective \(CO\) \(**In PRP both will be treated as Cluster Objective**\), activity can link to multiple objectives - due to schema limitations only the first objective can be currently linked
{% endhint %}

{% hint style="info" %}
\(3\) iterate over all Indicators in: `attachments -> value -> metrics -> values -> disaggregated -> locations`and `"type": "indicator"`
{% endhint %}

{% hint style="info" %}
\(4\) indicators are stored in attachments with `"type": "indicator"`
{% endhint %}

### Cluster objectives

To retrieve cluster objectives it has to be used _content=entities_ parameter:

> https://api.hpc.tools/v1/public/rpm/plan/id/&lt;plan\_id&gt;?content=entities

{% hint style="info" %}
In some case the 3 layer structure of `strategic objectives > cluster objectives > cluster activities` is not always followed. **Cluster activity** can link to **strategic objective**. Strategic objectives are multi-cluster.
{% endhint %}

#### Field mapping

| **PRP Cluster Objective model fields** | **RPM Plan API fields** |
| --- | --- | --- | --- | --- |
| _`title`_ | _`planEntities -> value -> description` \(1\)_ |
| _`cluster`_ | `parent -> parentId` \(2\)  |
| _**`locations`**_ | _`attachments`_ \(3\) |
| _**`reportables`**_ | _`attachments` \(4\)_ |

{% hint style="info" %}
\(1\) where `planEntities -> value -> name -> en -> singular = "Cluster Objective"`
{% endhint %}

{% hint style="info" %}
\(2\) `parentId` points to Cluster ID - might be empty, need to resolve in PRP
{% endhint %}

{% hint style="info" %}
\(3\) iterate over all Indicators in: `attachments -> value -> metrics -> values -> disaggregated -> locations`and `"type": "indicator"`
{% endhint %}

{% hint style="info" %}
\(4\) indicators are stored in attachments with `"type": "indicator"`
{% endhint %}

### Indicators and Disaggregation data

To retrieve disaggregation data it has to be used _content=measurements_ parameter:

> https://api.hpc.tools/v1/public/rpm/plan/id/&lt;plan\_id&gt;?content=measurements

#### Field mapping

| PRP Reportable model fields | **RPM Plan API fields** |
| --- | --- | --- | --- | --- | --- | --- |
|  _`target`_ | `attachments -> value -> metrics -> values -> totals -> "type": "target"` |
| _` baseline`_ | `attachments -> value -> metrics -> values -> totals -> "type": "baseline"` |
| _` in_need`_ | `attachments -> value -> metrics -> values -> totals -> "type": "inNeed"` |
| _` is_cluster_indicator`_ | **True** |
| _**`locations`**_ | `attachments -> value -> metrics -> values -> disaggregated -> locations` |
| _**`disaggregations`**_ | `disaggregations <-> attachments -> value -> metrics -> values -> disaggregated -> categories` |

{% hint style="info" %}
`inNeed` is sent for entire plan / response. Also sent per indicator in old platform. Depends on country we might get different results.
{% endhint %}

{% hint style="info" %}
Disaggregations are defined as mix of ids, for example: `"ids": [1, 4]`, where `1` is `Child`, `4` is a `Male`. There is possibility to get them into PRP `Disaggregation` and `DisaggregationValue` model. **Disaggregation ID are unique per system.**
{% endhint %}

{% hint style="info" %}
TODO: Disaggregations matrix needs to be analyzed. 
{% endhint %}

### Locations

Response plan and Disaggregation data have assigned locations. 

#### Response Plan location field mapping

| **PRP Location** | **RPM API Plan Location** |
| --- | --- | --- |
| `title` | `name` |
| `gateway -> admin_level` | `adminLevel` |

However disaggregation `admin_level` is provided only in OPS. By default in RMP, we should take value `0`.

#### Disaggregation data location field mapping

| **PRP Location** | **RPM API Plan Location** |
| --- | --- | --- |
| `title` | `name` |
| `gateway -> admin_level` | **0** |

## Projects API

Projects are available in old OPS  and new Project Module \(new OPS\).

### Overview

For the new Projects Module, the project data is available here:

[https://api.hpc.tools/v1/public/project/plan/637](https://api.hpc.tools/v1/public/project/plan/637)

However, there is a new **v2** path that provides more project details than the **v1** path.

The **v2** path doesn’t currently have a listing like this, and so you would need the individual `project id` before getting more details e.g.

[https://api.hpc.tools/v2/public/project/52716](https://api.hpc.tools/v2/public/project/52716)

Old OPS API provide only three endpoints \([https://ops.unocha.org/api](https://ops.unocha.org/api)\):

* by Project ID
* by Appeal ID \(short details\)
* by Appeal ID \(full details\)

Response is available in XML and JSON \(depends on request suffix `.xml` or `.json`\).

The old OPS is accessible under this URL, and does not require any authentication:

[https://ops.unocha.org/api/v1/project/appeal/\[id\].xml](https://ops.unocha.org/api/v1/project/appeal/%5bid%5d.xml)

Where the` [id]` is the `appeal id`.  Note that this `id` is different from the `plan id` in the HPC database.  The response from this endpoint is published \(finalized\) project data for the appeal.

### List of available Projects

#### New Project Module

To get list of available projects for given plan:

[https://api.hpc.tools/v1/public/project/plan/637](https://api.hpc.tools/v1/public/project/plan/637)

{% hint style="info" %}
We need to figure out if we want to limit projects to choosed partner \(organization\)  
{% endhint %}

Filtering is not available, so iteration over all set is required \(`organizations -> organization -> name `or `abbreviation` should be same like choosed PRP organization / partner\).

#### Old OPS

To find the appeal id’s for any particular country you are interested in, use this example:

[https://ftsarchive.unocha.org/api/v1/appeal/year/2017.xml](https://ftsarchive.unocha.org/api/v1/appeal/year/2017.xml)

This will give you a list of all available appeals for the year 2017, and then you can search within the result set.

Now having proper appeal ID we can list all projects:

[https://ops.unocha.org/api/v1/projectshort/appeal/951.xml](https://ops.unocha.org/api/v1/projectshort/appeal/951.xml)

To get detailed results \(with assigned organizations\):

[https://ops.unocha.org/api/v1/project/appeal/951.xml](https://ops.unocha.org/api/v1/projectshort/appeal/951.xml)

Similar to New Project Module, filtering is not available. In case of limit projects to choosed partner only, we have iterate over each project and compare `organisations -> organisation -> name` or `abbreviation.`

### Project details

During import selected Project, system synchronize all related information like Partner Activities, Objectives, Locations, Indicators etc.

#### New Project Module

To get project details:

[https://api.hpc.tools/v2/public/project/52716](https://api.hpc.tools/v2/public/project/52716)

#### Fields mapping

| **PRP Partner Project model** | **New Project Module response** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `title` | `name` |
| `description` | `objective` |
| `additional_information` | `objective` |
| `start_date` | `startDate` |
| `end_date` | `endDate` |
| `status` | **published** |
| `total_budget` | _`data -> incoming -> fundingTotal`_ _**FTS \(1\)**_ |
| `funding_source` | _**NEED TO BE MOVED AS MODEL \(2\)**_ |
| `clusters` | `globalClusters -> name` |
| `locations` | `locations` |
| `partner` | `organizations` |
| `reportables` | **Only for Chad 2018, Libya** |

{% hint style="info" %}
**\(1\)** To get total budget we have to use FTS endpoint:

[https://api.hpc.tools/v1/public/fts/flow?projectId=47561](https://api.hpc.tools/v1/public/fts/flow?projectId=47561)

where `projectId` is `id` field from project details endpoint, for example:

[https://api.hpc.tools/v2/public/project/47561](https://api.hpc.tools/v2/public/project/47561)
{% endhint %}

{% hint style="info" %}
**\(2\) **Since `funding_source` might have more then one funding relation must be changed to 0 -&gt; N.

```text
class FundingSource(models.model):
    partner_project = models.ForeignKey(PartnerProject,
        related_name="funding_sources")
    source_name = models.CharField(max_length=255)
    source_id = models.IntegerField()
    source_type = models.CharField(max_length=255)
    original_amount = models.DecimalField(decimal_places=2, max_digits=12)
    original_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
    )
    exchange_rate = models.DecimalField(decimal_places=3, max_digits=8,
        default=1)

```
{% endhint %}

**FTS field mapping**

| PRP FundingSource model fields | FTS API response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `partner_project` | **Partner Project object** |
| `source_name` | `data -> flows -> sourceObjects -> name` |
| `source_id` | `data -> flows -> sourceObjects -> id` |
| `source_type` | ",".join\(`data -> flows -> sourceObjects -> organizationTypes)` |
| `original_amount` | `data -> flows -> originalAmount` |
| `original_currency` | `data -> flows -> originalCurrency` |
| `exchange_rate` | `data -> flows -> exchangeRate` |

#### 

#### Additional fields to capture

| **PRP Partner Project model new fields** | **New Project Module response** |
| --- | --- | --- |
| `code` | `code` |
| `priorization_classification` | `projectPriority`** \(1\)** |

{% hint style="info" %}
Only v1 holds this information except Chad and Libya \(that works only on v2\)
{% endhint %}

#### Old OPS

To get project details we have to find interesting project in response:

[https://ops.unocha.org/api/v1/project/appeal/2897.json](https://ops.unocha.org/api/v1/project/appeal/2897.json)

I do not see possibility of filtering data.

#### Fields mapping

| **PRP Partner Project model** | **OPS response** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `title` | title |
| `description` | `description -> ProjectDescription -> Value (where "type": "objectives")` |
| `additional_information` | n/a |
| `start_date` | `startdate` |
| `end_date` | `endDate` |
| `status` | **published** |
| `total_budget` | _`data -> incoming -> fundingTotal`_ _**FTS \(1\)**_ |
| `funding_source` | _**NEED TO BE MOVED AS MODEL \(2\)**_ |
| `clusters` | cluster |
| `locations` | `projectEGF -> egf_location` |
| `partner` | `organisations` |
| `reportables` | **n/a** |

{% hint style="info" %}
**\(1\) and \(2\) **same like in New Project Module - data comes from FTS
{% endhint %}

### Clusters

#### New Project Module

There is `globalClusters`  section where provided ID is global for all projects in system.

**PRP Cluster model fields**

| **PRP Cluster model** | **RPM API fields** |
| --- | --- | --- |
| _`type`_ | _`globalClusters -> name `\(1\)_ |
| _`response_plan`_ | _`plans -> id` \(matched by external\_id\)_ |

#### Old OPS

| **PRP Cluster model** | **OPS API fields** |
| --- | --- | --- |
| _`type`_ | `cluster -> value` |
| _`response_plan`_ | _`appeal -> id `_\(matched by external\_id\) |

### Partner

#### New Project Module and Old OPS

Partner / Organization is stored in `organizations` section. 

{% hint style="info" %}
We need to assign OCHA partners with partners synchronized with PMP system. Contact with Rob Avram from Unicef for details. PRP already synchronize Partners with PMP.
{% endhint %}

### Locations

#### New Project Module

| **PRP Location** | **RPM API Location** |
| --- | --- | --- | --- | --- | --- |
| `title` | `locations -> name` |
| `gateway -> admin_level` | `locations -> adminLevel` |
| ` latitude` | `locations -> latitude` |
| ` longitude` | `locations -> longitude` |
| ` p_code` | `locations -> pcode` |

#### Old OPS

| **PRP Location** | **OPS API Location** |
| --- | --- | --- | --- |
| `title` | `locations -> value` |
| `gateway -> admin_level` | `locations -> level` |
| `gateway -> name` | `locations -< name` |

### Indicators and Disaggregation data

**New Project Module**

To get the full set of information for a project based on its id, you will need to connect to several different endpoints.

1.       First contact the v1 endpoint to get the list of projects for Chad 2018, which will give you the project id’s.

2.      [https://api.hpc.tools/v1/public/project/plan/637](https://api.hpc.tools/v1/public/project/plan/637)

3.       Next get the plan’s specific set of fields from this endpoint.  These are the customized fields relevant to this plan only.  Each condition field has a “name” and “id” value.  You will need this later on to link a project’s set of answers to these fields.

[https://api.hpc.tools/v2/public/plan/637/procedure](https://api.hpc.tools/v2/public/plan/637/procedure)

4.       From the first endpoint, loop for each project to get the “id” and the “currentPublishedVersionId” values for each object in the “data” array.

5.       Then use the project id here to get the overview information of the project:

[https://api.hpc.tools/v2/public/project/52765](https://api.hpc.tools/v2/public/project/52765)

6.      Use the project currentPublishedVersionId to get the cluster indicators it is linked to.  This also includes the project’s values for the disaggregation models set up for each cluster indicator.  
[https://api.hpc.tools/v2/public/project-version/104969/attachments](https://api.hpc.tools/v2/public/project-version/104969/attachments)

7.      Use the project currentPublishedVersionId to get the budget breakdown for each organization in the project.  Data\[0\] is for the whole project, data\[n\] is for each organization in the project.  
[https://api.hpc.tools/v2/public/project-version/104969/segments](https://api.hpc.tools/v2/public/project-version/104969/segments)

8.       Use the project currentPublishedVersionId to get the values for each of the plan’s custom fields.  
[https://api.hpc.tools/v2/public/project-version/104969/fields](https://api.hpc.tools/v2/public/project-version/104969/fields) 

#### Old OPS

Old OPS countries does not have endpoint for Indicators \(yet\).

### 

