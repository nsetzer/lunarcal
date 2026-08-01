# https://lichngaytot.com/tu-vi/xem-menh-theo-nam-sinh-304-187792.html

from dataclasses import dataclass


@dataclass(frozen=True)
class FengShuiInfo:
    year: int
    zodiac: str
    polarity: str
    element: str
    elemental_destiny: str
    male_house: str
    female_house: str


NAP_AM_CYCLE = (
    ("Earth", "Earth on the Wall"),
    ("Metal", "Refined Gold"),
    ("Fire", "Lamp Fire"),
    ("Water", "Water from the Heavenly River"),
    ("Earth", "Great Marsh Earth"),
    ("Metal", "Jewelry Gold"),
    ("Wood", "Mulberry Wood"),
    ("Water", "Great Stream Water"),
    ("Earth", "Sand Earth"),
    ("Fire", "Fire Above the Sky"),
    ("Wood", "Pomegranate Wood"),
    ("Water", "Great Sea Water"),
    ("Metal", "Gold in the Sea"),
    ("Fire", "Fire in the Furnace"),
    ("Wood", "Great Forest Wood"),
    ("Earth", "Roadside Earth"),
    ("Metal", "Sword Edge Metal"),
    ("Fire", "Mountain Peak Fire"),
    ("Water", "Stream Water"),
    ("Earth", "Wall Earth"),
    ("Metal", "White Wax Metal"),
    ("Wood", "Willow Wood"),
    ("Water", "Spring Water"),
    ("Earth", "Roof Tile Earth"),
    ("Fire", "Thunderbolt Fire"),
    ("Wood", "Pine and Cypress Wood"),
    ("Water", "Long Flowing Water"),
    ("Metal", "Sand Gold"),
    ("Fire", "Mountain-Foot Fire"),
    ("Wood", "Plain Wood"),
)

ZODIAC_CYCLE = (
    "Rat",
    "Ox",
    "Tiger",
    "Rabbit",
    "Dragon",
    "Snake",
    "Horse",
    "Goat",
    "Monkey",
    "Rooster",
    "Dog",
    "Pig",
)

MALE_HOUSE_CYCLE = (
    "Xun (Wood)",
    "Zhen (Wood)",
    "Kun (Earth)",
    "Kan (Water)",
    "Li (Fire)",
    "Gen (Earth)",
    "Dui (Metal)",
    "Qian (Metal)",
    "Kun (Earth)",
)

FEMALE_HOUSE_CYCLE = (
    "Kun (Earth)",
    "Zhen (Wood)",
    "Xun (Wood)",
    "Kun (Earth)",
    "Qian (Metal)",
    "Dui (Metal)",
    "Gen (Earth)",
    "Li (Fire)",
    "Kan (Water)",
)


def get_feng_shui_info(year: int) -> FengShuiInfo:
    if isinstance(year, bool) or not isinstance(year, int):
        raise TypeError("year must be an integer")

    offset = year - 1960

    element, elemental_destiny = NAP_AM_CYCLE[(offset // 2) % len(NAP_AM_CYCLE)]
    polarity = "Yang" if offset % 2 == 0 else "Yin"
    zodiac = ZODIAC_CYCLE[offset % len(ZODIAC_CYCLE)]
    house_index = offset % len(MALE_HOUSE_CYCLE)

    return FengShuiInfo(
        year=year,
        zodiac=zodiac,
        polarity=polarity,
        element=element,
        elemental_destiny=elemental_destiny,
        male_house=MALE_HOUSE_CYCLE[house_index],
        female_house=FEMALE_HOUSE_CYCLE[house_index],
    )


HEAVENLY_STEMS = (
    "Geng", "Xin", "Ren", "Gui", "Jia",
    "Yi", "Bing", "Ding", "Wu", "Ji",
)

EARTHLY_BRANCHES = (
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
    "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
)

CAN_VALUES = {
    "Jia": 1,
    "Yi": 1,
    "Bing": 2,
    "Ding": 2,
    "Wu": 3,
    "Ji": 3,
    "Geng": 4,
    "Xin": 4,
    "Ren": 5,
    "Gui": 5,
}

CHI_VALUES = {
    "Rat": 0,
    "Buffalo": 0,
    "Horse": 0,
    "Goat": 0,

    "Tiger": 1,
    "Cat": 1,
    "Monkey": 1,
    "Rooster": 1,

    "Dragon": 2,
    "Snake": 2,
    "Dog": 2,
    "Pig": 2,
}

CAN_CHI_ELEMENTS = {
    1: "Metal",
    2: "Water",
    3: "Fire",
    4: "Earth",
    5: "Wood",
}


def get_can_chi_element(can: str, chi: str) -> str:
    """
    The Vietnamese sexagenary cycle (Can Chi) is a traditional 60-year
    calendar system formed by combining one of the 10 Heavenly Stems (Can)
    with one of the 12 Earthly Branches (Chi).
    Each year is assigned a unique Can Chi pair
    (e.g., Canh Tý, Quý Hợi, Giáp Thìn), which repeats every 60 years.
    The Earthly Branch also determines the Chinese zodiac animal while the
    combined Can Chi is used in Vietnamese astrology and Feng Shui to derive
    attributes such as Yin/Yang polarity, the Five Elements (Ngũ Hành),
    and Nạp Âm (Elemental Destiny).
    """
    value = CAN_VALUES[can] + CHI_VALUES[chi]

    while value > 5:
        value -= 5

    return ELEMENTS[value]


def get_can_chi_element_from_year(year: int) -> str:
    offset = year - 1960

    can = HEAVENLY_STEMS[offset % 10]
    chi = EARTHLY_BRANCHES[offset % 12]

    return get_can_chi_element(can, chi)

if __name__ == "__main__":
    print(get_feng_shui_info(1963))
    print(get_feng_shui_info(1990))
    print(get_feng_shui_info(1992))