from lunardate import LunarDate
import datetime

# Vietnamese zodiac animals (Earthly Branch order)
ZODIAC = [
    "Rat",      # Tý
    "Buffalo",  # Sửu (Ox in Chinese)
    "Tiger",    # Dần
    "Cat",      # Mão (Rabbit in Chinese)
    "Dragon",   # Thìn
    "Snake",    # Tỵ
    "Horse",    # Ngọ
    "Goat",     # Mùi
    "Monkey",   # Thân
    "Rooster",  # Dậu
    "Dog",      # Tuất
    "Pig"       # Hợi
]

# Five Elements (Wu Xing) - cycles every 10 years/months/days
# Used for month/day/hour stems. Year pillars use Nạp Âm (see below).
ELEMENTS = [
    "Wood",     # Mộc
    "Wood",     # Mộc
    "Fire",     # Hỏa
    "Fire",     # Hỏa
    "Earth",    # Thổ
    "Earth",    # Thổ
    "Metal",    # Kim
    "Metal",    # Kim
    "Water",    # Thủy
    "Water"     # Thủy
]

# Vietnamese Nạp Âm year elements (Tet / Can Chi mệnh), base year 1960.
# Distinct from Chinese Heavenly-Stem elements — e.g. 1990 is Earth Horse, not Metal.
# Mirrors src/lunacy/fengshui.py NAP_AM_CYCLE element column.
TET_YEAR_BASE = 1960
NAP_AM_ELEMENTS = [
    "Earth",  # 1960–61  Earth on the Wall
    "Metal",  # 1962–63  Refined Gold
    "Fire",   # 1964–65  Lamp Fire
    "Water",  # 1966–67  Water from the Heavenly River
    "Earth",  # 1968–69  Great Marsh Earth
    "Metal",  # 1970–71  Jewelry Gold
    "Wood",   # 1972–73  Mulberry Wood
    "Water",  # 1974–75  Great Stream Water
    "Earth",  # 1976–77  Sand Earth
    "Fire",   # 1978–79  Fire Above the Sky
    "Wood",   # 1980–81  Pomegranate Wood
    "Water",  # 1982–83  Great Sea Water
    "Metal",  # 1984–85  Gold in the Sea
    "Fire",   # 1986–87  Fire in the Furnace
    "Wood",   # 1988–89  Great Forest Wood
    "Earth",  # 1990–91  Roadside Earth
    "Metal",  # 1992–93  Sword Edge Metal
    "Fire",   # 1994–95  Mountain Peak Fire
    "Water",  # 1996–97  Stream Water
    "Earth",  # 1998–99  Wall Earth
    "Metal",  # 2000–01  White Wax Metal
    "Wood",   # 2002–03  Willow Wood
    "Water",  # 2004–05  Spring Water
    "Earth",  # 2006–07  Roof Tile Earth
    "Fire",   # 2008–09  Thunderbolt Fire
    "Wood",   # 2010–11  Pine and Cypress Wood
    "Water",  # 2012–13  Long Flowing Water
    "Metal",  # 2014–15  Sand Gold
    "Fire",   # 2016–17  Mountain-Foot Fire
    "Wood",   # 2018–19  Plain Wood
]


