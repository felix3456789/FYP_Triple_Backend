import requests
import json
import codecs
import database
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from lxml import etree
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
from bson import json_util
from selenium.webdriver.common.keys import Keys

url = "https://tours.wingontravel.com/"

browser = webdriver.Chrome('./chromedriver')
browser.get(url)
searchLink = browser.find_element_by_css_selector("a[href*='japantravel']")
searchLink.click()
browser.switch_to_window(browser.window_handles[-1])
tourLink = browser.find_elements_by_css_selector("a[href*='japantravel']")
count = 0
closePopUp = browser.find_element_by_css_selector("a[href*='javascript:MasterPageJS.appClose();']").click()
url = browser.current_url

while (count < (len(tourLink) - 1)):
    browser.get(url)
    tourscrape = browser.find_elements_by_css_selector("a[href*='japantravel']")
    if (count == (len(tourLink) - 2)):
        browser.find_element_by_css_selector("a[class='next_page']").click()
        browser.switch_to_window(browser.window_handles[-1])
        tourLink = browser.find_elements_by_css_selector("a[href*='japantravel']")
        url = browser.current_url
        count = 0
    tourscrape = browser.find_elements_by_css_selector("h4 a[href*='japantravel']")
    tourscrape[count].click()
    browser.switch_to_window(browser.window_handles[-1])
    currentPage = browser.current_url

    response = requests.get(browser.current_url)
    soup = BeautifulSoup(browser.page_source, "lxml")

    # find days
    days = soup.select('.segment_days')[0].findAll('li', recursive=False)
    tag = soup.select_one('.product_description').getText().lstrip()
    number_of_days = len(days)

    tags = tag.split("、")
    tagList = []
    for i in range(len(tags)):
        tags[i] = tags[i].lstrip()
        tags[i] = tags[i].split('(')[0]
        tags[i] = tags[i].split(')')[0]
        tagList.append( {
            "id": i,
            "title": tags[i],
            "updatedBy": datetime.now()
        })

    if(len(tags)>0):
        allTag = tagList
    if (len(tags) == 0):
        allTag = " "

    availableDate = []
    dateList = soup.findAll("span",{"class":"on"})
    for i in range(len(dateList)):
        date = dateList[i].attrs['date']
        convDate = datetime(int(date.split('-')[0]),int(date.split('-')[1]),int(date.split('-')[2]))
        availableDate.append(convDate)


    image = []
    imageList = soup.select('.original_image')[0].findAll('img', {"src":True})
    for i in range(len(imageList)):
        imagesrc = imageList[i].attrs['src']
        image.append(imagesrc)

    detail = soup.select('.brochure_tag')[0].findAll('a', {"href":True})
    detailLink = detail[0].attrs['href']

    days = []
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

        eat = []
        eatList = day_info[0].findAll("li", {"class":"eat"})
        for j in range(len(eatList)):
            eat.append(eatList[j].getText().lstrip().split("；")[0].split("\n")[0])

        days.append( {
            "day": day_info[0].select_one('.segment_day').getText().lstrip(),
            "title": title[0],
            "content": content,
            "eat": eat,
            "stay": stay
        })

    title = soup.select_one('.china_title').select_one('h2').getText().lstrip()
    title = title.split('(')[0]
    title = title.split('《')[0]
    title = title.split('【')[0]

    tourID = soup.select_one('.refCode').getText().lstrip().split('(')[1].split(')')[0]
    country = soup.select_one('.visa_country').getText().lstrip().rstrip()
    if(soup.select_one('.original_price')):
        originalPrice = int(soup.select_one('.original_price').getText().lstrip().rstrip().split('HKD ')[1].replace(',',''))
    else:
        originalPrice = " "
    salesPrice = int(soup.select_one('.price_box').select_one('div').select_one('span').getText().lstrip().split('+')[0].replace(',',''))

    priceDetail = []
    detailLoop = browser.find_elements_by_xpath("//label[@class='tip'][not(contains(., '滿額'))]")
    for i in range(len(detailLoop)):
        browser.get(currentPage)
        detail = browser.find_elements_by_xpath("//label[@class='tip'][not(contains(., '滿額'))]")
        print(detail[i].is_displayed())
        nextMonth = browser.find_elements_by_css_selector("div[class*='next_month_able']")
        count = 0
        while (detail[i].is_displayed() == False):
            nextMonth[count].click()
            count += 1
            print(detail[i].is_displayed())

        print(detail[i].is_displayed())
        detail[i].click()
        browser.switch_to_window(browser.window_handles[-1])
        time.sleep(2)
        html = browser.page_source
        soup = BeautifulSoup(html, "lxml")
        priceList = soup.select("div.content_box.white_head_table.traveller_select_qty table tbody tr td span.fBlue")
        departureDate = soup.select_one('.date_picker.hasDatepicker')
        date = departureDate.attrs['value']
        priceDetail.append( {
                "departureDate": date,
                "adultPrice": int(priceList[0].getText().lstrip().rstrip().replace(',','')),
                "adultTax": int(priceList[1].getText().lstrip().rstrip().replace(',','')),
                "childHalfRoomPrice": int(priceList[3].getText().lstrip().rstrip().replace(',','')),
                "childHalfRoomTax": int(priceList[4].getText().lstrip().rstrip().replace(',','')),
                "childPrice": int(priceList[6].getText().lstrip().rstrip().replace(',','')),
                "childTax": int(priceList[7].getText().lstrip().rstrip().replace(',','')),
                "babyPrice": int(priceList[9].getText().lstrip().rstrip().replace(',','')),
                "babyTax": int(priceList[10].getText().lstrip().rstrip().replace(',','')),
                "singleRoomPrice": int(priceList[12].getText().lstrip().rstrip().replace(',',''))
        })
  
    Tour = {
        "tourID": tourID,
        "title": title,
        "country": country,
        "day": number_of_days,
        "tags": allTag,
        "originalPrice": originalPrice,
        "salesPrice": salesPrice,
        "prices": priceDetail,
        "availableDate": availableDate,
        "image": image,
        "detail": detailLink,
        "Disable": False,
        "Feature": False,
        "days": days,
        "updatedBy": datetime.now()
    }

    tour_json = json.dumps(Tour,indent=2, ensure_ascii=False, default=json_util.default)
    # print(tour_json)

    _id = database.insertTour(Tour)
    print(_id)
    count += 1

    print(count)
    print(len(tourLink))

# print(Tour)

# print()

