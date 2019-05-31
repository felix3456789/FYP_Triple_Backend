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
    linkList = browser.find_elements_by_css_selector("div[class*='level_title'] h4 a")
    nextRegion = browser.find_elements_by_css_selector("div[class*='category_root'] ul li[class*='root']")
    countryCount = 0
    while (linkList[j].is_displayed() == False):
        nextRegion[countryCount].click()
        countryCount += 1
        if count > 3: 
            break
    linkList[j].click()
    browser.switch_to_window(browser.window_handles[-1])
    tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
    count = 0
    # elem = browser.find_element_by_link_text("日本")
    # elem.click()
    url = browser.current_url

    while (count < (len(tourLink) - 1)):
        browser.get(url)
        if (count == (len(tourLink) - 2)):
            nextList = browser.find_elements_by_css_selector("a[class='next_page']")
            if not nextList:
                break
            else:
                nextList[0].click()
            browser.switch_to_window(browser.window_handles[-1])
            tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
            url = browser.current_url
            count = 0
        tourscrape = browser.find_elements_by_css_selector("h4 a[href*='detail']")
        tourscrape[count].click()
        browser.switch_to_window(browser.window_handles[-1])
        currentPage = browser.current_url

        response = requests.get(browser.current_url)
        soup = BeautifulSoup(browser.page_source, "lxml")

        # find days
        days = soup.select('.segment_days')[0].findAll('li', recursive=False)
        tag = soup.select_one('.product_description').getText().lstrip()
        number_of_days = len(days)

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
        title = title.split('《')[0]
        title = title.split('(')[0]


        tourID = soup.select_one('.refCode').getText().lstrip().split('(')[1].split(')')[0]
        place = soup.select("a[href*=dest]")
        country = place[0].getText().lstrip().rstrip().split('旅')[0]
        city = place[1].getText().lstrip().rstrip().split('旅')[0]
        if(city == "日本"):
            city = " "
        if(soup.select_one('.original_price')):
            originalPrice = int(soup.select_one('.original_price').getText().lstrip().rstrip().split('HKD ')[1].replace(',',''))
        else:
            originalPrice = " "
        salesPrice = int(soup.select_one('.price_box').select_one('div').select_one('span').getText().lstrip().split('+')[0].replace(',',''))

        priceDetail = []
        # detailLoop = browser.find_elements_by_xpath("//div[@class='date'][span[contains(@class, 'on')]][not(contains(., '滿額'))][not(contains(., '系統維護中'))]")
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
        #     priceList = soup.select("div.content_box.white_head_table.traveller_select_qty table tbody tr td span.fBlue")
        #     departureDate = soup.select_one('.date_picker.hasDatepicker')
        #     date = departureDate.attrs['value']
        #     priceDetail.append( {
        #             "departureDate": date,
        #             "adultPrice": int(priceList[0].getText().lstrip().rstrip().replace(',','')),
        #             "adultTax": int(priceList[1].getText().lstrip().rstrip().replace(',','')),
        #             "childHalfRoomPrice": int(priceList[3].getText().lstrip().rstrip().replace(',','')),
        #             "childHalfRoomTax": int(priceList[4].getText().lstrip().rstrip().replace(',','')),
        #             "childPrice": int(priceList[6].getText().lstrip().rstrip().replace(',','')),
        #             "childTax": int(priceList[7].getText().lstrip().rstrip().replace(',','')),
        #             "babyPrice": int(priceList[9].getText().lstrip().rstrip().replace(',','')),
        #             "babyTax": int(priceList[10].getText().lstrip().rstrip().replace(',','')),
        #             "singleRoomPrice": int(priceList[12].getText().lstrip().rstrip().replace(',',''))
        #     })
    
        Tour = {
            "tourID": tourID,
            "title": title,
            "country": country,
            "city": city,
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
        print(tour_json)

        _id = database.insertTour(Tour)
        print(_id)
        count += 1

        print(count)
        print(len(tourLink))

    # print(Tour)

    # print()

