const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_STORAGE_MB = 100; // 100 MB limit for Upload Library
const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Static Routes
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// Serve website public media directly for both CMS and Next.js parity
const websitePublicDir = path.join(__dirname, 'website', 'public');
if (fs.existsSync(websitePublicDir)) {
  app.use('/images', express.static(path.join(websitePublicDir, 'images')));
  app.use('/videos', express.static(path.join(websitePublicDir, 'videos')));
  app.use('/fonts', express.static(path.join(websitePublicDir, 'fonts')));
  app.use('/media', express.static(websitePublicDir));
}

// Next.js image optimizer compatibility route for CMS preview and dashboard
app.get('/_next/image', (req, res) => {
  const imageUrl = req.query.url;
  if (imageUrl) {
    return res.redirect(imageUrl);
  }
  res.status(404).send('Image not found');
});

// Storage calculation helper for all library media
function getStorageStats() {
  let totalBytes = 0;
  let fileCount = 0;

  // 1. User uploaded media in uploadsDir
  if (fs.existsSync(uploadsDir)) {
    try {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(f => {
        try {
          const stat = fs.statSync(path.join(uploadsDir, f));
          if (stat.isFile()) {
            totalBytes += stat.size;
            fileCount++;
          }
        } catch (e) {}
      });
    } catch (e) {}
  }

  // 2. Pre-loaded website media in websitePublicDir/images
  const siteImagesDir = path.join(websitePublicDir, 'images');
  if (fs.existsSync(siteImagesDir)) {
    const scanDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const fullPath = path.join(dir, e.name);
          if (e.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(jpe?g|png|webp|svg|gif|avif)$/i.test(e.name)) {
            try {
              const stat = fs.statSync(fullPath);
              totalBytes += stat.size;
              fileCount++;
            } catch (err) {}
          }
        }
      } catch (err) {}
    };
    scanDir(siteImagesDir);
  }

  // 3. Hero video in websitePublicDir/videos
  const siteVideosDir = path.join(websitePublicDir, 'videos');
  if (fs.existsSync(siteVideosDir)) {
    try {
      const entries = fs.readdirSync(siteVideosDir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory() && /\.(mp4|webm|ogg)$/i.test(e.name)) {
          try {
            const stat = fs.statSync(path.join(siteVideosDir, e.name));
            totalBytes += stat.size;
            fileCount++;
          } catch (err) {}
        }
      }
    } catch (err) {}
  }

  const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
  const availableBytes = Math.max(0, MAX_STORAGE_BYTES - totalBytes);
  const availableMB = (availableBytes / (1024 * 1024)).toFixed(1);
  const percentUsed = Math.min(100, Math.round((totalBytes / MAX_STORAGE_BYTES) * 100));

  return {
    usedBytes: totalBytes,
    maxBytes: MAX_STORAGE_BYTES,
    usedMB: parseFloat(usedMB),
    availableMB: parseFloat(availableMB),
    maxMB: MAX_STORAGE_MB,
    percentUsed,
    fileCount
  };
}

function getUploadsStorageStats() {
  return getStorageStats();
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per single file
});

// Persistent Data Store
const DATA_FILE = path.join(__dirname, 'cms-data.json');

