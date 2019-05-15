import requests
import json
import codecs
import database
from bs4 import BeautifulSoup
from selenium import webdriver

url = "https://tours.wingontravel.com/detail/japantravel-9-11233"

browser = webdriver.Chrome('./chromedriver')
browser.get(url)

response = requests.get(url)
soup = BeautifulSoup(browser.page_source, "lxml")

# find days
days = soup.select('.segment_days')[0].findAll('li', recursive=False)
tag = soup.select_one('.product_description').getText().lstrip()
number_of_days = len(days)

tags = tag.split("、")
if(len(tags)>1):
    allTag = tags
if (len(tags) == 0):
    allTag = " "
if (len(tags) == 1):
    allTag = soup.select_one('.product_description').getText().lstrip()

availableDate = []
dateList = soup.findAll("span",{"class":"on"})
for i in range(len(dateList)):
    date = dateList[i].attrs['date']
    availableDate.append(date)


image = []
imageList = soup.select('.original_image')[0].findAll('img', {"src":True})
for i in range(len(imageList)):
    imagesrc = imageList[i].attrs['src']
    image.append(imagesrc)

detail = soup.select('.brochure_tag')[0].findAll('a', {"href":True})
detailLink = detail[0].attrs['href']

Tour = {
    "id": soup.select_one('.refCode').getText().lstrip().split('(')[1].split(')')[0],
    "title": soup.select_one('.china_title').select_one('h2').getText().lstrip(),
    "day": number_of_days,
    "tag": allTag,
    "price": soup.select_one('.price_box').select_one('div').select_one('em').getText().lstrip() + soup.select_one('.price_box').select_one('div').select_one('span').getText().lstrip(),
    "availableDate": availableDate,
    "image": image,
    "detail": detailLink
}

for i in range(number_of_days):
    class_name = '.route_day' + str(i)
    day_info = soup.select(class_name)
    if(day_info[0].select_one('.segment_content').select_one('p')):
        content = day_info[0].select_one('.segment_content').select_one('p').getText().lstrip()
    else:
        content = " "

    if(day_info[0].select_one('.stay')):
        stay = day_info[0].select_one('.stay').getText().lstrip()
    else:
        stay = " "
    
    title = day_info[0].select_one('.segment_title').getText().lstrip().split("\n")

    Tour["day_" + str(i + 1)] = {
        "day": day_info[0].select_one('.segment_day').getText().lstrip(),
        "title": title[0],
        "content": content,
        "eat": day_info[0].select_one('.eat').getText().lstrip(),
        "stay": stay
    }

tour_json = json.dumps(Tour,indent=2, ensure_ascii=False)
print(tour_json)

database.insertTour(Tour)
# print(Tour)

# print()
