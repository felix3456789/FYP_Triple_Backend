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
hashTagList = ["深度遊", "美食", "純玩", "購物", "主題樂園", "日本", "韓國", "台灣", "泰國", "新加坡", "越南", "馬爾代夫", "柬埔寨" , "馬來西亞", "沙巴", "印尼", "歐洲", "澳洲", "俄羅斯", "埃及", "南非", "東歐", "西歐", "美國", "英國", "德國", "瑞士", "意大利", "加拿大", "新西蘭", "希臘", "西班牙", "杜拜", "土耳其", "北京", "絲綢之旅", "九寨溝", "西藏", "上海", "張家界", "西安", "雲南" , "華東", "內蒙古", "武夷山", "海南島", "武當山", "中國", "自然", "建築", "文化", "教堂", "長隆"]
closePopUp = browser.find_element_by_css_selector("a[href*='javascript:MasterPageJS.appClose();']").click()
for i in range(len(hashTagList)):
    search = "https://tours.wingontravel.com/search/searchtext=" + hashTagList[i]
    tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
    url = browser.current_url
    for j in range(len(tourLink)):
        browser.get(url)
        if (j == (len(tourLink) - 1)):
            nextList = browser.find_elements_by_css_selector("a[class='next_page']")
            if not nextList:
                break
            else:
                nextList[0].click()
            browser.switch_to_window(browser.window_handles[-1])
            tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
            url = browser.current_url
            j = 0
        soup = BeautifulSoup(browser.page_source, "lxml")
        tourscrape = browser.find_elements_by_css_selector("h4 a[href*='detail']")
        tourSoup = soup.select("h4 a[href*='detail']")
        tourscrape[j].click()
        browser.switch_to.window(browser.window_handles[0])
        browser.close()
        browser.switch_to_window(browser.window_handles[-1])
        currentPage = browser.current_url

        response = requests.get(browser.current_url)
        soup = BeautifulSoup(browser.page_source, "lxml")

        tourID = soup.select_one('.refCode').getText().lstrip().split('(')[1].split(')')[0]

        hashtags = {
                "title": hashTagList[i],
                "updatedBy": datetime.now()
            }
        _id = database.insertTag(hashtags)
        hashtags = {
            "_id": ObjectId(_id),
            "title": hashTagList[i],
            "updatedBy": datetime.now()
        }

        Tour = {
            "tourID": tourID,  
            "hashtags": hashtags,
            "updatedBy": datetime.now()
        }

        tour_json = json.dumps(Tour,indent=2, ensure_ascii=False, default=json_util.default)
        print(tour_json)

        _id = database.insertTour(Tour)
        print(_id)

    # print(Tour)

    # print()

