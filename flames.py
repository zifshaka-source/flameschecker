def cancel_common_letters(name_a, name_b):
    """Remove matching letters between two names (standard FLAMES method)."""
    name_a = list(name_a.lower())
    name_b = list(name_b.lower())

    i = 0
    while i < len(name_a):
        if name_a[i] in name_b:
            j = name_b.index(name_a[i])
            name_a.pop(i)
            name_b.pop(j)
            # Don't increment i — recheck same position after removal
        else:
            i += 1

    return "".join(name_a), "".join(name_b)


def finalize_flames(count):
    """Run the FLAMES elimination and return the winning letter."""
    flames = ["F", "L", "A", "M", "E", "S"]
    index = 0

    while len(flames) > 1:
        index = (index + count - 1) % len(flames)
        flames.pop(index)
        # After removal, index now points to the next element
        # If we removed the last element, wrap around
        if index == len(flames):
            index = 0

    return flames[0]


def describe_result(letter):
    """Return a human-readable description for a FLAMES result."""
    meanings = {
        "F": "💚 Friends       — Good vibes and a strong bond.",
        "L": "❤️  Lovers        — Romantic connection and attraction.",
        "A": "🩵 Affection     — Warm, caring, and emotionally close.",
        "M": "💍 Marriage      — Commitment vibes — partner material!",
        "E": "⚡ Enemies       — Chaotic match — handle with care.",
        "S": "🤝 Siblings      — Like family — playful and protective.",
    }
    return meanings.get(letter, "❓ Unknown — try again with valid names.")


def clean_name(raw):
    """Strip spaces and non-letter characters from a name."""
    return "".join(ch for ch in raw if ch.isalpha())


# ─── Main ────────────────────────────────────────────────────────────────────

print("=" * 40)
print("       🔥  F L A M I F Y  🔥")
print("    The school game, reborn.")
print("=" * 40)

raw_a = input("\nEnter your name   : ")
raw_b = input("Enter partner name: ")

name_a = clean_name(raw_a)
name_b = clean_name(raw_b)

if not name_a or not name_b:
    print("\n❌ Please enter valid names (letters only).")
else:
    print(f"\n🔤 Original  : {name_a.upper()}  +  {name_b.upper()}")

    remaining_a, remaining_b = cancel_common_letters(name_a, name_b)

    print(f"✂️  Remaining : {remaining_a.upper() or '(none)'}  +  {remaining_b.upper() or '(none)'}")

    count = len(remaining_a) + len(remaining_b)
    print(f"🔢 Count     : {count}")

    if count == 0:
        print("\n⚠️  All letters cancelled! Try different spellings.")
    else:
        result = finalize_flames(count)
        print(f"\n{'=' * 40}")
        print(f"  Result  →  {describe_result(result)}")
        print(f"{'=' * 40}\n")