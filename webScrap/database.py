import pymongo

myclient = pymongo.MongoClient("mongodb://chuenpidb.tk:27017/")
mydb = myclient["triple"]
mycol = mydb["tour"]

def insertTour(dict):
    x = mycol.insert_one(dict)
    print('Inserted')


