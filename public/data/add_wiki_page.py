# Fixed URL extraction
import csv

# Read HTML and extract URLs
accessory_urls = {}

with open('public/data/scrape.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all accessory name links (line 19, 29, 39 etc.)
import re
pattern = r'<td><a href="/([^"]+)" title="([^"]+)">([^<]+)</a>'
matches = re.findall(pattern, content)

for href, title, name in matches:
    # Skip collection items and rarity links
    if not href.endswith('#Collection') and href != '/Rarity':
        full_url = f"https://wiki.hypixel.net{href}"
        accessory_urls[name] = full_url

print(f"Found {len(accessory_urls)} accessories:")
for name, url in list(accessory_urls.items())[:5]:
    print(f"  {name}: {url}")

# Read and update CSV
with open('public/data/accessories.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Update each row
updated_count = 0
for row in rows:
    name = row['Name'].strip()
    if name in accessory_urls:
        row['image_url'] = accessory_urls[name]
        updated_count += 1
    else:
        row['image_url'] = ''

# Write updated CSV
with open('public/data/accessories.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['Name', 'Rarity', 'Source', 'Details', 'image_url']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Updated {updated_count} rows with URLs")

# Show missing accessories
missing = [row['Name'] for row in rows if not row['image_url']]
if missing:
    print(f"\nMissing accessories ({len(missing)}):")
    for name in missing[:10]:
        print(f"  - {name}")
    if len(missing) > 10:
        print(f"  ... and {len(missing) - 10} more")