const initialSeedData = {
  settings: {
    site_logo: "/images/emaar-india-logo-en.svg",
    site_logo_alt: "Emaar India Official Logo",
    hero_video: "/videos/emaar.mp4",
    hero_video_type: "local",
    hero_search_placeholder: "Search by project, location or property type...",
    contact_phone: "+91 124 4421155",
    contact_email: "enquiries@emaar-india.com",
    brand_title: "Emaar India Limited"
  },
  sections: {
    legacy_intro: {
      key: "legacy_intro",
      title: "BUILT ON LEGACY, DESIGNED FOR LIFE",
      subtitle: "Master developments across India",
      content: "For decades, Emaar has shaped some of the world’s most recognisable landmarks through visionary architecture, thoughtful design and a commitment to excellence. Building on this global legacy, Emaar India continues to create distinctive spaces across residential and commercial destinations.",
      badge: "LEGACY"
    },
    walkthrough: {
      key: "walkthrough",
      badge: "NEW",
      title: "PROJECT WALKTHROUGHS",
      subtitle: "EXPLORE EMAAR INDIA FROM WHEREVER YOU ARE IN DETAIL.",
      image: "/images/project-walkthrough.jpg",
      content: "STEP INSIDE EMAAR INDIA'S PROPERTIES THROUGH IMMERSIVE WALKTHROUGHS AND EXPERIENCE THE SPACES BEFORE YOU ARRIVE.",
      cta_text: "EXPLORE",
      cta_link: "/walkthroughs"
    },
    blogs: {
      key: "blogs",
      title: "DISCOVER OUR BLOGS",
      subtitle: "READ INSIGHTS ON REAL ESTATE, LIFESTYLE, INVESTMENT AND THE PLACES SHAPING INDIA.",
      view_all_link: "/blogs",
      posts: [
        {
          id: 1,
          caption: "EMAAR INDIA: BESPOKE, LUXURIOUS & SUSTAINABLE LIVING",
          image: "/images/blog1.jpg",
          link: "/blogs/bespoke-living"
        },
        {
          id: 2,
          caption: "DIGI HOMES VS URBAN OASIS: SMART LUXURY IN SECTOR 62",
          image: "/images/blog2.jpg",
          link: "/blogs/digi-homes"
        }
      ]
    },
    header: {
      key: "header",
      phone: "+91 124 4421155",
      whatsapp: "+91 124 4421155",
      phone_icon: "/images/call.svg",
      whatsapp_icon: "/images/whatsapp.svg",
      cta_text: "SCHEDULE A VISIT",
      cta_link: "/contact",
      nav_links: "ABOUT US, LATEST LAUNCHES, PROJECTS, SUSTAINABILITY",
      projects_dropdown: "Residential, Commercial",
      logo: "/images/emaar-india-logo-en.svg"
    },
    footer: {
      key: "footer",
      logo: "/images/emaar-india-logo-en.svg",
      facebook: "https://facebook.com/emaarindia",
      twitter: "https://twitter.com/emaarindia",
      youtube: "https://youtube.com/emaarindia",
      instagram: "https://instagram.com/emaarindia",
      linkedin: "https://linkedin.com/company/emaar-india",
      news_placeholder: "Enter email",
      news_btn: "SUBSCRIBE",
      news_btn_bg: "#525252",
      news_btn_color: "#ffffff",
      col1_title: "ABOUT EMAAR",
      col1_links: "Who We Are, Leadership, Awards, Emaar Business, Emaar Foundation, Career, Investor Relations, Emaar Blogs, Media, Emaar Sustainability, E-Services, Contact Us, Compliance",
      col2_title: "PROJECTS",
      col2_links: "Residential, Commercial",
      col3_title: "MASTER DEVELOPMENTS",
      col3_links: "Gomti Greens, Savana by Indore Greens, Savana by Jaipur Greens",
      col4_title: "LATEST LAUNCHES",
      col4_links: "Emaar Serenity Hills, Urban Ascent, Elite Oasis, Emaar India Business Centre, Mohali Hills Residential Plots",
      col5_title: "EMAAR INTERNATIONAL",
      col5_links: "KSA, India, Pakistan, Egypt, Morocco, Turkey",
      col6_title: "EMAAR HOSPITALITY",
      col6_links: "Hotels & Resorts, Emaar Hospitality Club, Address Hotels, Vida Residences",
      legal_text: "Privacy Policy • Disclaimer • Terms & Conditions • Country & Language"
    }
  },
  landmarks: [
    {
      id: 1,
      name: "SERENITY HILLS, GURUGRAM",
      slug: "emaar-serenity-hills",
      location: "Gurugram",
      category: "Residential",
      image: "/images/landmarks/Serenity-hills-big.webp",
      sort_order: 1
    },
    {
      id: 2,
      name: "EMAAR INDIA BUSINESS CENTRE, GURUGRAM",
      slug: "emaar-india-business-centre",
      location: "Gurugram",
      category: "Commercial",
      image: "/images/landmarks/business-centre.jpg",
      sort_order: 2
    },
    {
      id: 3,
      name: "ELITE OASIS, LUCKNOW",
      slug: "elite-oasis",
      location: "Lucknow",
      category: "Residential",
      image: "/images/landmarks/elite-oasis.jpg",
      sort_order: 3
    },
    {
      id: 4,
      name: "URBAN ASCENT, GURUGRAM",
      slug: "urban-ascent",
      location: "Gurugram",
      category: "Residential",
      image: "/images/landmarks/urban-ascent.jpg",
      sort_order: 4
    },
    {
      id: 5,
      name: "MOHALI HILLS RESIDENTIAL PLOTS, MOHALI",
      slug: "mohali-hills",
      location: "Mohali",
      category: "Plots",
      image: "/images/landmarks/mohali-hills.jpg",
      sort_order: 5
    },
    {
      id: 6,
      name: "URBAN OASIS PHASE-4, GURUGRAM",
      slug: "urban-oasis-phase-4",
      location: "Gurugram",
      category: "Residential",
      image: "/images/landmarks/property-main-image-706x385.jpg",
      sort_order: 6
    }
  ],
  pages: [
    {
      id: 1,
      title: "Home Page",
      slug: "/",
      template: "home",
      hero_banner: "/videos/emaar.mp4",
      hero_title: "Emaar India",
      hero_subtitle: "A Blend Of Lifestyle, Commercial Spaces & Residential Projects",
      content: "Main landing view featuring video hero, landmark slider, and discovery sections.",
      status: "published",
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      title: "Emaar Serenity Hills",
      slug: "/properties/emaar-serenity-hills",
      template: "property",
      hero_banner: "/images/landmarks/Serenity-hills-big.webp",
      hero_title: "Emaar Serenity Hills",
      hero_subtitle: "Nestled at the foothills of the Aravallis, Gurugram.",
      content: "Exclusive residential apartments surrounded by green vistas and world-class amenities.",
      status: "published",
      updated_at: new Date().toISOString()
    }
  ]
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!data.sections) data.sections = {};
      data.sections.header = { ...initialSeedData.sections.header, ...(data.sections.header || {}) };
      data.sections.footer = { ...initialSeedData.sections.footer, ...(data.sections.footer || {}) };
      delete data.sections.footer.toll_free;
      delete data.sections.footer.email;
      delete data.sections.footer.address;
      delete data.sections.footer.rera;
      delete data.sections.footer.copyright_html;
      delete data.sections.footer.news_title;
      delete data.sections.footer.news_sub;
      saveData(data);
      return data;
    } catch (e) {
      console.error('Error reading data file, using defaults', e);
    }
  }
  saveData(initialSeedData);
  return initialSeedData;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving data file', e);
  }
}

