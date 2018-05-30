# Humanitarian Reports \(HR\)

This report type is used in humanitarian situations, when it is critical to receive data on the PD \(or SSFA if applicable\) progress at a higher frequency than quarterly. In this report, the IP provides the following information:

* For each PD output \(or SSFA expected result\), report progress only against humanitarian response indicators defined for the PD/SSFA in PMP, at the level of disaggregation defined, or less or above, if applicable. Humanitarian response indicators are only those defined as:
  * “cluster indicators”
  * UNICEF specific “high-frequency humanitarian response indicators” in PMP.

The structure of this report is simplified compared to the standard QPR. This report does not include PD output rating or narrative assessment of progress and there is no “other info" tab in the user interface for this report. The tab in the PD report page called “Reporting on Results” must be renamed to “Reporting on Indicators”.

There is no workflow following the submission by the IP to UNICEF and Cluster. HR’s status can be set to “Received”, and the underlying cluster specific indicator report \(if any\) would be set to Received as well.

If data for a Indicator \(Report\) has been submitted \(hence "Received"\) already in cluster reporting, then data for that indicator in the HR would not be editable in IP reporting.

The frequency of reporting and report due dates are decided, with the following logic:

* For humanitarian response indicators that are “cluster indicators”, the frequency of reporting \(report start and end dates\) and due dates are those defined in PRP Cluster, with no ability for the UNICEF user to modify dates in PMP; if reporting requirements are modified by the IMO in PRP-Cluster, adjustments will automatically be reflected in PMP and PRP-IP.
* For humanitarian response indicators that are UNICEF specific “high-frequency humanitarian response indicators”, the due date is defined by the user in PMP, and the start and end date of the reporting period are automatically assigned \(start date: previous due date reporting period \(or PD start date for first HR\) + 1 day; end date: due date selected by the user\).

All humanitarian response indicators in the same PD \(or SSFA\) are bundled in the same report when they have the same due date and reporting periods. The same PD may have multiple humanitarian reports, for the same time period that are overlapping, depending on the frequency of reporting defined in PRP-Cluster and/or PMP. Example screenshot showing HF cluster \(one\) d HF non-cluster in the same HR:

![](https://lh3.googleusercontent.com/dQlDGMMnt64nAaGnijp-rb3n680jb61cU5DcKlJrOrOXd5auT2PyhA8pDPXGKVZc6fEGoCTF_nE_BwJFQr0HLUDr-Pm7XcGC6WhUCHM0K0MpzjxO0DvB30FHgk48KSneM8skSn0t)

**​**

Each location for an adopted cluster activity indicator, coming from the PD will also be pushed to the partner activity indicator. So Eg. PAI \(Partner Activity Indicator\) has locations L1, L2 and HF cluster indicator from PD has locations L2, L3. L3 will also be hence added to the PAI. Hence PAI will have a superset of all locations whether already added to it by the partner/IMO or the ones coming from the PD. This change should be wherever we create Reportable's and their locations for PD indicators.

{% hint style="info" %}
Cluster indicators that are adopted in a PD are the ones on which "dual reporting" happens. This implies that the partner will report cluster progress data and have the option to allocate a percentage of that progress towards the UNICEF PD result\(s\). Such will also happen in[ cluster reporting](https://unicef.gitbook.io/prp/product-end-user-documentation/cluster-reporting/reporting-on-results/reporting-to-unicef).
{% endhint %}

### **Screenshots**

![Data entry for a cluster indicator inside a HR](https://lh5.googleusercontent.com/HtbkIXebwmjPJvFTFtE6IhUEZr_NhiY2DKCI5jPK9d4fwkP6VZsD1EKAPlR3ql1muZy8BrSO2S0Yvbsx1Q1vFIeJOSY7UvPfEcD4pNba5udf8Wc21nap7QVXo9pyfsL0zqWAVB7e)

For the reporting entity \(UNICEF\) that a part of the cluster indicator progress data needs to be sent/attributed to, will also be shown in the data entry modal for each location. The user will have to enter the percentage of data they would like to allocate. The user can select whatever disaggregation level they are reporting at, and the reporting entity data will also be saved/attributed then at the same level.

![Appropriate data recorded for UNICEF reporting purposes.](https://lh6.googleusercontent.com/ivspunxSjy17hAoonkQLiIMNYEQrISdBHLKE1FR41glB2OUVhZSPAHBImi6Hn56NuVN59MYHUAJ7lKLanFmttnCuKhCCLdX0jnrIicsSod6TAvMindHDJtBM-tsMOSyEIrD9fqYh)

{% hint style="info" %}
If data for this indicator report \(inside the HR\) has been submitted \(hence "Received"\) already in[ cluster reporting](https://unicef.gitbook.io/prp/product-end-user-documentation/cluster-reporting/reporting-on-results/reporting-to-unicef), then the "ENTER DATA" button data for that indicator report in the HR would not show and hence none of the data will be be editable for it.
{% endhint %}

