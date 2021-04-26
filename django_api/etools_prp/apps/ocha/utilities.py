
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


def convert_to_json_ratio_value(value):
    """
    Get value as converted to json kind of storage we're doing eg on Reportable
    """
    try:
        value = float(value)
    except Exception:
        value = 0
    return {
        'v': value,
        'd': 1,
    }


def trim_list(object_list, api_data_type):
    out = []
    for obj in object_list:
        try:
            data = {
                'id': obj['id'],
                'name': obj['planVersion']['name'] if api_data_type == 'response_plan' else obj['name'],
            }
            # if api_data_type == 'partner_project':
            #     data['clusters'] = obj
            out.append(data)
        except KeyError:
            pass
    return sorted(out, key=lambda x: x['name'])