let db = loadData();

// Valid non-404 routes in the Next.js website (Home Page and Emaar Serenity Hills)
function isLiveNon404Route(slug) {
  if (!slug) return false;
  const clean = slug.trim().toLowerCase();
  if (clean === '/' || clean === '') return true;
  if (clean === '/properties/emaar-serenity-hills' || clean === 'emaar-serenity-hills') return true;
  return false;
}

// Ensure db.pages exists and has at least the default pages
if (!Array.isArray(db.pages) || db.pages.length === 0) {
  db.pages = JSON.parse(JSON.stringify(initialSeedData.pages));
}

// Ensure db.published snapshot exists
if (!db.published) {
  db.published = {
    settings: JSON.parse(JSON.stringify(db.settings)),
    sections: JSON.parse(JSON.stringify(db.sections)),
    landmarks: JSON.parse(JSON.stringify(db.landmarks)),
    pages: JSON.parse(JSON.stringify(db.pages))
  };
  saveData(db);
}

// Ensure db.versions array exists with at least an initial safe baseline version
if (!Array.isArray(db.versions) || db.versions.length === 0) {
  const baseSnapshot = db.published || {
    settings: db.settings,
    sections: db.sections,
    landmarks: db.landmarks,
    pages: db.pages
  };
  const baseVersion = {
    id: 'v-baseline-1',
    version_number: 'v1.0',
    title: 'Version 1.0 - Initial Safe Baseline',
    published_at: db.last_published_at || new Date().toISOString(),
    published_by: 'System Administrator',
    summary: `${(db.pages || []).length} Pages • ${(db.landmarks || []).length} Landmarks • Safe Baseline`,
    snapshot: JSON.parse(JSON.stringify(baseSnapshot))
  };
  db.versions = [baseVersion];
  db.active_version_id = baseVersion.id;
  saveData(db);
}

// =====================================================================
// API ROUTES
// =====================================================================

// Unified Site Content Endpoint (Consumed by Next.js Live & Preview)
app.get('/api/site-content', (req, res) => {
  const isStaged = req.query.mode === 'staged' || req.query.preview === 'true';
  const target = isStaged ? {
    settings: db.settings,
    sections: db.sections,
    landmarks: db.landmarks,
    pages: db.pages
  } : (db.published || {
    settings: db.settings,
    sections: db.sections,
    landmarks: db.landmarks,
    pages: db.pages
  });

  res.json({
    success: true,
    mode: isStaged ? 'staged' : 'published',
    isStagedPending: !!db.staged_pending,
    lastPublishedAt: db.last_published_at || null,
    data: target
  });
});

// Update Staged Site Content Endpoint (Directly updates settings, sections, landmarks, pages)
app.put('/api/site-content', (req, res) => {
  const { settings, sections, landmarks, pages } = req.body || {};
  if (settings && typeof settings === 'object') {
    db.settings = { ...(db.settings || {}), ...settings };
  }
  if (sections && typeof sections === 'object') {
    if (!db.sections) db.sections = {};
    for (const key of Object.keys(sections)) {
      if (typeof sections[key] === 'object' && !Array.isArray(sections[key]) && sections[key] !== null) {
        db.sections[key] = { ...(db.sections[key] || {}), ...sections[key] };
      } else {
        db.sections[key] = sections[key];
      }
    }
  }
  if (Array.isArray(landmarks)) {
    db.landmarks = landmarks;
  }
  if (Array.isArray(pages)) {
    db.pages = pages;
  }
  db.staged_pending = true;
  db.staged_updated_at = Date.now();
  saveData(db);
  res.json({
    success: true,
    message: 'Staged site content successfully saved',
    data: {
      settings: db.settings,
      sections: db.sections,
      landmarks: db.landmarks,
      pages: db.pages
    }
  });
});

