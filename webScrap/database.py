import pymongo

myclient = pymongo.MongoClient("mongodb://chuenpidb.tk:27017/")
mydb = myclient["triple"]
mycol = mydb["tour"]

def insertTour(dict):
    temp = mycol.find_one({"tourID":dict["tourID"]})
    if(not temp):
        x = mycol.insert_one(dict)
        print('Inserted!')
    else:
        myquery = { "tourID": dict["tourID"] }
        newvalues = { "$set": dict }
        mycol.update_one(myquery, newvalues)
        print("Updated!")
   

