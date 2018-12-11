# User Interface

The overall user interface for IP Reporting consists of the following sections. Click on each tab below for more details:

{% tabs %}
{% tab title="Overview" %}
Gives partner details and risk ratings. This data comes from the PMP system and displayed to the partner for their information only. This data cannot be modified in PRP.
{% endtab %}

{% tab title="Programme Documents" %}
Filterable \(defaults to signed and active PD's\) list of the PD's associated with the partner. Can filter by ref \#, title, pd status and location. Report \# will not be on the PD list page.

![](../../.gitbook/assets/screen-shot-2018-02-12-at-1.11.46-pm.png)

Clicking a PD will give more details \(shown in mockup below\) about this PD, its associated reports \(separate tab\), and also being able to set the [method of calculation](setting-calculation-methods-for-indicators.md) \(separate tab\) for each indicator associated with each output \(LLO\) within this PD.

![](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-KzwqgC7O0kW5EDlHvvK%2F-L4c0bvrfEPWnSxYQa0b%2F-L4c0iMbmQhsWwBUj8sx%2FScreen%20Shot%202018-02-05%20at%202.10.21%20PM.png?alt=media&token=f8c9102a-d906-4aa9-9840-938997f333aa)

Amendment section will not display if there are no amendments \(\#[732](https://github.com/unicef/etools-partner-reporting-portal/issues/732)\)

Additionally we will show a "Reporting Requirements" in a blue box, under which will have all reports in the future. The columns will be:

* Report name
* Due date - \(DD/MM/YYY \#[740](https://github.com/unicef/etools-partner-reporting-portal/issues/740)\)
* Reporting period

Nothing in it is clickable.



![Reporting Requirements](https://lh4.googleusercontent.com/p9SwdJ5o1cX2-McWj1RS0cpfPBoqLhHeajL4jwc8qeWJpQ6o51RnAJJZ3gGV7n-sNS_XiDkS2bS0J_jTA1L5TCiEmn8OSTOqmrohXO8AWSVaY61aFtNZFdyEBsiBN20ljzrrnjq4)

This data comes from the PMP system and displayed to the partner for their information only. It cannot be modified in PRP.

If a PD is suspended, we no longer 'move' the final report date to when it was suspended. The final report will stay the same as previously assigned \(\#[704](https://github.com/unicef/etools-partner-reporting-portal/issues/704)\). Once inside a Suspended PD, we should have the header message "PD is suspended, please contact UNICEF programme focal person to confirm reporting requirement" \(\#[700](https://github.com/unicef/etools-partner-reporting-portal/issues/700)\).  
{% endtab %}

{% tab title="Progress Reports" %}
Filterable list of the Progress Reports associated with all the various PD's of this partner. The user does not generate progress reports, but these are generated periodically/automatically for the partner based on the reporting periods and due dates set by the PO at UNICEF.

See the [progress reports section](progress-reports/) for more details on submission process, various statuses etc. of a progress report.

### Progress Reports - list view

The default list view for progress reports will be status, sent back and due report, and report type: QPR, HR & SR. The partner will have the ability to select a different report status to show all reports. The columns in progress report list will also be sortable.

![](../../.gitbook/assets/screen-shot-2018-02-05-at-1.58.35-pm.png)
{% endtab %}

{% tab title="Indicators" %}
Filterable list of all the indicators associated with all the PD's for this partner who is signed in. This view shows the progress % against each indicators target.

By default PD status will be selected to "Active". The user can change this as desired.

Unicef/Cluster indicators and show report type. Partners can find high frequency from report type. Dates format should be day/month/year.

Indicator list should only displays the last 2 submitted or accepted reports data \([\#873](https://github.com/unicef/etools-partner-reporting-portal/issues/873)\)

There will be no 'In Need' progress column in IP \([\#769](https://github.com/unicef/etools-partner-reporting-portal/issues/769)\)

![](../../.gitbook/assets/screen-shot-2018-02-12-at-1.14.34-pm.png)

**PD \(UNICEF only\) indicator or High Frequency non-cluster indicator**

Clicking on details of each PD \(UNICEF only\) indicator or High Frequency non-cluster indicator will show the latest and previous to latest data reported against that indicator by this partner. This data is part of an indicator report, which could be in a QPR \(in case of PD UNICEF indicator\) or a QPR / HR \(in case of high frequency non-cluster indicator\). The PD blue hyperlink will lead to the specific PD and the date blue hyperlink will lead to that specific report.

The latest and previous to latest is always decided based on the "end date" of the report \(whether QPR or HR, doesn't matter\).

Report data shown will be for Indicator Reports that have been marked either submitted or accepted \(received in cluster\).

**Cluster Indicators**

For cluster indicators, the behavior described above still applies. 
{% endtab %}
{% endtabs %}





