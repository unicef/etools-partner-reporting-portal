---
description: DRF API's that support the ID management interface
---

# Backend API's

{% api-method method="get" host="/api/id-management" path="/users/" %}
{% api-method-summary %}
User List
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you to get a list of Users
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-query-parameters %}
{% api-method-parameter name="name\_email" type="array" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="roles" type="array" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="partners" type="array" %}

{% endapi-method-parameter %}

{% api-method-parameter name="clusters" type="boolean" %}

{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Cake successfully retrieved.
{% endapi-method-response-example-description %}

```javascript
{
    "name": "Cake's name",
    "recipe": "Cake's recipe name",
    "cake": "Binary cake"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=404 %}
{% api-method-response-example-description %}
Could not find a cake matching this query.
{% endapi-method-response-example-description %}

```javascript
{
    "message": "Ain't no cake like that."
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="/api/id-management" path="/users/" %}
{% api-method-summary %}
Create a new User
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="position" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="email" type="string" required=false %}
Valid email address format
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}

{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="delete" host="/api/id-management" path="/role-group/:id" %}
{% api-method-summary %}
Delete a PRPRole instance
{% endapi-method-summary %}

{% api-method-description %}
Allows a valid user to delete one instance of a role group
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="patch" host="/api/id-management" path="/role-group/:id" %}
{% api-method-summary %}
Patch an existing PRPRole instance
{% endapi-method-summary %}

{% api-method-description %}
Used when a role is changed in an existing `PRPRole` instance by a valid user. Validation on the role should be done. Eg. an IMO cannot assign a super user role or a IP authorized officer cannot assign an IMO role etc. Additionally the user to which this `PRPRole` is assigned to, should be one that the requesting user is allowed to modify.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="role" type="string" required=true %}
Valid role string
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}



