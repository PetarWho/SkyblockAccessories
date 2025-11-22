import csv

def name_to_image_url(name):
    """Convert accessory name to image URL based on known patterns"""
    
    # Convert name to the format used in image URLs
    # Examples from your provided URLs:
    # Great Spook Ring -> great_spook_ring -> /images/8/8c/SkyBlock_items_great_spook_ring.png
    # Relic Of Coins -> relic_of_coins -> /images/4/46/SkyBlock_items_relic_of_coins.png
    
    # Handle special cases first
    special_cases = {
        'Talisman Of Coins': 'https://wiki.hypixel.net/images/c/c5/SkyBlock_items_coin_talisman.png',
        'Great Spook Ring': 'https://wiki.hypixel.net/images/8/8c/SkyBlock_items_great_spook_ring.png',
        'Relic Of Coins': 'https://wiki.hypixel.net/images/4/46/SkyBlock_items_relic_of_coins.png',
        'Emerald Ring': 'https://wiki.hypixel.net/images/1/1e/SkyBlock_items_emerald_ring.png',
        'Scavenger Talisman': 'https://wiki.hypixel.net/images/6/63/SkyBlock_items_scavenger_talisman.png',
        'Scavenger Ring': 'https://wiki.hypixel.net/images/4/45/SkyBlock_items_scavenger_ring.png',
    }
    
    if name in special_cases:
        return special_cases[name]
    
    # Generate standard pattern for other items
    # Convert to lowercase and replace spaces with underscores
    base_name = name.lower().replace(' ', '_').replace('-', '_')
    
    # Use common hash patterns based on first letter
    first_letter = base_name[0]
    
    # Some known patterns
    hash_patterns = {
        'c': ('c', 'c5'),  # coin_talisman
        'e': ('1', '1e'),  # emerald_ring  
        'g': ('8', '8c'),  # great_spook_ring
        'r': ('4', '46'),  # relic_of_coins
        's': ('6', '63'),  # scavenger_talisman
    }
    
    # Use known pattern or default to first letter pattern
    if first_letter in hash_patterns:
        hash1, hash2 = hash_patterns[first_letter]
    else:
        hash1, hash2 = 'a', first_letter
    
    return f"https://wiki.hypixel.net/images/{hash1}/{hash2}/SkyBlock_items_{base_name}.png"

def main():
    print("Adding image URLs to CSV...")
    
    # Read current CSV
    with open('public/data/accessories.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    # Update each row with image URL
    for row in rows:
        name = row['name'].strip()
        if name:
            image_url = name_to_image_url(name)
            row['image_url'] = image_url
            print(f"{name}: {image_url}")
    
    # Write updated CSV
    with open('public/data/accessories.csv', 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['name', 'rarity', 'source', 'details', 'wiki_page', 'image_url']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\nAdded image URLs to {len(rows)} accessories")

if __name__ == "__main__":
    main()
