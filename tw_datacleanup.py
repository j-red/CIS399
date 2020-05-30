import json
import pickle
from os import listdir
from os.path import isfile, join

# def load(name):
#     try:
#         with open(f"tw_users/{str(name)}.pickle", "rb") as f:
#             return pickle.load(f)
#     except:
#         print(f"Error loading {str(name)}.pickle")
#         return False
#
# onlyfiles = [f for f in listdir(r"C:\Users\jared\OneDrive\CIS\399\final\repo\tw_users") if isfile(join(r"C:\Users\jared\OneDrive\CIS\399\final\repo\tw_users", f))]
#
# users = []
# for f in onlyfiles:
#     node = load(f[:-7]) # load the name, but exclude the .pickle portion
#     d = {}
#     d["realname"] = node.handle
#     d["username"] = node.handle
#     d["private"] = False
#     d["mutuals"] = []
#     for i in node.following:
#         if i in node.followers:
#             d["mutuals"].append(i)
#     if len(d["mutuals"]) == 0:
#         continue
#     else:
#         users.append(d) # ignore invalid data points

users = []
with open('data/tw_data.json', encoding='utf-8') as json_file:
    data = json.load(json_file)
    # print()
    for p in data: # for each user p in the data file...
        u = {} # create a json dictionary
        u["username"] = p['username']
        u["realname"] = p['realname']
        u["private"] = p['private']
        u["mutuals"] = p['mutuals']
        if len(u["mutuals"]) > 0:
            users.append(u)

with open(f'data/tw_data2.json', 'w', encoding='utf-8') as f: # write users list to json file
        json.dump(users, f, ensure_ascii=False, indent=4)
