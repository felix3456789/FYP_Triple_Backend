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

# def insertHashtag(dict):
#     tempTag = tagsCol.find_one({"title":dict["title"]})
#     if(not tempTag):
#         _id = tagsCol.insert_one(dict)
#         print('Inserted!')
#         print(_id.inserted_id)
#         return _id.inserted_id
#     else:
#         myquery = { "title": dict["title"] }
#         newValues = { "$set": dict }
#         _id = tagsCol.update_one(myquery, newValues)
#         print("Updated!")
#         print(tempTag["_id"])
#         return tempTag["_id"]
   

