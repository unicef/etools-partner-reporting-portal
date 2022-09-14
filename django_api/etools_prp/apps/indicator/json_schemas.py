

indicator_schema = {
    "title": "Json schema for total, target, baseline and in_need fields",
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "c": {"type": ["number", "null"]},
        "d": {"type": ["number", "null"]},
        "v": {"type": ["number", "null"]}
    },
    "required": ["d", "v"]
}

disaggregation_schema = {
    "title": "Disaggregation json schema",
    "type": "object",
    "additionalProperties": False,
    "patternProperties": {
        "^\((\d*,\s*)*\d*\)$": indicator_schema  # noqa W605
    }
}
