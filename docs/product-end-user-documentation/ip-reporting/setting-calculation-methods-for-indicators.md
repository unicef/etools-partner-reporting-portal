# Setting calculation methods for indicators

The IP can set the appropriate calculation method for each indicator in a PD. If a partner selects a Ratio or Percent indicator, the calculation method will be set to SUM and greyed out. They cannot change the calculation method unless it is a Quantity Indicator. 

![](../../.gitbook/assets/reporting-ip-pd-calculation_method_03-2x.png)

### Supported calculation methods

The following calculation methods are supported:

* Sum - simply adds data.
* Avg - The average of the data.
* Max - The maximum value in the period being looked at.

### Calculation method across locations

This represents how the IP would like to aggregate the data entered for all the locations in an indicator. Once applied this helps measure the total progress made on an indicator in a reporting period.

### Calculation method across reporting periods

This represents how the IP would like to aggregate the data entered across various reporting periods. This is what decides what progress has been made on an indicator at any given point of time.

The calculation method in this case is applied to the total progress made on an indicator in a reporting period \(not location level data at all\).

### Demo indicator table

When the IP user goes to set calculation methods, we will enable the user to be able to understand the impact their calculation method selection will have, by showing the user some example numbers / data for an example indicator.



![](../../.gitbook/assets/screen-shot-2018-02-12-at-1.16.58-pm.png)

![](../../.gitbook/assets/screen-shot-2018-02-12-at-1.17.15-pm.png)

![](../../.gitbook/assets/screen-shot-2018-02-12-at-1.17.44-pm.png)

![](../../.gitbook/assets/screen-shot-2018-02-12-at-1.17.55-pm.png)

When changing the calculation method and saving, we have a warning modal to that let's user know changing calculation methods will recalculate progress reports for their indicators \([\#875](https://github.com/unicef/etools-partner-reporting-portal/issues/875)\). We will send a notification email to UNICEF Focal point if the calculation method is changed for progress reports in PD that was previously submitted or accepted \(\#[462](https://github.com/unicef/etools-partner-reporting-portal/issues/462)\)

![Warning modal for calculation method change](../../.gitbook/assets/44923720-6562ed00-ad49-11e8-97f7-1619530ff646.png)