// Accurate Real Media Counting (no fake numbers)
function getActualMediaCounts() {
  let imgCount = 0;
  let vidCount = 0;

  // 1. Count images in website/public/images
  const siteImagesDir = path.join(websitePublicDir, 'images');
  if (fs.existsSync(siteImagesDir)) {
    const countFilesRec = (dir) => {
      let count = 0;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const fullPath = path.join(dir, e.name);
          if (e.isDirectory()) count += countFilesRec(fullPath);
          else if (/\.(jpe?g|png|webp|svg|gif|avif)$/i.test(e.name)) count++;
        }
      } catch (err) {}
      return count;
    };
    imgCount += countFilesRec(siteImagesDir);
  }

  // 2. Count videos in website/public/videos
  const siteVideosDir = path.join(websitePublicDir, 'videos');
  if (fs.existsSync(siteVideosDir)) {
    try {
      const vids = fs.readdirSync(siteVideosDir).filter(f => /\.(mp4|webm|ogg|mov)$/i.test(f));
      vidCount += vids.length;
    } catch (err) {}
  }

  // 3. Count user uploaded media in uploads/
  if (fs.existsSync(uploadsDir)) {
    try {
      const uploadFiles = fs.readdirSync(uploadsDir);
      for (const f of uploadFiles) {
        if (/\.(mp4|webm|ogg|mov)$/i.test(f)) vidCount++;
        else if (/\.(jpe?g|png|webp|svg|gif|avif)$/i.test(f)) imgCount++;
      }
    } catch (err) {}
  }

  return { imgCount, vidCount };
}