def tet_year_element(lunar_year: int) -> str:
    """Year Ngũ hành by Vietnamese Nạp Âm (Tet), not Chinese Thiên can."""
    offset = lunar_year - TET_YEAR_BASE
    return NAP_AM_ELEMENTS[(offset // 2) % len(NAP_AM_ELEMENTS)]

zodiac_traits = {
    "Rat": {
        "Wood": {
            "good": ["adaptable", "clever", "resourceful"],
            "bad": ["restless", "opportunistic", "secretive"]
        },
        "Fire": {
            "good": ["passionate", "energetic", "charismatic"],
            "bad": ["impulsive", "quick-tempered", "overbearing"]
        },
        "Earth": {
            "good": ["practical", "stable", "loyal"],
            "bad": ["stubborn", "rigid", "possessive"]
        },
        "Metal": {
            "good": ["determined", "disciplined", "ambitious"],
            "bad": ["controlling", "unyielding", "materialistic"]
        },
        "Water": {
            "good": ["intuitive", "persuasive", "charming"],
            "bad": ["anxious", "manipulative", "indecisive"]
        }
    },
    "Ox": {
        "Wood": {
            "good": ["patient", "honest", "strong-willed"],
            "bad": ["rigid", "slow", "stubborn"]
        },
        "Fire": {
            "good": ["passionate", "driven", "protective"],
            "bad": ["hot-headed", "overbearing", "harsh"]
        },
        "Earth": {
            "good": ["grounded", "responsible", "hardworking"],
            "bad": ["conservative", "unyielding", "dull"]
        },
        "Metal": {
            "good": ["disciplined", "loyal", "resolute"],
            "bad": ["severe", "unyielding", "cold"]
        },
        "Water": {
            "good": ["empathetic", "resilient", "adaptable"],
            "bad": ["insecure", "secretive", "hesitant"]
        }
    },
    "Tiger": {
        "Wood": {
            "good": ["courageous", "idealistic", "adventurous"],
            "bad": ["reckless", "stubborn", "impatient"]
        },
        "Fire": {
            "good": ["dynamic", "passionate", "inspiring"],
            "bad": ["volatile", "impulsive", "domineering"]
        },
        "Earth": {
            "good": ["practical", "protective", "dependable"],
            "bad": ["rigid", "controlling", "inflexible"]
        },
        "Metal": {
            "good": ["ambitious", "disciplined", "decisive"],
            "bad": ["cold", "unyielding", "ruthless"]
        },
        "Water": {
            "good": ["intuitive", "flexible", "insightful"],
            "bad": ["anxious", "restless", "inconsistent"]
        }
    },
    "Rabbit": {
        "Wood": {
            "good": ["gentle", "compassionate", "artistic"],
            "bad": ["naïve", "indecisive", "overly sensitive"]
        },
        "Fire": {
            "good": ["charismatic", "energetic", "warm"],
            "bad": ["impulsive", "temperamental", "showy"]
        },
        "Earth": {
            "good": ["reliable", "practical", "grounded"],
            "bad": ["conservative", "timid", "inflexible"]
        },
        "Metal": {
            "good": ["disciplined", "loyal", "focused"],
            "bad": ["rigid", "unyielding", "perfectionist"]
        },
        "Water": {
            "good": ["intuitive", "empathetic", "adaptable"],
            "bad": ["secretive", "easily influenced", "moody"]
        }
    },
    "Dragon": {
        "Wood": {
            "good": ["visionary", "charismatic", "noble"],
            "bad": ["arrogant", "demanding", "stubborn"]
        },
        "Fire": {
            "good": ["dynamic", "powerful", "confident"],
            "bad": ["impulsive", "overbearing", "hot-tempered"]
        },
        "Earth": {
            "good": ["reliable", "responsible", "stable"],
            "bad": ["stubborn", "unyielding", "inflexible"]
        },
        "Metal": {
            "good": ["ambitious", "decisive", "disciplined"],
            "bad": ["ruthless", "rigid", "materialistic"]
        },
        "Water": {
            "good": ["adaptable", "insightful", "intuitive"],
            "bad": ["inconsistent", "moody", "secretive"]
        }
    },
    "Snake": {
        "Wood": {
            "good": ["wise", "insightful", "calm"],
            "bad": ["rigid", "secretive", "overly cautious"]
        },
        "Fire": {
            "good": ["charismatic", "passionate", "persuasive"],
            "bad": ["impulsive", "manipulative", "jealous"]
        },
        "Earth": {
            "good": ["practical", "stable", "responsible"],
            "bad": ["inflexible", "overly serious", "rigid"]
        },
        "Metal": {
            "good": ["disciplined", "determined", "focused"],
            "bad": ["cold", "unyielding", "calculating"]
        },
        "Water": {
            "good": ["intuitive", "adaptable", "mysterious"],
            "bad": ["secretive", "manipulative", "anxious"]
        }
    },
    "Horse": {
        "Wood": {
            "good": ["energetic", "optimistic", "adventurous"],
            "bad": ["reckless", "impatient", "stubborn"]
        },
        "Fire": {
            "good": ["charismatic", "passionate", "dynamic"],
            "bad": ["hot-tempered", "impulsive", "restless"]
        },
        "Earth": {
            "good": ["dependable", "responsible", "loyal"],
            "bad": ["rigid", "conservative", "stubborn"]
        },
        "Metal": {
            "good": ["ambitious", "disciplined", "resolute"],
            "bad": ["unyielding", "cold", "controlling"]
        },
        "Water": {
            "good": ["adaptable", "intuitive", "charming"],
            "bad": ["inconsistent", "anxious", "easily distracted"]
        }
    },
    "Goat": {
        "Wood": {
            "good": ["gentle", "compassionate", "creative"],
            "bad": ["indecisive", "overly sensitive", "naïve"]
        },
        "Fire": {
            "good": ["charismatic", "warm", "artistic"],
            "bad": ["impulsive", "temperamental", "restless"]
        },
        "Earth": {
            "good": ["grounded", "reliable", "responsible"],
            "bad": ["rigid", "conservative", "timid"]
        },
        "Metal": {
            "good": ["disciplined", "focused", "loyal"],
            "bad": ["unyielding", "cold", "overly perfectionist"]
        },
        "Water": {
            "good": ["empathetic", "intuitive", "adaptable"],
            "bad": ["moody", "insecure", "easily influenced"]
        }
    },
    "Monkey": {
        "Wood": {
            "good": ["clever", "curious", "inventive"],
            "bad": ["restless", "trickster", "inconsistent"]
        },
        "Fire": {
            "good": ["energetic", "charismatic", "creative"],
            "bad": ["impulsive", "showy", "manipulative"]
        },
        "Earth": {
            "good": ["practical", "resourceful", "responsible"],
            "bad": ["calculating", "stubborn", "rigid"]
        },
        "Metal": {
            "good": ["disciplined", "ambitious", "innovative"],
            "bad": ["manipulative", "controlling", "unyielding"]
        },
        "Water": {
            "good": ["adaptable", "insightful", "charming"],
            "bad": ["inconsistent", "secretive", "moody"]
        }
    },
    "Rooster": {
        "Wood": {
            "good": ["honest", "organized", "practical"],
            "bad": ["rigid", "self-righteous", "stubborn"]
        },
        "Fire": {
            "good": ["charismatic", "passionate", "energetic"],
            "bad": ["impulsive", "critical", "restless"]
        },
        "Earth": {
            "good": ["responsible", "loyal", "grounded"],
            "bad": ["rigid", "dogmatic", "conservative"]
        },
        "Metal": {
            "good": ["disciplined", "focused", "resolute"],
            "bad": ["cold", "unyielding", "harshly critical"]
        },
        "Water": {
            "good": ["intuitive", "adaptable", "sociable"],
            "bad": ["moody", "secretive", "indecisive"]
        }
    },
    "Dog": {
        "Wood": {
            "good": ["loyal", "honest", "compassionate"],
            "bad": ["stubborn", "overly cautious", "rigid"]
        },
        "Fire": {
            "good": ["brave", "protective", "energetic"],
            "bad": ["impulsive", "temperamental", "restless"]
        },
        "Earth": {
            "good": ["responsible", "stable", "grounded"],
            "bad": ["conservative", "rigid", "unyielding"]
        },
        "Metal": {
            "good": ["disciplined", "just", "resolute"],
            "bad": ["severe", "unyielding", "harsh"]
        },
        "Water": {
            "good": ["empathetic", "adaptable", "intuitive"],
            "bad": ["moody", "secretive", "inconsistent"]
        }
    },
    "Pig": {
        "Wood": {
            "good": ["generous", "compassionate", "gentle"],
            "bad": ["naïve", "gullible", "indecisive"]
        },
        "Fire": {
            "good": ["warm", "passionate", "sociable"],
            "bad": ["impulsive", "indulgent", "temperamental"]
        },
        "Earth": {
            "good": ["grounded", "responsible", "practical"],
            "bad": ["stubborn", "rigid", "conservative"]
        },
        "Metal": {
            "good": ["disciplined", "focused", "resolute"],
            "bad": ["unyielding", "materialistic", "harsh"]
        },
        "Water": {
            "good": ["intuitive", "empathetic", "adaptable"],
            "bad": ["moody", "insecure", "easily influenced"]
        }
    }
}

def gregorian_to_lunar_animals(year: int, month: int, day: int, hour: int = None, minute: int = None) -> dict:
    """
    Convert Gregorian date to Lunar date and return zodiac animals and elements for year, month, day.
    Returns dict with lunar date, animals, and elements.
    """
    # Convert Gregorian -> Lunar
    gregorian_date = datetime.date(year, month, day)
    lunar = LunarDate.from_solar_date(year, month, day)

    # YEAR animal (Earthly Branch cycles every 12 years, base: 1984 = Rat year)
    # Same phase as Tet base 1960 (24-year gap).
    offset = 1984
    year_branch_index = (lunar.year - offset) % 12
    year_animal = ZODIAC[year_branch_index]

    # YEAR element: Vietnamese Nạp Âm / Tet mệnh (base 1960), not Chinese stem.
    year_stem_index = (lunar.year - offset) % 10
    year_element = tet_year_element(lunar.year)

    # MONTH animal (1st month = Tiger, 2nd = Cat, … 12th = Buffalo)
    # Lunar month 1 is Tiger, so shift by +2
    month_branch_index = (lunar.month + 1) % 12
    month_animal = ZODIAC[month_branch_index]

    # MONTH element (cycles every 10 months, aligned with lunar months)
    month_stem_index = (lunar.month - 1) % 10
    month_element = ELEMENTS[month_stem_index]

    # DAY animal (continuous cycle, base: lunar 2 Aug 2025 was Goat day)
    base_date = LunarDate(2025, 8, 2, 0)

    days_diff =  (lunar - base_date).days
    day_branch_index = (ZODIAC.index("Goat") + days_diff) % 12
    day_animal = ZODIAC[day_branch_index] + ":" + str(day_branch_index)

    # DAY element (continuous cycle, base: 1 Jan 1900 was a Metal day in this system)
    day_stem_index = days_diff % 10
    day_element = ELEMENTS[day_stem_index]

    data = {
        "lunar_day": lunar.day,
        "lunar_month": lunar.month,
        "lunar_year": lunar.year,
        "is_leap_month": lunar.isLeapMonth,
        "year_animal": year_animal,
        "year_element": year_element,
        "month_animal": month_animal,
        "month_element": month_element,
        "day_animal": day_animal,
        "day_element": day_element
    }

    if hour is not None:
        # Normalize hour to 0 - 23
        hour = hour % 24

        if hour == 23:  # Special case for Rat
            animal_index = 0
        else:
            animal_index = (hour + 1) // 2

        # Element cycles every 10 hours, starting from 23:00 as Wood
        element_index = hour % 10

        data["hour"] = hour
        data["minute"] = minute or 0
        data["hour_animal"] = ZODIAC[animal_index]
        data["hour_element"] = ELEMENTS[element_index]

    return data


# Example usage:
#data = gregorian_to_lunar_animals(2025, 10, 2, 4, 15)
data = gregorian_to_lunar_animals(1990, 3, 12, 12, 17)
for key, value in data.items():
    print(f"{key}: {value}")

#data = gregorian_to_lunar_animals(2027, 7, 24 , 4, 15)
#for key, value in data.items():#
#    print(f"{key}: {value}")

# data = gregorian_to_lunar_animals(1990, 3, 12, 12, 17)
# good_traits_year = zodiac_traits[data["year_animal"]][data["year_element"]]["good"]
# bad_traits_year = zodiac_traits[data["year_animal"]][data["year_element"]]["bad"]
# print("Good traits for year:", good_traits_year)
# print("Bad traits for year:", bad_traits_year)
# for key, value in data.items():
#     print(f"{key}: {value}")

# print("Anh:")
# data = gregorian_to_lunar_animals(1992, 4, 20, 7, 45)
# good_traits_year = zodiac_traits[data["year_animal"]][data["year_element"]]["good"]
# bad_traits_year = zodiac_traits[data["year_animal"]][data["year_element"]]["bad"]
# print("Good traits for year:", good_traits_year)
# print("Bad traits for year:", bad_traits_year)
# for key, value in data.items():
#     print(f"{key}: {value}")

