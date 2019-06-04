import pymongo

myclient = pymongo.MongoClient("mongodb://chuenpidb.tk:27017/")
mydb = myclient["triple"]
toursCol = mydb["tours"]
tagsCol = mydb["tags"]
hashtagsCol = mydb["hashtags"]

def insertTour(dict):
    temp = toursCol.find_one({"tourID":dict["tourID"]})
    if(not temp):
        _id = toursCol.insert_one(dict)
        print('Inserted!')
        print(_id.inserted_id)
        return _id.inserted_id
    else:
        myquery = { "tourID": dict["tourID"] }
        newValues = { "$set": dict }
        _id = toursCol.update_one(myquery, newValues)
        print("Updated!")
        print(temp["_id"])
        return temp["_id"]

def insertTag(dict):
    tempTag = tagsCol.find_one({"title":dict["title"]})
    if(not tempTag):
        _id = tagsCol.insert_one(dict)
        print('Inserted!')
        print(_id.inserted_id)
        return _id.inserted_id
    else:
        myquery = { "title": dict["title"] }
        newValues = { "$set": dict }
        _id = tagsCol.update_one(myquery, newValues)
        print("Updated!")
        print(tempTag["_id"])
        return tempTag["_id"]

def insertHashTag(dict):
    temp = hashtagsCol.find_one({"title":dict["title"]})
    if(not temp):
        _id = hashtagsCol.insert_one(dict)
        print('Inserted!')
        print(_id.inserted_id)
        return _id.inserted_id
    else:
        myquery = { "title": dict["title"] }
        newValues = { "$set": dict }
        _id = hashtagsCol.update_one(myquery, newValues)
        print("Updated!")
        print(temp["_id"])
        return temp["_id"]


def update_tags(dict, new_tag, tourID):
    temp = toursCol.find_one({"tourID":dict["tourID"]})
    if(temp):
        myquery = { "tourID": dict["tourID"] }
        newValues = { "$set": dict }
        _id = toursCol.update({'tourID': tourID}, {'$push': {'hashtags': new_tag}})
        print("Updated!")
        print(temp["_id"])
        return temp["_id"]
    