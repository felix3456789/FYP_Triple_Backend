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
from bson import ObjectId
import re

url = "https://tours.wingontravel.com/"

chrome_options = webdriver.ChromeOptions()
prefs = {"profile.managed_default_content_settings.images": 2}
chrome_options.add_experimental_option("prefs", prefs)

browser = webdriver.Chrome('./chromedriver', chrome_options=chrome_options)
browser.get(url)
searchLink = browser.find_elements_by_css_selector("div[class*='level_title'] h4 a")
closePopUp = browser.find_element_by_css_selector("a[href*='javascript:MasterPageJS.appClose();']").click()
for j in range(len(searchLink)):
    url = "https://tours.wingontravel.com/"
    browser.get(url)
    browser.switch_to_window(browser.window_handles[-1])
    linkList = browser.find_elements_by_css_selector("div[class*='wg-site-seo'] div ul li a")
    nextRegion = browser.find_elements_by_css_selector("div[class*='category_root'] ul li[class*='root']")
    linkList[j].click()
    browser.switch_to_window(browser.window_handles[-1])
    # elem = browser.find_element_by_link_text("日本")
    # elem.click()
    tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
    count = 0
    url = browser.current_url

    while (count < (len(tourLink))):
        browser.get(url)
        if (count == (len(tourLink) - 1)):
            nextList = browser.find_elements_by_css_selector("a[class='next_page']")
            if not nextList:
                break
            else:
                nextList[0].click()
            browser.switch_to_window(browser.window_handles[-1])
            tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
            url = browser.current_url
            count = 0
        soup = BeautifulSoup(browser.page_source, "lxml")
        tourscrape = browser.find_elements_by_css_selector("h4 a[href*='detail']")
        tourSoup = soup.select("h4 a[href*='detail']")
        tourscrape[count].click()
        browser.switch_to.window(browser.window_handles[0])
        browser.close()
        feature = False
        featureCount = soup.select("div [class*='product_list_recommend_box']")
        if(count < len(featureCount)):
            if(tourSoup[count].find_parent('div').find_parent('div').find_parent('div') == soup.select("div [class*='product_list_recommend_box']")[count]):
                feature = True
        browser.switch_to_window(browser.window_handles[-1])
        currentPage = browser.current_url

        response = requests.get(browser.current_url)
        soup = BeautifulSoup(browser.page_source, "lxml")

        # find days
        day = soup.select("div[class*='segment_day']")
        tag = soup.select_one('.product_description').getText().lstrip()
        number_of_days = len(day)

        tagCollection = tag.split("、")
        tagList = []
        for i in range(len(tagCollection)):
            tagCollection[i] = tagCollection[i].lstrip()
            tagCollection[i] = tagCollection[i].split('(')[0]
            tagCollection[i] = tagCollection[i].split(')')[0]
            tags = {
                "title": tagCollection[i],
                "updatedBy": datetime.now()
            }
            _id = database.insertTag(tags)
            tagList.append( {
                "_id": ObjectId(_id),
                "title": tagCollection[i],
                "updatedBy": datetime.now()
            })

        if(len(tagCollection)>0):
            allTag = tagList
        if (len(tagCollection) == 0):
            allTag = " "

        availableDate = []
        dateList = soup.findAll("span",{"class":"on"})
        for i in range(len(dateList)):
            date = dateList[i].attrs['date']
            date = date.split('-')
            convDate = datetime(int(date[0]),int(date[1]),int(date[2]))
            availableDate.append(convDate)


        image = []
        imageList = soup.select('.original_image')[0].findAll('img', {"src":True})
        for i in range(len(imageList)):
            imagesrc = imageList[i].attrs['src']
            image.append(imagesrc)
        if(soup.select("a[title*='下載行程']")):
            detail = soup.select("a[title*='下載行程']")
            detailLink = detail[0].attrs['href']
        else:
            detail = " "

        days = []
        for i in range(number_of_days):
            class_name = '.route_day' + str(i)
            day_info = soup.select(class_name)
            if(day_info[0].select_one('.segment_content').select_one('p')):
                content = day_info[0].select_one('.segment_content').select_one('p').getText().lstrip().replace('\t','').replace('\n','')
            else:
                content = " "

            if(day_info[0].select_one('.stay')):
                stay = day_info[0].select_one('.stay').getText().lstrip().replace('\t','').replace('\n','')
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
        title = re.sub('【[^>]+】', '', title)
        title = re.sub('《[^>]+》', '', title)
        title = re.sub('\([^>]+\)', '', title)

        tourID = soup.select_one('.refCode').getText().lstrip().split('(')[1].split(')')[0]
        place = soup.select("a[href*=dest]")
        country = place[0].getText().lstrip().rstrip().split('旅')[0]
        city = place[1].getText().lstrip().rstrip().split('旅')[0]
        if(city == "日本"):
            city = " "
        if(soup.select_one('.original_price')):
            originalPrice = int(soup.select_one('.original_price').getText().lstrip().rstrip().split('HKD ')[1].replace(',',''))
            salesPrice = int(soup.select_one('.price_box').select_one('div').select_one('span').getText().lstrip().split('+')[0].replace(',',''))
        else:
            originalPrice = int(soup.select_one('.price_box').select_one('div').select_one('span').getText().lstrip().split('+')[0].replace(',',''))
            salesPrice = None

        hashtags = []
        
        # priceDetail = []
        # detailLoop = browser.find_elements_by_xpath("//div[@class='date'][span[contains(@class, 'on')]][not(contains(., '滿額'))][not(contains(., '系統維護中'))]")
        # print(len(detailLoop))
        # for i in range(len(detailLoop)):
        #     browser.get(currentPage)
        #     detail = browser.find_elements_by_xpath("//div[@class='date'][span[contains(@class, 'on')]][not(contains(., '滿額'))][not(contains(., '系統維護中'))]")
        #     nextMonth = browser.find_elements_by_css_selector("div[class*='next_month_able']")
        #     countNext = 0
        #     while (detail[i].is_displayed() == False):
        #         nextMonth[countNext].click()
        #         countNext += 1

        #     detail[i].click()
        #     browser.switch_to_window(browser.window_handles[-1])
        #     time.sleep(5)
        #     html = browser.page_source
        #     soup = BeautifulSoup(html, "lxml")
            
        #     if(soup.find(lambda t: t.text.strip()=='成人佔半房')):
        #         adult = soup.find(lambda t: t.text.strip()=='成人佔半房')
        #         price = adult.find_next('td')
        #         adultPrice = int(price.getText().lstrip().rstrip().replace(',','').split('D')[1])
        #         adultTax = int(price.find_next('td').getText().lstrip().rstrip().replace(',','').split('D')[1])
        #     else:
        #         adultPrice = " "
        #         adultTax = " "
        #     if(soup.select("span[class*=traveller_desc]")[1].getText() == "(2-11歲)按回程日期計算"):
        #         childHalf = soup.select("span[class*=traveller_desc]")[1]
        #         price = childHalf.find_next('td')
        #         childHalfRoomPrice = int(price.getText().lstrip().rstrip().replace(',','').split('D')[1])
        #         childHalfRoomTax = int(price.find_next('td').getText().lstrip().rstrip().replace(',','').split('D')[1])
        #     else:
        #         childHalfRoomPrice = " "
        #         childHalfRoomTax = " "
        #     if(soup.select("span[class*=traveller_desc]")[2].getText() == "(2-11歲)按回程日期計算"):
        #         child = soup.select("span[class*=traveller_desc]")[2]
        #         price = child.find_next('td')
        #         childPrice = int(price.getText().lstrip().rstrip().replace(',','').split('D')[1])
        #         childTax = int(price.find_next('td').getText().lstrip().rstrip().replace(',','').split('D')[1])
        #     else:
        #         childPrice = " "
        #         childTax = " "
        #     if(soup.select("span[class*=traveller_desc]")[3].getText() == "(0-1歲)按回程日期計算"):
        #         baby = soup.select("span[class*=traveller_desc]")[3]
        #         price = baby.find_next('td')
        #         babyPrice = int(price.getText().lstrip().rstrip().replace(',','').split('D')[1])
        #         babyTax = int(price.find_next('td').getText().lstrip().rstrip().replace(',','').split('D')[1])
        #     else:
        #         babyPrice = " "
        #         babyTax = " "
        #     if(soup.find(lambda t: t.text.strip()=='單人房附加費')):
        #         singleBed = soup.find(lambda t: t.text.strip()=='單人房附加費')
        #         price = singleBed.find_next('td')
        #         singleRoomPrice = int(price.getText().lstrip().rstrip().replace(',','').split('D')[1])
        #     else:
        #         singleRoomPrice = " "
        #     departureDate = soup.select_one('.date_picker.hasDatepicker')
        #     date = departureDate.attrs['value'].split('星')[0]
        #     date = date.split('/')
        #     priceDetail.append( {
        #             "departureDate": datetime(int(date[2]),int(date[1]),int(date[0])),
        #             "adultPrice": adultPrice,
        #             "adultTax": adultTax,
        #             "childHalfRoomPrice": childHalfRoomPrice,
        #             "childHalfRoomTax": childHalfRoomTax,
        #             "childPrice": childPrice,
        #             "childTax": childTax,
        #             "babyPrice": babyPrice,
        #             "babyTax": babyTax,
        #             "singleRoomPrice": singleRoomPrice
        #     })
    
        Tour = {
            "tourID": tourID,
            "feature": feature,
            "title": title,
            "country": country,
            "city": city,
            "day": number_of_days,
            "tags": allTag,
            "originalPrice": originalPrice,
            "salesPrice": salesPrice,
            # "prices": priceDetail,
            "availableDate": availableDate,
            "image": image,
            "detail": detailLink,
            "Disable": False,
            "days": days,
            "updatedBy": datetime.now(),
            "hashtags" : hashtags
        }

        tour_json = json.dumps(Tour,indent=2, ensure_ascii=False, default=json_util.default)
        print(tour_json)

        _id = database.insertTour(Tour)
        print(_id)
        count += 1

        print(count)
        print(len(tourLink))

    # print(Tour)

    # print()

