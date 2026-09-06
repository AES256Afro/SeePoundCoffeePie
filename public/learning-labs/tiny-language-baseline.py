"""Optional CPU-only teaching baseline. Not an LLM or neural network.

Uses embedded invented text. No network, third-party packages, or file writes.
"""
from collections import Counter, defaultdict
import math
import random
import string

VOCABULARY = string.ascii_lowercase + " .\n"
TRAINING = "tea is warm. bread is warm. tea and bread.\n" * 8
HELD_OUT = "bread and tea. tea is warm.\n"


def train(text):
    """Count pairs using training text only; nothing from held-out text."""
    if any(character not in VOCABULARY for character in text):
        raise ValueError("Use lowercase letters, spaces, periods, and newlines.")
    counts = defaultdict(Counter)
    for previous, following in zip(text, text[1:]):
        counts[previous][following] += 1
    return counts


def probabilities(counts, previous):
    """Add one to every count so unseen pairs still have nonzero probability."""
    row = counts.get(previous, {})
    total = sum(row.values()) + len(VOCABULARY)
    return [(row.get(character, 0) + 1) / total for character in VOCABULARY]


def loss(counts, text):
    if len(text) < 2 or any(character not in VOCABULARY for character in text):
        raise ValueError("Evaluation needs at least two supported characters.")
    errors = []
    for previous, following in zip(text, text[1:]):
        probability = probabilities(counts, previous)[VOCABULARY.index(following)]
        errors.append(-math.log(probability))
    return sum(errors) / len(errors)


def sample(counts, seed=7):
    rng = random.Random(seed)
    result = "t"
    for _ in range(79):
        result += rng.choices(VOCABULARY, weights=probabilities(counts, result[-1]))[0]
    return result


if __name__ == "__main__":
    trained = train(TRAINING)
    print("Next-character baseline. Not an LLM.")
    print(f"Untrained held-out loss: {loss({}, HELD_OUT):.3f}")
    print(f"Trained held-out loss:   {loss(trained, HELD_OUT):.3f}")
    print("Sample (not a factual answer):")
    print(sample(trained))
