const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const CONTENT = path.join(SRC, 'content');
const OUT = path.join(ROOT, '_site');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, name), 'utf8'));
}

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function nl2br(value = '') {
  return esc(value).replaceAll('\n', '<br>');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(source, destination) {
  ensureDir(destination);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function writeFile(name, html) {
  fs.writeFileSync(path.join(OUT, name), html, 'utf8');
}

function paragraphs(items = []) {
  return items.map((item) => `<p>${esc(item)}</p>`).join('');
}

function navLink(active, key, href, label) {
  return `<a${active === key ? ' class="active"' : ''} href="${esc(href)}">${esc(label)}</a>`;
}

function header(settings, active, ctaLabel, ctaUrl, announcementUrl = settings.announcement_link_url) {
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="announcement">
    <span>${esc(settings.book_title)}</span>
    <strong>${esc(settings.release_label)}</strong>
    <a href="${esc(announcementUrl)}">${esc(settings.announcement_link_label)}</a>
  </div>
  <header class="site-header">
    <a class="brand" href="/index.html" aria-label="Daddy Hunger home">
      <img src="${esc(settings.heart_logo)}" alt="">
      <span><b>${esc(settings.brand_name)}</b><small>${esc(settings.tagline)}</small></span>
    </a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">
      ${navLink(active, 'about', '/about.html', 'About')}
      ${navLink(active, 'book', '/book.html', 'The Book')}
      ${navLink(active, 'guide', '/guide.html', 'Free Guide')}
      ${navLink(active, 'speaking', '/speaking.html', 'Invite Ray')}
      ${navLink(active, 'shop', '/shop.html', 'Shop')}
      <a class="nav-button" href="${esc(ctaUrl)}">${esc(ctaLabel)}</a>
    </nav>
  </header>`;
}

function footer(settings) {
  const mail = `mailto:${settings.contact_email}`;
  return `
  <footer class="site-footer">
    <div class="footer-brand"><strong>${esc(settings.brand_name)}</strong><span>${esc(settings.tagline)}</span></div>
    <div class="footer-links">
      <a href="/about.html">About</a><a href="/book.html">The Book</a><a href="/guide.html">Free Guide</a><a href="/speaking.html">Invite Ray</a><a href="/shop.html">Shop</a>
    </div>
    <div class="footer-meta">
      <span>${esc(settings.book_title)} · ${esc(settings.release_label)}</span>
      <span>${esc(settings.copyright)}</span>
      <a href="${esc(mail)}">${esc(settings.contact_email)}</a>
      <a class="admin-link" href="/admin/">Website Admin</a>
    </div>
  </footer>`;
}

function pageShell({ settings, title, description, active, ctaLabel, ctaUrl, announcementUrl, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <title>${esc(title)}</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
${header(settings, active, ctaLabel, ctaUrl, announcementUrl)}
${body}
${footer(settings)}
  <script src="/script.js"></script>
</body>
</html>`;
}

function portrait(settings, compact = false) {
  if (settings.author_photo) {
    return `<div class="ray-portrait-placeholder${compact ? ' compact' : ''}"><img class="ray-portrait-image${compact ? ' compact' : ''}" src="${esc(settings.author_photo)}" alt="${esc(settings.author_photo_alt)}"></div>`;
  }
  return `<div class="ray-portrait-placeholder${compact ? ' compact' : ''}"><span class="portrait-initials">RU</span><small>Add Ray’s professional portrait in the CMS</small></div>`;
}

function hiddenFormFields(formName) {
  return `<input type="hidden" name="form-name" value="${esc(formName)}"><p hidden><label>Do not fill this out: <input name="bot-field"></label></p>`;
}

function signupForm({ formName, classes = '', download = '', buttonLabel, note = '' }) {
  return `<form name="${esc(formName)}" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field" class="signup-form ${esc(classes)}" data-download="${esc(download)}">
    ${hiddenFormFields(formName)}
    <label><span>First name</span><input type="text" name="firstName" autocomplete="given-name" required placeholder="First name"></label>
    <label><span>Email address</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label>
    <button class="button ${classes.includes('light-form') ? 'primary' : 'gold'}" type="submit">${esc(buttonLabel)}</button>
    ${note ? `<p class="form-note">${esc(note)}</p>` : ''}
    <p class="form-message" aria-live="polite"></p>
  </form>`;
}

function renderHome(settings, home) {
  const promiseCards = home.promises.map((p) => `<article class="promise-card"><span>${esc(p.number)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></article>`).join('');
  const visionCards = home.vision_cards.map((card) => `<a href="${esc(card.url)}"><span>${esc(card.label)}</span><strong>${esc(card.title)}</strong><i>→</i></a>`).join('');
  const body = `<main id="main">
    <section class="hero">
      <div class="hero-copy reveal">
        <p class="eyebrow">${esc(home.hero_eyebrow)}</p>
        <h1>${esc(home.hero_title_line_1)}<br><em>${esc(home.hero_title_line_2)}</em></h1>
        <p class="hero-subtitle">${esc(settings.book_subtitle)}</p>
        <p class="hero-lead">${esc(home.hero_lead)}</p>
        <div class="hero-actions"><a class="button primary" href="${esc(home.hero_primary_url)}">${esc(home.hero_primary_label)}</a><a class="button outline" href="${esc(home.hero_secondary_url)}">${esc(home.hero_secondary_label)}</a></div>
        <p class="launch-note"><span>Book release</span> ${esc(settings.release_short)}</p>
      </div>
      <div class="book-stage reveal" aria-label="Book cover for ${esc(settings.book_title)}">
        <div class="gold-ring ring-one"></div><div class="gold-ring ring-two"></div>
        <div class="book-object"><div class="book-spine"></div><img src="${esc(settings.book_cover)}" alt="${esc(settings.book_title)}, ${esc(settings.book_subtitle)}"><div class="book-author">RAY UPCHURCH</div></div>
        <div class="book-badge">${esc(settings.release_short).replace(' ', '<br>')}</div>
      </div>
    </section>
    <section class="quote-band"><div class="ornament">◆</div><blockquote>${esc(home.featured_quote)}</blockquote><div class="ornament">◆</div></section>
    <section class="section intro-section"><div class="section-kicker">The Mission</div><div class="intro-grid"><div><h2>${esc(home.mission_heading)}</h2></div><div class="intro-copy">${paragraphs(home.mission_paragraphs)}<a class="text-link" href="/about.html">Read the Daddy Hunger story <span>→</span></a></div></div></section>
    <section class="promises-section"><div class="section-heading centered"><p class="eyebrow">The Five Promises</p><h2>${esc(home.promises_heading)}</h2></div><div class="promise-grid">${promiseCards}</div></section>
    <section id="guide" class="guide-section">
      <div class="guide-preview"><div class="guide-sheet guide-sheet-back"></div><div class="guide-sheet guide-sheet-front"><span class="mini-brand">${esc(settings.brand_name)}</span><h3>${esc(home.guide_preview_title)}</h3><p>${esc(home.guide_preview_description)}</p><div class="guide-lines"><i></i><i></i><i></i><i></i><i></i></div><strong>FREE GUIDE</strong></div></div>
      <div class="guide-content"><p class="eyebrow light">Free Fatherhood Guide</p><h2>${esc(home.guide_heading)}</h2><p>${esc(home.guide_description)}</p>
        <form name="home-guide-signup" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field" class="signup-form" data-download="${esc(settings.guide_pdf)}">
          ${hiddenFormFields('home-guide-signup')}
          <div class="form-row"><label><span>First name</span><input type="text" name="firstName" autocomplete="given-name" required placeholder="First name"></label><label><span>Email address</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label></div>
          <button class="button gold" type="submit">Send Me the Free Guide</button><p class="form-note">You will also receive selected book-launch and Daddy Hunger updates. Unsubscribe anytime.</p><p class="form-message" aria-live="polite"></p>
        </form>
      </div>
    </section>
    <section class="section book-feature"><div class="book-feature-image"><img src="${esc(settings.book_spread)}" alt="Front, spine, and back cover concept for ${esc(settings.book_title)}"></div><div class="book-feature-copy"><p class="eyebrow">The Forthcoming Book</p><h2>${esc(home.book_feature_heading)}</h2>${paragraphs(home.book_feature_paragraphs)}<div class="button-row"><a class="button primary" href="/book.html">Learn About the Book</a><a class="button text-button" href="#guide">Join the Launch List</a></div></div></section>
    <section class="ray-section">${portrait(settings)}<div class="ray-copy"><p class="eyebrow light">About Ray Upchurch</p><h2>${esc(home.ray_heading)}</h2><p>${esc(home.ray_description)}</p><a class="button gold" href="/about.html">Meet Ray</a></div></section>
    <section class="section vision-section"><div class="section-heading centered narrow"><p class="eyebrow">The Vision</p><h2>${esc(home.vision_heading)}</h2><p>${esc(home.vision_description)}</p></div><div class="vision-grid">${visionCards}</div></section>
    <section class="closing-cta"><img src="${esc(settings.heart_logo)}" alt="" class="closing-mark"><p class="eyebrow light">${esc(home.closing_eyebrow)}</p><h2>${esc(home.closing_heading)}</h2><p>${esc(home.closing_line)}</p><a class="button gold" href="#guide">Get the Free Guide</a></section>
  </main>`;
  return pageShell({ settings, title: home.meta_title, description: home.meta_description, active: 'home', ctaLabel: 'Join the List', ctaUrl: '#guide', announcementUrl: '#guide', body });
}

function renderAbout(settings, about) {
  const missionWords = about.mission_words.map((word) => `<span>${esc(word)}</span>`).join('');
  const rayQuestions = about.ray_questions.map((q) => `<blockquote class="inline-quote">${esc(q)}</blockquote>`).join('');
  const impacts = about.journey_impact.map((item) => `<span>${esc(item)}</span>`).join('');
  const promises = about.promises.map((p) => `<article><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></article>`).join('');
  const platforms = about.platforms.map((item) => `<span>${esc(item)}</span>`).join('');
  const body = `<main id="main">
    <section class="page-hero about-hero"><div><p class="eyebrow">About Daddy Hunger</p><h1>${esc(about.hero_heading)}</h1><p>${esc(about.hero_description)}</p></div><img src="${esc(settings.brand_logo)}" alt="${esc(settings.brand_name)}, ${esc(settings.tagline)}"></section>
    <article class="story-layout">
      <aside class="story-nav"><span>On this page</span><a href="#origin">The Beginning</a><a href="#mission">Our Mission</a><a href="#ray">About Ray</a><a href="#journey">The Journey</a><a href="#book">The Book</a><a href="#promises">Five Promises</a><a href="#vision">The Vision</a><a href="#speak">Invite Ray</a></aside>
      <div class="story-content">
        <section id="origin" class="story-section">${paragraphs(about.origin_paragraphs)}</section>
        <section id="mission" class="story-section emphasized"><p class="eyebrow">Our Mission</p><h2>${esc(about.mission_heading)}</h2><p>${esc(about.mission_intro)}</p><div class="five-word-row">${missionWords}</div>${paragraphs(about.mission_paragraphs)}</section>
        <section id="ray" class="story-section split-story">${portrait(settings, true)}<div><p class="eyebrow">About Ray Upchurch</p><h2>${esc(about.ray_heading)}</h2>${paragraphs(about.ray_intro_paragraphs)}${rayQuestions}${about.ray_body_paragraphs.map((p, i) => i === about.ray_body_paragraphs.length - 1 ? `<p><strong>${esc(p)}</strong></p>` : `<p>${esc(p)}</p>`).join('')}</div></section>
        <section id="journey" class="story-section"><p class="eyebrow">The Daddy Hunger Journey</p><h2>${esc(about.journey_heading)}</h2>${paragraphs(about.journey_paragraphs)}<div class="impact-list">${impacts}</div><p>${esc(about.journey_closing)}</p></section>
        <section id="book" class="story-section book-callout"><div><img src="${esc(settings.book_cover)}" alt="${esc(settings.book_title)} book cover"></div><div><p class="eyebrow light">${esc(settings.book_title)}</p><h2>${esc(settings.book_subtitle)}</h2><p class="release-line">Book Release · ${esc(settings.release_short)}</p>${paragraphs(about.book_description_paragraphs)}<blockquote>${esc(about.featured_quote)}</blockquote><a class="button gold" href="/guide.html">Join the Book Launch List</a></div></section>
        <section id="promises" class="story-section"><p class="eyebrow">The Five Promises</p><h2>${esc(about.promises_heading)}</h2><div class="promise-list detailed">${promises}</div><a class="button primary" href="/guide.html">Get the Free Fatherhood Guide</a></section>
        <section id="vision" class="story-section emphasized"><p class="eyebrow">The Vision</p><h2>${esc(about.vision_heading)}</h2><p>${esc(about.vision_intro)}</p><div class="platform-grid">${platforms}</div><p>${esc(about.vision_description)}</p><blockquote class="vision-quote">${esc(about.vision_quote)}</blockquote></section>
        <section id="speak" class="story-section"><p class="eyebrow">Invite Ray to Speak</p><h2>${esc(about.speaking_heading)}</h2><p>${esc(about.speaking_description)}</p><div class="button-row"><a class="button primary" href="/speaking.html">Invite Ray to Speak</a><a class="button outline" href="mailto:${esc(settings.contact_email)}">${esc(settings.contact_email)}</a></div></section>
        <section class="story-section closing-story"><p class="eyebrow light">The Cycle Can Stop Here</p><h2>${esc(about.closing_heading)}</h2><p>${esc(about.closing_description)}</p><p class="keep-becoming">${esc(about.closing_line)}</p><a class="button gold" href="/guide.html">Get the Free Guide</a></section>
      </div>
    </article>
  </main>`;
  return pageShell({ settings, title: about.meta_title, description: about.meta_description, active: 'about', ctaLabel: 'Join the List', ctaUrl: '/guide.html', body });
}

function renderBook(settings, book) {
  const readers = book.readers.map((r) => `<article><span>${esc(r.number)}</span><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p></article>`).join('');
  const purchaseButton = book.purchase_url ? `<a class="button outline" href="${esc(book.purchase_url)}">${esc(book.purchase_button_label)}</a>` : '';
  const body = `<main id="main">
    <section class="book-page-hero"><div class="book-page-art"><div class="book-object large"><div class="book-spine"></div><img src="${esc(settings.book_cover)}" alt="${esc(settings.book_title)} book cover"><div class="book-author">RAY UPCHURCH</div></div></div><div class="book-page-copy"><p class="eyebrow">${esc(book.hero_eyebrow)}</p><h1>${esc(settings.book_title)}</h1><p class="hero-subtitle">${esc(settings.book_subtitle)}</p><p class="hero-lead">${esc(book.hero_lead)}</p><p class="release-pill">Book Release · ${esc(settings.release_short)}</p><div class="button-row"><a class="button primary" href="/guide.html">Join the Book Launch List</a>${purchaseButton}</div></div></section>
    <section class="section book-description"><div><p class="eyebrow">About the Book</p><h2>${esc(book.about_heading)}</h2></div><div>${paragraphs(book.about_paragraphs)}</div></section>
    <section class="quote-band"><div class="ornament">◆</div><blockquote>${esc(book.featured_quote)}</blockquote><div class="ornament">◆</div></section>
    <section class="section reader-section"><div class="section-heading centered narrow"><p class="eyebrow">Who This Book Is For</p><h2>${esc(book.reader_heading)}</h2></div><div class="reader-grid">${readers}</div></section>
    <section class="launch-list-section"><div><p class="eyebrow light">Be First to Know</p><h2>${esc(book.launch_heading)}</h2><p>${esc(book.launch_description)}</p></div>${signupForm({ formName: 'book-launch-list', classes: 'compact-form', buttonLabel: 'Join the Launch List' })}</section>
    <section class="section cover-section"><div><img src="${esc(settings.book_spread)}" alt="Full book cover concept"></div><div><p class="eyebrow">Cover Concept</p><h2>${esc(book.cover_heading)}</h2><p>${esc(book.cover_description)}</p><a class="text-link" href="/shop.html">Preview the merchandise direction <span>→</span></a></div></section>
  </main>`;
  return pageShell({ settings, title: book.meta_title, description: book.meta_description, active: 'book', ctaLabel: 'Join the List', ctaUrl: '/guide.html', body });
}

function renderGuide(settings, guide) {
  const checks = guide.checklist.map((item) => `<li>${esc(item)}</li>`).join('');
  const promises = guide.promises.map((p) => `<article class="promise-card"><span>${esc(p.number)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></article>`).join('');
  const body = `<main id="main">
    <section class="guide-page-hero"><div class="guide-cover-large"><span>${esc(settings.brand_name)}</span><h1>${esc(guide.cover_title)}</h1><p>${esc(guide.cover_description)}</p><div class="guide-five"><i>SAFE</i><i>SEEN</i><i>HEARD</i><i>LOVED</i><i>PREPARED</i></div></div><div class="guide-page-copy"><p class="eyebrow">Free Fatherhood Guide</p><h2>${esc(guide.hero_heading)}</h2><p>${esc(guide.hero_description)}</p><ul class="check-list">${checks}</ul>${signupForm({ formName: 'guide-download', classes: 'light-form', download: settings.guide_pdf, buttonLabel: 'Send Me the Free Guide', note: 'You will also receive selected Daddy Hunger and book-launch updates.' })}</div></section>
    <section class="section promises-preview"><div class="section-heading centered"><p class="eyebrow">Inside the Guide</p><h2>${esc(guide.preview_heading)}</h2></div><div class="promise-grid">${promises}</div></section>
    <section class="closing-cta"><img src="${esc(settings.heart_logo)}" alt="" class="closing-mark"><p class="eyebrow light">${esc(settings.release_label)}</p><h2>${esc(settings.book_title)}</h2><p>${esc(settings.book_subtitle)}</p><a class="button gold" href="/book.html">Learn About the Book</a></section>
  </main>`;
  return pageShell({ settings, title: guide.meta_title, description: guide.meta_description, active: 'guide', ctaLabel: 'Download', ctaUrl: '#download', announcementUrl: '#download', body });
}

function renderSpeaking(settings, speaking) {
  const engagements = speaking.engagements.map((item) => `<article><span>${esc(item.number)}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></article>`).join('');
  const eventOptions = speaking.event_types.map((item) => `<option value="${esc(item)}">${esc(item)}</option>`).join('');
  const body = `<main id="main">
    <section class="page-hero speaking-hero"><div><p class="eyebrow">Invite Ray to Speak</p><h1>${esc(speaking.hero_heading)}</h1><p>${esc(speaking.hero_description)}</p><a class="button primary" href="#inquiry">Start an Inquiry</a></div>${portrait(settings)}</section>
    <section class="section speaking-types"><div class="section-heading centered"><p class="eyebrow">Engagements</p><h2>${esc(speaking.engagement_heading)}</h2></div><div class="reader-grid">${engagements}</div></section>
    <section id="inquiry" class="inquiry-section"><div><p class="eyebrow light">Speaking Inquiry</p><h2>${esc(speaking.inquiry_heading)}</h2><p>${esc(speaking.inquiry_description)}</p><p><strong>Direct contact:</strong><br><a href="mailto:${esc(settings.contact_email)}">${esc(settings.contact_email)}</a></p></div>
      <form name="speaking-inquiry" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field" class="inquiry-form">
        ${hiddenFormFields('speaking-inquiry')}
        <label><span>Name</span><input type="text" name="name" required placeholder="Your name"></label>
        <label><span>Organization</span><input type="text" name="organization" placeholder="Organization name"></label>
        <label><span>Email</span><input type="email" name="email" required placeholder="you@example.com"></label>
        <label><span>Event type</span><select name="eventType">${eventOptions}</select></label>
        <label class="full"><span>Tell us about the opportunity</span><textarea name="details" rows="6" required placeholder="Date, location, audience, goals, and any other details"></textarea></label>
        <button class="button gold" type="submit">Send the Inquiry</button><p class="form-message full" aria-live="polite"></p>
      </form>
    </section>
  </main>`;
  return pageShell({ settings, title: speaking.meta_title, description: speaking.meta_description, active: 'speaking', ctaLabel: 'Start an Inquiry', ctaUrl: '#inquiry', body });
}

function renderShop(settings, shop) {
  const products = shop.products.map((product) => {
    const visual = product.image
      ? `<img class="product-photo" src="${esc(product.image)}" alt="${esc(product.name)}">`
      : `<div class="product-art ${esc(product.art_class)}"><b>${nl2br(product.art_primary)}</b>${product.art_secondary ? `<small>${esc(product.art_secondary)}</small>` : ''}</div>`;
    const action = product.product_url ? `<div class="product-card-actions"><a class="button primary" href="${esc(product.product_url)}">${esc(product.button_label || 'View Product')}</a></div>` : '';
    return `<article>${visual}<h3>${esc(product.name)}</h3><p>${esc(product.status)}</p>${action}</article>`;
  }).join('');
  const body = `<main id="main">
    <section class="shop-hero"><img src="${esc(settings.brand_logo)}" alt="${esc(settings.brand_name)} logo"><div><p class="eyebrow">Daddy Hunger Shop</p><h1>${esc(shop.hero_heading)}</h1><p>${esc(shop.hero_description)}</p><a class="button primary" href="#notify">Notify Me When the Shop Opens</a></div></section>
    <section class="section merch-preview"><div class="section-heading centered"><p class="eyebrow">Collection Preview</p><h2>${esc(shop.preview_heading)}</h2><p>${esc(shop.preview_description)}</p></div><div class="product-grid">${products}</div></section>
    <section id="notify" class="launch-list-section"><div><p class="eyebrow light">Shop Launch List</p><h2>${esc(shop.notify_heading)}</h2><p>${esc(shop.notify_description)}</p></div>${signupForm({ formName: 'shop-launch-list', classes: 'compact-form', buttonLabel: 'Notify Me' })}</section>
  </main>`;
  return pageShell({ settings, title: shop.meta_title, description: shop.meta_description, active: 'shop', ctaLabel: 'Notify Me', ctaUrl: '#notify', body });
}

function renderThanks(settings) {
  const body = `<main id="main"><section class="closing-cta" style="min-height:60vh"><img src="${esc(settings.heart_logo)}" alt="" class="closing-mark"><p class="eyebrow light">Thank You</p><h2>Your information has been received.</h2><p>Use the button below to open the free fatherhood guide. Speaking inquiries will be reviewed by the Daddy Hunger team.</p><div class="button-row"><a class="button gold" href="${esc(settings.guide_pdf)}" target="_blank" rel="noopener">Open the Free Guide</a><a class="button outline" href="/index.html">Return Home</a></div></section></main>`;
  return pageShell({ settings, title: 'Thank You | Daddy Hunger', description: 'Thank you for connecting with Daddy Hunger.', active: '', ctaLabel: 'Free Guide', ctaUrl: '/guide.html', body });
}

function build() {
  const settings = readJson('settings.json');
  const home = readJson('home.json');
  const about = readJson('about.json');
  const book = readJson('book.json');
  const guide = readJson('guide.json');
  const speaking = readJson('speaking.json');
  const shop = readJson('shop.json');

  fs.rmSync(OUT, { recursive: true, force: true });
  ensureDir(OUT);
  copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
  copyDir(path.join(SRC, 'admin'), path.join(OUT, 'admin'));
  fs.copyFileSync(path.join(SRC, 'styles.css'), path.join(OUT, 'styles.css'));
  fs.copyFileSync(path.join(SRC, 'script.js'), path.join(OUT, 'script.js'));

  writeFile('index.html', renderHome(settings, home));
  writeFile('about.html', renderAbout(settings, about));
  writeFile('book.html', renderBook(settings, book));
  writeFile('guide.html', renderGuide(settings, guide));
  writeFile('speaking.html', renderSpeaking(settings, speaking));
  writeFile('shop.html', renderShop(settings, shop));
  writeFile('thanks.html', renderThanks(settings));

  console.log(`Built Daddy Hunger site at ${OUT}`);
}

build();
