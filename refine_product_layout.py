from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path('/tmp/dreammy_work')

CONFIG = {
    'celebration-cake': {
        'whatsapp_text': 'Prefer WhatsApp? Send date + servings + postcode + colours/style - I will reply with availability and a quote.',
        'top_html': '''
<h2 class="h4">About this cake</h2>
<p>Celebration cakes are the easiest choice when you want something elegant, personal and versatile without going fully novelty. They suit birthdays, baby showers, anniversaries and family gatherings, especially when the brief is led by colour, finish and a few standout details.</p>
<div class="product-quick-facts">
  <div class="fact-card">
    <h3 class="h6">Popular format</h3>
    <p>6-8 inch cakes for around 8-20 servings.</p>
  </div>
  <div class="fact-card">
    <h3 class="h6">Decoration options</h3>
    <p>Standing or flat toppers, bows, florals, pearls, butterflies or an edible photo detail.</p>
  </div>
  <div class="fact-card wide">
    <h3 class="h6">Timing and price</h3>
    <p>Usually 7-10 days. Most celebration cakes start from GBP65 and go up with size and finish.</p>
  </div>
</div>
<div class="product-help-inline mt-3">
  <div class="help-band d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
    <div><strong>Prefer WhatsApp?</strong> Send date + servings + postcode + colours/style - I will reply with availability and a quote.</div>
    <div class="d-flex gap-2 flex-wrap">
      <a class="btn btn-outline btn-whatsapp" href="https://wa.me/447510837225"><i class="bi bi-whatsapp"></i> WhatsApp</a>
    </div>
  </div>
</div>
''',
        'bottom_html': '''
<section class="section alt-white product-planning">
  <div class="container">
    <div class="product-subtitle">
      <h2 class="h4 m-0">Ways to personalise a celebration cake</h2>
      <p class="text-muted small m-0">useful options to mention in your enquiry</p>
    </div>
    <div class="row g-3 mt-1">
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">Decoration options</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Vertical toppers on picks or flat toppers and plaques in gold, silver, black or colour-matched finishes.</li>
              <li><i class="bi bi-check2-circle"></i> Fresh or dried flowers, bows, pearls, butterflies and vintage piping all work beautifully on this style.</li>
              <li><i class="bi bi-check2-circle"></i> If you send a reference cake, I can recreate the overall look in my own style and adapt it to your size and budget.</li>
              <li><i class="bi bi-check2-circle"></i> An edible photo or printed detail can be added when it suits the design.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">What to send me</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Your event date and roughly how many people you want to serve.</li>
              <li><i class="bi bi-check2-circle"></i> Preferred colours and overall style: clean, vintage, floral, bow, butterfly and so on.</li>
              <li><i class="bi bi-check2-circle"></i> Any wording for the topper, board or front of the cake.</li>
              <li><i class="bi bi-check2-circle"></i> One to three reference photos if you already have a look in mind.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="planning-note mt-3">
      <p><strong>Extra option:</strong> For an extra charge I can add a personalised printed card with your own image and/or text.</p>
    </div>
  </div>
</section>
'''
    },
    'themed-cake': {
        'top_html': '''
<h2 class="h4">About this cake</h2>
<p>Themed cakes are for celebrations where the design needs to tell the story straight away. They are popular for kids' birthdays, football and gaming cakes, baby showers and bold adult celebrations where the theme matters as much as the flavour.</p>
<div class="product-quick-facts">
  <div class="fact-card">
    <h3 class="h6">Best when</h3>
    <p>The theme, name, age or character needs to be obvious at first glance.</p>
  </div>
  <div class="fact-card">
    <h3 class="h6">Decoration options</h3>
    <p>Standing toppers, flat toppers, edible images, plaques, hand-piped wording, bows or flowers.</p>
  </div>
  <div class="fact-card wide">
    <h3 class="h6">Timing and price</h3>
    <p>Usually 10-14 days. Most themed cakes start from GBP75.</p>
  </div>
</div>
<div class="product-help-inline mt-3">
  <div class="help-band d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
    <div><strong>Prefer WhatsApp?</strong> Send date + theme + servings + postcode + reference images - I will reply with availability and a quote.</div>
    <div class="d-flex gap-2 flex-wrap">
      <a class="btn btn-outline btn-whatsapp" href="https://wa.me/447510837225"><i class="bi bi-whatsapp"></i> WhatsApp</a>
    </div>
  </div>
</div>
''',
        'bottom_html': '''
<section class="section alt-white product-planning">
  <div class="container">
    <div class="product-subtitle">
      <h2 class="h4 m-0">How to brief a themed cake</h2>
      <p class="text-muted small m-0">the details that make the design clearer</p>
    </div>
    <div class="row g-3 mt-1">
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">Design options that work well</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Standing toppers, flat toppers, plaques or cut-out details for names, ages, logos and characters.</li>
              <li><i class="bi bi-check2-circle"></i> Edible images, printed details and hand-piped wording can all be combined when the brief needs more than one element.</li>
              <li><i class="bi bi-check2-circle"></i> Flowers, bows, butterflies or gift-box styling can also be worked into the theme where they suit the design.</li>
              <li><i class="bi bi-check2-circle"></i> If you send a strong reference, I can recreate the overall look in my own style and adapt it to the chosen size.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">What to send me</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Theme or character, name, age, date and any must-have details.</li>
              <li><i class="bi bi-check2-circle"></i> Colour palette and whether you want the cake to feel playful, elegant, bold or romantic.</li>
              <li><i class="bi bi-check2-circle"></i> One to three reference photos or screenshots.</li>
              <li><i class="bi bi-check2-circle"></i> Servings and postcode so I can check availability and quote properly.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="planning-note mt-3">
      <p><strong>Extra option:</strong> I can add a personalised printed card with your own image and/or text. Very sculpted or heavily 3D cakes should be discussed early so I can confirm what is realistic for the date and budget.</p>
    </div>
  </div>
</section>
'''
    },
    'mini-bento-cake': {
        'top_html': '''
<h2 class="h4">About this cake</h2>
<p>Mini / bento cakes are for small, personal moments where a full-size cake would be too much. They work well for gifts, date nights, office surprises, birthday add-ons and any order where a short message and neat presentation matter more than big servings.</p>
<div class="product-quick-facts">
  <div class="fact-card">
    <h3 class="h6">Popular format</h3>
    <p>Gift-size cake for 2-4 servings, in a lunchbox or clear box.</p>
  </div>
  <div class="fact-card">
    <h3 class="h6">Decoration options</h3>
    <p>Short wording, mini toppers, ribbons, bows, vintage piping or a small edible photo.</p>
  </div>
  <div class="fact-card wide">
    <h3 class="h6">Timing and price</h3>
    <p>Often 3-7 days when availability allows. Prices start from GBP24.</p>
  </div>
</div>
<div class="product-help-inline mt-3">
  <div class="help-band d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
    <div><strong>Prefer WhatsApp?</strong> Send date + box type + wording + postcode + inspiration photo - I will reply with availability and a quote.</div>
    <div class="d-flex gap-2 flex-wrap">
      <a class="btn btn-outline btn-whatsapp" href="https://wa.me/447510837225"><i class="bi bi-whatsapp"></i> WhatsApp</a>
    </div>
  </div>
</div>
''',
        'bottom_html': '''
<section class="section alt-white product-planning">
  <div class="container">
    <div class="product-subtitle">
      <h2 class="h4 m-0">What works best on a mini / bento cake</h2>
      <p class="text-muted small m-0">small format, but still plenty of room to personalise</p>
    </div>
    <div class="row g-3 mt-1">
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">Popular decoration options</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Short piped wording, mini toppers, ribbons, bows, hearts, pearls and vintage borders.</li>
              <li><i class="bi bi-check2-circle"></i> A small edible photo or printed detail can work well when the layout stays simple.</li>
              <li><i class="bi bi-check2-circle"></i> You can choose a lunchbox style or a clear gift box depending on the look you want.</li>
              <li><i class="bi bi-check2-circle"></i> If you send a reference cake, I can adapt it to a smaller format so it still looks balanced.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">What to send me</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Your date and whether you prefer a lunchbox or a clear gift-box style.</li>
              <li><i class="bi bi-check2-circle"></i> The message you want on top, plus any colours or finish you like.</li>
              <li><i class="bi bi-check2-circle"></i> Box style preference if you already know it.</li>
              <li><i class="bi bi-check2-circle"></i> One to three inspiration photos if there is a specific look you want me to follow.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="planning-note mt-3">
      <p><strong>Extra option:</strong> For an extra charge I can add a personalised printed card with your own image and/or text. Mini cakes work best with short wording rather than lots of tiny design elements.</p>
    </div>
  </div>
</section>
'''
    },
    'cupcakes': {
        'top_html': '''
<h2 class="h4">About this cake</h2>
<p>Cupcakes are the most practical option when you want individual portions that still look coordinated and gift-ready. They work for birthdays, office treats, baby showers, thank-you boxes and dessert tables where guests can pick up their own portion without cutting a cake.</p>
<div class="product-quick-facts">
  <div class="fact-card">
    <h3 class="h6">Popular quantities</h3>
    <p>From 6 cupcakes upward for gift boxes, offices and dessert tables.</p>
  </div>
  <div class="fact-card">
    <h3 class="h6">Decoration options</h3>
    <p>Swirl piping, colour themes, name or age toppers, logos and edible image details.</p>
  </div>
  <div class="fact-card wide">
    <h3 class="h6">Timing and price</h3>
    <p>Usually 4-7 days for standard boxes. Prices start from GBP24.</p>
  </div>
</div>
<div class="product-help-inline mt-3">
  <div class="help-band d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
    <div><strong>Prefer WhatsApp?</strong> Send date + quantity + colours + postcode + topper ideas - I will reply with availability and a quote.</div>
    <div class="d-flex gap-2 flex-wrap">
      <a class="btn btn-outline btn-whatsapp" href="https://wa.me/447510837225"><i class="bi bi-whatsapp"></i> WhatsApp</a>
    </div>
  </div>
</div>
''',
        'bottom_html': '''
<section class="section alt-white product-planning">
  <div class="container">
    <div class="product-subtitle">
      <h2 class="h4 m-0">Popular cupcake extras</h2>
      <p class="text-muted small m-0">useful details for gift boxes and event sets</p>
    </div>
    <div class="row g-3 mt-1">
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">Decoration options</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Single-colour or two-tone swirls, sprinkles and coordinated colour palettes across the full set.</li>
              <li><i class="bi bi-check2-circle"></i> Name toppers, age toppers, logo toppers or simple edible image details.</li>
              <li><i class="bi bi-check2-circle"></i> Mixed boxes can be kept neat and elegant or made brighter for party themes.</li>
              <li><i class="bi bi-check2-circle"></i> If you send a reference box or mood board, I can recreate the overall feel in my own style.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="card planning-card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="h6">What to send me</h3>
            <ul class="bullets">
              <li><i class="bi bi-check2-circle"></i> Quantity, date and whether this is for gifting, an office order or a dessert table.</li>
              <li><i class="bi bi-check2-circle"></i> Preferred colours, event theme and any wording or topper details.</li>
              <li><i class="bi bi-check2-circle"></i> Logo or image file if you want branded toppers or edible prints.</li>
              <li><i class="bi bi-check2-circle"></i> Postcode so I can confirm delivery timing and quote.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="planning-note mt-3">
      <p><strong>Extra option:</strong> I can add a personalised printed card with your own image and/or text when the cupcake box is going straight to the recipient.</p>
    </div>
  </div>
</section>
'''
    },
}

