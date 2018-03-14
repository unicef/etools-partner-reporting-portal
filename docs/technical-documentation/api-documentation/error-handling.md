# Error Handling

Original Django Rest Framework has been modified a bit for consistency and extended to include error codes.

Expected http status codes are **404** and **400**. **400** response details have been detailed below.

### General / Non Field Errors

 A response for a single error would look like this:

```javascript
{
    "non_field_errors": [
        "Error message"
    ],
    "error_codes": [
        "invalid"
    ]
}
```

Multiple errors can be provided under `non_field_errors` key, eg.:

```javascript
{
    "non_field_errors": [
        "Error message",
        "Another error"
    ],
    "error_codes": [
        "invalid",
        "invalid"
    ]
}
```

### Field Errors

Errors related to fields will be returned as a mapping

```javascript
{
    "email": [
        "This field is required."
    ],
    "error_codes": {
        "email": [
            "required"
        ]
    }
}
```

And of course can contain multiple messages per single field

```javascript
{
    "field1": [
        "Err1",
        "Err2"
    ],
    "field2": [
        "Err3"
    ],
    "error_codes": {
        "field1": [
            "invalid",
            "invalid"
        ],
        "field2": [
            "invalid"
        ]
    }
}
```

Any exceptions to these rules should be treated as bugs and reported.

