from twython import Twython
import pickle
import math

# import networkx as nx
# import matplotlib.pyplot as plt

# The following returns a list of user dicts
# twitter.lookup_user(user_id=user['id'])[0]['name']

# for i in range(numFollowers):
#     print(f"User with ID {each} is following J4_3D")
#     print(f"{followers['users'][i]['name']}, @{followers['users'][i]['screen_name']}")
# for i in range(numFriends):
#     print(f"User with ID {each} is following J4_3D")
#     print(f"{friends['users'][i]['name']}, @{friends    ['users'][i]['screen_name']}")

# GET USER FOLLOWERS LIST
# followers = twitter.get_followers_list(screen_name = "J4_3D")
# follower_obj = twitter.get_followers_ids(screen_name = "J4_3D")
# follower_ids = follower_obj['ids']

APP_KEY = "OFBFvd6X5pX23agO2PqbwnPdM"
APP_SECRET = "KUtUmoQW7yAa5knfNMDghDgl3j65iZz5vQBdQsl49RXZk6T2Jb"

# backup keys
APP_KEY = "vhaTzRYestRPuKZY9fAkA85tv"
APP_SECRET = "nX2HQIfrZ44zJATqwR1J9ZxNdXb4TmfNCRyuVBWxLgf150u2vC"

# SETUP ACCESS TOKEN
twitter = Twython(APP_KEY, APP_SECRET, oauth_version=2.0)
ACCESS_TOKEN = twitter.obtain_access_token()
twitter = Twython(APP_KEY, access_token=ACCESS_TOKEN)

# Initial nodes to branch from. Functions best for accounts with < 5K friends
initialUsers = ['J4_3D', 'claudvonriegan', 'fivehournaps', 'minzsaurus', 'skoodenfroodie']

init = []
followers = twitter.get_followers_list(screen_name = "J4_3D")['users']
# print(followers)
for user in followers:
    init.append(user['screen_name'])
print(init)

# user_string = ",".join(initialUsers)
user_string = ",".join(init)

class Node:
    def __init__(self, id, name='', screen_name='', followers=[], friends=[]):
        self.id = id
        self.name = name
        self.screen_name = screen_name
        self.followers = followers # A list of follower IDs
        self.friends = friends # A list of following IDs

    def __str__(self):
        return f"[@{self.screen_name}, {len(self.followers)}/{len(self.friends)}]"

def save(obj, name):
    with open(f"pickles/{name}.pickle", "wb") as f:
        pickle.dump(obj, f)

def load(name):
    try:
        with open(f"pickles/{str(name)}.pickle", "rb") as f:
            return pickle.load(f)
    except:
        print(f"Error loading pickles/{str(name)}.pickle")
        return False

def resetTable():
    table = {}
    lookup = twitter.lookup_user(screen_name=user_string)
    for user in lookup:
        print(f"---- {user['name']}, @{user['screen_name']} ----")
        print(f"ID: {user['id']}")

        name = user['name']
        screen_name = user['screen_name']
        id = user['id']

        try:
            follower_obj = twitter.get_followers_ids(screen_name = user['screen_name']) # this object returns the dict of {'ids', 'next_cursor', ...}
            follower_ids = follower_obj['ids'] # only care about ids list
            # friends_obj = twitter.get_friends_ids(screen_name = user['screen_name'])
            # friends_ids = friends_obj['ids']
            table[screen_name] = Node(id, name, screen_name, follower_ids)
            print(f"pickling @{user['screen_name']} with {len(follower_ids)} followers.")
            save(user, user['screen_name'])
        except:
            # if the user is private:
            table[screen_name] = Node(id, name, screen_name)

        save(table, "table")


def updateTable():
    table = load("table")
    follows = []
    for originator in table.keys():
        for follower in table[originator].followers:
            follows.append(str(follower))

    print(f"{len(follows)} followers over {len(table.keys())} originators.")

    callsRequired = math.ceil(len(follows) / 100) # functionality for > 5K followers

    for i in range(callsRequired):
        id_string = ",".join(follows[:100])

        lookup = load(f"lookup{i}")
        if lookup == False: # if this far hasn't been loaded yet
            print("Doing a lookup for a couple ID's....")
            lookup = twitter.lookup_user(user_id=id_string)
            save(lookup, f"lookup{i}")

        for current in lookup:
            id = current['id']
            name = current['name']
            screen_name = current['screen_name']

            follower_count = current['followers_count']
            friends_count = current['friends_count']

            if screen_name in table.keys():
                print(screen_name, "already in table")
            else:
                # print(screen_name) # print the name of the ith user in the lookup
                table[screen_name] = Node(id, name, screen_name)
    save(table, "table")

def main():
    lookup = twitter.lookup_user(screen_name=user_string)

    for user in lookup:
        print(f"---- {user['name']}, @{user['screen_name']} ----")
        print(f"ID: {user['id']}")

        name = user['name']
        screen_name = user['screen_name']
        id = user['id']

        # these requests are the ones being limited? 15
        follower_obj = twitter.get_followers_ids(screen_name = user['screen_name']) # this object returns the dict of {'ids', 'next_cursor', ...}
        follower_ids = follower_obj['ids'] # only care about ids list
        # print(follower_ids)
        numFollowers = len(follower_ids)
        # friends_obj = twitter.get_friends_ids(screen_name = user['screen_name'])
        # friends_ids = friends_obj['ids']
        # numFriends = len(friends_ids)

        table[screen_name] = Node(id, name, screen_name, follower_ids)

        try:
            open(f"pickles/{user['screen_name']}.pickle", "rb")
            # print(f"successly opened {user['screen_name']}.pickle")
        except:
            print(f"pickling @{user['screen_name']}")
            save(user, user['screen_name'])
        save(table, "table")

def printTable():
    table = load("table")
    print(f"Table contains {len(table.keys())} keys.")


if __name__ == "__main__":
    table = load("table")
    user = 'J4_3D'
    # print(f"User {user} has {len(table[user].followers)} followers.")
    # main()
    resetTable()
    updateTable()
    printTable()