CSS_APPEND = '''

/* === Product page layout refinement: lighter intro + moved planning details === */
.product .product-intro-copy p{margin-bottom:0}
.product .product-quick-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
.product .product-quick-facts .fact-card{background:#fff8ef;border:1px solid rgba(0,0,0,.06);border-radius:14px;padding:14px 15px}
.product .product-quick-facts .fact-card h3{margin:0 0 6px;font-size:.98rem}
.product .product-quick-facts .fact-card p{margin:0;font-size:.95rem;line-height:1.45}
.product .product-quick-facts .fact-card.wide{grid-column:1 / -1}
.product .product-planning .planning-card{background:#fff;border:1px solid #eee;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.04)}
.product .product-planning .planning-card .card-body{padding:18px}
.product .product-planning .planning-card h3{margin-bottom:12px}
.product .product-planning .planning-card .bullets{gap:.7rem}
.product .product-planning .planning-card .bullets li{font-size:.96rem;line-height:1.45}
.product .product-planning .planning-note{background:#fff8ef;border:1px solid rgba(0,0,0,.06);border-radius:16px;padding:14px 16px}
.product .product-planning .planning-note p{margin:0}
@media (min-width:992px){.product .product-intro-copy{padding-left:10px}}
@media (max-width:991.98px){
  .product .product-quick-facts{grid-template-columns:1fr;gap:10px}
  .product .product-quick-facts .fact-card.wide{grid-column:auto}
  .product .product-help-inline .help-band{padding:12px}
  #order-mobile.section{padding-top:20px}
  .product .product-planning .planning-card .card-body{padding:16px}
}
/* === end layout refinement === */
'''


