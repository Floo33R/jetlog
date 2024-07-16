from pydantic import BaseModel
from enum     import Enum

#  camel case convertion
def camel_case(snake_case: str) -> str:
    segments = [segment for segment in snake_case.split('_')]
    return segments[0] + ''.join([segment.capitalize() for segment in segments[1:]])

class CamelableModel(BaseModel):
    class Config:
        alias_generator = camel_case
        populate_by_name = True
        from_attributes = True

# abstract model
class CustomModel(CamelableModel):
    @classmethod
    def from_database(cls, db: tuple, explicit: dict|None = None):
        real = cls()
        columns = cls.get_attributes()

        i = 0
        for attr in columns:
            if not explicit or attr not in explicit:
                value = db[i] if db[i] else None
                setattr(real, attr, value)
                i += 1

        if explicit:
            for attr in explicit:
                setattr(real, attr, explicit[attr])

        return real

    @classmethod
    def get_attributes(cls, with_id: bool = True) -> list[str]:
        attributes = list(cls.__fields__.keys())

        if with_id:
            return attributes

        return attributes[1:]

class SeatType(str, Enum):
    AISLE = "aisle"
    MIDDLE = "middle"
    WINDOW = "window"

class AirportModel(CustomModel):
    icao:      str|None = None
    iata:      str|None = None
    name:      str|None = None
    city:      str|None = None
    country:   str|None = None
    latitude:  float|None = None
    longitude: float|None = None

# TODO domestic/international (bool), ...?
# note: for airports, the database type
# is string (icao code), while the type
# returned by the API is AirportModel
class FlightModel(CustomModel):
    id:             int|None = None
    date:           str|None = None
    origin:         str|AirportModel|None = None
    destination:    str|AirportModel|None = None
    departure_time: str|None = None
    arrival_time:   str|None = None
    seat:           SeatType|None = None
    duration:       int|None = None
    distance:       int|None = None
    airplane:       str|None = None

    def get_values(self) -> list:
        values = []

        for attr in FlightModel.get_attributes(False):
            value = getattr(self, attr)

            if attr == "origin" or attr == "destination":
                if type(value) == AirportModel:
                    value = value.icao

            if value:
                values.append(value)

        return values

class StatisticsModel(CustomModel):
    amount:                 int|None = None
    time:                   int|None = None
    distance:               int|None = None
    dpf:                    float|None = None
    unique_airports:        int|None = None
    common_airport:         AirportModel|None = None
    common_seat:            SeatType|None = None
