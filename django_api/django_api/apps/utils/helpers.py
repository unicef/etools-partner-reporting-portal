import random
import string


def generate_random_character_sequence(k=5):
    return "".join(random.choices(string.ascii_letters, k=k))