// Overview stats (real non-fake metrics calculated from database and storage)
app.get('/api/stats', (req, res) => {
  const storage = getUploadsStorageStats();
  const { imgCount, vidCount } = getActualMediaCounts();
  
  // Real last updated time calculation
  let lastTs = db.staged_updated_at || db.last_published_at || (db.pages[0] && new Date(db.pages[0].updated_at).getTime()) || Date.now();
  const diffSec = Math.max(0, Math.floor((Date.now() - lastTs) / 1000));
  let lastUpdatedStr = 'Just now';
  if (diffSec >= 86400) {
    const days = Math.floor(diffSec / 86400);
    lastUpdatedStr = `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffSec >= 3600) {
    const hours = Math.floor(diffSec / 3600);
    lastUpdatedStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffSec >= 60) {
    const mins = Math.floor(diffSec / 60);
    lastUpdatedStr = `${mins} min${mins > 1 ? 's' : ''} ago`;
  }

  res.json({
    success: true,
    data: {
      totalPages: db.pages.length,
      totalImages: imgCount,
      totalVideos: vidCount,
      lastUpdated: lastUpdatedStr,
      lastUpdatedTimestamp: lastTs,
      updatedBy: 'Tushar Yadav',
      storage
    }
  });
});

// Staged Status (for dynamic real-time sync with preview without manual reload)
app.get('/api/staged-status', (req, res) => {
  const currentDb = loadData();
  const changes = [];
  if (currentDb.staged_pending) {
    const pub = currentDb.published || {};
    if (JSON.stringify(currentDb.landmarks) !== JSON.stringify(pub.landmarks)) {
      const count = (currentDb.landmarks || []).length;
      changes.push(`Landmark developments reordered/updated (${count} items)`);
    }
    if (JSON.stringify(currentDb.pages) !== JSON.stringify(pub.pages)) {
      const pageCount = (currentDb.pages || []).length;
      changes.push(`Page content/structure modified (${pageCount} pages)`);
    }
    if (JSON.stringify(currentDb.sections) !== JSON.stringify(pub.sections)) {
      changes.push('Homepage sections updated');
    }
    if (JSON.stringify(currentDb.settings) !== JSON.stringify(pub.settings)) {
      changes.push('Site brand/contact settings modified');
    }
    if (changes.length === 0) {
      changes.push('Site content updates ready for live release');
    }
  }

  res.json({
    success: true,
    staged_pending: !!currentDb.staged_pending,
    staged_updated_at: currentDb.staged_updated_at || 0,
    last_published_at: currentDb.last_published_at || 0,
    changes,
    change_count: changes.length
  });
});

// Site Settings
app.get('/api/site-settings', (req, res) => {
  res.json({ success: true, data: db.settings });
});

app.put('/api/site-settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  db.staged_pending = true;
  db.staged_updated_at = Date.now();
  saveData(db);
  res.json({ success: true, message: 'Settings saved', data: db.settings });
});

// Page Sections
app.get('/api/sections', (req, res) => {
  res.json({ success: true, data: db.sections });
});

app.put('/api/sections/:key', (req, res) => {
  const key = req.params.key;
  db.sections[key] = { ...(db.sections[key] || {}), ...req.body };
  db.staged_pending = true;
  db.staged_updated_at = Date.now();
  saveData(db);
  res.json({ success: true, message: 'Section updated', data: db.sections[key] });
});

// Landmarks
app.get('/api/landmarks', (req, res) => {
  res.json({ success: true, data: db.landmarks });
});

app.post('/api/landmarks', (req, res) => {
  const newLandmark = {
    id: Date.now(),
    name: req.body.name || 'New Landmark',
    slug: req.body.slug || `landmark-${Date.now()}`,
    location: req.body.location || 'Gurugram',
    category: req.body.category || 'Residential',
    image: req.body.image || '/media/images/landmarks/Serenity-hills-big.webp',
    sort_order: db.landmarks.length + 1
  };
  db.landmarks.push(newLandmark);
  db.staged_pending = true;
  saveData(db);
  res.json({ success: true, message: 'Landmark added', data: newLandmark });
});

app.put('/api/landmarks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.landmarks.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  db.landmarks[idx] = { ...db.landmarks[idx], ...req.body };
  db.staged_pending = true;
  saveData(db);
  res.json({ success: true, message: 'Landmark updated', data: db.landmarks[idx] });
});

app.delete('/api/landmarks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.landmarks = db.landmarks.filter(l => l.id !== id);
  db.staged_pending = true;
  saveData(db);
  res.json({ success: true, message: 'Landmark deleted' });
});

// Pages
app.get('/api/pages', (req, res) => {
  res.json({ success: true, data: db.pages });
});

app.post('/api/pages', (req, res) => {
  const { title, slug, template, hero_banner, hero_title, hero_subtitle, content, status } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

  let finalSlug = slug;
  if (!finalSlug) {
    finalSlug = '/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  } else if (!finalSlug.startsWith('/')) {
    finalSlug = '/' + finalSlug;
  }

  const slugExists = (db.pages || []).some(p => p.slug.toLowerCase() === finalSlug.toLowerCase());
  if (slugExists) {
    return res.status(400).json({ success: false, message: `Route slug "${finalSlug}" is already in use by another page.` });
  }

  const newPage = {
    id: Date.now(),
    title,
    slug: finalSlug,
    template: template || 'standard',
    hero_banner: hero_banner || '/media/images/landmarks/business-centre.jpg',
    hero_title: hero_title || title,
    hero_subtitle: hero_subtitle || '',
    content: content || '',
    status: status || 'published',
    updated_at: new Date().toISOString()
  };

  db.pages.push(newPage);
  db.staged_pending = true;
  saveData(db);
  res.json({ success: true, message: 'Page created', data: newPage });
});

app.put('/api/pages/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.pages.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  db.pages[idx] = { ...db.pages[idx], ...req.body, updated_at: new Date().toISOString() };
  db.staged_pending = true;
  saveData(db);
  res.json({ success: true, message: 'Page updated', data: db.pages[idx] });
});

// Single Page Direct Publish API
app.post('/api/pages/:id/publish', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.pages.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  
  if (req.body && Object.keys(req.body).length > 0) {
    db.pages[idx] = { ...db.pages[idx], ...req.body };
  }
  db.pages[idx].status = 'published';
  db.pages[idx].updated_at = new Date().toISOString();
  db.last_published_at = new Date().toISOString();

  if (!db.published) {
    db.published = {
      settings: JSON.parse(JSON.stringify(db.settings)),
      sections: JSON.parse(JSON.stringify(db.sections)),
      landmarks: JSON.parse(JSON.stringify(db.landmarks)),
      pages: JSON.parse(JSON.stringify(db.pages))
    };
  } else {
    if (!db.published.pages) db.published.pages = [];
    const pubIdx = db.published.pages.findIndex(p => p.id === id);
    if (pubIdx !== -1) {
      db.published.pages[pubIdx] = JSON.parse(JSON.stringify(db.pages[idx]));
    } else {
      db.published.pages.push(JSON.parse(JSON.stringify(db.pages[idx])));
    }
  }

  saveData(db);
  res.json({
    success: true,
    message: `Page "${db.pages[idx].title}" published successfully to live website!`,
    data: db.pages[idx]
  });
});

app.delete('/api/pages/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const target = db.pages.find(p => p.id === id);
  if (target && target.slug === '/') {
    return res.status(400).json({ success: false, message: 'Cannot delete Home Page' });
  }
  db.pages = db.pages.filter(p => p.id !== id);
  if (db.published && Array.isArray(db.published.pages)) {
    db.published.pages = db.published.pages.filter(p => p.id !== id);
  }
  db.staged_pending = true;
  db.staged_updated_at = Date.now();
  saveData(db);
  res.json({ success: true, message: 'Page deleted' });
});

// Upload Library with Storage Quota Enforcement
app.get('/api/media', (req, res) => {
  const mediaList = [];
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(f => {
      try {
        const filePath = path.join(uploadsDir, f);
        const stat = fs.statSync(filePath);
        const ext = path.extname(f).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.ogg'].includes(ext);
        mediaList.push({
          id: f,
          name: f,
          url: `/uploads/${f}`,
          type: isVideo ? 'video' : 'image',
          sizeBytes: stat.size,
          sizeFormatted: (stat.size / 1024).toFixed(1) + ' KB',
          date: stat.mtime,
          isUserUpload: true
        });
      } catch (e) {}
    });
  }

  // Pre-loaded website media (scan all site images)
  const siteImagesDir = path.join(websitePublicDir, 'images');
  if (fs.existsSync(siteImagesDir)) {
    const scanDir = (dir, prefix = '') => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const fullPath = path.join(dir, e.name);
          if (e.isDirectory()) {
            scanDir(fullPath, `${prefix}${e.name}/`);
          } else if (/\.(jpe?g|png|webp|svg|gif|avif)$/i.test(e.name)) {
            let sizeBytes = 0;
            let mtime = new Date();
            try {
              const stat = fs.statSync(fullPath);
              sizeBytes = stat.size;
              mtime = stat.mtime;
            } catch (stErr) {}

            const sizeFormatted = sizeBytes > 1048576 
              ? (sizeBytes / 1048576).toFixed(2) + ' MB'
              : (sizeBytes / 1024).toFixed(1) + ' KB';

            const relUrl = `/images/${prefix}${e.name}`;
            mediaList.push({
              id: `site-${prefix}${e.name}`,
              name: e.name,
              url: relUrl,
              type: 'image',
              sizeBytes,
              sizeFormatted,
              category: prefix ? prefix.replace('/', '') : 'General',
              date: mtime,
              isUserUpload: false
            });
          }
        }
      } catch (err) {}
    };
    scanDir(siteImagesDir);
  }

  // Hero Video & Logo
  const videoPath = path.join(websitePublicDir, 'videos', 'emaar.mp4');
  let videoBytes = 4863054;
  let videoDate = new Date();
  if (fs.existsSync(videoPath)) {
    try {
      const vStat = fs.statSync(videoPath);
      videoBytes = vStat.size;
      videoDate = vStat.mtime;
    } catch (e) {}
  }
  const videoFormatted = videoBytes > 1048576 
    ? (videoBytes / 1048576).toFixed(2) + ' MB' 
    : (videoBytes / 1024).toFixed(1) + ' KB';

  mediaList.unshift({
    id: 'site-video',
    name: 'emaar.mp4 (Hero Background Video)',
    url: '/videos/emaar.mp4',
    type: 'video',
    sizeBytes: videoBytes,
    sizeFormatted: videoFormatted,
    date: videoDate,
    isUserUpload: false
  });

  const logoPath = path.join(websitePublicDir, 'images', 'emaar-india-logo-en.svg');
  let logoBytes = 3950;
  let logoDate = new Date();
  if (fs.existsSync(logoPath)) {
    try {
      const lStat = fs.statSync(logoPath);
      logoBytes = lStat.size;
      logoDate = lStat.mtime;
    } catch (e) {}
  }
  const logoFormatted = logoBytes > 1048576 
    ? (logoBytes / 1048576).toFixed(2) + ' MB' 
    : (logoBytes / 1024).toFixed(1) + ' KB';

  mediaList.unshift({
    id: 'site-logo',
    name: 'emaar-india-logo-en.svg (Brand Logo)',
    url: '/images/emaar-india-logo-en.svg',
    type: 'image',
    sizeBytes: logoBytes,
    sizeFormatted: logoFormatted,
    date: logoDate,
    isUserUpload: false
  });

  const storage = getStorageStats();
  res.json({ success: true, data: mediaList, storage });
});

// File Upload with Storage Quota Check
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check storage limit
    const currentStats = getUploadsStorageStats();
    if (currentStats.usedBytes > MAX_STORAGE_BYTES) {
      // Remove file immediately to protect storage quota
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(400).json({
        success: false,
        message: `Upload rejected: Storage quota of ${MAX_STORAGE_MB} MB exceeded. Current usage: ${currentStats.usedMB} MB. Please delete existing media to free up space.`
      });
    }

    res.json({
      success: true,
      message: 'File successfully uploaded to library',
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      storage: getUploadsStorageStats()
    });
  });
});

// Delete Media to Free Up Storage Quota
app.delete('/api/media/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: 'File deleted from library',
        storage: getUploadsStorageStats()
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Could not delete file' });
    }
  }
  res.status(404).json({ success: false, message: 'File not found' });
});

// Publish Staged Changes API (Creates Version Snapshot)
app.post('/api/publish', (req, res) => {
  const currentDb = loadData();
  if (!Array.isArray(currentDb.versions)) {
    currentDb.versions = [];
  }

  const newSnapshot = {
    settings: JSON.parse(JSON.stringify(currentDb.settings)),
    sections: JSON.parse(JSON.stringify(currentDb.sections)),
    landmarks: JSON.parse(JSON.stringify(currentDb.landmarks)),
    pages: JSON.parse(JSON.stringify(currentDb.pages))
  };

  const versionCount = currentDb.versions.length + 1;
  const newVersion = {
    id: 'v-' + Date.now(),
    version_number: `v${versionCount}.0`,
    title: `Version ${versionCount}.0 - Live Release`,
    published_at: new Date().toISOString(),
    published_by: 'Tushar Yadav',
    summary: `${(currentDb.pages || []).length} Pages • ${(currentDb.landmarks || []).length} Landmarks • Live Release`,
    snapshot: newSnapshot
  };

  currentDb.versions.unshift(newVersion);
  if (currentDb.versions.length > 25) {
    currentDb.versions = currentDb.versions.slice(0, 25);
  }

  currentDb.published = JSON.parse(JSON.stringify(newSnapshot));
  currentDb.active_version_id = newVersion.id;
  currentDb.last_published_at = newVersion.published_at;
  currentDb.staged_pending = false;
  saveData(currentDb);
  db = currentDb;

  res.json({
    success: true,
    message: `All staged changes published successfully as ${newVersion.version_number}! Live website is now updated.`,
    published_at: currentDb.last_published_at,
    version: {
      id: newVersion.id,
      version_number: newVersion.version_number,
      title: newVersion.title
    }
  });
});

// Version History API
app.get('/api/versions', (req, res) => {
  const currentDb = loadData();
  const list = (currentDb.versions || []).map(v => ({
    id: v.id,
    version_number: v.version_number,
    title: v.title,
    published_at: v.published_at,
    published_by: v.published_by,
    summary: v.summary,
    is_active: v.id === currentDb.active_version_id
  }));
  res.json({
    success: true,
    active_version_id: currentDb.active_version_id,
    data: list
  });
});

// Version Changes & Commit Diff API
app.get('/api/versions/:id/diff', (req, res) => {
  const currentDb = loadData();
  const versions = currentDb.versions || [];
  const idx = versions.findIndex(v => v.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Version not found' });
  }

  const target = versions[idx];
  const prev = idx < versions.length - 1 ? versions[idx + 1] : null;

  const changes = [];
  const currSnap = target.snapshot || {};
  const prevSnap = prev ? (prev.snapshot || {}) : null;

  if (!prevSnap) {
    changes.push({
      type: 'baseline',
      module: 'Safe Baseline',
      title: 'Safe Initial Baseline Release',
      desc: 'Complete initial baseline snapshot containing verified safe site settings, modular sections, landmarks, and pages.'
    });
  } else {
    // 1. Compare Sections
    const currSections = currSnap.sections || {};
    const prevSections = prevSnap.sections || {};
    const allSecKeys = Array.from(new Set([...Object.keys(currSections), ...Object.keys(prevSections)]));

    allSecKeys.forEach(secKey => {
      const c = currSections[secKey];
      const p = prevSections[secKey];
      if (!p && c) {
        changes.push({
          type: 'addition',
          module: 'Modular Sections',
          title: `Added Section "${secKey}"`,
          desc: 'Newly created section layout block.'
        });
      } else if (p && !c) {
        changes.push({
          type: 'deletion',
          module: 'Modular Sections',
          title: `Removed Section "${secKey}"`,
          desc: 'Section was deleted from website.'
        });
      } else if (p && c) {
        const fields = Array.from(new Set([...Object.keys(c), ...Object.keys(p)]));
        fields.forEach(f => {
          if (JSON.stringify(c[f]) !== JSON.stringify(p[f])) {
            changes.push({
              type: 'modification',
              module: 'Modular Section',
              title: `${secKey.toUpperCase()} • ${f}`,
              before: typeof p[f] === 'object' ? JSON.stringify(p[f], null, 2) : String(p[f] ?? ''),
              after: typeof c[f] === 'object' ? JSON.stringify(c[f], null, 2) : String(c[f] ?? '')
            });
          }
        });
      }
    });

    // 2. Compare Landmarks
    const currLandmarks = currSnap.landmarks || [];
    const prevLandmarks = prevSnap.landmarks || [];

    currLandmarks.forEach(cl => {
      const pl = prevLandmarks.find(l => l.id === cl.id);
      if (!pl) {
        changes.push({
          type: 'addition',
          module: 'Landmark Slider',
          title: `Added Landmark "${cl.name}"`,
          desc: `Category: ${cl.category}, Location: ${cl.location}`
        });
      } else {
        if (cl.sort_order !== pl.sort_order) {
          changes.push({
            type: 'modification',
            module: 'Landmark Slider',
            title: `Reordered Landmark "${cl.name}"`,
            before: `Position #${pl.sort_order}`,
            after: `Position #${cl.sort_order}`
          });
        }
        if (cl.name !== pl.name) {
          changes.push({
            type: 'modification',
            module: 'Landmark Slider',
            title: `Renamed Landmark`,
            before: pl.name,
            after: cl.name
          });
        }
        if (cl.image !== pl.image) {
          changes.push({
            type: 'modification',
            module: 'Landmark Slider',
            title: `Updated Landmark Image "${cl.name}"`,
            before: pl.image,
            after: cl.image
          });
        }
      }
    });

    prevLandmarks.forEach(pl => {
      if (!currLandmarks.find(l => l.id === pl.id)) {
        changes.push({
          type: 'deletion',
          module: 'Landmark Slider',
          title: `Removed Landmark "${pl.name}"`,
          desc: 'Landmark removed from the slider.'
        });
      }
    });

    // 3. Compare Pages
    const currPages = currSnap.pages || [];
    const prevPages = prevSnap.pages || [];

    currPages.forEach(cp => {
      const pp = prevPages.find(p => p.id === cp.id || p.slug === cp.slug);
      if (!pp) {
        changes.push({
          type: 'addition',
          module: 'Pages',
          title: `Created New Page "${cp.title}"`,
          desc: `URL: ${cp.slug}, Template: ${cp.template || 'standard'}`
        });
      } else {
        ['title', 'hero_title', 'hero_subtitle', 'status', 'content', 'hero_banner'].forEach(field => {
          if (cp[field] !== pp[field]) {
            changes.push({
              type: 'modification',
              module: 'Page Content',
              title: `Page "${cp.title}" • ${field}`,
              before: String(pp[field] ?? ''),
              after: String(cp[field] ?? '')
            });
          }
        });
      }
    });

    prevPages.forEach(pp => {
      if (!currPages.find(p => p.id === pp.id || p.slug === pp.slug)) {
        changes.push({
          type: 'deletion',
          module: 'Pages',
          title: `Deleted Page "${pp.title}"`,
          desc: `Slug: ${pp.slug}`
        });
      }
    });

    // 4. Compare Settings
    const currSettings = currSnap.settings || {};
    const prevSettings = prevSnap.settings || {};
    ['site_logo', 'hero_video', 'contact_phone', 'contact_email', 'brand_title'].forEach(sf => {
      if (currSettings[sf] !== prevSettings[sf]) {
        changes.push({
          type: 'modification',
          module: 'Brand Settings',
          title: `Setting • ${sf}`,
          before: String(prevSettings[sf] ?? ''),
          after: String(currSettings[sf] ?? '')
        });
      }
    });

    if (changes.length === 0) {
      changes.push({
        type: 'baseline',
        module: 'Live Release Sync',
        title: 'Maintenance Sync Release',
        desc: 'Verified live synchronization with no text/layout mutations compared to previous snapshot.'
      });
    }
  }

  res.json({
    success: true,
    version: {
      id: target.id,
      version_number: target.version_number,
      title: target.title,
      published_at: target.published_at,
      published_by: target.published_by,
      summary: target.summary,
      is_active: target.id === currentDb.active_version_id
    },
    previous_version: prev ? prev.version_number : null,
    total_changes: changes.length,
    changes
  });
});