def replace_children(node, fragment_html):
    node.clear()
    frag = BeautifulSoup(fragment_html, 'html.parser')
    body = frag.body or frag
    for child in list(body.contents):
        node.append(child)


for slug, cfg in CONFIG.items():
    path = ROOT / 'Products' / slug / 'index.html'
    html = path.read_text(encoding='utf-8')
    doctype = '<!DOCTYPE html>' if html.lstrip().lower().startswith('<!doctype html>') else ''
    soup = BeautifulSoup(html, 'html.parser')

    main = soup.select_one('main.product')
    top_section = None
    for sec in main.find_all('section', recursive=False):
        if sec.select_one('.gallery .product-swiper'):
            top_section = sec
            break
    if top_section is None:
        raise RuntimeError(f'No top section found for {slug}')

    right_col = top_section.select_one('.col-12.col-lg-7')
    right_col['class'] = ['col-12', 'col-lg-7', 'product-intro-copy']
    right_col['data-aos'] = 'fade-up'
    right_col['data-aos-delay'] = '100'
    replace_children(right_col, cfg['top_html'])

    story = main.select_one('section.product-story')
    if story:
        story.decompose()

    order_mobile = main.select_one('section#order-mobile')
    if order_mobile:
        order_mobile.extract()
        top_section.insert_after(order_mobile)

    help_section = main.select_one('section#help')
    if help_section is None:
        raise RuntimeError(f'No help section found for {slug}')
    planning_frag = BeautifulSoup(cfg['bottom_html'], 'html.parser')
    planning_sec = planning_frag.select_one('section.product-planning')
    help_section.insert_before(planning_sec)

    path.write_text(doctype + '\n' + str(soup), encoding='utf-8')

css_path = ROOT / 'assets' / 'css' / 'product.css'
css = css_path.read_text(encoding='utf-8')
if 'Product page layout refinement: lighter intro + moved planning details' not in css:
    css_path.write_text(css + CSS_APPEND, encoding='utf-8')

print('Updated files:', ', '.join(CONFIG.keys()))
