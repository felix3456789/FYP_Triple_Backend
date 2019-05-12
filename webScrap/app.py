import requests
from bs4 import BeautifulSoup
from selenium import webdriver

url = "https://tours.wingontravel.com/detail/luxortravel-245-11269"

browser = webdriver.Chrome()
browser.get(url)

response = requests.get(url)
soup = BeautifulSoup(browser.page_source, "lxml")

# find days
days = soup.select('.segment_days')[0].findAll('li', recursive=False)
number_of_days = len(days)


for number in range(number_of_days):
    class_name = '.route_day' + str(number)
    day_info = soup.select(class_name)
    print(day_info[0].select_one('.segment_day').getText().lstrip())
    print(day_info[0].select_one('.segment_title').getText().lstrip())
    print(day_info[0].select_one('.segment_content').getText().lstrip())


# print()
