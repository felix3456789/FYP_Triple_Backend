import pymongo

myclient = pymongo.MongoClient("mongodb://chuenpidb.tk:27017/")
mydb = myclient["triple"]
toursCol = mydb["tours"]
tagsCol = mydb["tags"]

def insertTour(dict):
    temp = toursCol.find_one({"tourID":dict["tourID"]})
    if(not temp):
        toursCol.insert_one(dict)
        print('Inserted!')
    else:
        myquery = { "tourID": dict["tourID"] }
        newValues = { "$set": dict }
        toursCol.update_one(myquery, newValues)
        print("Updated!")

def insertTag(dict):
    temp = tagsCol.find_one({"title":dict["title"]})
    if(not temp):
        tagsCol.insert_one(dict)
        print('Inserted!')
    else:
        myquery = { "title": dict["title"] }
        newValues = { "$set": dict }
        tagsCol.update_one(myquery, newValues)
        print("Updated!")
   

