def get_dict_from_list_by_key(dict_list, value, key='type'):
    """
    Meant to help out with retrieving items from list that are kind of a dict, eg:
        {
        "totals":[
            {
                "type":"inNeed",
                "name":{
                    "en":"In Need"
                },
                "value":0
            },
            {
                "type":"baseline",
                "name":{
                    "en":"Baseline"
                },
                "value":71
            },
            {
                "type":"target",
                "name":{
                    "en":"Target"
                },
                "value":85
            }
        ]
    }
    """

    try:
        return list(filter(
            lambda x: x[key] == value,
            dict_list
        ))[0]
    except (KeyError, IndexError):
        return {}
