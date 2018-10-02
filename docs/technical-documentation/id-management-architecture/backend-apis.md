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
{% api-method-parameter name="workspaces" type="array" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="name\_email" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="roles" type="array" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="partners" type="array" %}

{% endapi-method-parameter %}

{% api-method-parameter name="clusters" type="array" %}

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
{% api-method-parameter name="last\_name" type="string" required=true %}

{% endapi-method-parameter %}

{% api-method-parameter name="position" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="email" type="string" required=true %}
Valid email address format
{% endapi-method-parameter %}

{% api-method-parameter name="first\_name" type="string" required=true %}

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

{% api-method method="post" host="/api/id-management" path="/role-group/" %}
{% api-method-summary %}
Create PRPRoles
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows a valid user to create multiple roles for a single user.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="prp\_roles" type="array" required=true %}
an array of {"role": "ROLE\_TYPE", "cluster": cluster\_id, "workspace": workspace\_id}
{% endapi-method-parameter %}

{% api-method-parameter name="user\_id" type="integer" required=true %}

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

{% api-method method="get" host="/api/id-management" path="/assignable-clusters/" %}
{% api-method-summary %}
Assignable Cluster List
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows a valid user to list all user's clusters that can be assigned to other users
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

{% api-method method="get" host="/api/id-management" path="/partners/" %}
{% api-method-summary %}
Partner List
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you to get a list of partners.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-query-parameters %}
{% api-method-parameter name="partner\_type" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="clusters" type="array" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="title" type="string" required=false %}

{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
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

{% api-method method="post" host="/api/id-management" path="/partners/" %}
{% api-method-summary %}
Create a partner
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows a valid user to create a partner.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="ocha\_id" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="external\_id" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="external\_source" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="title" type="string" required=false %}
Full Name
{% endapi-method-parameter %}

{% api-method-parameter name="short\_title" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="shared\_partner" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="alternate\_title" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="cso\_type" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="partner\_type" type="string" required=true %}

{% endapi-method-parameter %}

{% api-method-parameter name="phone\_number" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="email" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="city" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="street\_address" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="country\_code" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="postal\_code" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="total\_ct\_cy" type="number" required=false %}
Total Cash Transferred per Current Year
{% endapi-method-parameter %}

{% api-method-parameter name="total\_ct\_cp" type="number" required=false %}
Total Cash Transferred for Country Programme
{% endapi-method-parameter %}

{% api-method-parameter name="alternate\_id" type="integer" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="vendor\_number" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="type\_of\_assessment" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="raiting" type="string" required=false %}
Risk Rating
{% endapi-method-parameter %}

{% api-method-parameter name="basis\_for\_risk\_raiting" type="string" required=false %}

{% endapi-method-parameter %}

{% api-method-parameter name="clusters" type="array" required=false %}

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