// Rollback to Specific Safe Version API
app.post('/api/versions/:id/rollback', (req, res) => {
  const currentDb = loadData();
  const targetId = req.params.id;
  const targetVersion = (currentDb.versions || []).find(v => v.id === targetId);
  if (!targetVersion || !targetVersion.snapshot) {
    return res.status(404).json({ success: false, message: 'Version not found or snapshot invalid' });
  }

  // Restore snapshot to published, settings, sections, landmarks, pages
  currentDb.published = JSON.parse(JSON.stringify(targetVersion.snapshot));
  if (targetVersion.snapshot.settings) currentDb.settings = JSON.parse(JSON.stringify(targetVersion.snapshot.settings));
  if (targetVersion.snapshot.sections) currentDb.sections = JSON.parse(JSON.stringify(targetVersion.snapshot.sections));
  if (targetVersion.snapshot.landmarks) currentDb.landmarks = JSON.parse(JSON.stringify(targetVersion.snapshot.landmarks));
  if (targetVersion.snapshot.pages) currentDb.pages = JSON.parse(JSON.stringify(targetVersion.snapshot.pages));

  currentDb.active_version_id = targetVersion.id;
  currentDb.staged_pending = false;
  currentDb.last_published_at = new Date().toISOString();
  saveData(currentDb);
  db = currentDb;

  res.json({
    success: true,
    message: `Successfully rolled back to safe ${targetVersion.version_number}! Live website and CMS restored.`,
    active_version_id: targetVersion.id,
    version_number: targetVersion.version_number,
    published_at: currentDb.last_published_at
  });
});

