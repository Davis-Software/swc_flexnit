import bs4
import requests

from models.movie import MovieModel
from models.series import SeriesModel, get_episode_by_season_and_episode


class IMDBScraper:
    def __init__(self, title_id, set_metadata=True, set_media=False, set_sub_info=True):
        self.title_id = title_id
        self.url = f"https://www.imdb.com/title/{self.title_id}/"
        self.soup = None

        self.__set_metadata = set_metadata
        self.__set_media = set_media
        self.__set_sub_info = set_sub_info

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

    @staticmethod
    def __set_attr(obj, attr, val):
        if None in [obj, attr, val]:
            return
        # if getattr(obj, attr) is None or getattr(obj, attr) == "":
        #     setattr(obj, attr, val)
        setattr(obj, attr, val)

    @staticmethod
    def get_file(url):
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            return r.content

    def get(self):
        if self.soup is None:
            self._fetch("")

        return {
            "title": self.find("h1 > span"),
            "year": self.find("section > section > div > section > section > div > div > ul > li > a"),
            "description": self.find("section > section > div > section > section > div > div > div > section > p > span"),
            "thumbnail": self.find_attr("section > section > div > section > section > div > div > div > div > div > img", "src"),
            "type": "series" if self.find("section > div > section > div > div > section > div > a > h3 > span") == "Episodes" else "movie"
        }

    def get_episodes(self, season=1, skip_check=False):
        if not skip_check and self.get().get("type") != "series":
            return None

        self._fetch(f"episodes/?season={season}")

        episodes = []
        for episode in self.soup.select("section > div > section > div > div > section > section > article"):
            def sub_find(selector, text=True):
                tag = episode.select_one(selector)
                if text:
                    return tag.text.strip() if tag else ""
                return tag

            episodes.append({
                "title": sub_find("div > div > div > div > h4 a").split("∙ ").pop(),
                "description": sub_find("div > div > div > div > div > div > div > div"),
            })

        return episodes

    def link_to_movie(self, movie: MovieModel):
        data = self.get()
        if data.get("type") != "movie":
            return None

        if self.__set_metadata:
            self.__set_attr(movie, "title", data.get("title"))
            self.__set_attr(movie, "year", data.get("year"))
            self.__set_attr(movie, "description", data.get("description"))
        if self.__set_media:
            self.__set_attr(movie, "thumbnail", self.get_file(data.get("thumbnail")))

        movie.commit()
        return movie

    def link_to_series(self, series: SeriesModel):
        data = self.get()
        if data.get("type") != "series":
            return None

        if self.__set_metadata:
            self.__set_attr(series, "title", data.get("title"))
            self.__set_attr(series, "year", data.get("year"))
            self.__set_attr(series, "description", data.get("description"))
        if self.__set_media:
            self.__set_attr(series, "thumbnail", self.get_file(data.get("thumbnail")))

        if self.__set_sub_info:
            for season in range(series.season_count):
                season_data = self.get_episodes(season + 1, skip_check=True)

                for i, episode in enumerate(season_data):
                    episode_model = get_episode_by_season_and_episode(series.uuid, season + 1, i + 1)

                    if episode_model is None:
                        continue

                    self.__set_attr(episode_model, "title", episode.get("title"))
                    self.__set_attr(episode_model, "description", episode.get("description"))
                    episode_model.commit()

        series.commit()
        return series
