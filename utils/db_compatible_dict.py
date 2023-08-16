class DBCompatibleDict(dict):
    def to_dict(self):
        return self

    def to_json(self):
        return self.to_dict()
