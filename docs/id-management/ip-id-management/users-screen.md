# Users screen

## **Adding new User**

Adding new user is possible by clicking button placed in the top right of this screen.

![Top of the screen with button &#x201C;add new&#x201D;](https://lh3.googleusercontent.com/e9UpehTvMgXHDLvaXgT_a0Wnsi9za8mNNi9uVMoZxjjkM4yCKbkROhbw4eMHKX5pi_QUk_pg5yz5wIYcXxY8Nziz8pEOV1oWT5HMNFF5z9L7V3HfQVc6idlCzXzfGtqMnF4hctiQ)

  
When button is clicked, following modal windows are displayed to the user:

![Add new user modal window](https://lh4.googleusercontent.com/rOLyWKkh6pau8no9gTacyGTFmv0593SzHB8dWrqT6OnZGrJKN1hSu-fZOEZKCUyYUhrG1W2eHIbcKf7BDPRJtVGG2Ys5A2LzotlOii08zfw8eD7OgAp1O4TmsP5WycjSEFbKBtO4)

  
If user already exists in data base, the following error message will be displayed. Saving changes and continuing is impossible.

![Error message](../../.gitbook/assets/screen-shot-2018-07-10-at-16.15.41.png)

When information is provided, user can press “save and continue” button which will take him to the next modal window, where permissions can be assigned to just added person:

![Add permissions modal window](https://lh5.googleusercontent.com/cxVnQ4CZq7OBpWr84aeOT30W2KsCfqOEi7b9y6QVxwRr3lOZYzJo8NCbgMZzhVu7yVPo9lcNug32TS5e2gdlEPrG_OBQmwC5fNYHfdwHGMHtjKaXBKmtxRypcPgXMZxxxGL7wzCw)



Role of each user depends on the workspace. Logged in user can only assign roles for other users in workspaces, where he has a role of Authorized Officer or IP Admin.  
****

Authorized Officer will have the possibility to add a new CSO user as an IP Admin. IP Admin can designate access permission for the organization and add more users as IP Editors or IP Viewers.



## Filters

  
****On the top of the screen person can use filter area to narrow down search results that appear below.

![Filters on Users screen](https://lh4.googleusercontent.com/vpmTEM1A2fPOMwhDQ-gBbPZT4-x0gwPe2vudtCphC9s4As4nUguJoGhodX8d0TOMzv4s7wE5DMnQtmMs1VCgV6OaRY-PU00qcNHoTsjzSYDqAJVKjHzFgTQ_pTEp9cYmKj1a3Vs2)

## **Search results**

Below filters user can see search results in a form of a list of users. It contains columns:

* Name
* Position \(optional field\)
* E-mail
* Status \(Active or Invited\) - Row will be highlighted if no role has been assigned to them.
* Last login

![Search results on User screen](https://lh4.googleusercontent.com/l5CZ2lN3xyP_qVnwQmMLTPCdHjjRCt2SKcfu-3i_wlM-DJ31notAkjfCwX3KFyGxrdKq69mN5KdiYsdjmgdj7fkoc1Q5jKAktw2nOk80G7ACT7RbnXiBWXlloB6HE5Irve4Djr8c)

  
Each row in a table is expandable. By expanding a row, additional data is revealed. This data shows information about user’s permissions per workspace.

### Edit/delete/add new permission

**Depending on the role of logged in person, different actions can be taken here:**

* **As Authorized Officer** of particular workspaces, this person can make the user an IP Admin or can delete \(remove\) this role for this user in those workspaces. These actions are accessible by clicking on the links next to the Workspace/Role pair.
* If AO is logged in and there are other AO's in the system \(can re-use existing user list API endpoint with AO filter\) then at top of user list \(above filters\) show the names of those AO's and a link saying "see all below" which triggers the filter then.
* Also if role is AO a different color in the table row to make it stand out.
* Only Authorized officers from PMP will be synced and assign correct roles in the new ID management data models.
* AO of a workspace can remove AO role from another user in same workspace.

![View of IP Admin of Kenya and India workspaces ](https://lh6.googleusercontent.com/bHak4nMtGJo98IMXTf7eP7qw9cVO6xpFLPXYyTrwrTUqHbPJrsYqS2cqKO27vDdpafoPNXk_cJPfg-joFVqRrVT1fiPuYtT-gHTMCBMBDtBK8VbsE3BPRTifyg-Inu9o6K_qUE4R)

Both actions of making and removing a role of IP Admin will display modal window, so Authorized Officer will need to confirm this decision:

![Confirmation for making the user an IP Admin](https://lh5.googleusercontent.com/I1R9pQl1ED6yfE78VMtmge55iq1KEMWKPoIftfm9pO8Wh_xXyQ6n8shywdiPbwhzGthOktt4v8Buwf3oiyJ9_hOsGy-F9-a39V2q7xCTGIl7JDfbnT5ci-DNxVHhkr4G3IZ_wjwg)

![Confirmation for removing an IP Admin role](https://lh5.googleusercontent.com/RFDEBuPOOYP4wecSB9sR02ZgyfmwYRJ9nSbkP5sZ-7EfTJPk_601VAiv5EmKaZ-BnJcw3bG0mE0_mMJs4KdE5Fc8SauyZ_Ubr9Rr4DcGs9NZqN4GanzWG4dsufRQFf88hCkZ7ZJf)



* **As IP Admin** of particular workspaces, this person can edit or delete roles for users in those workspaces. These actions are accessible by clicking on the links next to the Workspace/Role pair:

![View of Authorized Officer of Kenya and India workspaces](https://lh3.googleusercontent.com/uXk3WnEWoG3riO2BDXnVgJxYb34EVGlE1gSJdePk-e73RdVm26WOmBuX7OU_9G3M7zR3FfQCkY6Mo4de-QdueNDFsJ2K0Mg1dHccshBupAKYtDRdfnkppQFE3XxFgLko3yYkoPCD)

Editing a role takes place in a modal window:

![Edit permissions modal window](https://lh3.googleusercontent.com/Tv1Tsi4D4qhpEkiUm7PY6OZT_axfwzLIxrSpeeNT5z0kT5TIONSsHBop-ocjRyDcw1Hcb2n1b3w__iJaoP9ZL03Uqxtk877mKLUDV3BvKACjSjOusXE6PlgPxrgeERU_9t2m4xQx)

  
For chosen workspace \(this field is not editable\), user can select different role and save changes.  


* **Both Authorized Officer and IP Admin** can add new permissions for the user. Clicking on “Add new permissions” button will display modal window:

![Add new permission modal window](https://lh5.googleusercontent.com/D9cPxllapbMsumOcm_M3CdEPkmY40k6pdAIOS3HfK993aPXm7oHEh5FgepEcKWjG312UCNnU9nuJ-B1nQMklJKUPbc9oTLDet3QaFm3GSTv2XjRNndeljdrz5o_SmH-16RKUp3uV)

User can select from workspaces he has access to.

### No permissions assigned

User with no permissions assigned is displayed in the UI as shown below. Status of this user has additional information \(No roles assigned\):

![](../../.gitbook/assets/image-2.png)





### Information about other Authorized Officers

If user is logged in as an  AO and there are other AOs in his workspaces, information \(as shown below\) will be displayed:

![](../../.gitbook/assets/screen-shot-2018-08-22-at-19.47.34.png)

  
Clicking on the button "Click here to see them" will filter search results.

##  