// Staged Website Preview Route (Serves staged preview on port 5000 before publishing)
app.get(/^\/preview/, (req, res) => {
  const previewPath = path.join(publicDir, 'preview.html');
  if (fs.existsSync(previewPath)) {
    return res.sendFile(previewPath);
  }
  res.redirect('/index.html');
});

// Visual Website Editor Mode Route
app.get(/^\/editor/, (req, res) => {
  const editorPath = path.join(publicDir, 'editor.html');
  if (fs.existsSync(editorPath)) {
    return res.sendFile(editorPath);
  }
  res.redirect('/index.html');
});

// Route custom page slugs (e.g. /test) directly to the website with visual editor on :3000
app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase().replace(/\/$/, '') || '/';
  if (reqPath !== '' && reqPath !== '/' && !reqPath.startsWith('/api') && !reqPath.startsWith('/uploads') && !reqPath.startsWith('/media') && !reqPath.startsWith('/images') && !reqPath.startsWith('/videos') && !reqPath.startsWith('/fonts') && !reqPath.startsWith('/preview') && !reqPath.startsWith('/editor')) {
    const currentPages = db.pages || [];
    const matchedPage = currentPages.find((p) => {
      const pSlug = (p.slug || '').toLowerCase().replace(/\/$/, '') || '/';
      return pSlug === reqPath || pSlug === `/${reqPath.replace(/^\//, '')}`;
    });

    if (matchedPage) {
      const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      const hasEditorParam = query.includes('editor=');
      const targetQuery = hasEditorParam ? query : (query ? `${query}&editor=true` : '?editor=true');
      return res.redirect(`http://localhost:3000${matchedPage.slug}${targetQuery}`);
    }
  }
  next();
});

// Fallback to CMS dashboard
app.use((req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Emaar CMS Server Running');
  }
});

app.listen(PORT, () => {
  console.log(`[Emaar India CMS] Server running at http://localhost:${PORT}`);
});
