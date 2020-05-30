import json

with open('userdata.json', encoding='utf-8') as json_file:
    data = json.load(json_file)
    users = []
    for p in data: # for each user p in the data file...
        u = {} # create a json dictionary
        u["username"] = data[p]['username']
        u["realname"] = data[p]['fullname']
        u["private"] = data[p]['private']
        u["mutuals"] = data[p]['mutuals']
        users.append(u)
    with open(f'cleandata.json', 'w', encoding='utf-8') as f: # write dict to json file
        json.dump(users, f, ensure_ascii=False, indent=4)
