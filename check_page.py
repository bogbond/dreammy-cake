from pathlib import Path
from playwright.sync_api import sync_playwright

outdir = Path('/tmp/dreammy_work/checks')
outdir.mkdir(exist_ok=True)
url = 'http://127.0.0.1:8000/Products/themed-cake/'
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 1800}, device_scale_factor=1)
    page.goto(url, wait_until='networkidle')
    page.screenshot(path=str(outdir/'themed-desktop.png'), full_page=True)
    page = browser.new_page(viewport={'width': 390, 'height': 1400}, is_mobile=True)
    page.goto(url, wait_until='networkidle')
    page.screenshot(path=str(outdir/'themed-mobile.png'), full_page=True)
    browser.close()
print('ok')
