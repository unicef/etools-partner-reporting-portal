# AD Integration

We will integrate with Active Directory \(AD\) that UNICEF will provide. User registration, fields, login etc. will be handled by AD. PRP will integrate with it via Oauth2.

Currently users in PRP can login via their email address, instead they will see a button saying “Login” upon clicking which, they will be redirected to AD to login. Once back in PRP they will be logged in with their appropriate email and permissions in PRP that have been set. If the user has not already been setup in Django Admin, an admin can go in and add their roles/permissions.

![](https://lh5.googleusercontent.com/TmtdNj1d6zaxNCsG0amzIzG1BRSMrDGFWkW0iy6ePTl9YvnRj491bp-OF5cny4UxQVkUJLDX1eUeBwRVACYHf5HUvYcmS77Rsf4ZbHlXWSBY2ZywPjSloLcTGRaQ5bt_WNU56oLp)

![](https://lh4.googleusercontent.com/-ribfPPCOOu71qiY1f-y0LC4iQOkPyq8mJm6UytMLJ-LrSdMCmVquBEf63PeLRjgU_F8gkaMmSKAHdIn9zNkkzNuCi8TLiGLNGPLuXQHQNPhXaHOt8Xn4SuVNY2D9NxfBaH7Y8tE)



