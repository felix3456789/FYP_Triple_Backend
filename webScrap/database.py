import pymongo

myclient = pymongo.MongoClient("mongodb://chuenpidb.tk:27017/")
mydb = myclient["triple"]
mycol = mydb["tour"]



def insertTour(dict):
    temp = mycol.find_one({"_id":dict["_id"]})
    if(not temp):
        x = mycol.insert_one(dict)
        print('Inserted!')
    else:
        myquery = { "_id": dict["_id"] }
        newvalues = { "$set": dict }
        mycol.update_one(myquery, newvalues)
        print("Updated!")
   

