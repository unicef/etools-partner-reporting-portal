
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

    def filter_functon(dictionary, key=key):
        if '.' in key:
            keys = key.split('.')
            value_to_compare = dictionary
            for key in keys:
                value_to_compare = value_to_compare[key]
        else:
            value_to_compare = dictionary[key]
        return value_to_compare == value

    try:
        return list(filter(filter_functon, dict_list))[0]
    except (KeyError, IndexError):
        return {}
