# Cluster Indicators

Indicators in a cluster can belong to following entities:

* Cluster Objective
* Cluster Activity
* Partner Project
* Project Activity: Either one of these
  * Custom
  * Associated with Cluster activity

### Add Indicator Modal

IMOs and partners can create their own indicators. They can choose the type of indicator \(quantity, percent, ratio\) and calculation method for reporting periods/locations.

For _**Quantity indicators**_ IMO's set baseline, target and in-need at the indicator level. If this is a Partner indicator, they can set these too. In-need is optional. If baseline is not set, it defaults to 0. For all indicator types baseline can be greater than target \(\#[914](https://github.com/unicef/etools-partner-reporting-portal/issues/914)\)

At the location level, IMO can set the admin level and specific location pertaining to the level. In-need is optional to set here. IMOs can add multiple locations and disaggregations too.

![](https://lh4.googleusercontent.com/SXBzTrrOf9hN8RYitbUn1SrFWPkb3uZyc63oPCoW0C4IsdKZy17wq0TaEztdcmk3ie6XdzJE542oZjnRlehI0DzDvhWFC_OKlZnTJ-kj9Xhlyk5Rs-dZTFSfV3S2qlnM4Skj_Sr_)

For _**Percentage Indicator**_, we have added 2 labels for numerator and denominator. We won’t have In-Need. We’re only going to take one number for each label. The calculation method will be greyed out and defaulted to SUM.

At the location level, IMO can set the admin level and specific location pertaining to the level. In-need is optional to set here. IMOs can add multiple locations and disaggregations too.

![](https://lh4.googleusercontent.com/oCiTpPmhBqTE20rdPLD6yNYZtHAO6sAphkbRltOuBEqtIJboWK_lc0g-bsmDW-ykQy8Hu6SBZnHdCmncMRdE87RvDcP0xy3awU0p4Dp83dNmG6UegnkZCQ8kn_z-_xRjYuBjYmLk)

  
When it’s _**Ratio Indicator**_, we will have 2 labels, and will take 2 \#s \(numerator and denominator\) for baseline and target. The calculation method will be greyed out and defaulted to SUM. We won’t have In-Need.

At the location level, IMO can set the admin level and specific location pertaining to the level. In-need is optional to set here. IMOs can add multiple locations and disaggregations too. For ratio indicators, there is a numerator + denominator for baseline & target.

![](https://lh3.googleusercontent.com/gcteXd0X6cVKJVgO1wDL-zajXCI6Ox5wL77Z6zl5qoe-ybhfvg2l7u7G2h35a9-COpP19nhQfcoFGX5MMf1VP3TktOm0Hj3FfXDwK-ryTKVoE8qgDkrLcOMQRnE2b3n72aGKShvV)

### Edit Indicator Modal

IMO or Partner can edit an indicator. The location admin level, specific location previously, and disaggregations set are not editable. Locations can be added though.

![](https://lh5.googleusercontent.com/3EjFV21ha2QVvAcR-qx3cU5xEI9PGvVpnHeoyxVjWgS1cGwKVkMdX64esR3S5fBKIMKT2DHpT9ceBm71X5u3Krcs8ns88AR5KaryLdlXrb3qoC9yHQN-TT7uEnTGOf8XuG0XKErz)

_**Partners can adopt \(Cluster\) Activity Indicators previously set by the IMO**_. They are able to edit the target and add locations. If the partner adds a location, they will be able to include the administration level, specific location for the level and target.

Editing Partner Activity Indicator modal derived from CAI a should only allow Partner to add new locations or editing targets on locations \(\#[669](https://github.com/unicef/etools-partner-reporting-portal/issues/669)\). 

![](https://lh6.googleusercontent.com/A-KIeRDMjYPzoFDTDbR3avI1_hxdK9NRB9_ASAU30TphLYbz2VOWWEBAnOAIFJntp8t55qRJXeR0dxh9_cdxSH4kRAm43XFeNeOSiaPyISjshMx6fr0cYAqC-mnJz-3nzphy9_OV)

If the Partner would like to propose a new Baseline and in-need to the IMO, they can send a direct message to the IMO. This will be sent to the IMO's email. We will add  partner users name, email, partner name, indicator, project, plan to the modal and message received by the IMO.

![](https://lh3.googleusercontent.com/DWGM_egjN1j33XXeNJQbflfnc0mWOfiafFDDYE2ITHv6EzHTOMjsacIXmPpaIV0Pge9MkJ1E5St8k8EJuSmA8wXC59OGOAyyJxH03zXThqTZD1NJ0D6SHYjEKfqOegEmfzeoKtb-)

### Showing Current Progress against Target and against In-Need

In the Indicator Reports, users will be able to see the current progress against Target and In-Need.

Current Progress =  achievement/in-need \(\#[647](https://github.com/unicef/etools-partner-reporting-portal/issues/647)\).

![](https://lh4.googleusercontent.com/6BHlmxUejYlX_z2LHM56NDumX_8JgAenXKYdkdQluvyvDIruPJOKsEzSsMBB1ydESNW38JROpxSD_uwagHwKUc2z1JpPU0MHS6VR8epeNHTNI_ihE3zS0SHRGnG-Co_63LALOIxX)

For Quantity Indicators, IMOs will be able to enter new baseline and In-Need for specific locations in bulk. In-need is optional and Baseline defaults to 0. 

For CAI, once IMO updates baseline and In-need for the specific location from the Locations section, it will get pushed down to the partner for PAI \(\#[1048](https://github.com/unicef/etools-partner-reporting-portal/issues/1048)\).

![](https://lh3.googleusercontent.com/-4DIgKH4ORiH50vi98SZXGg4--v_w10mSGhr1xliPD3krcx1ndoowFy0O9BILvinqEwPNXQQ8taFTBak0-PwZQqr6EpBC7oYqE9oXNG7Sa-zj2ArGherjN7WmsQeZUTIY0LO_gRb)

For Percent Indicators, IMOs will be able to enter a new Baseline. It defaults to 0.

![](https://lh6.googleusercontent.com/-YVIa3sXfOceuc4UIce2Lfpte03yTGTaCjpa04w1wTjtdivK7Vtf8HN-zv1BCSbiKBGld9UJ17VCwjBq2nvuFl_YLhK9hc8GJx25ed1I79S0dBQvgYLtmIns2updLn3k0MzytBK4)

For Ratio Indicators, IMOs will be able to enter a new Baseline. The data key specifies the numerator and denominator.

![](https://lh6.googleusercontent.com/_Ep9SObps2aDSe_FIqv55igZXtoV7ZHZDJmPA1Kdk8yOyR16DksTJJfp6VJtf_HpnjwzwY6Ut5-zz_MRoqPbjmEgdXtWFyfZcIX0QzvQmCCf3LkDVoqjmg8x36zm9rQyubiPyzLD)

When a partner adds a location after adopting a Cluster Activity Indicator, baseline and target will sync from each location from the CAI. \(\#[1055\)](https://github.com/unicef/etools-partner-reporting-portal/issues/1055)

### Helper Text

When looking at an indicator edit/create modal, the user can click on the 'i' for helper text associated with the field.  

Additionally for calculation method selection we will show a modal similar to in [IP reporting](https://unicef.gitbook.io/prp/product-end-user-documentation/ip-reporting/setting-calculation-methods-for-indicators#demo-indicator-table) where the user will be able to see the impact of that selection.  


### Report Generator Logic

When a new indicator is added, all reports whose start date + due date before the day of report generation will be created. Indicator reports are created as soon as locations are added to the indicator \(\#[675](https://github.com/unicef/etools-partner-reporting-portal/issues/675)\). It typically takes around 5 minutes for reports to generate.

After reports are generated, the future reports will be generated on the due date of latest indicator report based on their frequency to prevent partners from reporting early. 

If the frequency of a report is changed, none of the existing reports will be affected. Only the future reports will change to the new frequency. For example, if weekly reports are being generated and partner/imo changes to weekly on the 16th of the month, the report will finish for its intended due date and then switch to monthly after. If the due date is on the 20th, the next report will go from 20th - end of month for monthly report frequency. The following report will go from 1 to end of the month. This is specific for cluster reporting. 

We only generate indicator reports for indicators for Cluster Objective, Partner Activity, and Partner Project indicators in Cluster Reporting.

If the indicator has custom specific dates as frequency type, the first indicator start date will be according to the start date of indicator. The list of custom specific dates specified in the indicator will be the start dates of subsequent reports. 



