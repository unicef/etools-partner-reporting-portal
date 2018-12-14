# Reporting on results

In this section \("Reporting Results" in the left hand navigation\) of the interface partners can come and report in the indicator reports that are due. IMO's can do the same for any partner and submit data on their behalf. Interface is split into:

* Draft/Due reports \(default tab\)
* Submitted reports

{% hint style="info" %}
**Partners do not create indicator reports** in PRP. These are auto-generated for them at a frequency as setup/agreed upon at the indicator level either by them or the IMO, depending on what this indicator is associated with.
{% endhint %}

The reports list can be filtered by cluster, partner \(defaults to the partner to whom this user is associated with, if its a partner user\), indicator, indicator type etc.

Indicator type options will be: Partner Activity, Partner Project, Cluster Objective, and Cluster Activity. 

If partner filter is used, system will only grab Partner Activity and Partner Project indicators only \(\#[846](https://github.com/unicef/etools-partner-reporting-portal/issues/846)\)

![](../../../.gitbook/assets/screen-shot-2018-03-07-at-4.56.23-pm.png)

### Entering data

For each indicator report the partner can enter progress data for each location in which this indicator is being tracked. Additionally they can give an "overall status" and narrative assessment as well \(\#[696](https://github.com/unicef/etools-partner-reporting-portal/issues/696)\). Narrative will auto save after 2 hours \(\#[832](https://github.com/unicef/etools-partner-reporting-portal/issues/832)\). Indicators can have max 2 decimal points \(\#[1043](https://github.com/unicef/etools-partner-reporting-portal/issues/1043)\)

We will have a data key to specify the labels of the indicators that are set in the add/edit indicators. The data key will be available when IMO edit’s locations or IMO/Partner reports on data for all indicators \(quantity, ratio, percent\).



![](https://lh3.googleusercontent.com/Xf308Gio6iW1ozNvXdTTQkqb3vmATbPoUtJoKeW-Dv8I14OysdTqVdv2FcgvqIT4gtV8Klc2NvDqf3U59ibFXvbRpBywriiT8B_Wa4SmD96Y_9pI3A9RKKAJVcce3xj7zg9_f59t)

![Ratio Indicator ](../../../.gitbook/assets/reporting_01-2x.png)

### Submitting an indicator report

Once all the data for all locations has been entered the indicator report can be submitted. Once submitted the indicator report goes under "Submitted Reports" tab, and can be reviewed by the IMO. Once submitted, none of the report data can be modified by anyone. The IMO may send back the report and add feedback/comments if they would like to see changes to the report.

![](https://lh4.googleusercontent.com/X5LDkUK70raGw9nXbAHSbyRJNr_TRDZnMaEqx-IMiSuFZWCj5gvslDMr9Nj4KUpY1h-7APKzGwaxaeeDVsNZKa6QNF5ML-6tZA9s-QVnInQNMh_sWI_-CI8WpYxZs7fe0M2DVD1U)

The Partner will see the report the Draft/Due Column with a ‘Sent Back’ notice. They will be able to make the appropriate edits and re-submit.

### **Import / Export of data**

On the Reporting Results Page, we will have 3 options for the user

* Export Template
* Export
* Import Template

Partner/IMO can download the export template for the indicators they are currently looking at based on the applied filters in xlsx format that includes all of the data pertaining to the indicators. The partner or IMO can enter the proper disaggregation value here instead of on the platform.

Partners cannot enter data via import/export for indicators that do not belong to them \(\#[636](https://github.com/unicef/etools-partner-reporting-portal/issues/636)\)  
****

![](https://lh6.googleusercontent.com/JdcLPeZVCxZDz76q9a6FwpufirqwDfiEZj1OrRaXz06kMJOmDN81XZZQ2hbHAjT4Rrtn-T1T6BR-xL5DTI77kmupcn2QP_ISM3BrGKnv3DQLloxoWGIY5uiHe7fv8zMK5M-RFTiK)

The export template should include multiple rows with indicators, locations etc and data on targets, in-need, baseline \(where available in PRP\). The only thing that should be blank \(no data\) should be the achieved data that the partner will report on. If they have not stated targets in PRP then that column might have no data and could also be filled.

Here is a link to an example export of multiple reports: [https://docs.google.com/spreadsheets/d/1CDQP0VLgRIQbzJ-SUpgZSG4l9-n-6iVt65jnW8m5ucQ/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1CDQP0VLgRIQbzJ-SUpgZSG4l9-n-6iVt65jnW8m5ucQ/edit?usp=sharing)

Once the Partner/IMO is done editing the export template, they can upload it via import template. They will only be able to update the disaggregation value and will receive an error if they add/delete columns or edit any data that is not a disaggregation.  
****

![](https://lh6.googleusercontent.com/I8LAZGL-gN1wQGK-_wxFwZCK2KSNnqByxAr1wQrdfBYJ8mI_qKkWxAiy-gUsTWr8Qsr2dyJPIY4Kta3wkK9Lx9uFsSbBbHnYMdCzPiy8aWuKCGX74r_Gh0awVt6rbI_PnoV5DfBp)

Partner/IMO cannot import submitted/accepted reports. We will validate to make sure users do not add/subtract disaggregation value for indicators that pertain to them.

The Export Analysis will be similar to the Export Template but also have Cluster ID, Cluster Objective ID, Activity ID, Indicator ID, Partner ID, Project ID, Report ID, Location ID. Here is an example  [https://docs.google.com/spreadsheets/d/1PNFzzN75daFZ\_uHF\_8nB1yjTeGWbv5ec5n0vRS2chac/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1PNFzzN75daFZ_uHF_8nB1yjTeGWbv5ec5n0vRS2chac/edit?usp=sharing)

For IP and Cluster When NO Location Progress data is entered, it should be null \(-\) as opposed to 0. \(\#[966](https://github.com/unicef/etools-partner-reporting-portal/issues/966)\)

### Workflow of Indicator Reports

By default indicator reports go into accepted state once submitted by a partner. The IMO can decide to "send back" a report for revision.

![IMO can send back to partner, an indicator report](../../../.gitbook/assets/cluster_reporting___prp.png)



