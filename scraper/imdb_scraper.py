import bs4
import requests


class IMDBScraper:
    def __init__(self, title_id):
        self.title_id = title_id
        self.url = f"https://www.imdb.com/title/{self.title_id}/"
        self.soup = None

    def _fetch(self, route):
        response = requests.get(self.url + route, headers={
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en",
            "Cache-Control": "no-cache",
            "Dnt": "1",
            "Pragma": "no-cache",
            "Referer": "https://www.imdb.com/",
            "Sec-Ch-Ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": "\"Windows\"",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Sec-Gpc": "1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        })
        self.soup = bs4.BeautifulSoup(response.text, "html.parser")

    def find(self, selector, text=True):
        tag = self.soup.select_one(selector)
        if text:
            return tag.text.strip() if tag else None
        return tag

    def find_attr(self, selector, attr):
        tag = self.soup.select_one(selector)
        if tag:
            return tag.attrs.get(attr)
        return None

    def get(self):
        if self.soup is None:
            self._fetch("")

        data = {
            "title": self.find("h1 > span"),
            "year": self.find("section > section > div > section > section > div > div > ul > li > a"),
            "description": self.find("section > section > div > section > section > div > div > div > section > p > span"),
            "thumbnail": self.find_attr("section > section > div > section > section > div > div > div > div > div > img", "src"),
            "type": "series" if self.find("section > div > section > div > div > section > div > a > h3 > span") == "Episodes" else "movie"
        }

        return data

    def get_episodes(self, season=1):
        if self.get().get("type") != "series":
            return None

        self._fetch(f"episodes/?season={season}")

        episodes = []
        for episode in self.soup.select("section > div > section > div > div > section > section > article"):
            episodes.append({
                "title": episode.select_one("div > div > div > div > h4 > a").text.strip().split("∙ ")[1],
                "description": episode.select_one("div > div > div > div > div > div > div > div").text.strip(),
            })

        return episodes
