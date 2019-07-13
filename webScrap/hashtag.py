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
hashTagList = database.getTagList()
closePopUp = browser.find_element_by_css_selector("a[href*='javascript:MasterPageJS.appClose();']").click()
print(len(hashTagList))
for i in range(len(hashTagList)):
    try:
        search = "https://tours.wingontravel.com/search/searchtext=" + hashTagList[i]
        browser.get(search)
        browser.switch_to_window(browser.window_handles[-1])
        tourLink = browser.find_elements_by_css_selector("h4 a[href*='detail']")
        url = browser.current_url
        count = 0
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
            browser.switch_to_window(browser.window_handles[-1])
            currentPage = browser.current_url

            soup = BeautifulSoup(browser.page_source, "lxml")

            tourID = soup.select_one('.prodct-name').getText().lstrip().split(' ( ')[1].split(' )')[0]
            print(tourID)

            hashtag = {
                    "title": hashTagList[i],
                    "updatedBy": datetime.now()
                }
            _id = database.insertTag(hashtag)
            hashtags = {
                "_id": ObjectId(_id),
                "title": hashTagList[i],
            }

            Tour = {
                "tourID": tourID,  
                "updatedBy": datetime.now()
            }

            database.update_tags(hashtags, tourID)
            count += 1
    except Exception as e: 
        print (e)
        print(browser.current_url)
    # print(Tour)

    # print()

browser.close()