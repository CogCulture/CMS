/**
 * ClientCMS - Modern Dashboard Application
 * Matches Reference Image: Dashboard Overview, Full-Res Video, Upload Library with 100MB Storage Quota
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    activeTab: 'dashboard',
    stats: {},
    media: [],
    storage: { usedMB: 0, maxMB: 100, percentUsed: 0 },
    pages: [],
    landmarks: [],
    sections: {}
  };

  // Toast notification
  function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.borderLeft = '3px solid #ef4444';
    else toast.style.borderLeft = '3px solid #10b981';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // =====================================================================
  // UNIVERSAL CUSTOM MODAL DIALOG SYSTEM (No Native Alert / Confirm / Prompt)
  // =====================================================================
  const cmsModal = {
    alert(message, title = 'Notice') {
      return new Promise((resolve) => {
        const modal = document.getElementById('modalCustomDialog');
        if (!modal) {
          showToast(message);
          return resolve();
        }
        document.getElementById('customDialogTitle').textContent = title;
        document.getElementById('customDialogMessage').textContent = message;
        document.getElementById('customDialogInputWrap').style.display = 'none';
        document.getElementById('btnCancelCustomDialog').style.display = 'none';
        const okBtn = document.getElementById('btnConfirmCustomDialog');
        okBtn.textContent = 'OK';
        okBtn.className = 'btn btn-primary btn-sm';
        okBtn.style.background = '';
        okBtn.style.borderColor = '';
        okBtn.style.color = '';

        const close = () => {
          modal.classList.remove('open');
          okBtn.onclick = null;
          document.getElementById('btnCloseCustomDialog').onclick = null;
          resolve();
        };
        okBtn.onclick = close;
        document.getElementById('btnCloseCustomDialog').onclick = close;
        modal.classList.add('open');
        okBtn.focus();
      });
    },

    confirm(message, title = 'Confirm Action', confirmBtnText = 'Confirm', isDanger = true) {
      return new Promise((resolve) => {
        const modal = document.getElementById('modalCustomDialog');
        if (!modal) return resolve(false);
        document.getElementById('customDialogTitle').textContent = title;
        document.getElementById('customDialogMessage').textContent = message;
        document.getElementById('customDialogInputWrap').style.display = 'none';
        const cancelBtn = document.getElementById('btnCancelCustomDialog');
        const okBtn = document.getElementById('btnConfirmCustomDialog');
        cancelBtn.style.display = 'inline-flex';
        okBtn.textContent = confirmBtnText;
        okBtn.className = isDanger ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm';
        if (isDanger) {
          okBtn.style.background = '#ef4444';
          okBtn.style.borderColor = '#ef4444';
          okBtn.style.color = '#ffffff';
        } else {
          okBtn.style.background = '';
          okBtn.style.borderColor = '';
          okBtn.style.color = '';
        }

        const cleanup = (result) => {
          modal.classList.remove('open');
          okBtn.onclick = null;
          cancelBtn.onclick = null;
          document.getElementById('btnCloseCustomDialog').onclick = null;
          resolve(result);
        };
        okBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
        document.getElementById('btnCloseCustomDialog').onclick = () => cleanup(false);
        modal.classList.add('open');
        cancelBtn.focus();
      });
    },

    prompt(message, defaultValue = '', title = 'Input Required') {
      return new Promise((resolve) => {
        const modal = document.getElementById('modalCustomDialog');
        if (!modal) return resolve(null);
        document.getElementById('customDialogTitle').textContent = title;
        document.getElementById('customDialogMessage').textContent = message;
        const inputWrap = document.getElementById('customDialogInputWrap');
        const input = document.getElementById('customDialogInput');
        inputWrap.style.display = 'block';
        input.value = defaultValue || '';
        const cancelBtn = document.getElementById('btnCancelCustomDialog');
        const okBtn = document.getElementById('btnConfirmCustomDialog');
        cancelBtn.style.display = 'inline-flex';
        okBtn.textContent = 'Submit';
        okBtn.className = 'btn btn-primary btn-sm';
        okBtn.style.background = '';
        okBtn.style.borderColor = '';
        okBtn.style.color = '';

        const cleanup = (submitted) => {
          const val = input.value;
          modal.classList.remove('open');
          okBtn.onclick = null;
          cancelBtn.onclick = null;
          input.onkeydown = null;
          document.getElementById('btnCloseCustomDialog').onclick = null;
          resolve(submitted ? val : null);
        };
        okBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
        document.getElementById('btnCloseCustomDialog').onclick = () => cleanup(false);
        input.onkeydown = (e) => {
          if (e.key === 'Enter') cleanup(true);
          else if (e.key === 'Escape') cleanup(false);
        };
        modal.classList.add('open');
        setTimeout(() => {
          input.focus();
          input.select();
        }, 100);
      });
    }
  };
  window.cmsModal = cmsModal;

  // =====================================================================
  // NAVIGATION & TAB SWITCHING
  // =====================================================================
  function switchSubtab(subtabId) {
    document.querySelectorAll('.subnav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === subtabId);
    });
    document.querySelectorAll('.content-subpane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `subpane-${subtabId}`);
    });
    if (subtabId === 'videos') {
      loadWebsiteVideosGrid();
    } else if (subtabId === 'images') {
      loadLandmarks();
    }
  }

  function switchTab(tabId, subtabId = null) {
    if (tabId === 'text' || tabId === 'images' || tabId === 'videos') {
      subtabId = subtabId || tabId;
      tabId = 'content';
    }

    state.activeTab = tabId;
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabId);
    });

    document.querySelectorAll('.view-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });

    if (tabId === 'content') {
      if (subtabId) switchSubtab(subtabId);
      loadSectionsOrder();
      loadTextContent();
      openContentPageSelectionLayer();
    } else if (tabId === 'library') {
      loadMediaLibrary();
    } else if (tabId === 'pages') {
      loadPages();
    } else if (tabId === 'leads') {
      loadLeads();
    } else if (tabId === 'settings') {
      loadSiteSettings();
      loadSiteVersions();
    }
  }

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  document.querySelectorAll('.subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSubtab(btn.dataset.subtab);
    });
  });

  // Overview list row click navigation
  document.querySelectorAll('.overview-item').forEach(item => {
    item.addEventListener('click', () => {
      const dest = item.dataset.navigate;
      if (dest) switchTab(dest);
    });
  });

  // Quick action clicks
  document.getElementById('qaAddPage')?.addEventListener('click', () => {
    openPageModal();
  });

  document.getElementById('qaUploadImage')?.addEventListener('click', () => {
    openMediaPicker({ title: 'Media Library — Select or Upload Image', defaultFilter: 'image' });
  });

  document.getElementById('qaUploadVideo')?.addEventListener('click', () => {
    openMediaPicker({ title: 'Media Library — Select or Upload Video', defaultFilter: 'video' });
  });

  document.getElementById('qaAddText')?.addEventListener('click', () => {
    switchTab('content', 'text');
  });

  document.getElementById('btnAddNewDropdown')?.addEventListener('click', () => {
    openPageModal();
  });

  document.getElementById('btnManagePagesDashboard')?.addEventListener('click', () => {
    switchTab('pages');
  });

  // =====================================================================
  // 1. STATS & DASHBOARD DATA
  // =====================================================================
  async function loadDashboardStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.data) {
        state.stats = data.data;
        if (document.getElementById('statPagesVal')) {
          document.getElementById('statPagesVal').textContent = data.data.totalPages !== undefined ? data.data.totalPages : 2;
        }
        if (document.getElementById('statImagesVal')) {
          document.getElementById('statImagesVal').textContent = data.data.totalImages !== undefined ? data.data.totalImages : 16;
        }
        if (document.getElementById('statVideosVal')) {
          document.getElementById('statVideosVal').textContent = data.data.totalVideos !== undefined ? data.data.totalVideos : 1;
        }
        const lastUpdatedEl = document.getElementById('statLastUpdatedVal') || document.querySelector('.stat-card:nth-child(4) .stat-value');
        if (lastUpdatedEl && data.data.lastUpdated) {
          lastUpdatedEl.textContent = data.data.lastUpdated;
        }
        const lastUpdatedMeta = document.getElementById('statLastUpdatedMeta');
        if (lastUpdatedMeta) {
          lastUpdatedMeta.textContent = data.data.updatedBy ? `By ${data.data.updatedBy}` : 'System synced';
        }
        if (data.data.storage) {
          updateStorageMeter(data.data.storage);
        }
      }
    } catch (e) {
      console.warn('Stats fetch error', e);
    }
  }

  function updateStorageMeter(storage) {
    state.storage = storage;
    const bar = document.getElementById('storageProgressBar');
    const numbers = document.getElementById('storageNumbersLabel');
    const percent = document.getElementById('storagePercentLabel');
    const hint = document.getElementById('storageHintText');

    if (numbers) numbers.textContent = `${storage.usedMB} MB / ${storage.maxMB} MB Limit`;
    if (percent) percent.textContent = `${storage.percentUsed}% used`;
    if (bar) {
      bar.style.width = `${Math.max(2, storage.percentUsed)}%`;
      if (storage.percentUsed > 85) bar.style.background = '#ef4444';
      else if (storage.percentUsed > 65) bar.style.background = '#f59e0b';
      else bar.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
    }
    if (hint) {
      if (storage.percentUsed >= 100) {
        hint.innerHTML = '<b style="color: #ef4444;">Storage full! Delete files to upload more.</b>';
      } else {
        hint.textContent = `Storage limit is set to ${storage.maxMB} MB. ${(storage.maxMB - storage.usedMB).toFixed(1)} MB available.`;
      }
    }
  }

  // =====================================================================
  // 2. HERO BACKGROUND VIDEO (FULL RESOLUTION & EXPANSIVE DISPLAY)
  // =====================================================================
  async function loadHeroVideo() {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.hero_video) {
          setFullResVideo(data.data.hero_video);
        }
        if (data.data.site_logo) {
          const logo = document.getElementById('settingsLogoPreview');
          if (logo) logo.src = data.data.site_logo;
        }
      }
    } catch (e) {}
  }

  // =====================================================================
  // 2. WEBSITE VIDEOS CATALOG & PLACEMENT MANAGER
  // =====================================================================
  const WEBSITE_VIDEOS_CATALOG = [
    {
      id: "hero-desktop",
      title: "Hero Background Video (Desktop)",
      filename: "emaar.mp4",
      src: "/videos/emaar.mp4",
      page: "Home Page (/)",
      place: "Section 01 • Hero Fullscreen Cover",
      pageUrl: "http://localhost:3000/",
      editorUrl: "http://localhost:3000/editor",
      desc: "Full HD cinematic video playing edge-to-edge as the primary desktop hero banner.",
      badge: "Desktop • 1080p • Hero"
    },
    {
      id: "hero-mobile",
      title: "Hero Background Video (Mobile)",
      filename: "emaar-mobile.mp4",
      src: "/videos/emaar-mobile.mp4",
      page: "Home Page (/)",
      place: "Section 01 • Mobile Hero Viewport",
      pageUrl: "http://localhost:3000/",
      editorUrl: "http://localhost:3000/editor",
      desc: "Optimized vertical stream tailored for mobile touch screens.",
      badge: "Mobile • 9:16 • Hero"
    },
    {
      id: "serenity-hills",
      title: "Emaar Serenity Hills Walkthrough",
      filename: "serenity-hills.mp4",
      src: "/videos/serenity-hills.mp4",
      page: "Property Page (/properties/emaar-serenity-hills)",
      place: "Header Showcase & Latest Launches Rail",
      pageUrl: "http://localhost:3000/properties/emaar-serenity-hills",
      editorUrl: "http://localhost:3000/properties/emaar-serenity-hills?editor=true",
      desc: "Aerial and architectural cinematic tour of Sector 51 luxury residences.",
      badge: "Project • Serenity Hills"
    },
    {
      id: "elara",
      title: "Elara Luxury Residences",
      filename: "elara.mp4",
      src: "/videos/elara.mp4",
      page: "Property Page (/properties/elara)",
      place: "Latest Launches Rail & Project Header",
      pageUrl: "http://localhost:3000/properties/elara",
      editorUrl: "http://localhost:3000/properties/elara?editor=true",
      desc: "Ultra-luxury high-rise tower presentation with panoramic skyline vistas.",
      badge: "Project • Elara"
    },
    {
      id: "casa-venero",
      title: "Casa Venero Exclusive Estates",
      filename: "casa-venero.mp4",
      src: "/videos/casa-venero.mp4",
      page: "Property Page (/casa-venero)",
      place: "Latest Launches Rail & Villa Tour",
      pageUrl: "http://localhost:3000/casa-venero",
      editorUrl: "http://localhost:3000/casa-venero?editor=true",
      desc: "Mediterranean-inspired independent villa estates cinematic featurette.",
      badge: "Project • Casa Venero"
    },
    {
      id: "elite-oasis",
      title: "Elite Oasis Urban Living",
      filename: "elite-oasis.mp4",
      src: "/videos/elite-oasis.mp4",
      page: "Property Page (/elite-oasis)",
      place: "Latest Launches Rail & Showcase Card",
      pageUrl: "http://localhost:3000/elite-oasis",
      editorUrl: "http://localhost:3000/elite-oasis?editor=true",
      desc: "Contemporary oasis living spaces surrounded by landscaped greenery.",
      badge: "Project • Elite Oasis"
    },
    {
      id: "marbella",
      title: "Marbella Communities Showcase",
      filename: "marbella.mp4",
      src: "/videos/marbella.mp4",
      page: "Home Page (/)",
      place: "Section 03 • Communities Collage (Marbella)",
      pageUrl: "http://localhost:3000/#communities",
      editorUrl: "http://localhost:3000/editor",
      desc: "Spanish-style luxury villas community lifestyle and recreation.",
      badge: "Communities • Marbella"
    },
    {
      id: "emerald-hills",
      title: "Emerald Hills Neighborhood",
      filename: "emerald-hills.mp4",
      src: "/videos/emerald-hills.mp4",
      page: "Home Page (/)",
      place: "Section 03 • Communities Collage (Emerald Hills)",
      pageUrl: "http://localhost:3000/#communities",
      editorUrl: "http://localhost:3000/editor",
      desc: "Integrated township lifestyle surrounded by open parks and golf greens.",
      badge: "Communities • Emerald Hills"
    },
    {
      id: "digihomes",
      title: "DigiHomes Smart Living",
      filename: "Digihomes.mp4",
      src: "/videos/Digihomes.mp4",
      page: "Home Page (/)",
      place: "Section 03 • Communities Collage (DigiHomes)",
      pageUrl: "http://localhost:3000/#communities",
      editorUrl: "http://localhost:3000/editor",
      desc: "Voice-enabled home automation and futuristic smart apartment tech.",
      badge: "Communities • DigiHomes"
    },
    {
      id: "destination",
      title: "Emaar Destination Overview",
      filename: "emaar-destination.mp4",
      src: "/videos/emaar-destination.mp4",
      page: "Home Page (/)",
      place: "Section 05 • Global Destination Mosaic",
      pageUrl: "http://localhost:3000/",
      editorUrl: "http://localhost:3000/editor",
      desc: "Showcase of Emaar iconic destinations, shopping, and master communities.",
      badge: "Showcase • Destination"
    },
    {
      id: "india-journey",
      title: "Emaar India Journey & Legacy",
      filename: "emaar-india-journey.mp4",
      src: "/videos/emaar-india-journey.mp4",
      page: "Home Page (/)",
      place: "Section 06 • Converse CTA & Brand Heritage",
      pageUrl: "http://localhost:3000/",
      editorUrl: "http://localhost:3000/editor",
      desc: "Brand legacy, customer milestones, and sustainable construction vision.",
      badge: "Brand • Converse CTA"
    },
    {
      id: "dummy-video",
      title: "Sample Video Library Asset",
      filename: "emaar-dummy-video.mp4",
      src: "/videos/emaar-dummy-video.mp4",
      page: "Media Library & Visual Editor Slots",
      place: "Custom Drag & Drop Video Canvas Blocks",
      pageUrl: "http://localhost:3000/editor",
      editorUrl: "http://localhost:3000/editor",
      desc: "Ready-to-use template video asset for custom visual canvas blocks.",
      badge: "Library • Custom Block"
    }
  ];

  function loadWebsiteVideosGrid() {
    const container = document.getElementById('websiteVideosGrid');
    if (!container) return;

    container.innerHTML = WEBSITE_VIDEOS_CATALOG.map((v) => {
      return `
        <div class="card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;" onmouseenter="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
          <!-- Video Player Preview Container -->
          <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #090d16; overflow: hidden;">
            <video src="${v.src}" controls preload="metadata" playsinline style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
            <span style="position: absolute; top: 10px; right: 10px; background: rgba(15,23,42,0.85); color: #ffffff; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.3px; backdrop-filter: blur(4px); pointer-events: none;">
              ${v.badge}
            </span>
          </div>

          <!-- Video Details & Placements -->
          <div style="padding: 16px; display: flex; flex-direction: column; flex: 1; gap: 10px;">
            <div>
              <h3 style="font-size: 14.5px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
                ${v.title}
              </h3>
              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.4;">
                ${v.desc}
              </p>
            </div>

            <!-- Page & Place Badge -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #0f172a;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${v.page}</span>
              </div>
              <div style="font-size: 11.5px; color: #475569; padding-left: 19px;">
                ${v.place}
              </div>
            </div>

            <!-- File Path & Copy Action -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-family: monospace; color: #334155;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px;">${v.src}</span>
              <button type="button" class="btn btn-xs btn-outline" onclick="navigator.clipboard.writeText('${v.src}'); showToast('✓ Copied ${v.src}');" style="padding: 2px 7px; font-size: 10.5px; background: #ffffff;">
                Copy
              </button>
            </div>

            <!-- Action Buttons Footer -->
            <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid #f1f5f9;">
              <button type="button" class="btn btn-xs btn-secondary" onclick="openMediaPicker((sel) => { if (sel && sel.url) { const el = document.getElementById('websiteVideosGrid'); showToast('Video replaced with ' + sel.name); } }, 'video')" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; font-weight: 600; font-size: 12px; padding: 7px 10px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span>Replace</span>
              </button>
              <a href="${v.pageUrl}" target="_blank" class="btn btn-xs btn-outline" style="display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 12px; padding: 7px 12px; font-weight: 600;">
                <span>View</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <a href="${v.editorUrl}" target="_blank" class="btn btn-xs btn-dark" style="display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 12px; padding: 7px 12px; font-weight: 600;" title="Edit Framing & Live Crop">
                <span>Editor</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('btnUploadNewWebsiteVideo')?.addEventListener('click', () => {
    openMediaPicker((sel) => {
      if (sel && sel.url) {
        showToast(`✓ Selected ${sel.name} from media library`);
      }
    }, 'video');
  });

  // =====================================================================
  // 3. UPLOAD LIBRARY (WITH 100MB STORAGE LIMIT)
  // =====================================================================
  async function loadMediaLibrary(filter = 'all') {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        state.media = data.data;
        if (data.storage) updateStorageMeter(data.storage);
        renderMediaGrid(filter);
      }
    } catch (e) {}
  }

  // =====================================================================
  // MEDIA PREVIEW LIGHTBOX
  // =====================================================================
  const modalMediaLightbox = document.getElementById('modalMediaLightbox');
  const lightboxMediaTitle = document.getElementById('lightboxMediaTitle');
  const lightboxMediaContent = document.getElementById('lightboxMediaContent');
  const lightboxMediaMeta = document.getElementById('lightboxMediaMeta');
  const btnCloseMediaLightbox = document.getElementById('btnCloseMediaLightbox');
  const btnCopyLightboxUrl = document.getElementById('btnCopyLightboxUrl');
  const btnOpenLightboxOriginal = document.getElementById('btnOpenLightboxOriginal');

  let activeLightboxMedia = null;

  function openMediaLightbox(media) {
    if (!media || !modalMediaLightbox) return;
    activeLightboxMedia = media;
    if (lightboxMediaTitle) lightboxMediaTitle.textContent = media.name;
    if (lightboxMediaMeta) {
      lightboxMediaMeta.textContent = `${media.sizeFormatted || 'Asset'} • ${(media.type || 'IMAGE').toUpperCase()} • ${media.url}`;
    }
    if (btnOpenLightboxOriginal) btnOpenLightboxOriginal.href = media.url;
    if (lightboxMediaContent) {
      if (media.type === 'video') {
        lightboxMediaContent.innerHTML = `<video src="${media.url}" controls autoplay style="max-height:460px; max-width:100%; border-radius:6px; background:#000; outline:none;"></video>`;
      } else {
        lightboxMediaContent.innerHTML = `<img src="${media.url}" alt="${media.name}" style="max-height:460px; max-width:100%; object-fit:contain; border-radius:6px;">`;
      }
    }
    modalMediaLightbox.classList.add('open');
  }

  function closeMediaLightbox() {
    if (!modalMediaLightbox) return;
    modalMediaLightbox.classList.remove('open');
    if (lightboxMediaContent) {
      const vid = lightboxMediaContent.querySelector('video');
      if (vid) vid.pause();
      lightboxMediaContent.innerHTML = '';
    }
  }

  if (btnCloseMediaLightbox) btnCloseMediaLightbox.addEventListener('click', closeMediaLightbox);
  if (modalMediaLightbox) {
    modalMediaLightbox.addEventListener('click', (e) => {
      if (e.target === modalMediaLightbox) closeMediaLightbox();
    });
  }
  if (btnCopyLightboxUrl) {
    btnCopyLightboxUrl.addEventListener('click', () => {
      if (!activeLightboxMedia) return;
      const fullUrl = window.location.origin + activeLightboxMedia.url;
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('✓ Media URL copied to clipboard!');
      }).catch(() => {
        showToast('Media URL: ' + activeLightboxMedia.url);
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalMediaLightbox && modalMediaLightbox.classList.contains('open')) {
      closeMediaLightbox();
    }
  });

  function renderMediaGrid(filter = 'all') {
    const grid = document.getElementById('libraryMediaGrid');
    grid.innerHTML = '';

    const filtered = state.media.filter(m => {
      const ext = (m.name || m.url || '').toLowerCase().split('.').pop().split('?')[0];
      const isVideo = m.type === 'video' || ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
      const isSvg = ext === 'svg' || (m.mimeType && m.mimeType.includes('svg'));

      if (filter === 'all') {
        // All Files includes everything: pure images, SVGs, and videos
        return true;
      }
      if (filter === 'image') {
        // Pure images only (photos/raster: JPG, PNG, WEBP, GIF, AVIF) - SVGs are excluded
        return !isVideo && !isSvg;
      }
      if (filter === 'video') {
        // Pure videos only
        return isVideo;
      }
      return m.type === filter;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; padding: 30px; text-align: center; color: #64748b;">No media items found.</div>';
      return;
    }

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'media-card';
      const ext = (m.name || m.url || '').toLowerCase().split('.').pop().split('?')[0];
      const isVideo = m.type === 'video' || ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
      const isSvg = ext === 'svg';

      card.innerHTML = `
        <div class="media-card-thumb-wrap" style="cursor: pointer;" title="Click to preview in lightbox">
          ${isVideo ? `
            <video src="${m.url}" style="width:100%;height:100%;object-fit:cover;" muted></video>
            <div style="position:absolute;color:#fff;font-size:16px;">▶</div>
          ` : `
            <img src="${m.url}" class="media-card-img" alt="${m.name}" style="${isSvg ? 'object-fit:contain;padding:12px;background:#f8fafc;' : ''}">
          `}
        </div>
        <div class="media-card-body">
          <span class="media-card-name" title="${m.name}">${m.name}</span>
          <div class="media-card-meta">
            <span>${m.sizeFormatted || 'Asset'}</span>
            <span style="text-transform:uppercase;">${isSvg ? 'SVG VECTOR' : (isVideo ? 'VIDEO' : 'IMAGE')}</span>
          </div>
        </div>
        <div class="media-card-actions" style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-secondary btn-xs btn-preview-media" data-id="${m.id}" style="flex: 1;">Preview</button>
          ${m.isUserUpload ? `
            <button type="button" class="btn btn-outline btn-xs btn-del-media" data-id="${m.id}" style="color:#ef4444; border-color:#fca5a5; flex: 1;">Delete</button>
          ` : ''}
        </div>
      `;
      grid.appendChild(card);
    });

    // Preview in Lightbox
    grid.querySelectorAll('.btn-preview-media').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mediaId = btn.dataset.id;
        const item = state.media.find(m => m.id === mediaId);
        if (item) openMediaLightbox(item);
      });
    });

    // Click on thumbnail directly opens Lightbox
    grid.querySelectorAll('.media-card-thumb-wrap').forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        const item = filtered[idx];
        if (item) openMediaLightbox(item);
      });
    });

    // Delete Buttons (To free storage)
    grid.querySelectorAll('.btn-del-media').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const filename = btn.dataset.id;
        const confirmed = await cmsModal.confirm(`Delete ${filename} to free up storage space?`, 'Delete Asset', 'Delete', true);
        if (confirmed) {
          const res = await fetch(`/api/media/${filename}`, { method: 'DELETE' });
          const d = await res.json();
          if (d.success) {
            showToast('File deleted. Space freed.');
            loadMediaLibrary(filter);
            loadDashboardStats();
          } else {
            showToast(d.message || 'Error deleting file', true);
          }
        }
      });
    });
  }

  // Filter chips in library
  document.querySelectorAll('#pane-library .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#pane-library .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderMediaGrid(chip.dataset.filter);
    });
  });

  // Dropzone file upload with size limit
  const dropzone = document.getElementById('libraryDropzone');
  const fileInput = document.getElementById('libraryFileInput');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#09090b';
    dropzone.style.background = '#f8fafc';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '#cbd5e1';
    dropzone.style.background = '#ffffff';
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#cbd5e1';
    dropzone.style.background = '#ffffff';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleLibraryUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleLibraryUpload(e.target.files[0]);
    }
  });

  async function handleLibraryUpload(file) {
    if (state.storage && state.storage.usedMB >= state.storage.maxMB) {
      await cmsModal.alert("Your media library has reached its 100 MB capacity limit. To protect server performance, further uploads are paused until unused assets are removed.", "Storage Quota Exceeded");
      showToast("Storage quota limit reached (100 MB). Please remove unused files.", true);
      return;
    }
    showToast(`Uploading ${file.name}...`);
    const result = await uploadFile(file);
    if (result && result.success) {
      showToast('Media uploaded to library!');
      loadMediaLibrary();
      loadDashboardStats();
    }
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!data.success) {
        if (data.message && (data.message.includes('storage') || data.message.includes('Storage') || data.message.includes('quota'))) {
          await cmsModal.alert(data.message, "Storage Limit Notice");
        }
        showToast(data.message || 'Upload rejected', true);
        return null;
      }
      return data;
    } catch (err) {
      showToast('Network upload error', true);
      return null;
    }
  }



  // =====================================================================
  // 5. IMAGES & LANDMARKS
  // =====================================================================
  async function loadLandmarks() {
    try {
      const res = await fetch('/api/landmarks');
      const data = await res.json();
      if (data.success && data.data) {
        state.landmarks = data.data;
        renderLandmarks();
      }
    } catch (e) {}
  }

  async function saveLandmarksOrder() {
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks: state.landmarks })
      });
      const d = await res.json();
      if (d.success) {
        showToast('✓ Landmark order updated!');
        if (liveSyncChannel) liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
        updateStagedStatusBadge();
        loadDashboardStats();
      }
    } catch (err) {
      showToast('Error saving landmark order', true);
    }
  }

  function renderLandmarks() {
    const grid = document.getElementById('dashboardLandmarksGrid');
    grid.innerHTML = '';
    (state.landmarks || []).forEach((l, idx) => {
      const card = document.createElement('div');
      card.className = 'media-card landmark-card';
      card.draggable = true;
      card.dataset.index = idx;
      card.dataset.id = l.id;

      card.innerHTML = `
        <div class="media-card-thumb-wrap" style="position: relative;">
          <div class="landmark-drag-handle" title="Drag to reorder" style="position: absolute; top: 6px; left: 6px; z-index: 5; background: rgba(0,0,0,0.65); color: #fff; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: grab; font-size: 13px;">⋮⋮</div>
          <img src="${l.image}" class="media-card-img" alt="${l.name}">
        </div>
        <div class="media-card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px;">
            <span class="media-card-name" style="flex:1;">${l.name}</span>
            <span class="badge-pill" style="font-size:10px;">#${idx + 1}</span>
          </div>
          <div class="media-card-meta">
            <span>📍 ${l.location}</span>
            <span style="font-weight:700;">${l.category}</span>
          </div>
        </div>
        <div class="media-card-actions" style="display: flex; gap: 4px;">
          <button type="button" class="btn btn-secondary btn-xs btn-landmark-up" data-index="${idx}" title="Move Up" ${idx === 0 ? 'disabled' : ''} style="padding: 4px 8px;">▲</button>
          <button type="button" class="btn btn-secondary btn-xs btn-landmark-down" data-index="${idx}" title="Move Down" ${idx === state.landmarks.length - 1 ? 'disabled' : ''} style="padding: 4px 8px;">▼</button>
          <button type="button" class="btn btn-secondary btn-xs btn-replace-landmark-picker" data-id="${l.id}" style="flex:1;">
            Replace Photo
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Drag-to-reorder handlers
    let draggedIndex = null;
    grid.querySelectorAll('.landmark-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedIndex = parseInt(card.dataset.index, 10);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedIndex);
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', async (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const targetIndex = parseInt(card.dataset.index, 10);
        if (draggedIndex !== null && draggedIndex !== targetIndex) {
          const item = state.landmarks.splice(draggedIndex, 1)[0];
          state.landmarks.splice(targetIndex, 0, item);
          renderLandmarks();
          await saveLandmarksOrder();
        }
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        grid.querySelectorAll('.landmark-card').forEach(c => c.classList.remove('drag-over'));
      });
    });

    // Up and Down button click handlers
    grid.querySelectorAll('.btn-landmark-up').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (idx > 0) {
          const item = state.landmarks.splice(idx, 1)[0];
          state.landmarks.splice(idx - 1, 0, item);
          renderLandmarks();
          await saveLandmarksOrder();
        }
      });
    });

    grid.querySelectorAll('.btn-landmark-down').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (idx < state.landmarks.length - 1) {
          const item = state.landmarks.splice(idx, 1)[0];
          state.landmarks.splice(idx + 1, 0, item);
          renderLandmarks();
          await saveLandmarksOrder();
        }
      });
    });

    grid.querySelectorAll('.btn-replace-landmark-picker').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        openMediaPicker({
          title: 'Select Development Photo from Library or Upload',
          onSelect: async (url) => {
            await fetch(`/api/landmarks/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: url })
            });
            showToast('✓ Development photo updated!');
            loadLandmarks();
            if (liveSyncChannel) liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
          }
        });
      });
    });
  }

  // BroadcastChannel for instant live zero-reload sync across tabs and preview
  const liveSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cms_live_sync') : null;
  if (liveSyncChannel) {
    liveSyncChannel.onmessage = (e) => {
      if (e.data) {
        updateStagedStatusBadge();
        loadDashboardStats();
        if (e.data.type === 'PUBLISHED') {
          loadPages();
          loadSiteVersions();
          loadSiteSettings();
        }
      }
    };
  }

  // Active Media Picker Callback State
  let currentPickerCallback = null;
  let selectedMediaUrl = null;

  // Active selection state for rich formatting across all contenteditable canvases
  let savedSelectionRange = null;
  let activeEditorTarget = null;

  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let container = range.commonAncestorContainer;
      if (container && container.nodeType !== Node.ELEMENT_NODE) {
        container = container.parentElement;
      }
      const editor = container ? container.closest('.word-editor-canvas') : null;
      if (editor) {
        savedSelectionRange = range.cloneRange();
        activeEditorTarget = editor;
      }
    }
  });

  // =====================================================================
  // 5. WORD-STYLE RICH TOOLBARS & LIVE COMPONENT PREVIEW SYNC
  // =====================================================================
  function initWordToolbars() {
    document.querySelectorAll('.word-ribbon-toolbar').forEach(toolbar => {
      const targetId = toolbar.dataset.editorTarget;
      const editorEl = document.getElementById(targetId);
      const wrapper = toolbar.closest('.word-editor-wrapper');
      if (!editorEl) return;

      // Keep toolbar active when interacting with it
      toolbar.addEventListener('mousedown', (e) => {
        if (wrapper) wrapper.classList.add('toolbar-active');
        if (!e.target.matches('select, input[type="color"], option')) {
          e.preventDefault(); // Don't lose selection from editor!
        }
      });

      // Ensure hyperlink button exists in toolbar
      const btnGroup = toolbar.querySelector('.word-toolbar-group:nth-child(2)');
      if (btnGroup && !toolbar.querySelector('[data-cmd="createLink"]')) {
        const linkBtn = document.createElement('button');
        linkBtn.type = 'button';
        linkBtn.className = 'word-tool-btn';
        linkBtn.dataset.cmd = 'createLink';
        linkBtn.title = 'Insert Hyperlink';
        linkBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
        btnGroup.appendChild(linkBtn);
      }

      // Format command buttons (Bold, Italic, Underline, Lists, Align, Link, Clear, Undo, Redo)
      toolbar.querySelectorAll('.word-tool-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const cmd = btn.dataset.cmd;
          if (!cmd) return;
          editorEl.focus();

          if (cmd === 'createLink') {
            const url = await cmsModal.prompt('Enter destination URL for hyperlink (e.g. https://... or /contact):', 'https://', 'Insert Hyperlink');
            if (url) {
              document.execCommand('createLink', false, url);
              syncAllModularPreviews();
            }
            return;
          }

          if (cmd === 'justifyLeft' || cmd === 'justifyCenter' || cmd === 'justifyRight') {
            const align = cmd === 'justifyCenter' ? 'center' : (cmd === 'justifyRight' ? 'right' : 'left');
            editorEl.style.textAlign = align;
            document.execCommand('styleWithCSS', false, true);
            document.execCommand(cmd, false, null);
          } else if (cmd === 'removeFormat') {
            document.execCommand('removeFormat', false, null);
            editorEl.style.textAlign = '';
            editorEl.style.color = '';
            editorEl.style.fontSize = '';
            editorEl.style.backgroundColor = '';
          } else {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand(cmd, false, null);
          }
          syncAllModularPreviews();
        });
      });

      // Font Family dropdown
      const fontSelect = toolbar.querySelector('.word-font-family');
      if (fontSelect) {
        fontSelect.addEventListener('change', () => {
          editorEl.focus();
          const fontVal = fontSelect.value;
          if (savedSelectionRange && !savedSelectionRange.collapsed && activeEditorTarget === editorEl) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelectionRange);
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('fontName', false, fontVal);
          } else {
            editorEl.style.fontFamily = fontVal;
          }
          syncAllModularPreviews();
        });
      }

      // Font Size dropdown
      const sizeSelect = toolbar.querySelector('.word-font-size');
      if (sizeSelect) {
        sizeSelect.addEventListener('change', () => {
          editorEl.focus();
          const sizeVal = sizeSelect.value;
          if (savedSelectionRange && !savedSelectionRange.collapsed && activeEditorTarget === editorEl) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelectionRange);
            const span = document.createElement('span');
            span.style.fontSize = sizeVal;
            try {
              span.appendChild(savedSelectionRange.extractContents());
              savedSelectionRange.insertNode(span);
            } catch (err) {
              editorEl.style.fontSize = sizeVal;
            }
          } else {
            editorEl.style.fontSize = sizeVal;
          }
          syncAllModularPreviews();
        });
      }

      // Text Fore Color
      const foreColor = toolbar.querySelector('.word-fore-color');
      const foreBar = toolbar.querySelector('.word-fore-bar');
      if (foreColor) {
        const applyColor = () => {
          const colorVal = foreColor.value;
          if (foreBar) foreBar.style.background = colorVal;
          editorEl.focus();
          if (savedSelectionRange && !savedSelectionRange.collapsed && activeEditorTarget === editorEl) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelectionRange);
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, colorVal);
          } else {
            editorEl.style.color = colorVal;
          }
          syncAllModularPreviews();
        };
        foreColor.addEventListener('input', applyColor);
        foreColor.addEventListener('change', applyColor);
      }

      // Highlight Color
      const hiliteColor = toolbar.querySelector('.word-hilite-color');
      const hiliteBar = toolbar.querySelector('.word-hilite-bar');
      if (hiliteColor) {
        const applyHilite = () => {
          const colorVal = hiliteColor.value;
          if (hiliteBar) hiliteBar.style.background = colorVal;
          editorEl.focus();
          if (savedSelectionRange && !savedSelectionRange.collapsed && activeEditorTarget === editorEl) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelectionRange);
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('hiliteColor', false, colorVal);
          } else {
            editorEl.style.backgroundColor = colorVal;
          }
          syncAllModularPreviews();
        };
        hiliteColor.addEventListener('input', applyHilite);
        hiliteColor.addEventListener('change', applyHilite);
      }
    });

    // Close active toolbar state when clicking elsewhere
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.word-editor-wrapper').forEach(w => {
        if (!w.contains(e.target)) {
          w.classList.remove('toolbar-active');
        }
      });
    });
  }

  // ── Official Social Media Channels (Custom SVG & Multi-channel Support) ───
  const defaultSocialChannels = [
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://facebook.com/emaarindia',
      icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      url: 'https://twitter.com/emaarindia',
      icon: '<svg viewBox="0 0 1024 1024" fill="currentColor"><path d="M818 800 498.11 333.745l.546.437L787.084 0h-96.385L455.738 272 269.15 0H16.367l298.648 435.31-.036-.037L0 800h96.385l261.222-302.618L565.217 800zM230.96 72.727l448.827 654.546h-76.38L154.217 72.727z" transform="translate(103 112)"></path></svg>'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/emaarindia',
      icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/emaarindia',
      icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/emaar-india',
      icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>'
    }
  ];

  let socialChannels = [...defaultSocialChannels];

  function getSocialIconHtml(icon, name, isPreview = false) {
    if (!icon) {
      return `<svg fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2" fill="none"></path></svg>`;
    }
    const trimmed = (icon || '').trim();
    if (trimmed.startsWith('<svg')) {
      return trimmed;
    }
    const sz = isPreview ? '14px' : '22px';
    return `<img src="${trimmed}" alt="${name || 'Social'}" style="width:${sz};height:${sz};object-fit:contain;">`;
  }

  function syncSocialPreviews() {
    const container = document.getElementById('previewFooterSocials');
    if (container) {
      container.innerHTML = socialChannels.map(ch => `
        <a href="${ch.url || '#'}" target="_blank" class="live-footer-social-btn" title="${ch.name}">
          ${getSocialIconHtml(ch.icon, ch.name, true)}
        </a>
      `).join('');
    }

    // Keep hidden legacy inputs in sync for any watchers
    socialChannels.forEach(ch => {
      const lower = (ch.name || '').toLowerCase();
      if (lower.includes('facebook') && document.getElementById('editFooterFacebook')) document.getElementById('editFooterFacebook').value = ch.url;
      if ((lower.includes('twitter') || lower.includes('x')) && document.getElementById('editFooterTwitter')) document.getElementById('editFooterTwitter').value = ch.url;
      if (lower.includes('youtube') && document.getElementById('editFooterYoutube')) document.getElementById('editFooterYoutube').value = ch.url;
      if (lower.includes('instagram') && document.getElementById('editFooterInstagram')) document.getElementById('editFooterInstagram').value = ch.url;
      if (lower.includes('linkedin') && document.getElementById('editFooterLinkedin')) document.getElementById('editFooterLinkedin').value = ch.url;
    });
  }

  function renderSocialChannelsEditor() {
    const list = document.getElementById('socialChannelsList');
    if (!list) return;

    const cardsHtml = socialChannels.map((ch, idx) => `
      <div class="cms-social-card" data-idx="${idx}">
        <div class="cms-social-card-left">
          <div class="cms-social-icon-box" title="${ch.name} Icon">
            ${getSocialIconHtml(ch.icon, ch.name, false)}
          </div>
          <div class="cms-social-icon-actions">
            <button type="button" class="btn-replace-social-svg" data-idx="${idx}" title="Select SVG from library or upload from local device">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span>Replace SVG</span>
            </button>
            <button type="button" class="btn-paste-social-svg" data-idx="${idx}" title="Paste raw SVG code or image URL">
              <span>Paste Code</span>
            </button>
          </div>
        </div>
        <div class="cms-social-card-body">
          <div class="form-group">
            <label class="form-label">Platform Name</label>
            <input type="text" class="form-input cms-social-name-input" value="${ch.name}" placeholder="e.g. Facebook" data-idx="${idx}">
          </div>
          <div class="form-group">
            <label class="form-label">Profile URL</label>
            <input type="text" class="form-input cms-social-url-input" value="${ch.url}" placeholder="https://..." data-idx="${idx}">
          </div>
        </div>
        <button type="button" class="btn-item-delete btn-delete-social" data-idx="${idx}" title="Delete Channel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    `).join('');

    const addCardHtml = `
      <div class="cms-social-card cms-social-add-card" id="btnCardAddSocial" title="Add New Social Channel" role="button" tabindex="0">
        <div class="cms-social-add-plus">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
      </div>
    `;

    list.innerHTML = cardsHtml + addCardHtml;

    // Wire "+ Add Social Button as card"
    document.getElementById('btnCardAddSocial')?.addEventListener('click', () => {
      socialChannels.push({
        id: 'social_' + Date.now(),
        name: 'New Platform',
        url: 'https://',
        icon: '<svg fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2" fill="none"></path></svg>'
      });
      renderSocialChannelsEditor();
      syncSocialPreviews();
      showToast('✓ Added new social channel! Click "Replace SVG" or "Paste Code" to set custom icon.');
      const inputs = document.querySelectorAll('#socialChannelsList .cms-social-name-input');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
        inputs[inputs.length - 1].select();
      }
    });

    // Wire input listeners for Platform Name
    list.querySelectorAll('.cms-social-name-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (socialChannels[idx]) {
          socialChannels[idx].name = input.value;
          syncSocialPreviews();
        }
      });
    });

    // Wire input listeners for Profile URL
    list.querySelectorAll('.cms-social-url-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (socialChannels[idx]) {
          socialChannels[idx].url = input.value;
          syncSocialPreviews();
        }
      });
    });

    // Wire Replace SVG button
    list.querySelectorAll('.btn-replace-social-svg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        const channel = socialChannels[idx];
        if (!channel) return;
        openMediaPicker({
          title: `Select SVG / Icon for ${channel.name}`,
          defaultFilter: 'image',
          onSelect: (url) => {
            channel.icon = url;
            renderSocialChannelsEditor();
            syncSocialPreviews();
            showToast(`✓ SVG icon updated for ${channel.name}!`);
          }
        });
      });
    });

    // Wire Paste SVG Code button (opens elegant modal dialog instead of browser prompt)
    list.querySelectorAll('.btn-paste-social-svg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        openPasteSvgModal(idx);
      });
    });

    // Wire Delete Channel button (opens modal dialog instead of browser confirm)
    list.querySelectorAll('.btn-delete-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        openDeleteSocialModal(idx);
      });
    });
  }

  // Hook legacy "+ Add Social Channel / SVG" button if present
  document.getElementById('btnAddSocialChannel')?.addEventListener('click', () => {
    document.getElementById('btnCardAddSocial')?.click();
  });

  // Modal handlers for Paste SVG Code
  let activePasteSvgIdx = null;

  function openPasteSvgModal(idx) {
    const channel = socialChannels[idx];
    if (!channel) return;
    activePasteSvgIdx = idx;

    const modal = document.getElementById('modalPasteSvgCode');
    const title = document.getElementById('pasteSvgModalTitle');
    const subtitle = document.getElementById('pasteSvgModalSubtitle');
    const textarea = document.getElementById('txtPasteSvgInput');
    const preview = document.getElementById('pasteSvgPreviewIcon');
    const status = document.getElementById('pasteSvgPreviewStatus');

    if (title) title.textContent = `Paste SVG Code — ${channel.name}`;
    if (subtitle) subtitle.textContent = `Enter raw <svg> XML markup or an image file URL for ${channel.name}`;
    if (textarea) textarea.value = channel.icon.startsWith('<svg') ? channel.icon : '';

    const updatePreview = () => {
      if (!textarea || !preview) return;
      const val = textarea.value.trim();
      if (!val) {
        preview.innerHTML = '<span style="color:#94a3b8; font-size:11px;">Empty</span>';
        if (status) status.textContent = 'Paste SVG code above to preview here.';
        return;
      }
      if (val.startsWith('<svg')) {
        preview.innerHTML = val;
        const svgEl = preview.querySelector('svg');
        if (svgEl) {
          svgEl.setAttribute('width', '24');
          svgEl.setAttribute('height', '24');
          svgEl.style.width = '24px';
          svgEl.style.height = '24px';
          svgEl.style.display = 'block';
        }
        if (status) status.textContent = '✓ Valid SVG markup detected.';
      } else {
        preview.innerHTML = `<img src="${val}" style="width:24px; height:24px; object-fit:contain;" onerror="this.outerHTML='<span style=\\'color:#ef4444; font-size:10px;\\'>Invalid</span>'"/>`;
        if (status) status.textContent = 'Image URL detected.';
      }
    };

    if (textarea) {
      textarea.oninput = updatePreview;
      updatePreview();
    }

    if (modal) modal.classList.add('open');
    setTimeout(() => textarea?.focus(), 120);
  }

  function closePasteSvgModal() {
    const modal = document.getElementById('modalPasteSvgCode');
    if (modal) modal.classList.remove('open');
    activePasteSvgIdx = null;
  }

  document.getElementById('btnClosePasteSvgModal')?.addEventListener('click', closePasteSvgModal);
  document.getElementById('btnCancelPasteSvgModal')?.addEventListener('click', closePasteSvgModal);
  document.getElementById('btnClearSvgInput')?.addEventListener('click', () => {
    const textarea = document.getElementById('txtPasteSvgInput');
    if (textarea) {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
      textarea.focus();
    }
  });

  document.getElementById('btnPasteSvgFromClipboard')?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      const textarea = document.getElementById('txtPasteSvgInput');
      if (textarea && text) {
        textarea.value = text.trim();
        textarea.dispatchEvent(new Event('input'));
        textarea.focus();
        showToast('✓ Pasted from clipboard!');
      }
    } catch (e) {
      showToast('Clipboard access was blocked by browser. Please paste with Ctrl+V.');
    }
  });

  document.getElementById('btnApplyPasteSvgModal')?.addEventListener('click', () => {
    if (activePasteSvgIdx === null) return;
    const channel = socialChannels[activePasteSvgIdx];
    if (!channel) return;
    const textarea = document.getElementById('txtPasteSvgInput');
    const val = textarea?.value?.trim();
    if (val) {
      channel.icon = val;
      renderSocialChannelsEditor();
      syncSocialPreviews();
      showToast(`✓ SVG icon updated for ${channel.name}!`);
    }
    closePasteSvgModal();
  });

  // Modal handlers for Delete Channel Confirmation
  let activeDeleteChannelIdx = null;

  function openDeleteSocialModal(idx) {
    const channel = socialChannels[idx];
    if (!channel) return;
    activeDeleteChannelIdx = idx;

    const modal = document.getElementById('modalConfirmDeleteSocial');
    const msg = document.getElementById('confirmDeleteSocialMsg');
    if (msg) msg.textContent = `Are you sure you want to remove "${channel.name}" from footer social channels?`;
    if (modal) modal.classList.add('open');
  }

  function closeDeleteSocialModal() {
    const modal = document.getElementById('modalConfirmDeleteSocial');
    if (modal) modal.classList.remove('open');
    activeDeleteChannelIdx = null;
  }

  document.getElementById('btnCloseDeleteSocialModal')?.addEventListener('click', closeDeleteSocialModal);
  document.getElementById('btnCancelDeleteSocialModal')?.addEventListener('click', closeDeleteSocialModal);
  document.getElementById('btnConfirmDeleteSocialModal')?.addEventListener('click', () => {
    if (activeDeleteChannelIdx !== null && socialChannels[activeDeleteChannelIdx]) {
      const removedName = socialChannels[activeDeleteChannelIdx].name;
      socialChannels.splice(activeDeleteChannelIdx, 1);
      renderSocialChannelsEditor();
      syncSocialPreviews();
      showToast(`✓ Removed "${removedName}"`);
    }
    closeDeleteSocialModal();
  });

  function syncAllModularPreviews() {
    // 0. Navigation Header / Topbar
    const navPhoneIn = document.getElementById('editNavPhone');
    const navWaIn = document.getElementById('editNavWhatsapp');
    const navCtaIn = document.getElementById('editNavCtaText');
    const navLinksIn = document.getElementById('editNavLinksText');
    const navProjDropIn = document.getElementById('editNavProjectsDropdown');
    const pNavCallLink = document.getElementById('previewNavCallLink');
    const pNavWaLink = document.getElementById('previewNavWaLink');
    const pNavCta = document.getElementById('previewNavCta');
    const pNavLinks = document.getElementById('previewNavLinks');
    const pProjDrop = document.getElementById('previewProjectsDropdown');

    if (pNavCallLink && navPhoneIn) {
      const cleanPhone = navPhoneIn.value.replace(/[^0-9+]/g, '');
      pNavCallLink.href = `tel:${cleanPhone}`;
      pNavCallLink.title = `Call: ${navPhoneIn.value}`;
    }
    if (pNavWaLink && navWaIn) {
      const cleanWa = navWaIn.value.replace(/[^0-9]/g, '');
      pNavWaLink.href = `https://wa.me/${cleanWa}`;
      pNavWaLink.title = `WhatsApp: ${navWaIn.value}`;
    }
    if (pNavCta && navCtaIn) pNavCta.textContent = navCtaIn.value;
    if (pNavLinks && navLinksIn) {
      const links = navLinksIn.value.split(',').map(s => s.trim()).filter(Boolean);
      pNavLinks.innerHTML = links.map(l => {
        if (l.toUpperCase() === 'PROJECTS') {
          return `
            <div class="live-nav-dropdown-wrap">
              <span class="live-nav-link live-nav-dropdown-trigger">
                PROJECTS
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"></path></svg>
              </span>
              <div class="live-nav-dropdown-menu" id="previewProjectsDropdown">
                <span>Residential</span>
                <span>Commercial</span>
              </div>
            </div>
          `;
        }
        return `<span class="live-nav-link">${l}</span>`;
      }).join('');
    }
    if (pProjDrop && navProjDropIn) {
      const subItems = navProjDropIn.value.split(',').map(s => s.trim()).filter(Boolean);
      pProjDrop.innerHTML = subItems.map(item => `<span>${item}</span>`).join('');
    }

    // 1. Built on Legacy
    const legTitleEl = document.getElementById('editTextLegacyTitleRich');
    const legBodyEl = document.getElementById('editTextLegacyBodyRich');
    const pLegHead = document.getElementById('previewLegacyHeading');
    const pLegDesc = document.getElementById('previewLegacyDesc');
    if (pLegHead && legTitleEl) {
      pLegHead.innerHTML = legTitleEl.innerHTML;
      if (legTitleEl.style.fontSize) pLegHead.style.fontSize = legTitleEl.style.fontSize;
      if (legTitleEl.style.color) pLegHead.style.color = legTitleEl.style.color;
      if (legTitleEl.style.textAlign) pLegHead.style.textAlign = legTitleEl.style.textAlign;
      if (legTitleEl.style.fontFamily) pLegHead.style.fontFamily = legTitleEl.style.fontFamily;
    }
    if (pLegDesc && legBodyEl) {
      pLegDesc.innerHTML = legBodyEl.innerHTML;
      if (legBodyEl.style.fontSize) pLegDesc.style.fontSize = legBodyEl.style.fontSize;
      if (legBodyEl.style.color) pLegDesc.style.color = legBodyEl.style.color;
      if (legBodyEl.style.textAlign) pLegDesc.style.textAlign = legBodyEl.style.textAlign;
      if (legBodyEl.style.fontFamily) pLegDesc.style.fontFamily = legBodyEl.style.fontFamily;
    }

    // 2. Walkthrough
    const walkTitleEl = document.getElementById('editTextWalkTitleRich');
    const walkSubEl = document.getElementById('editTextWalkSubRich');
    const walkBadgeEl = document.getElementById('editTextWalkBadge');
    const walkCapEl = document.getElementById('editTextWalkCaptionRich');
    const pWalkHead = document.getElementById('previewWalkTitle');
    const pWalkSub = document.getElementById('previewWalkSub');
    const pWalkBadge = document.getElementById('previewWalkBadge');
    const pWalkCap = document.getElementById('previewWalkCaption');
    if (pWalkHead && walkTitleEl) {
      pWalkHead.innerHTML = walkTitleEl.innerHTML;
      if (walkTitleEl.style.fontSize) pWalkHead.style.fontSize = walkTitleEl.style.fontSize;
      if (walkTitleEl.style.color) pWalkHead.style.color = walkTitleEl.style.color;
      if (walkTitleEl.style.textAlign) pWalkHead.style.textAlign = walkTitleEl.style.textAlign;
      if (walkTitleEl.style.fontFamily) pWalkHead.style.fontFamily = walkTitleEl.style.fontFamily;
    }
    if (pWalkSub && walkSubEl) {
      pWalkSub.innerHTML = walkSubEl.innerHTML;
      if (walkSubEl.style.fontSize) pWalkSub.style.fontSize = walkSubEl.style.fontSize;
      if (walkSubEl.style.color) pWalkSub.style.color = walkSubEl.style.color;
      if (walkSubEl.style.textAlign) pWalkSub.style.textAlign = walkSubEl.style.textAlign;
    }
    if (pWalkBadge && walkBadgeEl) pWalkBadge.textContent = walkBadgeEl.value;
    if (pWalkCap && walkCapEl) {
      pWalkCap.innerHTML = walkCapEl.innerHTML;
      if (walkCapEl.style.fontSize) pWalkCap.style.fontSize = walkCapEl.style.fontSize;
      if (walkCapEl.style.color) pWalkCap.style.color = walkCapEl.style.color;
      if (walkCapEl.style.textAlign) pWalkCap.style.textAlign = walkCapEl.style.textAlign;
    }

    // 3. Blogs & Captions
    const blogTitleEl = document.getElementById('editTextBlogTitleRich');
    const blogSubEl = document.getElementById('editTextBlogSubRich');
    const pBlogTitle = document.getElementById('previewBlogTitle');
    const pBlogSub = document.getElementById('previewBlogSub');
    if (pBlogTitle && blogTitleEl) {
      pBlogTitle.innerHTML = blogTitleEl.innerHTML;
      if (blogTitleEl.style.fontSize) pBlogTitle.style.fontSize = blogTitleEl.style.fontSize;
      if (blogTitleEl.style.color) pBlogTitle.style.color = blogTitleEl.style.color;
      if (blogTitleEl.style.textAlign) pBlogTitle.style.textAlign = blogTitleEl.style.textAlign;
      if (blogTitleEl.style.fontFamily) pBlogTitle.style.fontFamily = blogTitleEl.style.fontFamily;
    }
    if (pBlogSub && blogSubEl) {
      pBlogSub.innerHTML = blogSubEl.innerHTML;
      if (blogSubEl.style.fontSize) pBlogSub.style.fontSize = blogSubEl.style.fontSize;
      if (blogSubEl.style.color) pBlogSub.style.color = blogSubEl.style.color;
      if (blogSubEl.style.textAlign) pBlogSub.style.textAlign = blogSubEl.style.textAlign;
    }
    const b1CapIn = document.getElementById('editTextBlog1CaptionRich');
    const b2CapIn = document.getElementById('editTextBlog2CaptionRich');
    const pB1Cap = document.getElementById('previewBlog1Caption');
    const pB2Cap = document.getElementById('previewBlog2Caption');
    if (pB1Cap && b1CapIn) {
      pB1Cap.innerHTML = b1CapIn.innerHTML;
      if (b1CapIn.style.fontSize) pB1Cap.style.fontSize = b1CapIn.style.fontSize;
      if (b1CapIn.style.color) pB1Cap.style.color = b1CapIn.style.color;
      if (b1CapIn.style.textAlign) pB1Cap.style.textAlign = b1CapIn.style.textAlign;
      if (b1CapIn.style.fontFamily) pB1Cap.style.fontFamily = b1CapIn.style.fontFamily;
    }
    if (pB2Cap && b2CapIn) {
      pB2Cap.innerHTML = b2CapIn.innerHTML;
      if (b2CapIn.style.fontSize) pB2Cap.style.fontSize = b2CapIn.style.fontSize;
      if (b2CapIn.style.color) pB2Cap.style.color = b2CapIn.style.color;
      if (b2CapIn.style.textAlign) pB2Cap.style.textAlign = b2CapIn.style.textAlign;
      if (b2CapIn.style.fontFamily) pB2Cap.style.fontFamily = b2CapIn.style.fontFamily;
    }

    // 4. Global Footer (Matches live site schema: socials, newsletter, 6 dropdown columns, legal)
    // Social Links (Synced from dynamic socialChannels list)
    syncSocialPreviews();

    // Newsletter Box
    const newsPlaceIn = document.getElementById('editFooterNewsPlaceholder');
    const newsBtnIn = document.getElementById('editFooterNewsBtn');
    const newsBtnBgIn = document.getElementById('editFooterNewsBtnBg');
    const newsBtnColorIn = document.getElementById('editFooterNewsBtnColor');
    const pNewsPlace = document.getElementById('previewFooterNewsPlaceholder');
    const pNewsBtn = document.getElementById('previewFooterNewsBtn');
    if (pNewsPlace && newsPlaceIn) pNewsPlace.placeholder = newsPlaceIn.value || 'Enter email';
    if (pNewsBtn) {
      if (newsBtnIn) pNewsBtn.textContent = newsBtnIn.value || 'SUBSCRIBE';
      if (newsBtnBgIn && newsBtnBgIn.value) pNewsBtn.style.backgroundColor = newsBtnBgIn.value;
      if (newsBtnColorIn && newsBtnColorIn.value) pNewsBtn.style.color = newsBtnColorIn.value;
    }

    // Render live footer preview columns dynamically from footerNavColumns
    const pColsGrid = document.getElementById('previewFooterColsGrid');
    if (pColsGrid && typeof footerNavColumns !== 'undefined' && Array.isArray(footerNavColumns)) {
      pColsGrid.innerHTML = footerNavColumns.map((col) => {
        if (col.type === 'link') {
          return `
            <div class="live-footer-acc-row" data-col="${col.id}">
              <a href="${col.url || '#'}" ${col.openInNewTab ? 'target="_blank" rel="noopener"' : ''} class="live-footer-acc-direct-link">
                <span>${col.title || 'UNTITLED'}</span>
                <span style="font-size: 12px; opacity: 0.65;">↗</span>
              </a>
            </div>
          `;
        }
        const links = (col.links || '').split(',').map(s => s.trim()).filter(Boolean);
        return `
          <div class="live-footer-acc-row" data-col="${col.id}">
            <button type="button" class="live-footer-acc-btn" data-toggle-col="${col.id}">
              <span class="live-footer-acc-title">${col.title || 'UNTITLED'}</span>
              <svg class="live-footer-acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <ul class="live-footer-acc-list">
              ${links.map(l => `<li><span>${l}</span></li>`).join('')}
            </ul>
          </div>
        `;
      }).join('');

      pColsGrid.querySelectorAll('.live-footer-acc-btn[data-toggle-col]').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.closest('.live-footer-acc-row');
          if (row) row.classList.toggle('open');
        });
      });
    }

    // Centered Legal Links
    const footLegIn = document.getElementById('editFooterLegal');
    const pFootLeg = document.getElementById('previewFooterLegal');
    if (pFootLeg && footLegIn) {
      const items = (footLegIn.value || '').split(/•|,/).map(s => s.trim()).filter(Boolean);
      pFootLeg.innerHTML = items.map((item, idx) => `
        <span class="live-footer-legal-item ${idx !== items.length - 1 ? 'has-divider' : ''}">${item}</span>
      `).join('');
    }
  }

  // Real-time typing listeners on all rich text canvases and inputs
  [
    'editNavPhone', 'editNavWhatsapp', 'editNavCtaText', 'editNavCtaLink', 'editNavLinksText', 'editNavProjectsDropdown',
    'editTextLegacyTitleRich', 'editTextLegacyBodyRich',
    'editTextWalkTitleRich', 'editTextWalkBadge', 'editTextWalkSubRich', 'editTextWalkCaptionRich',
    'editTextBlogTitleRich', 'editTextBlogSubRich', 'editTextBlog1CaptionRich', 'editTextBlog2CaptionRich',
    'editFooterFacebook', 'editFooterTwitter', 'editFooterYoutube', 'editFooterInstagram', 'editFooterLinkedin',
    'editFooterNewsPlaceholder', 'editFooterNewsBtn', 'editFooterNewsBtnBg', 'editFooterNewsBtnColor',
    'editFooterCol1Title', 'editFooterCol1Links',
    'editFooterCol2Title', 'editFooterCol2Links',
    'editFooterCol3Title', 'editFooterCol3Links',
    'editFooterCol4Title', 'editFooterCol4Links',
    'editFooterCol5Title', 'editFooterCol5Links',
    'editFooterCol6Title', 'editFooterCol6Links',
    'editFooterLegal'
  ].forEach(id => {
    document.getElementById(id)?.addEventListener('input', syncAllModularPreviews);
  });

  // Prevent any links or preview texts in modular preview boxes from navigating or jumping the page
  document.addEventListener('click', (e) => {
    const previewBox = e.target.closest('.modular-preview-box');
    if (previewBox) {
      const link = e.target.closest('a, [href]');
      if (link && !link.classList.contains('btn-preview-action')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  // Two-way sync for color picker swatches and hex text inputs
  function wireColorInputPair(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (!picker || !hex) return;
    picker.addEventListener('input', () => {
      hex.value = picker.value;
      syncAllModularPreviews();
    });
    hex.addEventListener('input', () => {
      let val = hex.value.trim();
      if (!val.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(val)) {
        val = '#' + val;
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        picker.value = val;
        syncAllModularPreviews();
      }
    });
  }
  wireColorInputPair('editFooterNewsBtnBg', 'editFooterNewsBtnBgHex');
  wireColorInputPair('editFooterNewsBtnColor', 'editFooterNewsBtnColorHex');

  async function loadTextContent() {
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      if (data.success && data.data) {
        state.sections = data.data;

        // Section 0: Header
        const header = data.data.header || {};
        if (document.getElementById('editNavPhone') && header.phone) document.getElementById('editNavPhone').value = header.phone;
        if (document.getElementById('editNavWhatsapp') && header.whatsapp) document.getElementById('editNavWhatsapp').value = header.whatsapp;
        if (document.getElementById('editNavCtaText') && header.cta_text) document.getElementById('editNavCtaText').value = header.cta_text;
        if (document.getElementById('editNavLinksText') && header.nav_links) document.getElementById('editNavLinksText').value = header.nav_links;
        if (document.getElementById('editNavProjectsDropdown') && header.projects_dropdown) document.getElementById('editNavProjectsDropdown').value = header.projects_dropdown;
        if (header.logo) {
          const lPrev = document.getElementById('previewNavLogo');
          const lThumb = document.getElementById('navLogoThumbImg');
          const lPath = document.getElementById('navLogoImgPath');
          if (lPrev) lPrev.src = header.logo;
          if (lThumb) lThumb.src = header.logo;
          if (lPath) lPath.textContent = header.logo;
        }

        // Section 1: Hero
        const hero = data.data.hero || {};
        if (document.getElementById('editHeroTitle')) document.getElementById('editHeroTitle').value = hero.title || '';
        if (document.getElementById('editHeroAlt')) document.getElementById('editHeroAlt').value = hero.alt || '';

        // Section 2: Launches
        const launches = data.data.launches || {};
        if (document.getElementById('editLaunchesKicker')) document.getElementById('editLaunchesKicker').value = launches.kicker || '';
        if (document.getElementById('editLaunchesTitle')) document.getElementById('editLaunchesTitle').value = launches.title || '';
        if (document.getElementById('editLaunchesLede')) document.getElementById('editLaunchesLede').value = launches.lede || '';

        // Section 3: Developments
        const devs = data.data.developments || {};
        if (document.getElementById('editDevsKicker')) document.getElementById('editDevsKicker').value = devs.kicker || '';
        if (document.getElementById('editDevsTitle')) document.getElementById('editDevsTitle').value = devs.title || '';
        if (document.getElementById('editDevsLede')) document.getElementById('editDevsLede').value = devs.lede || '';

        // Section 4: Under Development
        const underDev = data.data.underDevelopment || {};
        if (document.getElementById('editUnderDevKicker')) document.getElementById('editUnderDevKicker').value = underDev.kicker || '';
        if (document.getElementById('editUnderDevTitle')) document.getElementById('editUnderDevTitle').value = underDev.title || '';
        if (document.getElementById('editUnderDevLede')) document.getElementById('editUnderDevLede').value = underDev.lede || '';

        // Section 5: Communities
        const comm = data.data.communitiesIntro || {};
        if (document.getElementById('editCommKicker')) document.getElementById('editCommKicker').value = comm.kicker || '';
        if (document.getElementById('editCommTitle')) document.getElementById('editCommTitle').value = comm.title || '';
        if (document.getElementById('editCommLede')) document.getElementById('editCommLede').value = comm.lede || '';

        // Section 6: Properties
        const props = data.data.propertiesIntro || {};
        if (document.getElementById('editPropsKicker')) document.getElementById('editPropsKicker').value = props.kicker || '';
        if (document.getElementById('editPropsTitle')) document.getElementById('editPropsTitle').value = props.title || '';
        if (document.getElementById('editPropsLede')) document.getElementById('editPropsLede').value = props.lede || '';

        // Section 7: Legacy
        const legacy = data.data.legacy || {};
        if (document.getElementById('editLegacyTitle')) document.getElementById('editLegacyTitle').value = legacy.title || '';
        if (document.getElementById('editLegacyLede')) document.getElementById('editLegacyLede').value = legacy.lede || '';

        // Section 8: Press
        const press = data.data.press || {};
        if (document.getElementById('editPressTitle')) document.getElementById('editPressTitle').value = press.title || '';
        if (document.getElementById('editPressLede')) document.getElementById('editPressLede').value = press.lede || '';

        // Section 9: Converse
        const converse = data.data.converse || {};
        if (document.getElementById('editConverseTitle')) document.getElementById('editConverseTitle').value = converse.title || '';
        if (document.getElementById('editConverseLede')) document.getElementById('editConverseLede').value = converse.lede || '';

        // Section 4: Footer
        const footer = data.data.footer || {};
        if (document.getElementById('editFooterToll') && footer.toll_free) document.getElementById('editFooterToll').value = footer.toll_free;
        if (document.getElementById('editFooterEmail') && footer.email) document.getElementById('editFooterEmail').value = footer.email;
        if (document.getElementById('editFooterAddress') && footer.address) document.getElementById('editFooterAddress').value = footer.address;
        if (document.getElementById('editFooterRera') && footer.rera) document.getElementById('editFooterRera').value = footer.rera;

        if (Array.isArray(footer.social_channels) && footer.social_channels.length > 0) {
          socialChannels = footer.social_channels;
        } else {
          socialChannels = defaultSocialChannels.map(ch => {
            const copy = { ...ch };
            if (ch.id === 'facebook' && footer.facebook) copy.url = footer.facebook;
            if (ch.id === 'twitter' && footer.twitter) copy.url = footer.twitter;
            if (ch.id === 'youtube' && footer.youtube) copy.url = footer.youtube;
            if (ch.id === 'instagram' && footer.instagram) copy.url = footer.instagram;
            if (ch.id === 'linkedin' && footer.linkedin) copy.url = footer.linkedin;
            return copy;
          });
        }
        renderSocialChannelsEditor();
        syncSocialPreviews();

        if (document.getElementById('editFooterNewsTitle') && footer.news_title) document.getElementById('editFooterNewsTitle').value = footer.news_title;
        if (document.getElementById('editFooterNewsSub') && footer.news_sub) document.getElementById('editFooterNewsSub').value = footer.news_sub;
        if (document.getElementById('editFooterNewsPlaceholder') && footer.news_placeholder) document.getElementById('editFooterNewsPlaceholder').value = footer.news_placeholder;
        if (document.getElementById('editFooterNewsBtn') && footer.news_btn) document.getElementById('editFooterNewsBtn').value = footer.news_btn;
        if (footer.news_btn_bg) {
          if (document.getElementById('editFooterNewsBtnBg')) document.getElementById('editFooterNewsBtnBg').value = footer.news_btn_bg;
          if (document.getElementById('editFooterNewsBtnBgHex')) document.getElementById('editFooterNewsBtnBgHex').value = footer.news_btn_bg;
        }
        if (footer.news_btn_color) {
          if (document.getElementById('editFooterNewsBtnColor')) document.getElementById('editFooterNewsBtnColor').value = footer.news_btn_color;
          if (document.getElementById('editFooterNewsBtnColorHex')) document.getElementById('editFooterNewsBtnColorHex').value = footer.news_btn_color;
        }

        if (footer.nav_columns && Array.isArray(footer.nav_columns) && footer.nav_columns.length > 0) {
          footerNavColumns = footer.nav_columns;
        } else if (footer.columns && Array.isArray(footer.columns) && footer.columns.length > 0) {
          footerNavColumns = footer.columns.map((col, idx) => ({
            id: 'col_' + (idx + 1),
            type: col.type === 'link' || col.href ? 'link' : 'dropdown',
            title: col.title || `COLUMN ${idx + 1}`,
            links: Array.isArray(col.links) ? col.links.map(l => typeof l === 'string' ? l : l.label).join(', ') : '',
            url: col.href || col.url || '',
            openInNewTab: Boolean(col.external)
          }));
        } else {
          for (let i = 1; i <= 6; i++) {
            if (footer[`col${i}_title`] && footerNavColumns[i - 1]) {
              footerNavColumns[i - 1].title = footer[`col${i}_title`];
            }
            if (footer[`col${i}_links`] && footerNavColumns[i - 1]) {
              footerNavColumns[i - 1].links = footer[`col${i}_links`];
            }
          }
        }

        renderFooterNavColumnsEditor();

        syncAllModularPreviews();
      }
    } catch (e) {
      console.error('Error loading sections', e);
    }
  }

  // =====================================================================
  // MEDIA LIBRARY PICKER MODAL (Select from CMS or Upload from Local)
  // =====================================================================
  let pickerCurrentFilter = 'all';

  function initMediaPickerModal() {
    const modal = document.getElementById('modalMediaPicker');
    const closeBtn = document.getElementById('btnCloseMediaPicker');
    const cancelBtn = document.getElementById('btnCancelMediaPicker');
    const applyBtn = document.getElementById('btnApplyMediaPicker');
    const directUploadInput = document.getElementById('pickerDirectFileInput');
    const searchInput = document.getElementById('pickerSearchInput');
    const tabs = document.querySelectorAll('.picker-tab');

    function closeModal() {
      if (modal) modal.classList.remove('open');
      selectedMediaUrl = null;
      if (applyBtn) applyBtn.disabled = true;
    }

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Tab filter
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        pickerCurrentFilter = tab.dataset.pickerFilter || 'all';
        renderPickerGrid();
      });
    });

    // Search input
    searchInput?.addEventListener('input', () => {
      renderPickerGrid();
    });

    // Unified upload handler for picker
    async function handlePickerUploadFile(file) {
      if (!file) return;
      showToast(`Uploading "${file.name}"...`);
      const uploaded = await uploadFile(file);
      if (uploaded && uploaded.url) {
        showToast('✓ File successfully uploaded to library!');
        await loadMediaLibrary();
        pickerCurrentFilter = 'all';
        tabs.forEach(t => {
          t.classList.toggle('active', t.dataset.pickerFilter === 'all');
        });
        renderPickerGrid();
        selectPickerImage(uploaded.url, uploaded.name || file.name);
        if (currentPickerCallback) {
          applyBtn.disabled = false;
        }
      }
    }

    // Direct file upload button inside picker top-bar
    directUploadInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await handlePickerUploadFile(file);
      e.target.value = '';
    });

    // Drag and drop onto modal
    const modalCard = modal?.querySelector('.modal-card');
    modal?.addEventListener('dragover', (e) => {
      e.preventDefault();
      modalCard?.classList.add('drag-over');
    });
    modal?.addEventListener('dragleave', () => {
      modalCard?.classList.remove('drag-over');
    });
    modal?.addEventListener('drop', async (e) => {
      e.preventDefault();
      modalCard?.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handlePickerUploadFile(e.dataTransfer.files[0]);
      }
    });

    // Confirm selection
    applyBtn?.addEventListener('click', () => {
      if (selectedMediaUrl && currentPickerCallback) {
        currentPickerCallback(selectedMediaUrl);
        closeModal();
      } else if (!currentPickerCallback) {
        closeModal();
      }
    });
  }

  function openMediaPicker({ title = 'Media Library', defaultFilter = 'all', onSelect = null } = {}) {
    const modal = document.getElementById('modalMediaPicker');
    const heading = document.getElementById('pickerModalHeading');
    const sub = document.getElementById('pickerContextSub');
    if (heading) heading.textContent = title;
    if (sub) sub.textContent = 'Choose an existing media item or upload from your local device';
    currentPickerCallback = onSelect;
    selectedMediaUrl = null;
    const applyBtn = document.getElementById('btnApplyMediaPicker');
    const info = document.getElementById('pickerSelectedInfo');
    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.textContent = onSelect ? 'Apply Selected Media' : 'Close';
    }
    if (info) info.textContent = 'Click a media item below to select, or switch to Upload to add new files';

    pickerCurrentFilter = defaultFilter;
    const tabs = document.querySelectorAll('.picker-tab');
    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.pickerFilter === defaultFilter);
    });

    // Update storage badge in picker
    const storageBadge = document.getElementById('pickerStorageBadge');
    if (storageBadge && state.storage) {
      storageBadge.textContent = `${state.storage.usedMB} MB / ${state.storage.maxMB} MB Used`;
    }

    renderPickerGrid();
    if (modal) modal.classList.add('open');
  }

  function selectPickerImage(url, name) {
    selectedMediaUrl = url;
    const applyBtn = document.getElementById('btnApplyMediaPicker');
    const info = document.getElementById('pickerSelectedInfo');
    if (applyBtn) applyBtn.disabled = false;
    if (info) info.innerHTML = `Selected: <strong>${name}</strong> (<code style="font-size:10px;">${url}</code>)`;

    document.querySelectorAll('.picker-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.url === url);
    });
  }

  function deselectPickerImage() {
    selectedMediaUrl = null;
    const applyBtn = document.getElementById('btnApplyMediaPicker');
    const info = document.getElementById('pickerSelectedInfo');
    if (applyBtn) applyBtn.disabled = true;
    if (info) info.textContent = 'Click a media item below to select, or switch to Upload to add new files';

    document.querySelectorAll('.picker-card').forEach(c => {
      c.classList.remove('selected');
    });
  }

  function renderPickerGrid() {
    const grid = document.getElementById('pickerImageGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Update storage badge
    const storageBadge = document.getElementById('pickerStorageBadge');
    if (storageBadge && state.storage) {
      storageBadge.textContent = `${state.storage.usedMB} MB / ${state.storage.maxMB} MB Used`;
    }

    // Special View for "Upload" tab: Big dotted dropzone with modern SVG upload icon
    if (pickerCurrentFilter === 'upload') {
      const dropzone = document.createElement('div');
      dropzone.className = 'picker-upload-dropzone';
      dropzone.id = 'pickerDottedDropzone';
      dropzone.innerHTML = `
        <div class="dropzone-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h4 style="font-size: 14.5px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Drag & drop your files here</h4>
        <p style="font-size: 11.5px; color: #64748b; margin-bottom: 16px;">Supports images (JPG, PNG, WEBP, SVG) & videos (MP4, WebM)</p>
        <label class="btn btn-dark btn-xs" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; font-weight: 600;">
          <input type="file" id="pickerDropzoneFileInput" accept="image/*,video/*" hidden>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span>Browse Device Files</span>
        </label>
      `;

      const input = dropzone.querySelector('#pickerDropzoneFileInput');
      input?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          showToast(`Uploading "${file.name}"...`);
          const uploaded = await uploadFile(file);
          if (uploaded && uploaded.url) {
            showToast('✓ File successfully uploaded to library!');
            await loadMediaLibrary();
            pickerCurrentFilter = 'all';
            document.querySelectorAll('.picker-tab').forEach(t => {
              t.classList.toggle('active', t.dataset.pickerFilter === 'all');
            });
            renderPickerGrid();
            selectPickerImage(uploaded.url, uploaded.name || file.name);
          }
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-active');
      });
      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          showToast(`Uploading "${file.name}"...`);
          const uploaded = await uploadFile(file);
          if (uploaded && uploaded.url) {
            showToast('✓ File successfully uploaded to library!');
            await loadMediaLibrary();
            pickerCurrentFilter = 'all';
            document.querySelectorAll('.picker-tab').forEach(t => {
              t.classList.toggle('active', t.dataset.pickerFilter === 'all');
            });
            renderPickerGrid();
            selectPickerImage(uploaded.url, uploaded.name || file.name);
          }
        }
      });

      grid.appendChild(dropzone);
      return;
    }

    const query = document.getElementById('pickerSearchInput')?.value.toLowerCase().trim() || '';

    // Normal files view: All Files, Images, Videos (includes user-uploaded files)
    const filtered = (state.media || []).filter(m => {
      if (pickerCurrentFilter === 'image' && m.type !== 'image') return false;
      if (pickerCurrentFilter === 'video' && m.type !== 'video') return false;
      if (query && !m.name.toLowerCase().includes(query)) return false;
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px 20px; text-align: center; color: #64748b;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" style="margin: 0 auto 10px; display: block;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">No media files found</div>
          <div style="font-size: 11.5px; color: #94a3b8;">Try adjusting your search query or switch to the Upload tab to add new files.</div>
        </div>
      `;
      return;
    }

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = `picker-card ${selectedMediaUrl === m.url ? 'selected' : ''}`;
      card.dataset.url = m.url;
      const isVideo = m.type === 'video';
      card.innerHTML = `
        <div class="picker-card-thumb-wrap">
          ${isVideo ? `
            <video src="${m.url}" muted preload="metadata" style="width:100%;height:100%;object-fit:cover;"></video>
            <div class="picker-play-badge">▶</div>
          ` : `
            <img src="${m.url}" class="picker-card-img" alt="${m.name}" loading="lazy">
          `}
          ${m.isUserUpload ? '<span class="picker-card-badge">Uploaded</span>' : ''}
          <div class="picker-card-check">✓</div>
        </div>
        <div class="picker-card-meta">
          <span class="picker-card-name" title="${m.name}">${m.name}</span>
          <span class="picker-card-sub">${m.sizeFormatted || (isVideo ? 'Video' : 'Image')}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        if (selectedMediaUrl === m.url) {
          deselectPickerImage();
        } else {
          selectPickerImage(m.url, m.name);
        }
      });
      card.addEventListener('dblclick', () => {
        selectPickerImage(m.url, m.name);
        if (currentPickerCallback) {
          currentPickerCallback(m.url);
          const modal = document.getElementById('modalMediaPicker');
          if (modal) modal.classList.remove('open');
        }
      });
      grid.appendChild(card);
    });
  }

  // Hook image replacer triggers
  document.getElementById('btnReplaceNavLogo')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Header Brand Logo',
      defaultFilter: 'image',
      onSelect: (url) => {
        const prev = document.getElementById('previewNavLogo');
        const thumb = document.getElementById('navLogoThumbImg');
        const pathTxt = document.getElementById('navLogoImgPath');
        if (prev) prev.src = url;
        if (thumb) thumb.src = url;
        if (pathTxt) pathTxt.textContent = url;
        if (!state.sections.header) state.sections.header = {};
        state.sections.header.logo = url;
        showToast('✓ Header logo updated! Click "Save Staged Changes" to stage.');
      }
    });
  });

  document.getElementById('btnReplaceFooterLogo')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Footer Brand Logo',
      defaultFilter: 'image',
      onSelect: (url) => {
        const prev = document.getElementById('previewFooterLogo');
        const thumb = document.getElementById('footerLogoThumbImg');
        const pathTxt = document.getElementById('footerLogoImgPath');
        if (prev) prev.src = url;
        if (thumb) thumb.src = url;
        if (pathTxt) pathTxt.textContent = url;
        if (!state.sections.footer) state.sections.footer = {};
        state.sections.footer.logo = url;
        showToast('✓ Footer logo updated! Click "Save Staged Changes" to stage.');
      }
    });
  });

  // ── Preview accordion rows (live-footer-acc-row) ──────────────────────────
  document.querySelectorAll('.live-footer-acc-btn[data-toggle-col]').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.getAttribute('data-toggle-col');
      const row = btn.closest('.live-footer-acc-row');
      if (row) row.classList.toggle('open');
    });
  });

  // ── Editor accordion drawers (cms-nav-accordion-trigger) ─────────────────
  document.querySelectorAll('.cms-nav-accordion-trigger[data-drawer-col]').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.getAttribute('data-drawer-col');
      const accordion = btn.closest('.cms-nav-col-accordion');
      if (accordion) accordion.classList.toggle('open');
    });
  });

  // ── Dynamic Footer Navigation Columns & Hyperlinks Management ──────────────
  let footerNavColumns = [
    { id: 'col_1', type: 'dropdown', title: 'ABOUT EMAAR', links: 'Who We Are, Leadership, Awards, Emaar Business, Emaar Foundation, Career, Investor Relations, Emaar Blogs, Media, Emaar Sustainability, E-Services, Contact Us, Compliance', url: '', openInNewTab: false },
    { id: 'col_2', type: 'dropdown', title: 'PROJECTS', links: 'Residential, Commercial', url: '', openInNewTab: false },
    { id: 'col_3', type: 'dropdown', title: 'MASTER DEVELOPMENTS', links: 'Gomti Greens, Savana by Indore Greens, Savana by Jaipur Greens', url: '', openInNewTab: false },
    { id: 'col_4', type: 'dropdown', title: 'LATEST LAUNCHES', links: 'Emaar Serenity Hills, Urban Ascent, Elite Oasis, Emaar India Business Centre, Mohali Hills Residential Plots', url: '', openInNewTab: false },
    { id: 'col_5', type: 'dropdown', title: 'EMAAR INTERNATIONAL', links: 'KSA, India, Pakistan, Egypt, Morocco, Turkey', url: '', openInNewTab: false },
    { id: 'col_6', type: 'dropdown', title: 'EMAAR HOSPITALITY', links: 'The Address Hotels + Resorts, Vida Hotels and Resorts, Armani Hotels & Resorts, Rove Hotels', url: '', openInNewTab: false }
  ];
  let openFooterColId = 'col_1';

  function renderFooterNavColumnsEditor() {
    const container = document.getElementById('footerNavDrawersContainer');
    if (!container) return;

    container.innerHTML = footerNavColumns.map((col, idx) => {
      const isOpen = col.id === openFooterColId;
      const linkItems = (col.links || '').split(',').map(s => s.trim()).filter(Boolean);

      return `
        <div class="cms-nav-col-accordion ${isOpen ? 'open' : ''}" data-col-id="${col.id}">
          <div class="cms-nav-accordion-trigger" data-drawer-col="${col.id}" role="button" tabindex="0">
            <div class="cms-nav-trigger-left">
              <span class="cms-col-badge">#${idx + 1}</span>
              <strong class="col-title-display">${col.title || 'UNTITLED'}</strong>
              <span class="cms-col-type-pill ${col.type === 'link' ? 'badge-link' : 'badge-dropdown'}">
                ${col.type === 'link' ? '🔗 Hyperlink' : '▼ Dropdown'}
              </span>
              ${col.type === 'dropdown' ? `<span class="cms-chips-count-badge">${linkItems.length} items</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" class="btn-item-delete btn-delete-col" data-col-id="${col.id}" title="Delete Column" style="padding: 2px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              <svg class="cms-accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m6 9 6 6 6-6"></path></svg>
            </div>
          </div>
          <div class="cms-nav-accordion-body">
            <!-- Format Toggle -->
            <div class="form-group mb-2">
              <label class="form-label" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Column Format</label>
              <div class="col-format-toggle-bar">
                <div class="col-format-tab ${col.type === 'dropdown' ? 'active' : ''}" data-set-format="dropdown" data-col-id="${col.id}">
                  <span>▼ Dropdown (Expandable Sub-Items)</span>
                </div>
                <div class="col-format-tab ${col.type === 'link' ? 'active' : ''}" data-set-format="link" data-col-id="${col.id}">
                  <span>🔗 Simple Text with Hyperlink</span>
                </div>
              </div>
            </div>

            ${col.type === 'dropdown' ? `
              <!-- Dropdown Configuration -->
              <div class="form-group mb-2">
                <label class="form-label">Dropdown Title</label>
                <input type="text" class="form-input col-title-input" data-col-id="${col.id}" value="${col.title}" placeholder="e.g. ABOUT EMAAR">
              </div>
              <div class="form-group mb-1">
                <label class="form-label">Dropdown Items</label>
                <div class="cms-dropdown-items-list" data-chips-col="${col.id}">
                  ${linkItems.map((item, itemIdx) => `
                    <div class="cms-dropdown-item-row" data-col-id="${col.id}" data-item-idx="${itemIdx}">
                      <span class="cms-item-bullet">•</span>
                      <input type="text" class="cms-item-name-input" data-col-id="${col.id}" data-item-idx="${itemIdx}" value="${item}" placeholder="Item label...">
                      <button type="button" class="btn-item-delete btn-delete-chip" data-col-id="${col.id}" data-item-idx="${itemIdx}" title="Delete item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  `).join('')}
                </div>
                <button type="button" class="btn-add-dropdown-item btn-add-chip-action" data-add-chip="${col.id}">+ Add Item</button>
              </div>
            ` : `
              <!-- Simple Text with Hyperlink Configuration -->
              <div class="form-grid-2 mb-2">
                <div class="form-group mb-0">
                  <label class="form-label">Link Text / Label</label>
                  <input type="text" class="form-input col-title-input" data-col-id="${col.id}" value="${col.title}" placeholder="e.g. CAREERS">
                </div>
                <div class="form-group mb-0">
                  <label class="form-label">Hyperlink URL</label>
                  <input type="text" class="form-input col-url-input" data-col-id="${col.id}" value="${col.url || ''}" placeholder="https://... or /careers">
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px;">
                <input type="checkbox" id="chkNewTab_${col.id}" class="col-newtab-chk" data-col-id="${col.id}" ${col.openInNewTab ? 'checked' : ''} style="cursor: pointer;">
                <label for="chkNewTab_${col.id}" style="font-size: 11.5px; color: #475569; cursor: pointer; margin-bottom: 0;">Open link in a new tab</label>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Wire accordion open/close toggle
    container.querySelectorAll('.cms-nav-accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-col')) return;
        const colId = trigger.getAttribute('data-drawer-col');
        openFooterColId = openFooterColId === colId ? null : colId;
        renderFooterNavColumnsEditor();
      });
    });

    // Wire Column Format Tabs (Dropdown vs Link)
    container.querySelectorAll('.col-format-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const colId = tab.getAttribute('data-col-id');
        const format = tab.getAttribute('data-set-format');
        const col = footerNavColumns.find(c => c.id === colId);
        if (col && col.type !== format) {
          col.type = format;
          renderFooterNavColumnsEditor();
          syncAllModularPreviews();
        }
      });
    });

    // Wire Title Inputs
    container.querySelectorAll('.col-title-input').forEach(input => {
      input.addEventListener('input', () => {
        const colId = input.getAttribute('data-col-id');
        const col = footerNavColumns.find(c => c.id === colId);
        if (col) {
          col.title = input.value;
          const displayEl = container.querySelector(`.cms-nav-col-accordion[data-col-id="${colId}"] .col-title-display`);
          if (displayEl) displayEl.textContent = col.title || 'UNTITLED';
          syncAllModularPreviews();
        }
      });
    });

    // Wire URL Inputs
    container.querySelectorAll('.col-url-input').forEach(input => {
      input.addEventListener('input', () => {
        const colId = input.getAttribute('data-col-id');
        const col = footerNavColumns.find(c => c.id === colId);
        if (col) {
          col.url = input.value.trim();
          syncAllModularPreviews();
        }
      });
    });

    // Wire New Tab Checkbox
    container.querySelectorAll('.col-newtab-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const colId = chk.getAttribute('data-col-id');
        const col = footerNavColumns.find(c => c.id === colId);
        if (col) {
          col.openInNewTab = chk.checked;
          syncAllModularPreviews();
        }
      });
    });

    // Wire Chip Item Inputs
    container.querySelectorAll('.cms-item-name-input').forEach(input => {
      input.addEventListener('input', () => {
        const colId = input.getAttribute('data-col-id');
        const itemIdx = parseInt(input.getAttribute('data-item-idx'));
        const col = footerNavColumns.find(c => c.id === colId);
        if (col) {
          const arr = (col.links || '').split(',').map(s => s.trim()).filter(Boolean);
          arr[itemIdx] = input.value.trim();
          col.links = arr.filter(Boolean).join(', ');
          syncAllModularPreviews();
        }
      });
    });

    // Wire Delete Chip Buttons
    container.querySelectorAll('.btn-delete-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const colId = btn.getAttribute('data-col-id');
        const itemIdx = parseInt(btn.getAttribute('data-item-idx'));
        const col = footerNavColumns.find(c => c.id === colId);
        if (col) {
          const arr = (col.links || '').split(',').map(s => s.trim()).filter(Boolean);
          arr.splice(itemIdx, 1);
          col.links = arr.join(', ');
          renderFooterNavColumnsEditor();
          syncAllModularPreviews();
        }
      });
    });

    // Wire Add Chip Buttons
    container.querySelectorAll('.btn-add-chip-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const colId = btn.getAttribute('data-add-chip');
        const col = footerNavColumns.find(c => c.id === colId);
        if (col) {
          const arr = (col.links || '').split(',').map(s => s.trim()).filter(Boolean);
          arr.push('New Item');
          col.links = arr.join(', ');
          renderFooterNavColumnsEditor();
          syncAllModularPreviews();
          const listEl = container.querySelector(`[data-chips-col="${colId}"]`);
          const inputs = listEl?.querySelectorAll('.cms-item-name-input');
          if (inputs && inputs.length > 0) {
            inputs[inputs.length - 1].focus();
            inputs[inputs.length - 1].select();
          }
        }
      });
    });

    // Wire Delete Column Buttons
    container.querySelectorAll('.btn-delete-col').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colId = btn.getAttribute('data-col-id');
        const col = footerNavColumns.find(c => c.id === colId);
        if (!col) return;
        if (footerNavColumns.length <= 1) {
          showToast('At least one column is required in footer navigation.');
          return;
        }
        footerNavColumns = footerNavColumns.filter(c => c.id !== colId);
        if (openFooterColId === colId) openFooterColId = footerNavColumns[0]?.id || null;
        renderFooterNavColumnsEditor();
        syncAllModularPreviews();
        showToast(`Column "${col.title}" removed`);
      });
    });
  }

  function addNewFooterColumn() {
    const newId = 'col_' + Date.now();
    footerNavColumns.push({
      id: newId,
      type: 'dropdown',
      title: 'NEW COLUMN',
      links: 'Option 1, Option 2',
      url: '',
      openInNewTab: false
    });
    openFooterColId = newId;
    renderFooterNavColumnsEditor();
    syncAllModularPreviews();
    showToast('✓ Added new column! Customize as dropdown or hyperlink.');
    const input = document.querySelector(`.col-title-input[data-col-id="${newId}"]`);
    if (input) {
      input.focus();
      input.select();
    }
  }

  document.getElementById('btnAddFooterNavCol')?.addEventListener('click', addNewFooterColumn);
  document.getElementById('btnCardAddFooterCol')?.addEventListener('click', addNewFooterColumn);

  // Initial render of columns
  renderFooterNavColumnsEditor();

  document.getElementById('btnOpenWalkImgPicker')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Walkthrough Image',
      defaultFilter: 'image',
      onSelect: (url) => {
        const prev = document.getElementById('previewWalkImg');
        const thumb = document.getElementById('walkCurrentImgThumb');
        const pathTxt = document.getElementById('walkCurrentImgPath');
        if (prev) prev.src = url;
        if (thumb) thumb.src = url;
        if (pathTxt) pathTxt.textContent = url;
        if (!state.sections.walkthrough) state.sections.walkthrough = {};
        state.sections.walkthrough.image = url;
        showToast('✓ Walkthrough image selected! Click "Save Staged Changes" to stage.');
      }
    });
  });

  document.getElementById('btnReplaceBlog1Img')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Blog 1 Image',
      defaultFilter: 'image',
      onSelect: (url) => {
        const prev = document.getElementById('previewBlog1Img');
        const thumb = document.getElementById('blog1ThumbImg');
        const pathTxt = document.getElementById('blog1ImgPath');
        if (prev) prev.src = url;
        if (thumb) thumb.src = url;
        if (pathTxt) pathTxt.textContent = url;
        if (state.sections.blogs && state.sections.blogs.posts && state.sections.blogs.posts[0]) {
          state.sections.blogs.posts[0].image = url;
        }
        showToast('✓ Blog 1 image selected! Click "Save Staged Changes" to stage.');
      }
    });
  });

  document.getElementById('btnReplaceBlog2Img')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Blog 2 Image',
      defaultFilter: 'image',
      onSelect: (url) => {
        const prev = document.getElementById('previewBlog2Img');
        const thumb = document.getElementById('blog2ThumbImg');
        const pathTxt = document.getElementById('blog2ImgPath');
        if (prev) prev.src = url;
        if (thumb) thumb.src = url;
        if (pathTxt) pathTxt.textContent = url;
        if (state.sections.blogs && state.sections.blogs.posts && state.sections.blogs.posts[1]) {
          state.sections.blogs.posts[1].image = url;
        }
        showToast('✓ Blog 2 image selected! Click "Save Staged Changes" to stage.');
      }
    });
  });

  document.getElementById('btnOpenHeroVideoPicker')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Hero Background Video',
      defaultFilter: 'video',
      onSelect: (url) => {
        const fullVideo = document.getElementById('fullResHeroVideo');
        const fullVideoSource = document.getElementById('fullResVideoSource');
        const fullVideoInput = document.getElementById('fullResVideoUrlInput');
        if (fullVideo && fullVideoSource) {
          fullVideoSource.src = url;
          fullVideo.load();
          fullVideo.play().catch(() => {});
        }
        if (fullVideoInput) fullVideoInput.value = url;
        showToast('✓ Hero background video selected!');
      }
    });
  });

  document.getElementById('btnSettingsLogoPicker')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Replace Brand Logo',
      defaultFilter: 'image',
      onSelect: async (url) => {
        const preview = document.getElementById('settingsLogoPreview');
        if (preview) preview.src = url;
        try {
          await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_logo: url })
          });
          showToast('✓ Brand logo updated successfully!');
        } catch (e) {}
      }
    });
  });

  document.getElementById('btnOpenAddImgModal')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Select or Upload Photo for New Development',
      defaultFilter: 'image',
      onSelect: async (url) => {
        const name = await cmsModal.prompt('Enter Development Name:', 'SERENITY HILLS, GURUGRAM', 'Add Landmark Development');
        if (!name) return;
        const location = (await cmsModal.prompt('Enter Location (e.g. Gurugram, Mohali):', 'Gurugram', 'Add Landmark Location')) || 'Gurugram';
        const category = (await cmsModal.prompt('Enter Category (Residential / Commercial):', 'Residential', 'Add Landmark Category')) || 'Residential';

        try {
          const res = await fetch('/api/landmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              location,
              category,
              image: url
            })
          });
          const d = await res.json();
          if (d.success) {
            showToast(`✓ Development "${name}" added!`);
            loadLandmarks();
            loadDashboardStats();
            if (liveSyncChannel) liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
          } else {
            showToast(d.message || 'Error adding development', true);
          }
        } catch (e) {
          showToast('Error adding development', true);
        }
      }
    });
  });

  // Save Staged Text, Media & Component Content (Unified for Top and Bottom buttons)
  async function saveAllTextAndComponentContent() {
    const topBtn = document.getElementById('btnSaveTextContent');
    const btmBtn = document.getElementById('btnSaveTextContentBottom');
    if (topBtn) topBtn.disabled = true;
    if (btmBtn) btmBtn.disabled = true;

    // If an individual custom page is selected, save that page specifically!
    if (state.activeContentPageSlug && state.activeContentPageSlug !== '/') {
      await saveCustomPageContent();
      if (topBtn) topBtn.disabled = false;
      if (btmBtn) btmBtn.disabled = false;
      return;
    }

    try {
      // 0. Navigation Header
      const navLogo = document.getElementById('navLogoImgPath')?.textContent || '/images/emaar-india-logo-en.svg';
      const headerPayload = {
        phone: document.getElementById('editNavPhone')?.value || '+91 124 4421155',
        whatsapp: document.getElementById('editNavWhatsapp')?.value || '+91 124 4421155',
        cta_text: document.getElementById('editNavCtaText')?.value || 'SCHEDULE A VISIT',
        nav_links: document.getElementById('editNavLinksText')?.value || 'ABOUT US, LATEST LAUNCHES, PROJECTS, SUSTAINABILITY',
        projects_dropdown: document.getElementById('editNavProjectsDropdown')?.value || 'Residential, Commercial',
        logo: navLogo
      };

      // 1. Live Website Modular Sections
      const heroPayload = {
        ...(state.sections?.hero || {}),
        title: document.getElementById('editHeroTitle')?.value || state.sections?.hero?.title || '',
        alt: document.getElementById('editHeroAlt')?.value || state.sections?.hero?.alt || ''
      };

      const launchesPayload = {
        ...(state.sections?.launches || {}),
        kicker: document.getElementById('editLaunchesKicker')?.value || '',
        title: document.getElementById('editLaunchesTitle')?.value || '',
        lede: document.getElementById('editLaunchesLede')?.value || ''
      };

      const devsPayload = {
        ...(state.sections?.developments || {}),
        kicker: document.getElementById('editDevsKicker')?.value || '',
        title: document.getElementById('editDevsTitle')?.value || '',
        lede: document.getElementById('editDevsLede')?.value || ''
      };

      const underDevPayload = {
        ...(state.sections?.underDevelopment || {}),
        kicker: document.getElementById('editUnderDevKicker')?.value || '',
        title: document.getElementById('editUnderDevTitle')?.value || '',
        lede: document.getElementById('editUnderDevLede')?.value || ''
      };

      const commPayload = {
        ...(state.sections?.communitiesIntro || {}),
        kicker: document.getElementById('editCommKicker')?.value || '',
        title: document.getElementById('editCommTitle')?.value || '',
        lede: document.getElementById('editCommLede')?.value || ''
      };

      const propsPayload = {
        ...(state.sections?.propertiesIntro || {}),
        kicker: document.getElementById('editPropsKicker')?.value || '',
        title: document.getElementById('editPropsTitle')?.value || '',
        lede: document.getElementById('editPropsLede')?.value || ''
      };

      const legacyPayload = {
        ...(state.sections?.legacy || {}),
        title: document.getElementById('editLegacyTitle')?.value || '',
        lede: document.getElementById('editLegacyLede')?.value || ''
      };

      const pressPayload = {
        ...(state.sections?.press || {}),
        title: document.getElementById('editPressTitle')?.value || '',
        lede: document.getElementById('editPressLede')?.value || ''
      };

      const conversePayload = {
        ...(state.sections?.converse || {}),
        title: document.getElementById('editConverseTitle')?.value || '',
        lede: document.getElementById('editConverseLede')?.value || ''
      };

      // 2. Global Footer
      const footerLogo = document.getElementById('footerLogoImgPath')?.textContent || '/images/emaar-india-logo-en.svg';
      const footerPayload = {
        logo: footerLogo,
        toll_free: document.getElementById('editFooterToll')?.value || '1800-102-36227',
        email: document.getElementById('editFooterEmail')?.value || 'enquiries@emaar-india.com',
        address: document.getElementById('editFooterAddress')?.value || 'Emaar Business Park, MG Road, Gurugram, Haryana - 122002',
        rera: document.getElementById('editFooterRera')?.value || 'HARERA Reg: RC/REP/HARERA/GGM/735/467/2023/79',
        facebook: (socialChannels.find(s => s.name?.toLowerCase().includes('facebook'))?.url) || document.getElementById('editFooterFacebook')?.value || 'https://facebook.com/emaarindia',
        twitter: (socialChannels.find(s => s.name?.toLowerCase().includes('twitter') || s.name?.toLowerCase().includes('x'))?.url) || document.getElementById('editFooterTwitter')?.value || 'https://twitter.com/emaarindia',
        youtube: (socialChannels.find(s => s.name?.toLowerCase().includes('youtube'))?.url) || document.getElementById('editFooterYoutube')?.value || 'https://youtube.com/emaarindia',
        instagram: (socialChannels.find(s => s.name?.toLowerCase().includes('instagram'))?.url) || document.getElementById('editFooterInstagram')?.value || 'https://instagram.com/emaarindia',
        linkedin: (socialChannels.find(s => s.name?.toLowerCase().includes('linkedin'))?.url) || document.getElementById('editFooterLinkedin')?.value || 'https://linkedin.com/company/emaar-india',
        social_channels: socialChannels,
        news_title: document.getElementById('editFooterNewsTitle')?.value || 'SUBSCRIBE TO OUR NEWSLETTER',
        news_sub: document.getElementById('editFooterNewsSub')?.value || 'Stay updated with new project launches & insights.',
        news_placeholder: document.getElementById('editFooterNewsPlaceholder')?.value || 'Enter email',
        news_btn: document.getElementById('editFooterNewsBtn')?.value || 'SUBSCRIBE',
        news_btn_bg: document.getElementById('editFooterNewsBtnBg')?.value || '#525252',
        news_btn_color: document.getElementById('editFooterNewsBtnColor')?.value || '#ffffff',
        nav_columns: footerNavColumns,
        columns: footerNavColumns.map(c => ({
          title: c.title,
          type: c.type,
          href: c.type === 'link' ? (c.url || '#') : undefined,
          external: Boolean(c.openInNewTab),
          links: c.type === 'dropdown' ? (c.links || '').split(',').map(s => ({ label: s.trim(), href: '#' })).filter(l => l.label) : []
        })),
        col1_title: footerNavColumns[0]?.title || 'ABOUT EMAAR',
        col1_links: footerNavColumns[0]?.links || '',
        col2_title: footerNavColumns[1]?.title || 'PROJECTS',
        col2_links: footerNavColumns[1]?.links || '',
        col3_title: footerNavColumns[2]?.title || 'MASTER DEVELOPMENTS',
        col3_links: footerNavColumns[2]?.links || '',
        col4_title: footerNavColumns[3]?.title || 'LATEST LAUNCHES',
        col4_links: footerNavColumns[3]?.links || '',
        col5_title: footerNavColumns[4]?.title || 'EMAAR INTERNATIONAL',
        col5_links: footerNavColumns[4]?.links || '',
        col6_title: footerNavColumns[5]?.title || 'EMAAR HOSPITALITY',
        col6_links: footerNavColumns[5]?.links || '',
        legal_text: document.getElementById('editFooterLegal')?.value || 'Privacy Policy • Disclaimer • Terms & Conditions • Country & Language • RERA Registered',
        copyright_html: document.getElementById('editFooterCopyRich')?.innerHTML || '© 2026 Emaar India Limited. All rights reserved. Visionary architecture & enduring spaces.'
      };

      await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: {
            header: headerPayload,
            hero: heroPayload,
            launches: launchesPayload,
            developments: devsPayload,
            underDevelopment: underDevPayload,
            communitiesIntro: commPayload,
            propertiesIntro: propsPayload,
            legacy: legacyPayload,
            press: pressPayload,
            converse: conversePayload,
            footer: footerPayload
          }
        })
      });

      // Broadcast live staged change for zero-reload dynamic update on /preview!
      if (liveSyncChannel) {
        liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
      }

      showToast('✓ All staged changes saved! Live preview updated.');
      loadDashboardStats();
    } catch (err) {
      showToast('Error saving staged changes', true);
    } finally {
      if (topBtn) topBtn.disabled = false;
      if (btmBtn) btmBtn.disabled = false;
    }
  }

  document.getElementById('btnSaveTextContent')?.addEventListener('click', saveAllTextAndComponentContent);
  document.getElementById('btnSaveTextContentBottom')?.addEventListener('click', saveAllTextAndComponentContent);

  // =====================================================================
  // COMPONENT ORDER & VISIBILITY CONTROLLER (WORDPRESS-STYLE MANAGER)
  // =====================================================================
  const defaultSectionsOrder = [
    { id: "hero", name: "Hero Section & Search", visible: true },
    { id: "launches", name: "Latest Launches Stack", visible: true },
    { id: "developments", name: "Featured Developments Rail", visible: true },
    { id: "underDevelopment", name: "Under Development Rail", visible: true },
    { id: "communitiesIntro", name: "Communities Intro Stack", visible: true },
    { id: "communities", name: "Communities Collage", visible: true },
    { id: "propertiesIntro", name: "Properties Intro Stack", visible: true },
    { id: "showcase", name: "Showcase Mosaic", visible: true },
    { id: "legacy", name: "Legacy & Heritage Stats", visible: true },
    { id: "press", name: "Press Releases & News Rail", visible: true },
    { id: "converse", name: "Converse CTA & Contact", visible: true }
  ];
  let currentSectionsOrder = [...defaultSectionsOrder];

  async function loadSectionsOrder() {
    renderSectionsOrderUI();
    try {
      let res = await fetch('/api/sections-order?mode=staged');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          currentSectionsOrder = json.data;
          renderSectionsOrderUI();
          return;
        }
      }
      // Fallback to /api/site-content if /api/sections-order is not responding
      const altRes = await fetch('/api/site-content?mode=staged');
      if (altRes.ok) {
        const altJson = await altRes.json();
        if (Array.isArray(altJson.data?.sections_order) && altJson.data.sections_order.length > 0) {
          currentSectionsOrder = altJson.data.sections_order;
          renderSectionsOrderUI();
        }
      }
    } catch (e) {
      console.error('Failed to load sections order', e);
    }
  }

  function updateSectionsOrderBadges() {
    if (!currentSectionsOrder) return;
    const total = currentSectionsOrder.length;
    const visibleCount = currentSectionsOrder.filter(item => item.visible !== false).length;
    const summaryText = `${visibleCount} of ${total} Visible`;

    const summaryBadge = document.getElementById('sectionsOrderSummaryBadge');
    if (summaryBadge) summaryBadge.textContent = summaryText;

    const modalSummary = document.getElementById('modalComponentOrderSummary');
    if (modalSummary) modalSummary.textContent = `${summaryText} (${total} total sections)`;
  }

  function renderSectionsOrderUI() {
    updateSectionsOrderBadges();
    const container = document.getElementById('componentOrderListContainer');
    if (!container) return;
    if (!currentSectionsOrder || currentSectionsOrder.length === 0) {
      container.innerHTML = '<div style="color:#64748b; font-size:13px;">No components loaded.</div>';
      return;
    }

    container.innerHTML = currentSectionsOrder.map((item, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: ${item.visible !== false ? '#f8fafc' : '#f1f5f9'}; border: 1px solid ${item.visible !== false ? '#e2e8f0' : '#cbd5e1'}; border-radius: 8px; opacity: ${item.visible !== false ? '1' : '0.6'};">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; width: 22px;">#${idx + 1}</span>
          <div>
            <div style="font-weight: 600; font-size: 13px; color: #0f172a;">${item.name || item.id}</div>
            <div style="font-size: 11px; color: #64748b;">Component ID: <code>${item.id}</code></div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; cursor: pointer; margin-right: 8px;">
            <input type="checkbox" class="component-visibility-toggle" data-idx="${idx}" ${item.visible !== false ? 'checked' : ''} style="cursor: pointer;">
            <span>${item.visible !== false ? 'Visible' : 'Hidden'}</span>
          </label>
          <button type="button" class="btn btn-secondary btn-xs btn-move-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up" style="padding: 2px 7px;">↑</button>
          <button type="button" class="btn btn-secondary btn-xs btn-move-down" data-idx="${idx}" ${idx === currentSectionsOrder.length - 1 ? 'disabled' : ''} title="Move Down" style="padding: 2px 7px;">↓</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx, 10);
        if (i > 0) {
          const temp = currentSectionsOrder[i];
          currentSectionsOrder[i] = currentSectionsOrder[i - 1];
          currentSectionsOrder[i - 1] = temp;
          renderSectionsOrderUI();
        }
      });
    });

    container.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx, 10);
        if (i < currentSectionsOrder.length - 1) {
          const temp = currentSectionsOrder[i];
          currentSectionsOrder[i] = currentSectionsOrder[i + 1];
          currentSectionsOrder[i + 1] = temp;
          renderSectionsOrderUI();
        }
      });
    });

    container.querySelectorAll('.component-visibility-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const i = parseInt(chk.dataset.idx, 10);
        if (currentSectionsOrder[i]) {
          currentSectionsOrder[i].visible = chk.checked;
          renderSectionsOrderUI();
        }
      });
    });
  }

  function openComponentOrderModal() {
    const modal = document.getElementById('modalComponentOrder');
    if (!modal) return;
    renderSectionsOrderUI();
    modal.classList.add('open');
  }

  function closeComponentOrderModal() {
    const modal = document.getElementById('modalComponentOrder');
    if (modal) modal.classList.remove('open');
  }

  document.querySelectorAll('.btn-open-reorder-modal').forEach(btn => {
    btn.addEventListener('click', openComponentOrderModal);
  });
  document.getElementById('btnCloseComponentOrderModal')?.addEventListener('click', closeComponentOrderModal);
  document.getElementById('btnCancelComponentOrderModal')?.addEventListener('click', closeComponentOrderModal);
  const modalCompOrder = document.getElementById('modalComponentOrder');
  if (modalCompOrder) {
    modalCompOrder.addEventListener('click', (e) => {
      if (e.target === modalCompOrder) closeComponentOrderModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCompOrder && modalCompOrder.classList.contains('open')) {
      closeComponentOrderModal();
    }
  });

  async function saveSectionsOrder() {
    const btn = document.getElementById('btnSaveComponentOrder');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('/api/sections-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections_order: currentSectionsOrder })
      });
      if (res.ok) {
        if (liveSyncChannel) {
          liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
        }
        showToast('✓ Component layout order and visibility updated!');
        closeComponentOrderModal();
        updateSectionsOrderBadges();
      } else {
        showToast('Failed to save component layout', true);
      }
    } catch (e) {
      showToast('Error saving component layout', true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  document.getElementById('btnSaveComponentOrder')?.addEventListener('click', saveSectionsOrder);

  // =====================================================================
  // PAGE-SPECIFIC COMPONENT EDITING CONTROLLER
  // =====================================================================
  state.activeContentPageSlug = '/';

  function renderCustomPageSelectOptions() {
    const menu = document.getElementById('customPageSelectMenu');
    const label = document.getElementById('customPageSelectLabel');
    if (!menu) return;
    const currentVal = state.activeContentPageSlug || '/';

    const pages = [
      { slug: '/', title: 'Home Page' },
      ...(state.pages || []).filter(p => p.slug !== '/')
    ];

    const activePage = pages.find(p => p.slug === currentVal) || pages[0];
    if (label && activePage) {
      label.textContent = `${activePage.title} (${activePage.slug})`;
    }

    menu.innerHTML = pages.map(p => {
      const isSelected = p.slug === currentVal;
      return `
        <div class="cms-custom-select-option ${isSelected ? 'selected' : ''}" data-slug="${p.slug}" role="option" aria-selected="${isSelected}">
          <div class="option-meta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <span class="option-title">${p.title}</span>
            <code class="option-slug">${p.slug}</code>
          </div>
          <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      `;
    }).join('');

    menu.querySelectorAll('.cms-custom-select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = opt.dataset.slug;
        state.activeContentPageSlug = slug;
        const select = document.getElementById('contentEditorPageSelect');
        if (select) {
          select.value = slug;
          select.dispatchEvent(new Event('change'));
        }
        renderContentEditorForActivePage();
        closeCustomPageSelect();
      });
    });
  }

  function toggleCustomPageSelect(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const wrap = document.getElementById('pageSelectCustomWrap');
    const trigger = document.getElementById('customPageSelectTrigger');
    if (!wrap) return;
    const isOpen = wrap.classList.contains('open');
    if (isOpen) {
      closeCustomPageSelect();
    } else {
      wrap.classList.add('open');
      trigger?.setAttribute('aria-expanded', 'true');
    }
  }

  function closeCustomPageSelect() {
    const wrap = document.getElementById('pageSelectCustomWrap');
    const trigger = document.getElementById('customPageSelectTrigger');
    if (wrap) wrap.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  document.getElementById('customPageSelectTrigger')?.addEventListener('click', toggleCustomPageSelect);
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('pageSelectCustomWrap');
    if (wrap && !wrap.contains(e.target)) {
      closeCustomPageSelect();
    }
  });

  // =====================================================================
  // PAGE SELECTION LAYER (LAYER 1 BEFORE ENTERING CONTENT EDITOR)
  // =====================================================================
  let activePageCategoryFilter = 'all';

  function openContentPageSelectionLayer() {
    const selLayer = document.getElementById('contentPageSelectionLayer');
    const actLayer = document.getElementById('contentActiveEditorLayer');
    if (selLayer) selLayer.style.display = 'block';
    if (actLayer) actLayer.style.display = 'none';
    renderContentPageSelectionGrid();
  }

  function openContentActiveEditorLayer(slug) {
    state.activeContentPageSlug = slug;
    const selLayer = document.getElementById('contentPageSelectionLayer');
    const actLayer = document.getElementById('contentActiveEditorLayer');
    if (selLayer) selLayer.style.display = 'none';
    if (actLayer) actLayer.style.display = 'block';
    renderContentEditorForActivePage();
  }

  function renderContentPageSelectionGrid() {
    const grid = document.getElementById('contentPageCardsGrid');
    if (!grid) return;

    const searchInput = document.getElementById('searchPagesInContentEditor');
    const query = (searchInput?.value || '').trim().toLowerCase();

    const websiteBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : window.location.origin;

    // ONLY display real pages that genuinely exist in the database (state.pages)
    const allPagesMap = new Map();

    (state.pages || []).forEach(p => {
      const clean = p.slug === '/' ? '/' : (p.slug.startsWith('/') ? p.slug : '/' + p.slug);
      let comps = p.components;
      if (!comps || comps.length === 0) {
        if (clean === '/') {
          comps = ['Header & Navbar', 'Hero Video', 'Search Filter Bar', 'New Launches', 'Landmark Developments', 'Communities', 'Showcase', 'Footer'];
        } else if (p.template === 'property' || clean.startsWith('/properties')) {
          comps = ['Hero Banner', 'Editorial Story', 'Photo Gallery', 'Highlights', 'Location & Map', 'Amenities', 'Floorplans'];
        } else {
          comps = ['Hero Banner', 'Editorial Narrative', 'Sections', 'Footer'];
        }
      }
      allPagesMap.set(clean, {
        ...p,
        slug: clean,
        components: comps
      });
    });

    // Ensure Home Page is present if not already in state.pages
    if (!allPagesMap.has('/')) {
      allPagesMap.set('/', {
        id: 1,
        title: 'Home Page',
        slug: '/',
        template: 'home',
        status: 'published',
        hero_banner: '/images/hero-poster.jpg',
        content: 'Main landing showcase featuring cinematic video hero, search filter bar, landmark developments, communities, and curated showcases.',
        components: ['Header & Navbar', 'Hero Video', 'Search Filter Bar', 'New Launches', 'Landmark Developments', 'Communities', 'Showcase', 'Footer']
      });
    }

    let pages = Array.from(allPagesMap.values());

    // Apply Category Filter
    if (activePageCategoryFilter === 'landing') {
      pages = pages.filter(p => p.slug === '/' || p.template === 'home');
    } else if (activePageCategoryFilter === 'properties') {
      pages = pages.filter(p => p.template === 'property' || p.slug.startsWith('/properties'));
    } else if (activePageCategoryFilter === 'custom') {
      pages = pages.filter(p => p.slug !== '/' && p.template !== 'home' && p.template !== 'property' && !p.slug.startsWith('/properties'));
    }

    // Apply Search Query Filter
    if (query) {
      pages = pages.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.slug && p.slug.toLowerCase().includes(query)) ||
        (p.content && p.content.toLowerCase().includes(query))
      );
    }

    if (pages.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin: 0 auto 12px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No pages match your filter</h3>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Try adjusting your search query or clear the filter.</p>
          <button type="button" class="btn btn-secondary btn-sm" id="btnResetPageFilter">Show All Pages</button>
        </div>
      `;
      document.getElementById('btnResetPageFilter')?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        activePageCategoryFilter = 'all';
        document.querySelectorAll('#pageCategoryFilterTabs .page-filter-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'all'));
        renderContentPageSelectionGrid();
      });
      return;
    }

    grid.innerHTML = pages.map(p => {
      const isHome = p.slug === '/';
      const cleanSlug = isHome ? '/' : (p.slug.startsWith('/') ? p.slug : '/' + p.slug);
      const isPublished = p.status !== 'draft';
      const visualUrl = isHome ? `${websiteBase}/editor` : `${websiteBase}${cleanSlug}/editor`;
      const thumb = p.hero_banner || (isHome ? '/images/hero-poster.jpg' : '/images/serenity-main.jpg');
      const badgeText = isHome ? 'Main Landing' : (p.template === 'property' || p.slug.startsWith('/properties') ? 'Property Page' : 'Custom Page');
      const comps = p.components || ['Hero Banner', 'Editorial Story', 'Components'];

      return `
        <div class="page-card" data-slug="${p.slug}">
          <div class="page-card-thumb-wrap">
            <img src="${thumb}" alt="${p.title}" class="page-card-thumb" onerror="this.src='/images/landmarks/Serenity-hills-big.webp'">
            <span class="page-card-badge">${badgeText}</span>
            <span class="page-card-status ${isPublished ? 'published' : 'draft'}">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
              <span>${isPublished ? 'Published' : 'Draft'}</span>
            </span>
          </div>
          <div class="page-card-body">
            <h3 class="page-card-title">${p.title}</h3>
            <span class="page-card-slug">${cleanSlug}</span>
            <p class="page-card-summary">${p.content || 'Manage visual components, text narratives, and interactive elements for this page.'}</p>
            
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px;">Page Components:</div>
            <div class="page-card-components-chips">
              ${comps.slice(0, 6).map(c => `<span class="page-card-chip">${c}</span>`).join('')}
              ${comps.length > 6 ? `<span class="page-card-chip" style="background:#e0f2fe; color:#0369a1;">+${comps.length - 6} more</span>` : ''}
            </div>

            <div class="page-card-footer">
              <button type="button" class="page-card-btn-edit btn-select-page-to-edit" data-slug="${p.slug}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit Page Components</span>
              </button>
              <a href="${visualUrl}" target="_blank" class="page-card-btn-visual" title="Open Visual Editor directly for this page">
                <span>Editor</span>
                <span style="font-size: 11px; opacity: 0.7;">↗</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    grid.querySelectorAll('.btn-select-page-to-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        openContentActiveEditorLayer(slug);
      });
    });

    grid.querySelectorAll('.page-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        const slug = card.dataset.slug;
        if (slug) openContentActiveEditorLayer(slug);
      });
    });
  }

  // Listeners for Page Selection Layer
  document.getElementById('btnBackToPageSelection')?.addEventListener('click', () => {
    openContentPageSelectionLayer();
  });

  document.getElementById('searchPagesInContentEditor')?.addEventListener('input', () => {
    renderContentPageSelectionGrid();
  });

  document.querySelectorAll('#pageCategoryFilterTabs .page-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#pageCategoryFilterTabs .page-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activePageCategoryFilter = tab.dataset.cat || 'all';
      renderContentPageSelectionGrid();
    });
  });

  document.getElementById('btnOpenCreatePageFromSelector')?.addEventListener('click', () => {
    document.getElementById('modalNewPage')?.classList.add('open');
  });

  function populateContentEditorPageSelect() {
    const select = document.getElementById('contentEditorPageSelect');
    const currentVal = state.activeContentPageSlug || '/';
    if (select) {
      select.innerHTML = `
        <option value="/">Home Page (/)</option>
        ${(state.pages || []).filter(p => p.slug !== '/').map(p => `
          <option value="${p.slug}">${p.title} (${p.slug})</option>
        `).join('')}
      `;
      select.value = currentVal;
    }
    renderCustomPageSelectOptions();
  }

  function renderContentEditorForActivePage() {
    const slug = state.activeContentPageSlug || '/';
    const select = document.getElementById('contentEditorPageSelect');
    if (select) select.value = slug;
    const badge = document.getElementById('contentEditorActiveSlugBadge');
    if (badge) badge.textContent = slug;

    // Update custom select label and active option
    const pages = [
      { slug: '/', title: 'Home Page' },
      ...(state.pages || []).filter(p => p.slug !== '/')
    ];
    const activePage = pages.find(p => p.slug === slug) || { title: slug, slug };
    const label = document.getElementById('customPageSelectLabel');
    if (label) label.textContent = `${activePage.title} (${activePage.slug})`;
    document.querySelectorAll('#customPageSelectMenu .cms-custom-select-option').forEach(opt => {
      const isSel = opt.dataset.slug === slug;
      opt.classList.toggle('selected', isSel);
      opt.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });

    const homeWrapper = document.getElementById('homePageComponentsWrapper');
    const customWrapper = document.getElementById('customPageComponentsWrapper');
    const reorderBtnTop = document.getElementById('btnOpenReorderModalTop');
    const btnOpenVisualEditor = document.getElementById('btnOpenVisualEditor');

    const websiteBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : window.location.origin;

    if (slug === '/') {
      if (homeWrapper) homeWrapper.style.display = 'block';
      if (customWrapper) customWrapper.style.display = 'none';
      if (reorderBtnTop) reorderBtnTop.style.display = 'inline-flex';
      if (btnOpenVisualEditor) btnOpenVisualEditor.href = `${websiteBase}/editor`;
    } else {
      if (homeWrapper) homeWrapper.style.display = 'none';
      if (customWrapper) customWrapper.style.display = 'block';
      if (reorderBtnTop) reorderBtnTop.style.display = 'none';
      const cleanSlug = slug.startsWith('/') ? slug : '/' + slug;
      if (btnOpenVisualEditor) btnOpenVisualEditor.href = `${websiteBase}${cleanSlug}/editor`;
    }

      const page = (state.pages || []).find(p => p.slug === slug);
      if (page) {
        const titleEl = document.getElementById('customPageEditorTitle');
        const statusEl = document.getElementById('customPageEditorStatus');
        const slugEl = document.getElementById('customPageEditorSlug');
        const previewBtn = document.getElementById('customPagePreviewBtn');
        if (titleEl) titleEl.textContent = page.title || 'Page Details';
        if (statusEl) statusEl.textContent = page.status === 'draft' ? 'Draft' : 'Published';
        if (slugEl) slugEl.textContent = page.slug;
        if (previewBtn) {
          const targetSlug = page.slug ? (page.slug.startsWith('/') ? page.slug : '/' + page.slug) : '';
          previewBtn.href = (targetSlug && targetSlug !== '/') ? `/admin/staged?page=${encodeURIComponent(targetSlug)}` : '/admin/staged';
        }

        const heroTitleInput = document.getElementById('customEditHeroTitle');
        const heroSubInput = document.getElementById('customEditHeroSubtitle');
        const bodyContentInput = document.getElementById('customEditBodyContent');
        const bannerPath = document.getElementById('customEditHeroBannerPath');
        const bannerThumb = document.getElementById('customEditHeroBannerThumb');
        const previewHeroTitle = document.getElementById('customPreviewHeroTitle');
        const previewHeroSub = document.getElementById('customPreviewHeroSubtitle');
        const previewHeroBg = document.getElementById('customPreviewHeroBg');

        const initialTitle = page.hero_title || page.title || 'Page Headline';
        const initialSub = page.hero_subtitle || 'Exclusive Landmark Living';
        const initialBanner = page.hero_banner || '/images/serenity-main.jpg';
        const initialBannerMobile = page.hero_banner_mobile || initialBanner;

        if (heroTitleInput) heroTitleInput.value = page.hero_title || page.title || '';
        if (heroSubInput) heroSubInput.value = page.hero_subtitle || '';
        if (bodyContentInput) bodyContentInput.value = page.content || '';
        if (bannerPath) bannerPath.textContent = initialBanner;
        if (bannerThumb) bannerThumb.src = initialBanner;
        if (previewHeroTitle) previewHeroTitle.textContent = initialTitle;
        if (previewHeroSub) previewHeroSub.textContent = initialSub;
        if (previewHeroBg) previewHeroBg.src = initialBanner;

        // Populate new Hero fields
        const eyebrowInput = document.getElementById('customEditHeroEyebrow');
        const mobilePath = document.getElementById('customEditHeroMobilePath');
        const mobileThumb = document.getElementById('customEditHeroMobileThumb');
        const brochureInput = document.getElementById('customEditBrochureUrl');
        const floorplanInput = document.getElementById('customEditFloorplanUrl');
        const disclaimerInput = document.getElementById('customEditHeroDisclaimer');

        if (eyebrowInput) eyebrowInput.value = page.hero_eyebrow || 'COME HOME TO ACRES OF NATURE';
        if (mobilePath) mobilePath.textContent = initialBannerMobile;
        if (mobileThumb) mobileThumb.src = initialBannerMobile;
        if (brochureInput) brochureInput.value = page.brochure_url || '/brochures/serenity-hills.pdf';
        if (floorplanInput) floorplanInput.value = page.floorplan_url || '/floorplans/serenity-hills.pdf';
        if (disclaimerInput) disclaimerInput.value = (Array.isArray(page.disclaimer) ? page.disclaimer.join(' ') : page.disclaimer) || 'PROMOTION: HARERA Registration No...';

        // Overview & Architectural Facts
        const overviewHeadlineInput = document.getElementById('customEditOverviewHeadline');
        if (overviewHeadlineInput) overviewHeadlineInput.value = page.overview?.title || page.overview_headline || 'The Vision of Refined Living';

        const defaultFacts = [
          { value: '50+ ACRES', label: 'Master-Planned Township' },
          { value: '4 TOWERS', label: 'Sculpted Architecture' },
          { value: '80% OPEN', label: 'Landscaped Greens' },
          { value: '1.2M SQ.FT', label: 'Club & Wellness' }
        ];
        const facts = page.overview?.facts || defaultFacts;
        for (let fi = 0; fi < 4; fi++) {
          const vEl = document.getElementById(`customFactVal${fi}`);
          const lEl = document.getElementById(`customFactLbl${fi}`);
          if (vEl) vEl.value = facts[fi]?.value || defaultFacts[fi].value;
          if (lEl) lEl.value = facts[fi]?.label || defaultFacts[fi].label;
        }

        // Architectural Highlights
        const defaultHighlights = [
          {
            title: "Life, Framed by Nature",
            text: "At the heart of Serenity Hills lies an 8-acre Central Greens, a canvas of pathways, courtyards, gardens and water features.",
            image: { src: "/images/properties/serenity-hills/highlight-1.webp", alt: "Central Greens" }
          },
          {
            title: "The Art of Living Well",
            text: "An Olympic pool, a spa, yoga lawns, swimming pools and multi-sport arenas make wellness feel effortless.",
            image: { src: "/images/properties/serenity-hills/highlight-2.webp", alt: "Pool & Cabanas" }
          }
        ];
        activePageHighlights = (page.highlights?.items && page.highlights.items.length > 0)
          ? page.highlights.items.map(h => ({
              title: h.title || '',
              text: h.text || '',
              image: typeof h.image === 'object' ? { ...h.image } : { src: h.image, alt: h.title }
            }))
          : defaultHighlights;
        renderCustomHighlightsList();

        // Curated Photo Gallery
        const defaultGallery = [
          { src: "/images/properties/serenity-hills/gallery-ext-1.webp", alt: "Towers and landscape" },
          { src: "/images/properties/serenity-hills/gallery-ext-2.webp", alt: "Children's play area" },
          { src: "/images/properties/serenity-hills/gallery-ext-3.webp", alt: "Water garden and walkway" },
          { src: "/images/properties/serenity-hills/gallery-int-1.webp", alt: "Living room interior" }
        ];
        const rawGallery = page.gallery?.tabs?.[0]?.images || page.gallery?.images || defaultGallery;
        activePageGallery = rawGallery.map(g => ({
          src: g.src || g,
          alt: g.alt || 'Gallery photo'
        }));
        renderCustomGalleryList();

        // Luxury Amenities Grid
        const defaultAmenities = [
          { label: "Cycling Track" }, { label: "Olympic Pool" }, { label: "Luxury Spa" },
          { label: "Floating Deck" }, { label: "Yoga & Meditation" }, { label: "Kids' Play Area" },
          { label: "Community Lawn" }, { label: "Sports Arenas" }, { label: "Pet Park" },
          { label: "Jogging Trail" }, { label: "Lake & Waterbodies" }, { label: "Clubhouse" }
        ];
        activePageAmenities = (page.amenities?.items && page.amenities.items.length > 0)
          ? page.amenities.items.map(a => ({ label: a.label || a.title || '' }))
          : defaultAmenities;
        renderCustomAmenitiesList();

        // Connectivity & Township Stats
        const conn = page.connectivity || {};
        const connHead = document.getElementById('customEditConnectHeadline');
        const connLede = document.getElementById('customEditConnectLede');
        if (connHead) connHead.value = conn.title || 'Connected to Gurugram. Closer to Calm.';
        if (connLede) connLede.value = (Array.isArray(conn.text) ? conn.text.join(' ') : conn.text) || 'Set in Sector 86 with direct frontage on a 75-metre road, Serenity Hills flows seamlessly onto NH-48 and Dwarka Expressway.';

        const defaultStats = ["8 acres • Central Greens", "13 • Sculpted Towers", "25.9 acres • Township"];
        for (let si = 0; si < 3; si++) {
          const sInput = document.getElementById(`customEditStat${si}`);
          if (sInput) {
            const statObj = conn.stats?.[si];
            sInput.value = statObj ? `${statObj.value} • ${statObj.label}` : defaultStats[si];
          }
        }

        // Active sections checkboxes
        const activeSecs = page.sections || ['hero', 'overview', 'projects', 'amenities', 'cta'];
        document.querySelectorAll('input[name="customPageSection"]').forEach(cb => {
          cb.checked = activeSecs.includes(cb.value);
        });

        // Project Interactive Map & Landmark Locations Manager
        const mapCard = document.getElementById('customPageMapSectionCard');
        const isPropertyPage = slug.includes('/properties/') || slug.includes('serenity-hills') || page.template === 'property' || Boolean(page.location);
        if (mapCard) {
          mapCard.style.display = isPropertyPage ? 'block' : 'none';
        }

        if (isPropertyPage) {
          const originNameInput = document.getElementById('mapOriginName');
          const originLatInput = document.getElementById('mapOriginLat');
          const originLngInput = document.getElementById('mapOriginLng');

          const defaultOrigin = {
            name: "Serenity Hills",
            coords: [77.0660397, 28.4269689] // Samaspur / Sector 51-57 Gurugram
          };

          const loc = page.location || { origin: defaultOrigin, destinations: [] };
          const origin = loc.origin || defaultOrigin;

          if (originNameInput) originNameInput.value = origin.name || 'Serenity Hills';
          if (originLatInput) originLatInput.value = origin.coords ? origin.coords[1] : 28.4269689;
          if (originLngInput) originLngInput.value = origin.coords ? origin.coords[0] : 77.0660397;

          const defaultDestinations = [
            { name: "Cloverleaf (Dwarka Expy / NH-48)", coords: [76.9900132, 28.4069395] },
            { name: "Delhi Public School", coords: [76.9597526, 28.4063222] },
            { name: "Apollo Cradle", coords: [76.9530944, 28.3926184] },
            { name: "Hyatt Regency", coords: [76.9769075, 28.3919521] },
            { name: "Iris Broadway", coords: [76.9454175, 28.4035483] },
            { name: "St. Xavier's High School", coords: [77.0579754, 28.407035] }
          ];

          activePageDestinations = (loc.destinations && loc.destinations.length > 0)
            ? loc.destinations.map(d => ({
                name: d.name,
                coords: Array.isArray(d.coords) ? [...d.coords] : [77.0660397, 28.4269689]
              }))
            : defaultDestinations;
          renderMapDestinationsList();
          setTimeout(() => {
            initOrUpdateCmsPropertyMap(origin);
          }, 100);
        }
      }
    }

  let activePageHighlights = [];
  let activePageGallery = [];
  let activePageAmenities = [];

  function renderCustomHighlightsList() {
    const listEl = document.getElementById('customHighlightsList');
    if (!listEl) return;
    listEl.innerHTML = (activePageHighlights || []).map((h, i) => `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; display:flex; gap:12px; align-items:flex-start;">
        <div style="width:110px; flex-shrink:0;">
          <img src="${h.image?.src || h.image || '/images/serenity-main.jpg'}" alt="Highlight" style="width:110px; height:74px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; margin-bottom:6px;">
          <button type="button" class="btn btn-secondary btn-xs btn-replace-highlight-img" data-index="${i}" style="width:100%; font-size:10.5px; padding:2px 4px;">Replace Media</button>
        </div>
        <div style="flex:1;">
          <input type="text" class="form-input highlight-title-input" data-index="${i}" value="${escapeHtml(h.title || '')}" placeholder="Highlight Title" style="font-weight:700; font-size:13px; margin-bottom:6px;">
          <textarea class="form-textarea highlight-text-input" data-index="${i}" rows="2" placeholder="Highlight narrative..." style="font-size:12px; min-height:50px;">${escapeHtml(h.text || '')}</textarea>
        </div>
        <button type="button" class="btn-del-highlight" data-index="${i}" title="Delete Highlight" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px; font-weight:700;">✕</button>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-replace-highlight-img').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        openMediaPicker({
          title: `Select Image for Highlight #${idx + 1}`,
          defaultFilter: 'image',
          onSelect: (url) => {
            if (activePageHighlights[idx]) {
              if (typeof activePageHighlights[idx].image === 'object') {
                activePageHighlights[idx].image.src = url;
              } else {
                activePageHighlights[idx].image = { src: url, alt: activePageHighlights[idx].title || 'Highlight' };
              }
              renderCustomHighlightsList();
              showToast('✓ Highlight image updated!');
            }
          }
        });
      });
    });

    listEl.querySelectorAll('.highlight-title-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index, 10);
        if (activePageHighlights[idx]) activePageHighlights[idx].title = input.value;
      });
    });

    listEl.querySelectorAll('.highlight-text-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index, 10);
        if (activePageHighlights[idx]) activePageHighlights[idx].text = input.value;
      });
    });

    listEl.querySelectorAll('.btn-del-highlight').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        activePageHighlights.splice(idx, 1);
        renderCustomHighlightsList();
        showToast('Highlight removed');
      });
    });
  }

  function renderCustomGalleryList() {
    const listEl = document.getElementById('customGalleryList');
    if (!listEl) return;
    listEl.innerHTML = (activePageGallery || []).map((g, i) => `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px; position:relative;">
        <img src="${g.src || '/images/serenity-main.jpg'}" alt="${escapeHtml(g.alt || 'Photo')}" style="width:100%; height:120px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; margin-bottom:6px;">
        <input type="text" class="form-input gallery-caption-input" data-index="${i}" value="${escapeHtml(g.alt || '')}" placeholder="Caption / Alt text" style="font-size:11.5px; margin-bottom:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn btn-secondary btn-xs btn-replace-gallery-img" data-index="${i}" style="font-size:10.5px;">Replace</button>
          <button type="button" class="btn-del-gallery" data-index="${i}" title="Delete Photo" style="background:none; border:none; color:#ef4444; font-size:11px; cursor:pointer;">✕ Delete</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-replace-gallery-img').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        openMediaPicker({
          title: `Select Image for Gallery Photo #${idx + 1}`,
          defaultFilter: 'image',
          onSelect: (url) => {
            if (activePageGallery[idx]) {
              activePageGallery[idx].src = url;
              renderCustomGalleryList();
              showToast('✓ Photo updated!');
            }
          }
        });
      });
    });

    listEl.querySelectorAll('.gallery-caption-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index, 10);
        if (activePageGallery[idx]) activePageGallery[idx].alt = input.value;
      });
    });

    listEl.querySelectorAll('.btn-del-gallery').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        activePageGallery.splice(idx, 1);
        renderCustomGalleryList();
        showToast('Photo removed');
      });
    });
  }

  function renderCustomAmenitiesList() {
    const listEl = document.getElementById('customAmenitiesList');
    if (!listEl) return;
    listEl.innerHTML = (activePageAmenities || []).map((am, i) => `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; display:flex; align-items:center; gap:8px;">
        <span style="font-size:13px; color:#64748b;">✦</span>
        <input type="text" class="form-input amenity-label-input" data-index="${i}" value="${escapeHtml(am.label || am.title || '')}" placeholder="Amenity Name" style="font-size:12px; padding:4px 6px; flex:1;">
        <button type="button" class="btn-del-amenity" data-index="${i}" title="Delete" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer;">✕</button>
      </div>
    `).join('');

    listEl.querySelectorAll('.amenity-label-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index, 10);
        if (activePageAmenities[idx]) {
          activePageAmenities[idx].label = input.value;
          activePageAmenities[idx].title = input.value;
        }
      });
    });

    listEl.querySelectorAll('.btn-del-amenity').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        activePageAmenities.splice(idx, 1);
        renderCustomAmenitiesList();
      });
    });
  }

  let activePageDestinations = [];
  let cmsMapInstance = null;
  let cmsMapOriginMarker = null;
  let cmsMapDestMarker = null;
  let cmsMapDestPopup = null;
  let cmsActiveDestIndex = null;

  function renderCmsMapChips() {
    const chipsBar = document.getElementById('cmsMapChipsBar');
    if (!chipsBar) return;

    const chipsHtml = (activePageDestinations || []).map((dest, i) => {
      const isSel = cmsActiveDestIndex === i;
      return `
        <button
          type="button"
          class="cms-loc-chip"
          data-index="${i}"
          style="
            background: ${isSel ? '#111111' : '#ffffff'};
            color: ${isSel ? '#ffffff' : '#111111'};
            border: 1px solid #111111;
            padding: 5px 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            cursor: pointer;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            transition: all 0.15s ease;
            white-space: nowrap;
          "
        >
          ${escapeHtml(dest.name || 'Location')}
        </button>
      `;
    }).join('');

    const newBtnHtml = `
      <button
        type="button"
        id="btnMapAddLocationChip"
        style="
          background: #111111;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 5px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        "
        onmouseenter="this.style.background='#262626'"
        onmouseleave="this.style.background='#111111'"
      >
        <span style="font-size: 13px; line-height: 1;">+</span>
        <span>New</span>
      </button>
    `;

    chipsBar.innerHTML = chipsHtml + newBtnHtml;

    // Chip click listeners
    chipsBar.querySelectorAll('.cms-loc-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        selectCmsMapDestination(idx);
      });
    });

    // "+ New" button on map
    document.getElementById('btnMapAddLocationChip')?.addEventListener('click', () => {
      const inlineCard = document.getElementById('addDestinationInlineCard');
      const formTitle = document.getElementById('destinationFormTitle');
      const editIdxInput = document.getElementById('editDestinationIndex');
      const nameInput = document.getElementById('newDestName');
      const latInput = document.getElementById('newDestLat');
      const lngInput = document.getElementById('newDestLng');

      if (editIdxInput) editIdxInput.value = '-1';
      if (formTitle) formTitle.textContent = 'Add New Landmark Location';
      if (nameInput) nameInput.value = '';
      if (latInput) latInput.value = '';
      if (lngInput) lngInput.value = '';

      if (inlineCard) {
        inlineCard.style.display = 'block';
        inlineCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        nameInput?.focus();
      }
    });
  }

  async function selectCmsMapDestination(index) {
    if (!cmsMapInstance) return;
    const map = cmsMapInstance;

    if (cmsActiveDestIndex === index) {
      // Toggle off / deselect
      cmsActiveDestIndex = null;
      cmsMapDestMarker?.remove();
      cmsMapDestPopup?.remove();
      if (map.getLayer('cms-route-line')) map.removeLayer('cms-route-line');
      if (map.getSource('cms-route')) map.removeSource('cms-route');

      const originLng = parseFloat(document.getElementById('mapOriginLng')?.value) || 77.0660397;
      const originLat = parseFloat(document.getElementById('mapOriginLat')?.value) || 28.4269689;
      map.flyTo({ center: [originLng, originLat], zoom: 11, duration: 600 });
      renderCmsMapChips();
      return;
    }

    cmsActiveDestIndex = index;
    renderCmsMapChips();

    const dest = activePageDestinations[index];
    if (!dest || !dest.coords) return;

    const originLng = parseFloat(document.getElementById('mapOriginLng')?.value) || 77.0660397;
    const originLat = parseFloat(document.getElementById('mapOriginLat')?.value) || 28.4269689;
    const originCoords = [originLng, originLat];

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.join(',')};${dest.coords.join(',')}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== 'Ok' || !json.routes?.[0]) throw new Error('Route not found');

      const route = json.routes[0];
      const line = { type: 'Feature', geometry: route.geometry };

      if (map.getSource('cms-route')) {
        map.getSource('cms-route').setData(line);
      } else {
        map.addSource('cms-route', { type: 'geojson', data: line });
        map.addLayer({
          id: 'cms-route-line',
          type: 'line',
          source: 'cms-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#111111', 'line-width': 4 }
        });
      }

      cmsMapDestMarker?.remove();
      cmsMapDestPopup?.remove();

      cmsMapDestMarker = new window.maplibregl.Marker({ color: '#111111' })
        .setLngLat(dest.coords)
        .addTo(map);

      const distanceStr = route.distance < 1000 ? `${Math.round(route.distance)} m` : `${(route.distance / 1000).toFixed(1)} km`;
      const durationMins = Math.max(1, Math.round(route.duration / 60));
      const durationStr = durationMins >= 60 ? `${Math.floor(durationMins / 60)} hr ${durationMins % 60} min` : `${durationMins} min`;

      const popupContent = `
        <div style="font-family: inherit; padding: 4px 6px;">
          <div style="font-weight: 700; font-size: 13px; color: #111;">${escapeHtml(dest.name)}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">🚗 ${distanceStr} · ${durationStr} drive</div>
          <a href="https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${dest.coords[1]},${dest.coords[0]}&travelmode=driving" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 10.5px; color: #2563eb; text-decoration: underline; margin-top: 4px;">Get directions ↗</a>
        </div>
      `;

      cmsMapDestPopup = new window.maplibregl.Popup({ closeOnClick: false, offset: 30 })
        .setLngLat(dest.coords)
        .setHTML(popupContent)
        .addTo(map);

      const bounds = new window.maplibregl.LngLatBounds();
      route.geometry.coordinates.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, { padding: { top: 90, bottom: 40, left: 40, right: 40 }, maxZoom: 15, duration: 700 });
    } catch (err) {
      console.warn('Failed to load OSRM route in CMS map:', err);
    }
  }

  function initOrUpdateCmsPropertyMap(origin) {
    if (typeof window === 'undefined' || !window.maplibregl) {
      setTimeout(() => initOrUpdateCmsPropertyMap(origin), 250);
      return;
    }

    const container = document.getElementById('cmsPropertyLiveMap');
    if (!container) return;

    const coords = origin?.coords || [77.0660397, 28.4269689];

    if (!cmsMapInstance) {
      cmsMapInstance = new window.maplibregl.Map({
        container: 'cmsPropertyLiveMap',
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: coords,
        zoom: 11,
        cooperativeGestures: true,
        attributionControl: { compact: true }
      });

      cmsMapInstance.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      // Click on map to populate Lat/Lng for a new destination
      cmsMapInstance.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const inlineCard = document.getElementById('addDestinationInlineCard');
        if (inlineCard && inlineCard.style.display !== 'none') {
          const latInput = document.getElementById('newDestLat');
          const lngInput = document.getElementById('newDestLng');
          if (latInput) latInput.value = lat.toFixed(7);
          if (lngInput) lngInput.value = lng.toFixed(7);
          showToast(`📍 Coordinates pinned from map: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        }
      });
    }

    const map = cmsMapInstance;
    map.resize();

    // Update origin pin
    cmsMapOriginMarker?.remove();
    const dot = document.createElement('div');
    dot.style.cssText = 'width: 16px; height: 16px; border-radius: 50%; background: #111111; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
    cmsMapOriginMarker = new window.maplibregl.Marker({ element: dot })
      .setLngLat(coords)
      .addTo(map);

    renderCmsMapChips();
  }

  function renderMapDestinationsList() {
    renderCmsMapChips();
    const listEl = document.getElementById('mapDestinationsList');
    if (!listEl) return;
    if (!activePageDestinations || activePageDestinations.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 16px; text-align: center; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; color: #64748b; font-size: 12px;">
          No landmark buttons added yet. Click <strong>"+ Add New Location"</strong> above to add buttons to the interactive map.
        </div>
      `;
      return;
    }

    listEl.innerHTML = activePageDestinations.map((dest, idx) => {
      const lat = dest.coords ? dest.coords[1] : '';
      const lng = dest.coords ? dest.coords[0] : '';
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">
              ${idx + 1}
            </div>
            <div style="min-width: 0;">
              <div style="font-size: 13px; font-weight: 700; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(dest.name || 'Location')}
              </div>
              <div style="font-size: 11px; color: #64748b; font-family: monospace;">
                Lat: ${lat}, Lng: ${lng}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            <button type="button" class="btn btn-outline btn-xs btn-edit-map-dest" data-index="${idx}" style="font-size: 11px; padding: 3px 8px;">Edit</button>
            <button type="button" class="btn btn-outline btn-xs btn-del-map-dest" data-index="${idx}" style="font-size: 11px; padding: 3px 8px; color: #ef4444; border-color: #fecaca;">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Edit & Delete button listeners
    listEl.querySelectorAll('.btn-edit-map-dest').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const item = activePageDestinations[idx];
        if (!item) return;
        const inlineCard = document.getElementById('addDestinationInlineCard');
        const formTitle = document.getElementById('destinationFormTitle');
        const editIdxInput = document.getElementById('editDestinationIndex');
        const nameInput = document.getElementById('newDestName');
        const latInput = document.getElementById('newDestLat');
        const lngInput = document.getElementById('newDestLng');

        if (editIdxInput) editIdxInput.value = idx;
        if (formTitle) formTitle.textContent = `Edit Landmark: ${item.name}`;
        if (nameInput) nameInput.value = item.name || '';
        if (latInput) latInput.value = item.coords ? item.coords[1] : '';
        if (lngInput) lngInput.value = item.coords ? item.coords[0] : '';
        if (inlineCard) {
          inlineCard.style.display = 'block';
          inlineCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    listEl.querySelectorAll('.btn-del-map-dest').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.index, 10);
        const item = activePageDestinations[idx];
        const confirmed = await cmsModal.confirm(`Delete landmark "${item?.name || 'Location'}" from the map?`, 'Delete Landmark', 'Delete', true);
        if (!confirmed) return;
        activePageDestinations.splice(idx, 1);
        renderMapDestinationsList();
        await saveCustomPageContent(true);
        showToast('✓ Landmark location deleted from map!');
      });
    });
  }

  // Toggle Add Destination Form
  document.getElementById('btnToggleAddDestinationForm')?.addEventListener('click', () => {
    const inlineCard = document.getElementById('addDestinationInlineCard');
    const formTitle = document.getElementById('destinationFormTitle');
    const editIdxInput = document.getElementById('editDestinationIndex');
    const nameInput = document.getElementById('newDestName');
    const latInput = document.getElementById('newDestLat');
    const lngInput = document.getElementById('newDestLng');

    if (editIdxInput) editIdxInput.value = '-1';
    if (formTitle) formTitle.textContent = 'Add New Landmark Location';
    if (nameInput) nameInput.value = '';
    if (latInput) latInput.value = '';
    if (lngInput) lngInput.value = '';

    if (inlineCard) {
      inlineCard.style.display = inlineCard.style.display === 'none' ? 'block' : 'none';
      if (inlineCard.style.display === 'block') {
        nameInput?.focus();
      }
    }
  });

  const closeDestForm = () => {
    const inlineCard = document.getElementById('addDestinationInlineCard');
    if (inlineCard) inlineCard.style.display = 'none';
  };
  document.getElementById('btnCancelDestinationForm')?.addEventListener('click', closeDestForm);
  document.getElementById('btnCancelDestinationForm2')?.addEventListener('click', closeDestForm);

  document.getElementById('btnSaveDestinationItem')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('newDestName');
    const latInput = document.getElementById('newDestLat');
    const lngInput = document.getElementById('newDestLng');
    const editIdxInput = document.getElementById('editDestinationIndex');

    const name = nameInput?.value.trim();
    const lat = parseFloat(latInput?.value);
    const lng = parseFloat(lngInput?.value);
    const idx = parseInt(editIdxInput?.value ?? '-1', 10);

    if (!name) {
      showToast('Please enter a location name for the button label.', true);
      nameInput?.focus();
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      showToast('Please enter valid decimal coordinates (Latitude & Longitude).', true);
      return;
    }

    const newItem = {
      name,
      coords: [lng, lat] // [longitude, latitude]
    };

    if (idx >= 0 && idx < activePageDestinations.length) {
      activePageDestinations[idx] = newItem;
      showToast(`✓ Updated location "${name}"`);
    } else {
      activePageDestinations.push(newItem);
      showToast(`✓ Added landmark button "${name}"`);
    }

    renderMapDestinationsList();
    closeDestForm();
    await saveCustomPageContent(true);
  });

  function openContentEditorForPage(slug = '/') {
    state.activeContentPageSlug = slug;
    switchTab('content', 'text');
    populateContentEditorPageSelect();
    renderContentEditorForActivePage();
  }

  // Hook custom page live preview and replace media listeners
  document.getElementById('customEditHeroTitle')?.addEventListener('input', (e) => {
    const titleEl = document.getElementById('customPreviewHeroTitle');
    if (titleEl) titleEl.textContent = e.target.value || 'Page Headline';
  });
  document.getElementById('customEditHeroSubtitle')?.addEventListener('input', (e) => {
    const subEl = document.getElementById('customPreviewHeroSubtitle');
    if (subEl) subEl.textContent = e.target.value || 'Hero Subtitle';
  });
  document.getElementById('btnReplaceCustomHeroBanner')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Select Hero Banner for Page',
      defaultFilter: 'image',
      onSelect: (url) => {
        const thumb = document.getElementById('customEditHeroBannerThumb');
        const path = document.getElementById('customEditHeroBannerPath');
        const previewBg = document.getElementById('customPreviewHeroBg');
        if (thumb) thumb.src = url;
        if (path) path.textContent = url;
        if (previewBg) previewBg.src = url;
        showToast('✓ Hero desktop banner selected! Click "Save Page Changes" to apply.');
      }
    });
  });

  document.getElementById('btnReplaceCustomHeroMobile')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Select Mobile Hero Banner (750×1000)',
      defaultFilter: 'image',
      onSelect: (url) => {
        const thumb = document.getElementById('customEditHeroMobileThumb');
        const path = document.getElementById('customEditHeroMobilePath');
        if (thumb) thumb.src = url;
        if (path) path.textContent = url;
        showToast('✓ Hero mobile banner selected! Click "Save Page Changes" to apply.');
      }
    });
  });

  document.getElementById('btnAddHighlightItem')?.addEventListener('click', () => {
    activePageHighlights.push({
      title: 'New Architectural Feature',
      text: 'Detailed description of this distinctive architectural highlight and craftsmanship...',
      image: { src: '/images/serenity-main.jpg', alt: 'Feature' }
    });
    renderCustomHighlightsList();
    showToast('✓ Added new highlight card! Click "Replace" to choose photo.');
  });

  document.getElementById('btnAddGalleryItem')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Select Photo to Add to Gallery',
      defaultFilter: 'image',
      onSelect: (url) => {
        activePageGallery.push({
          src: url,
          alt: 'Curated Gallery View'
        });
        renderCustomGalleryList();
        showToast('✓ Photo added to gallery!');
      }
    });
  });

  document.getElementById('btnAddAmenityItem')?.addEventListener('click', async () => {
    const label = await cmsModal.prompt('Enter Amenity Name (e.g. Infinity Lap Pool, Badminton Court):', '', 'Add Luxury Amenity');
    if (label && label.trim()) {
      activePageAmenities.push({ label: label.trim() });
      renderCustomAmenitiesList();
      showToast(`✓ Amenity "${label.trim()}" added!`);
    }
  });

  document.getElementById('contentEditorPageSelect')?.addEventListener('change', (e) => {
    state.activeContentPageSlug = e.target.value;
    renderContentEditorForActivePage();
  });

  async function saveCustomPageContent(isSilent = false) {
    const slug = state.activeContentPageSlug;
    const page = (state.pages || []).find(p => p.slug === slug);
    if (!page) return;

    const selectedSections = Array.from(document.querySelectorAll('input[name="customPageSection"]:checked')).map(cb => cb.value);

    // Location / Map configuration
    const originLat = parseFloat(document.getElementById('mapOriginLat')?.value);
    const originLng = parseFloat(document.getElementById('mapOriginLng')?.value);
    const originName = document.getElementById('mapOriginName')?.value.trim() || 'Serenity Hills';

    let locationPayload = null;
    if (!isNaN(originLat) && !isNaN(originLng)) {
      locationPayload = {
        origin: {
          name: originName,
          coords: [originLng, originLat] // [lng, lat]
        },
        destinations: activePageDestinations || []
      };
    }

    // Facts
    const factsPayload = [];
    for (let fi = 0; fi < 4; fi++) {
      const v = document.getElementById(`customFactVal${fi}`)?.value.trim();
      const l = document.getElementById(`customFactLbl${fi}`)?.value.trim();
      if (v || l) factsPayload.push({ value: v || '', label: l || '' });
    }

    // Connectivity stats
    const connStatsPayload = [];
    for (let si = 0; si < 3; si++) {
      const val = document.getElementById(`customEditStat${si}`)?.value.trim();
      if (val) {
        const parts = val.split('•');
        connStatsPayload.push({
          value: parts[0]?.trim() || val,
          label: parts[1]?.trim() || ''
        });
      }
    }

    const heroBannerDesktop = document.getElementById('customEditHeroBannerPath')?.textContent.trim() || page.hero_banner || '/images/serenity-main.jpg';
    const heroBannerMobile = document.getElementById('customEditHeroMobilePath')?.textContent.trim() || heroBannerDesktop;

    const payload = {
      hero_title: document.getElementById('customEditHeroTitle')?.value.trim() || page.title,
      hero_subtitle: document.getElementById('customEditHeroSubtitle')?.value.trim() || '',
      hero_eyebrow: document.getElementById('customEditHeroEyebrow')?.value.trim() || 'COME HOME TO ACRES OF NATURE',
      hero_banner: heroBannerDesktop,
      hero_banner_mobile: heroBannerMobile,
      brochure_url: document.getElementById('customEditBrochureUrl')?.value.trim() || '',
      floorplan_url: document.getElementById('customEditFloorplanUrl')?.value.trim() || '',
      disclaimer: document.getElementById('customEditHeroDisclaimer')?.value.trim() || '',
      content: document.getElementById('customEditBodyContent')?.value.trim() || '',
      overview: {
        title: document.getElementById('customEditOverviewHeadline')?.value.trim() || 'The Vision of Refined Living',
        description: [document.getElementById('customEditBodyContent')?.value.trim() || ''],
        facts: factsPayload
      },
      highlights: {
        eyebrow: 'Highlights',
        items: activePageHighlights || []
      },
      gallery: {
        eyebrow: 'Gallery',
        tabs: [
          {
            key: 'exterior',
            label: 'Exterior',
            images: activePageGallery || []
          }
        ]
      },
      amenities: {
        eyebrow: 'Amenities',
        title: 'Designed for Living Well',
        items: activePageAmenities || []
      },
      connectivity: {
        title: document.getElementById('customEditConnectHeadline')?.value.trim() || 'Connected to Gurugram. Closer to Calm.',
        text: [document.getElementById('customEditConnectLede')?.value.trim() || ''],
        stats: connStatsPayload
      },
      sections: selectedSections,
      ...(locationPayload ? { location: locationPayload } : {})
    };

    try {
      if (!isSilent) showToast(`Saving changes for "${page.title}"...`);
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        Object.assign(page, payload);
        if (!isSilent) showToast(`✓ Changes saved for "${page.title}"!`);
        if (liveSyncChannel) {
          liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
        }
        loadPages();
        loadDashboardStats();
      } else {
        if (!isSilent) showToast(d.message || 'Error saving page', true);
      }
    } catch (err) {
      if (!isSilent) showToast('Error saving page changes', true);
    }
  }

  document.getElementById('btnSaveCustomPageDirect')?.addEventListener('click', () => saveCustomPageContent(false));
  document.getElementById('btnSaveCustomPageBottom')?.addEventListener('click', () => saveCustomPageContent(false));

  // =====================================================================
  // 6. PAGES
  // =====================================================================
  async function loadPages() {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success && data.data) {
        state.pages = data.data;
        renderPages();
        populateContentEditorPageSelect();
        renderContentPageSelectionGrid();
        attachOverviewEditPageListeners();
      }
    } catch (e) {}
  }

  function renderPages() {
    const tbody = document.getElementById('dashboardPagesTable');
    if (tbody) {
      tbody.innerHTML = '';
      (state.pages || []).forEach(p => {
        const cleanSlug = p.slug === '/' ? '/' : (p.slug.startsWith('/') ? p.slug : '/' + p.slug);
        const liveUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? `http://localhost:3000${cleanSlug}`
          : `${window.location.origin}${cleanSlug}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${p.title}</strong></td>
          <td><code style="color:#09090b;background:#f4f4f5;padding:2px 6px;border-radius:4px;font-weight:600;">${p.slug}</code></td>
          <td><span class="badge-pill">${p.template || 'standard'}</span></td>
          <td><span class="live-pill" style="${p.status === 'draft' ? 'background:#f1f5f9; color:#64748b;' : ''}">${p.status || 'published'}</span></td>
          <td class="text-right" style="white-space: nowrap;">
            <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs" style="margin-right: 4px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none;" title="Open live page in new tab (${liveUrl})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>View</span>
            </a>
            <button type="button" class="btn btn-secondary btn-xs btn-edit-table-page" data-slug="${p.slug}" style="margin-right: 4px; display: inline-flex; align-items: center; gap: 4px;" title="Edit page settings and components">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Edit</span>
            </button>
            ${p.slug !== '/' ? `
              <button type="button" class="btn btn-danger btn-xs btn-del-page" data-id="${p.id}" data-title="${p.title}" style="display: inline-flex; align-items: center; gap: 4px;" title="Delete this custom page">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Delete</span>
              </button>
            ` : ''}
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.btn-edit-table-page').forEach(btn => {
        btn.addEventListener('click', () => {
          openEditPageModalBySlug(btn.dataset.slug);
        });
      });

      tbody.querySelectorAll('.btn-del-page').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = parseInt(btn.dataset.id, 10);
          const title = btn.dataset.title || 'this page';
          const confirmed = await cmsModal.confirm(`Are you sure you want to permanently delete "${title}"?`, 'Delete Page', 'Delete Page', true);
          if (confirmed) {
            try {
              const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
              const d = await res.json();
              if (d.success) {
                showToast(`Page "${title}" deleted successfully.`);
                loadPages();
                loadDashboardStats();
                if (typeof updateStagedStatusBadge === 'function') updateStagedStatusBadge();
              } else {
                showToast(d.message || 'Error deleting page', true);
              }
            } catch (err) {
              showToast('Error deleting page', true);
            }
          }
        });
      });
    }

    // Also sync the Content Overview list on the dashboard pane
    const overviewContainer = document.getElementById('contentOverviewPagesList');
    if (overviewContainer) {
      if (state.pages && state.pages.length > 0) {
        overviewContainer.innerHTML = state.pages.map(p => {
          const isVideo = p.slug === '/' || (p.hero_banner && /\.(mp4|webm|ogg)$/i.test(p.hero_banner));
          const thumbImg = isVideo ? '/images/landmarks/Serenity-hills-big.webp' : (p.hero_banner || '/images/landmarks/Serenity-hills-big.webp');
          const cleanSlug = p.slug === '/' ? '/' : (p.slug.startsWith('/') ? p.slug : '/' + p.slug);
          const liveUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? `http://localhost:3000${cleanSlug}`
            : `${window.location.origin}${cleanSlug}`;

          return `
          <div class="overview-item" data-page-slug="${p.slug}">
            <div class="item-icon-box ${p.slug === '/' ? 'bg-blue-soft' : 'bg-amber-soft'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${p.slug === '/' ? '#09090b' : '#F59E0B'}" stroke-width="2">
                ${p.slug === '/' ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' : '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>'}
              </svg>
            </div>
            <div class="item-thumb-preview ${isVideo ? 'video-thumb-box' : ''}">
              <img src="${thumbImg}" alt="${p.title}" class="mini-thumb" onerror="this.src='/images/landmarks/Serenity-hills-big.webp'">
              ${isVideo ? '<div class="mini-play-icon">▶</div>' : ''}
            </div>
            <div class="item-details">
              <div class="item-title-row">
                <span class="item-title">${p.title}</span>
                <code class="slug-pill">${p.slug}</code>
                <span class="live-pill" style="${p.status === 'draft' ? 'background:#f1f5f9; color:#64748b;' : ''}">${p.status === 'draft' ? 'Draft' : 'Published'}</span>
              </div>
              <p class="item-desc">${p.content || p.hero_subtitle || 'Custom website page'}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Open live page in new tab">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>View</span>
              </a>
              <button type="button" class="btn-link btn-edit-page-direct" data-page-slug="${p.slug}">Edit ›</button>
            </div>
          </div>
        `;
        }).join('');
      } else {
        overviewContainer.innerHTML = '<div style="padding: 28px 16px; text-align: center; color: var(--text-muted); font-size: 12.5px;">No pages found. Click &ldquo;Manage Pages&rdquo; above to create one.</div>';
      }
    }

    attachOverviewEditPageListeners();
  }

  // =====================================================================
  // VIEW & EDIT PAGE MODAL (WITH DIRECT SINGLE PAGE PUBLISH)
  // =====================================================================
  const modalEditPage = document.getElementById('modalEditPage');

  async function openEditPageModalBySlug(slug) {
    if (!state.pages || state.pages.length === 0) {
      await loadPages();
    }
    let page = (state.pages || []).find(p => p.slug === slug);
    if (!page) {
      try {
        const res = await fetch('/api/pages');
        const d = await res.json();
        if (d.success && d.data) {
          state.pages = d.data;
          page = state.pages.find(p => p.slug === slug);
        }
      } catch (err) {}
    }

    if (!page) {
      // Fallback default
      page = {
        id: Date.now(),
        title: slug === '/' ? 'Home Page' : slug.replace('/', '').replace(/-/g, ' ').toUpperCase(),
        slug: slug,
        status: 'published',
        hero_title: 'Emaar India',
        hero_subtitle: 'A Blend Of Lifestyle, Commercial Spaces & Residential Projects',
        content: 'Main editorial content for this page.'
      };
    }
    openEditPageModal(page);
  }

  function openEditPageModal(page) {
    document.getElementById('editPageId').value = page.id || '';
    document.getElementById('modalEditPageHeading').textContent = `View & Edit: ${page.title}`;
    document.getElementById('modalEditPageSlugSub').textContent = page.slug;
    document.getElementById('editPageTitle').value = page.title || '';
    document.getElementById('editPageSlug').value = page.slug || '';
    document.getElementById('editPageStatus').value = page.status || 'published';
    document.getElementById('editPageHeroTitle').value = page.hero_title || '';
    document.getElementById('editPageHeroSubtitle').value = page.hero_subtitle || '';
    document.getElementById('editPageContent').value = page.content || '';

    // Synchronize active page sections checkboxes
    const activeSections = page.sections || ['hero', 'overview', 'projects', 'amenities', 'cta'];
    document.querySelectorAll('input[name="editPageSection"]').forEach(cb => {
      cb.checked = activeSections.includes(cb.value);
    });

    const previewLink = document.getElementById('btnPreviewCurrentPage');
    if (previewLink) {
      const targetSlug = page.slug ? (page.slug.startsWith('/') ? page.slug : '/' + page.slug) : '';
      previewLink.href = (targetSlug && targetSlug !== '/') ? `/admin/staged?page=${encodeURIComponent(targetSlug)}` : '/admin/staged';
    }

    const delBtn = document.getElementById('btnDeleteCurrentPage');
    if (delBtn) {
      if (page.slug && page.slug !== '/') {
        delBtn.style.display = 'inline-flex';
        delBtn.dataset.id = page.id || '';
        delBtn.dataset.title = page.title || '';
      } else {
        delBtn.style.display = 'none';
      }
    }

    modalEditPage.classList.add('open');
  }

  // Attach listeners to overview page cards "View & Edit" buttons
  function attachOverviewEditPageListeners() {
    document.querySelectorAll('.btn-edit-page-direct').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slug = btn.dataset.pageSlug || '/';
        openEditPageModalBySlug(slug);
      };
    });
  }

  document.getElementById('btnCloseEditPageModal')?.addEventListener('click', () => modalEditPage.classList.remove('open'));
  document.getElementById('btnCancelEditPageModal')?.addEventListener('click', () => modalEditPage.classList.remove('open'));

  // Delete page directly from inside Edit Page modal
  document.getElementById('btnDeleteCurrentPage')?.addEventListener('click', async () => {
    const id = document.getElementById('editPageId')?.value;
    const title = document.getElementById('editPageTitle')?.value || 'this page';
    if (!id) return;
    const confirmed = await cmsModal.confirm(`Are you sure you want to permanently delete "${title}"?`, 'Delete Page', 'Delete Page', true);
    if (confirmed) {
      try {
        const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
        const d = await res.json();
        if (d.success) {
          showToast(`Page "${title}" deleted successfully.`);
          modalEditPage.classList.remove('open');
          loadPages();
          loadDashboardStats();
          if (typeof updateStagedStatusBadge === 'function') updateStagedStatusBadge();
        } else {
          showToast(d.message || 'Error deleting page', true);
        }
      } catch (err) {
        showToast('Error deleting page', true);
      }
    }
  });

  // Edit Components button inside View & Edit Page modal - switches directly to Content Editor for that specific page!
  ['btnEditPageComponents', 'btnEditPageComponentsHeader', 'btnEditPageComponentsBody'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      const slug = document.getElementById('editPageSlug')?.value || '/';
      const pageTitle = document.getElementById('editPageTitle')?.value || slug;
      modalEditPage.classList.remove('open');
      openContentEditorForPage(slug);
      showToast(`Opened Content Editor for: ${pageTitle}`);
    });
  });

  // Save Staged Page Edits
  document.getElementById('formEditPage')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pageId = document.getElementById('editPageId').value;
    const selectedSections = Array.from(document.querySelectorAll('input[name="editPageSection"]:checked')).map(cb => cb.value);
    const payload = {
      title: document.getElementById('editPageTitle').value.trim(),
      slug: document.getElementById('editPageSlug').value.trim(),
      status: document.getElementById('editPageStatus').value,
      hero_title: document.getElementById('editPageHeroTitle').value.trim(),
      hero_subtitle: document.getElementById('editPageHeroSubtitle').value.trim(),
      content: document.getElementById('editPageContent').value.trim(),
      sections: selectedSections
    };

    try {
      if (pageId && pageId !== 'undefined') {
        await fetch(`/api/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      showToast(`Staged changes saved for "${payload.title}"!`);
      modalEditPage.classList.remove('open');
      loadPages();
      loadDashboardStats();
    } catch (err) {
      showToast('Error saving page edits', true);
    }
  });

  // Single Page Direct Publish
  document.getElementById('btnPublishSinglePage')?.addEventListener('click', async () => {
    const pageId = document.getElementById('editPageId').value;
    const selectedSections = Array.from(document.querySelectorAll('input[name="editPageSection"]:checked')).map(cb => cb.value);
    const payload = {
      title: document.getElementById('editPageTitle').value.trim(),
      slug: document.getElementById('editPageSlug').value.trim(),
      status: 'published',
      hero_title: document.getElementById('editPageHeroTitle').value.trim(),
      hero_subtitle: document.getElementById('editPageHeroSubtitle').value.trim(),
      content: document.getElementById('editPageContent').value.trim(),
      sections: selectedSections
    };

    try {
      showToast(`Publishing "${payload.title}" to live...`);
      if (pageId && pageId !== 'undefined') {
        const res = await fetch(`/api/pages/${pageId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          showToast(`✓ Page "${payload.title}" published successfully to live!`);
          modalEditPage.classList.remove('open');
          loadPages();
          loadDashboardStats();
          return;
        }
      }
      // Fallback
      await fetch('/api/publish', { method: 'POST' });
      showToast(`✓ Page "${payload.title}" published successfully!`);
      modalEditPage.classList.remove('open');
      loadPages();
      loadDashboardStats();
    } catch (err) {
      showToast('Error publishing page', true);
    }
  });

  // Topbar Publish All Changes Button
  document.getElementById('btnTopbarPublish')?.addEventListener('click', async () => {
    try {
      showToast('Publishing all CMS changes...');
      const res = await fetch('/api/publish', { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(d.message || '✓ All staged CMS changes published directly to live website!');
        loadDashboardStats();
        loadPages();
        updateStagedStatusBadge();
        loadSiteVersions();
        if (liveSyncChannel) {
          liveSyncChannel.postMessage({ type: 'PUBLISHED', timestamp: Date.now() });
        }
      } else {
        showToast(d.message || 'Error publishing', true);
      }
    } catch (err) {
      showToast('Error publishing changes', true);
    }
  });

  // Modal: Add Page
  const pageModal = document.getElementById('modalAddPage');
  function openPageModal() {
    document.getElementById('formAddPage').reset();
    document.querySelectorAll('input[name="newPageSection"]').forEach(cb => {
      cb.checked = ['hero', 'overview', 'projects', 'amenities', 'cta'].includes(cb.value);
    });
    pageModal.classList.add('open');
  }

  document.getElementById('btnOpenPageModal').addEventListener('click', openPageModal);
  document.getElementById('btnClosePageModal').addEventListener('click', () => pageModal.classList.remove('open'));
  document.getElementById('btnCancelPageModal').addEventListener('click', () => pageModal.classList.remove('open'));

  document.getElementById('newPageTitle').addEventListener('input', (e) => {
    const slug = '/' + e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    document.getElementById('newPageSlug').value = slug;
  });

  document.getElementById('formAddPage').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newPageTitle').value.trim();
    let slug = document.getElementById('newPageSlug').value.trim();
    if (!title) {
      showToast('Page title is required', true);
      return;
    }
    if (!slug) {
      slug = '/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else if (!slug.startsWith('/')) {
      slug = '/' + slug;
    }

    // Duplicate slug validation
    const duplicate = (state.pages || []).some(p => p.slug.toLowerCase() === slug.toLowerCase());
    if (duplicate) {
      showToast(`A page with slug "${slug}" already exists! Please choose a unique URL route.`, true);
      document.getElementById('newPageSlug').focus();
      return;
    }

    const template = document.getElementById('newPageTemplate')?.value || 'blank';
    const includeNavbar = document.getElementById('newPageIncludeNavbar')?.checked ?? true;
    const includeFooter = document.getElementById('newPageIncludeFooter')?.checked ?? true;

    const selectedSections = Array.from(document.querySelectorAll('input[name="newPageSection"]:checked')).map(cb => cb.value);
    const payload = {
      title,
      slug,
      template,
      include_navbar: includeNavbar,
      include_footer: includeFooter,
      status: document.getElementById('newPageStatus').value,
      hero_title: template === 'blank' ? '' : (document.getElementById('newPageHeroTitle')?.value.trim() || title),
      hero_subtitle: template === 'blank' ? '' : (document.getElementById('newPageHeroSubtitle')?.value.trim() || ''),
      hero_banner: template === 'blank' ? '' : '/media/images/landmarks/business-centre.jpg',
      content: document.getElementById('newPageContent').value.trim(),
      sections: template === 'blank' ? [] : selectedSections
    };

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        showToast(`✓ New page "${title}" created!`);
        pageModal.classList.remove('open');
        loadPages();
        loadDashboardStats();
        updateStagedStatusBadge();
      } else {
        showToast(d.message || 'Error creating page', true);
      }
    } catch (e) {
      showToast('Error saving page', true);
    }
  });

  // =====================================================================
  // SETTINGS & BRAND IDENTITY
  // =====================================================================
  async function loadSiteSettings() {
    try {
      const res = await fetch('/api/site-settings');
      const d = await res.json();
      if (d.success && d.data) {
        const s = d.data;
        const brandTitleInput = document.getElementById('settingsBrandTitle');
        if (brandTitleInput) brandTitleInput.value = s.brand_title || '';

        const searchPlaceholderInput = document.getElementById('settingsSearchPlaceholder');
        if (searchPlaceholderInput) searchPlaceholderInput.value = s.hero_search_placeholder || '';

        const contactPhoneInput = document.getElementById('settingsContactPhone');
        if (contactPhoneInput) contactPhoneInput.value = s.contact_phone || '';

        const contactEmailInput = document.getElementById('settingsContactEmail');
        if (contactEmailInput) contactEmailInput.value = s.contact_email || '';

        if (s.site_logo) {
          const logo = document.getElementById('settingsLogoPreview');
          if (logo) logo.src = s.site_logo;
        }
      }
    } catch (e) {
      console.warn('Error loading settings', e);
    }
  }

  document.getElementById('btnSaveBrandSettings')?.addEventListener('click', async () => {
    const brand_title = document.getElementById('settingsBrandTitle')?.value?.trim() || '';
    const hero_search_placeholder = document.getElementById('settingsSearchPlaceholder')?.value?.trim() || '';
    const contact_phone = document.getElementById('settingsContactPhone')?.value?.trim() || '';
    const contact_email = document.getElementById('settingsContactEmail')?.value?.trim() || '';

    showToast('Saving settings...');
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_title,
          hero_search_placeholder,
          contact_phone,
          contact_email
        })
      });
      const d = await res.json();
      if (d.success) {
        showToast('Settings saved successfully!');
        loadDashboardStats();
        updateStagedStatusBadge();
      } else {
        showToast(d.message || 'Error saving settings', true);
      }
    } catch (e) {
      showToast('Error saving settings', true);
    }
  });

  // Logo file upload in settings
  document.getElementById('settingsLogoFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Uploading new logo...');
    const result = await uploadFile(file);
    if (result && result.url) {
      document.getElementById('settingsLogoPreview').src = result.url;
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_logo: result.url })
      });
      showToast('Brand logo updated!');
      updateStagedStatusBadge();
    }
  });

  // =====================================================================
  // RELEASE VERSIONING & SAFE ROLLBACK
  // =====================================================================
  async function loadSiteVersions() {
    const tableBody = document.getElementById('settingsVersionsTable');
    if (!tableBody) return;

    try {
      const res = await fetch('/api/versions');
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        if (d.data.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:24px;">No release versions recorded yet.</td></tr>';
          return;
        }

        tableBody.innerHTML = d.data.map(v => {
          const dateStr = v.published_at ? new Date(v.published_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'Initial';
          const isActive = !!v.is_active;

          return `
            <tr style="${isActive ? 'background: #f0fdf4;' : ''}">
              <td>
                <div style="display:flex;align-items:center;gap:6px;">
                  <code style="font-weight:700;font-size:12px;background:${isActive ? '#dcfce7' : '#f1f5f9'};color:${isActive ? '#15803d' : '#0f172a'};padding:2px 8px;border-radius:4px;">${v.version_number}</code>
                  ${isActive ? '<span style="font-size:10px;font-weight:700;color:#15803d;background:#dcfce7;padding:1px 6px;border-radius:4px;">● CURRENT LIVE</span>' : ''}
                </div>
              </td>
              <td><span style="font-size:12px;color:#334155;white-space:nowrap;">${dateStr}</span></td>
              <td><span style="font-size:12px;font-weight:600;color:#0f172a;">${v.published_by || 'Admin'}</span></td>
              <td><span style="font-size:11.5px;color:#64748b;">${v.summary || 'Release Snapshot'}</span></td>
              <td class="text-right">
                <div style="display:inline-flex;align-items:center;gap:6px;justify-content:flex-end;">
                  <button type="button" class="btn btn-secondary btn-xs btn-view-version-diff" data-id="${v.id}" data-version="${v.version_number}" style="padding:3px 8px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    <span>👁 View Changes</span>
                  </button>
                  ${isActive ? `
                    <span class="live-pill" style="font-size:10.5px;padding:3px 9px;">Live Release</span>
                  ` : `
                    <button type="button" class="btn btn-outline btn-xs btn-rollback-version" data-id="${v.id}" data-version="${v.version_number}" style="color:#ef4444;border-color:#fca5a5;padding:3px 9px;font-weight:600;">
                      ↺ Rollback
                    </button>
                  `}
                </div>
              </td>
            </tr>
          `;
        }).join('');

        tableBody.querySelectorAll('.btn-view-version-diff').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            openVersionDiffModal(id);
          });
        });

        tableBody.querySelectorAll('.btn-rollback-version').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const ver = btn.dataset.version;
            const confirmed = await cmsModal.confirm(`Are you sure you want to rollback to ${ver}?\n\nThis will immediately restore the live website (port 3000) and CMS data to this safe snapshot.`, 'Rollback Version', 'Rollback to Snapshot', true);
            if (confirmed) {
              try {
                showToast(`Rolling back to ${ver}...`);
                const rbRes = await fetch(`/api/versions/${id}/rollback`, { method: 'POST' });
                const rbData = await rbRes.json();
                if (rbData.success) {
                  showToast(`✓ Rolled back to ${ver}! Live site is restored.`);
                  loadSiteVersions();
                  loadSiteSettings();
                  loadPages();
                  loadLandmarks();
                  loadDashboardStats();
                  updateStagedStatusBadge();
                  if (liveSyncChannel) {
                    liveSyncChannel.postMessage({ type: 'PUBLISHED', rollback: true, timestamp: Date.now() });
                  }
                } else {
                  showToast(rbData.message || 'Rollback failed', true);
                }
              } catch (err) {
                showToast('Error during rollback', true);
              }
            }
          });
        });
      }
    } catch (e) {
      console.warn('Error loading versions', e);
    }
  }

  // =====================================================================
  // VERSION CHANGES & COMMIT DIFF MODAL
  // =====================================================================
  const modalVersionDiff = document.getElementById('modalVersionDiff');
  const diffModalVersionBadge = document.getElementById('diffModalVersionBadge');
  const diffModalLiveBadge = document.getElementById('diffModalLiveBadge');
  const diffModalSubtitle = document.getElementById('diffModalSubtitle');
  const diffModalBody = document.getElementById('diffModalBody');
  const btnCloseDiffModal = document.getElementById('btnCloseDiffModal');
  const btnCloseDiffModalBtn = document.getElementById('btnCloseDiffModalBtn');
  const btnRollbackFromDiffModal = document.getElementById('btnRollbackFromDiffModal');

  async function openVersionDiffModal(versionId) {
    if (!modalVersionDiff) return;
    diffModalBody.innerHTML = '<div style="text-align:center;padding:30px;color:#64748b;">Loading changes history...</div>';
    modalVersionDiff.classList.add('open');

    try {
      const res = await fetch(`/api/versions/${versionId}/diff`);
      const data = await res.json();
      if (!data.success || !data.version) {
        diffModalBody.innerHTML = '<div style="padding:20px;color:#ef4444;">Could not load version changes.</div>';
        return;
      }

      diffModalVersionBadge.textContent = data.version.version_number;
      diffModalLiveBadge.style.display = data.version.is_active ? 'inline-block' : 'none';
      const timeStr = data.version.published_at ? new Date(data.version.published_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '';
      diffModalSubtitle.textContent = `Published by ${data.version.published_by || 'Admin'} • ${timeStr} • Compared to ${data.previous_version || 'Baseline'}`;

      if (btnRollbackFromDiffModal) {
        btnRollbackFromDiffModal.style.display = data.version.is_active ? 'none' : 'inline-block';
        btnRollbackFromDiffModal.onclick = () => {
          modalVersionDiff.classList.remove('open');
          const tableBtn = document.querySelector(`.btn-rollback-version[data-id="${data.version.id}"]`);
          if (tableBtn) tableBtn.click();
        };
      }

      if (data.changes.length === 0) {
        diffModalBody.innerHTML = '<div style="padding:24px;text-align:center;color:#64748b;">No text or structure changes detected in this release snapshot.</div>';
        return;
      }

      diffModalBody.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid #f1f5f9;">
            <strong style="font-size:12.5px;color:#0f172a;">${data.total_changes} Change(s) Recorded in this Release</strong>
            <span style="font-size:11px;color:#64748b;">Safe Snapshot Commit History</span>
          </div>
          ${data.changes.map(ch => {
            const isMod = ch.type === 'modification';
            const isAdd = ch.type === 'addition';
            const isDel = ch.type === 'deletion';
            const badgeColor = isAdd ? '#15803d' : (isDel ? '#b91c1c' : '#2563eb');
            const badgeBg = isAdd ? '#dcfce7' : (isDel ? '#fee2e2' : '#eff6ff');

            return `
              <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:9.5px;font-weight:700;padding:2px 6px;border-radius:4px;background:${badgeBg};color:${badgeColor};text-transform:uppercase;">
                      ${ch.type || 'CHANGE'}
                    </span>
                    <span style="font-size:11px;font-weight:600;color:#64748b;">${ch.module || 'Content'}</span>
                  </div>
                  <strong style="font-size:12px;color:#0f172a;">${escapeHtml(ch.title)}</strong>
                </div>
                ${ch.desc ? `
                  <p style="font-size:12px;color:#475569;margin:0;">${escapeHtml(ch.desc)}</p>
                ` : ''}
                ${isMod ? `
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                    <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:6px;padding:8px;">
                      <span style="font-size:10px;font-weight:700;color:#e11d48;display:block;margin-bottom:3px;text-transform:uppercase;">Previous (Before)</span>
                      <div style="font-size:11.5px;color:#881337;white-space:pre-wrap;word-break:break-word;max-height:120px;overflow-y:auto;font-family:monospace;">${escapeHtml(ch.before || '(Empty)')}</div>
                    </div>
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px;">
                      <span style="font-size:10px;font-weight:700;color:#16a34a;display:block;margin-bottom:3px;text-transform:uppercase;">Committed (After)</span>
                      <div style="font-size:11.5px;color:#14532d;white-space:pre-wrap;word-break:break-word;max-height:120px;overflow-y:auto;font-family:monospace;">${escapeHtml(ch.after || '(Empty)')}</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      diffModalBody.innerHTML = '<div style="padding:20px;color:#ef4444;">Network error fetching changes.</div>';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (btnCloseDiffModal) btnCloseDiffModal.onclick = () => modalVersionDiff.classList.remove('open');
  if (btnCloseDiffModalBtn) btnCloseDiffModalBtn.onclick = () => modalVersionDiff.classList.remove('open');
  if (modalVersionDiff) {
    modalVersionDiff.onclick = (e) => {
      if (e.target === modalVersionDiff) modalVersionDiff.classList.remove('open');
    };
  }

  document.getElementById('btnRefreshVersions')?.addEventListener('click', () => {
    loadSiteVersions();
    showToast('Version history refreshed');
  });

  // =====================================================================
  // USER PROFILE DROPDOWN, NOTIFICATIONS & LOGOUT
  // =====================================================================
  const profileTrigger = document.getElementById('userProfileTrigger');
  const profileDropdown = document.getElementById('userProfileDropdown');
  const notifItem = document.getElementById('menuItemNotifications');
  const notifBadge = document.getElementById('dropdownNotifBadge');
  const notifSub = document.getElementById('dropdownNotifSub');
  const settingsMenuItem = document.getElementById('menuItemSettings');
  const logoutBtn = document.getElementById('btnProfileLogout');

  async function updateStagedStatusBadge() {
    try {
      const res = await fetch('/api/staged-status');
      const d = await res.json();
      const badge = document.getElementById('dropdownNotifBadge');
      const sub = document.getElementById('dropdownNotifSub');
      const btnPub = document.getElementById('btnTopbarPublish');

      if (d && d.success) {
        if (d.staged_pending) {
          if (badge) {
            badge.textContent = 'Pending';
            badge.style.background = '#fef3c7';
            badge.style.color = '#92400e';
            badge.style.borderColor = '#fde68a';
          }
          if (sub) {
            sub.textContent = 'Staged changes pending release to live site';
          }
          if (btnPub) {
            btnPub.innerHTML = `
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;box-shadow:0 0 6px #f59e0b;"></span>
              <span>Publish Changes</span>
            `;
            btnPub.style.background = '#2563eb';
            btnPub.title = 'Staged changes pending release to live site';
          }
        } else {
          if (badge) {
            badge.textContent = 'Live';
            badge.style.background = '#f1f5f9';
            badge.style.color = '#475569';
            badge.style.borderColor = '#e2e8f0';
          }
          if (sub) {
            sub.textContent = 'All systems operational • Up to date';
          }
          if (btnPub) {
            btnPub.innerHTML = `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Publish Changes</span>
            `;
            btnPub.style.background = '#09090b';
            btnPub.title = 'All changes published to live website';
          }
        }
      }
    } catch (e) {}
  }

  function toggleProfileDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isOpen = profileDropdown && profileDropdown.classList.contains('open');
    if (isOpen) {
      closeProfileDropdown();
    } else {
      openProfileDropdown();
    }
  }

  function openProfileDropdown() {
    if (!profileDropdown || !profileTrigger) return;
    profileDropdown.classList.add('open');
    profileTrigger.classList.add('open');
    profileTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeProfileDropdown() {
    if (!profileDropdown || !profileTrigger) return;
    profileDropdown.classList.remove('open');
    profileTrigger.classList.remove('open');
    profileTrigger.setAttribute('aria-expanded', 'false');
  }

  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', toggleProfileDropdown);
    profileTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleProfileDropdown(e);
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
        closeProfileDropdown();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileDropdown.classList.contains('open')) {
        closeProfileDropdown();
      }
    });
  }

  // Notifications item action
  if (notifItem) {
    notifItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const badge = document.getElementById('dropdownNotifBadge');
      if (badge && badge.textContent === 'Pending') {
        showToast('Notice: Staged changes are pending release to live site.');
      } else {
        showToast('System operational: All content is synced with live website.');
      }
    });
  }

  // Settings dropdown item
  if (settingsMenuItem) {
    settingsMenuItem.addEventListener('click', (e) => {
      e.preventDefault();
      closeProfileDropdown();
      switchTab('settings');
    });
  }

  // Logout button action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeProfileDropdown();
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
      localStorage.removeItem('clientcms_auth_token');
      localStorage.removeItem('clientcms_auth_user');
      localStorage.removeItem('clientcms_auth_expires');
      showToast('Logged out successfully.');
      const loginScreen = document.getElementById('loginScreen');
      const cmsAppRoot = document.getElementById('cmsAppRoot');
      if (loginScreen) loginScreen.style.display = 'flex';
      if (cmsAppRoot) cmsAppRoot.style.display = 'none';
    });
  }

  // =====================================================================
  // GLOBAL SEARCH (Pages, Landmarks, Media Library)
  // =====================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('btnClearGlobalSearch');
    const dropdown = document.getElementById('globalSearchResultsDropdown');
    const list = document.getElementById('globalSearchResultsList');
    const filterChips = document.querySelectorAll('#topbarSearchFilterChips .topbar-filter-chip');

    if (!searchInput || !dropdown || !list) return;

    let activeFilter = 'all';

    function setFilter(filter) {
      activeFilter = filter;
      filterChips.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === filter);
      });

      // Update input placeholder to match filter
      if (filter === 'pages') {
        searchInput.placeholder = 'Search website pages...';
      } else if (filter === 'landmarks') {
        searchInput.placeholder = 'Search developments & landmarks...';
      } else if (filter === 'media') {
        searchInput.placeholder = 'Search media library files...';
      } else {
        searchInput.placeholder = 'Search pages, developments, media...';
      }

      runSearch();
    }

    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        setFilter(chip.dataset.filter);
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = '';
        clearBtn.style.display = 'none';
        dropdown.style.display = 'none';
        list.innerHTML = '';
        searchInput.focus();
      });
    }

    function runSearch() {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        if (clearBtn) clearBtn.style.display = 'none';
        dropdown.style.display = 'none';
        list.innerHTML = '';
        return;
      }

      if (clearBtn) clearBtn.style.display = 'flex';

      // Match pages
      const matchedPages = (state.pages || []).filter(p => {
        return (p.title && p.title.toLowerCase().includes(q)) ||
               (p.slug && p.slug.toLowerCase().includes(q)) ||
               (p.hero_title && p.hero_title.toLowerCase().includes(q)) ||
               (p.content && p.content.toLowerCase().includes(q));
      });

      // Match landmarks
      const matchedLandmarks = (state.landmarks || []).filter(l => {
        return (l.name && l.name.toLowerCase().includes(q)) ||
               (l.location && l.location.toLowerCase().includes(q)) ||
               (l.category && l.category.toLowerCase().includes(q));
      });

      // Match media
      const matchedMedia = (state.media || []).filter(m => {
        return (m.name && m.name.toLowerCase().includes(q)) ||
               (m.type && m.type.toLowerCase().includes(q)) ||
               (m.url && m.url.toLowerCase().includes(q));
      });

      // Update count badges
      const totalAll = matchedPages.length + matchedLandmarks.length + matchedMedia.length;
      if (countAllEl) countAllEl.textContent = totalAll;
      if (countPagesEl) countPagesEl.textContent = matchedPages.length;
      if (countLandmarksEl) countLandmarksEl.textContent = matchedLandmarks.length;
      if (countMediaEl) countMediaEl.textContent = matchedMedia.length;

      // Determine which sections to display based on activeFilter
      const showPages = (activeFilter === 'all' || activeFilter === 'pages') && matchedPages.length > 0;
      const showLandmarks = (activeFilter === 'all' || activeFilter === 'landmarks') && matchedLandmarks.length > 0;
      const showMedia = (activeFilter === 'all' || activeFilter === 'media') && matchedMedia.length > 0;

      const hasVisibleMatches = showPages || showLandmarks || showMedia;

      if (!hasVisibleMatches) {
        list.innerHTML = `
          <div style="padding: 24px 16px; text-align: center; color: #64748b; font-size: 12.5px;">
            No ${activeFilter !== 'all' ? activeFilter : ''} results found for &ldquo;${escapeHtml(q)}&rdquo;
          </div>
        `;
        dropdown.style.display = 'block';
        return;
      }

      let html = '';

      if (showPages) {
        html += `<div class="search-result-group-title">Pages (${matchedPages.length})</div>`;
        matchedPages.slice(0, 6).forEach(p => {
          html += `
            <div class="search-result-item" data-action="page" data-slug="${escapeHtml(p.slug)}">
              <div>
                <div class="search-result-title">${escapeHtml(p.title)}</div>
                <div class="search-result-sub">${escapeHtml(p.hero_title || p.content || p.slug)}</div>
              </div>
              <span class="search-result-badge">${escapeHtml(p.slug)}</span>
            </div>
          `;
        });
      }

      if (showLandmarks) {
        html += `<div class="search-result-group-title">Developments & Landmarks (${matchedLandmarks.length})</div>`;
        matchedLandmarks.slice(0, 6).forEach(l => {
          html += `
            <div class="search-result-item" data-action="landmark" data-id="${l.id}">
              <div>
                <div class="search-result-title">${escapeHtml(l.name)}</div>
                <div class="search-result-sub">📍 ${escapeHtml(l.location)}</div>
              </div>
              <span class="search-result-badge">${escapeHtml(l.category)}</span>
            </div>
          `;
        });
      }

      if (showMedia) {
        html += `<div class="search-result-group-title">Media Library (${matchedMedia.length})</div>`;
        matchedMedia.slice(0, 6).forEach(m => {
          html += `
            <div class="search-result-item" data-action="media" data-id="${escapeHtml(m.id)}">
              <div>
                <div class="search-result-title">${escapeHtml(m.name)}</div>
                <div class="search-result-sub">${m.sizeFormatted || 'Asset'} • ${(m.type || '').toUpperCase()}</div>
              </div>
              <span class="search-result-badge">${m.type === 'video' ? 'Video' : 'Image'}</span>
            </div>
          `;
        });
      }

      list.innerHTML = html;
      dropdown.style.display = 'block';

      // Item selection clicks
      list.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          if (action === 'page') {
            const slug = item.dataset.slug;
            openEditPageModalBySlug(slug);
          } else if (action === 'landmark') {
            switchTab('content', 'images');
          } else if (action === 'media') {
            const mediaId = item.dataset.id;
            const mediaObj = state.media.find(m => m.id === mediaId);
            if (mediaObj) openMediaLightbox(mediaObj);
            else switchTab('library');
          }
          dropdown.style.display = 'none';
          searchInput.value = '';
          if (clearBtn) clearBtn.style.display = 'none';
        });
      });
    }

    searchInput.addEventListener('input', runSearch);

    // Close on click outside
    document.addEventListener('click', (e) => {
      const isSearchChild = dropdown.contains(e.target) || searchInput.contains(e.target) || (e.target.closest && e.target.closest('#topbarSearchFilterChips'));
      if (!isSearchChild) {
        dropdown.style.display = 'none';
      }
    });

    // Close on Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });
  }

  // Modular Section Cards Accordion Dropdowns (Collapsible / Expandable)
  function initModularSectionAccordions() {
    document.querySelectorAll('.modular-section-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input, select, textarea, label')) return;
        const card = header.closest('.modular-section-card');
        if (card) {
          card.classList.toggle('collapsed');
        }
      });
    });
  }

  // =====================================================================
  // CUSTOMER LEADS & FORM SUBMISSIONS SYSTEM
  // =====================================================================
  let leadsData = [];
  let currentLeadFilter = 'all';
  let leadSearchTerm = '';

  async function loadLeads() {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        leadsData = data.data;
        renderLeadsStats();
        renderLeadsTable();
      }
    } catch (err) {
      console.error('Error loading leads:', err);
    }
  }

  function renderLeadsStats() {
    const total = leadsData.length;
    const newCount = leadsData.filter(l => l.status === 'New').length;
    const contactedCount = leadsData.filter(l => l.status === 'Contacted').length;
    const qualifiedCount = leadsData.filter(l => l.status === 'Qualified').length;

    const elTotal = document.getElementById('leadsStatTotal');
    const elNew = document.getElementById('leadsStatNew');
    const elContacted = document.getElementById('leadsStatContacted');
    const elQualified = document.getElementById('leadsStatQualified');
    const elSidebarCount = document.getElementById('leadsSidebarCount');

    if (elTotal) elTotal.textContent = total;
    if (elNew) elNew.textContent = newCount;
    if (elContacted) elContacted.textContent = contactedCount;
    if (elQualified) elQualified.textContent = qualifiedCount;
    if (elSidebarCount) {
      elSidebarCount.textContent = newCount > 0 ? newCount : total;
      elSidebarCount.style.background = newCount > 0 ? '#10b981' : '#64748b';
    }
  }

  function renderLeadsTable() {
    const tbody = document.getElementById('leadsTableBody');
    const emptyState = document.getElementById('leadsEmptyState');
    if (!tbody) return;

    let filtered = [...leadsData];

    if (currentLeadFilter !== 'all') {
      filtered = filtered.filter(l => (l.status || 'New').toLowerCase() === currentLeadFilter.toLowerCase());
    }

    if (leadSearchTerm.trim()) {
      const term = leadSearchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        (l.name && l.name.toLowerCase().includes(term)) ||
        (l.email && l.email.toLowerCase().includes(term)) ||
        (l.phone && l.phone.toLowerCase().includes(term)) ||
        (l.source && l.source.toLowerCase().includes(term)) ||
        (l.message && l.message.toLowerCase().includes(term))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(lead => {
      const initials = (lead.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'Recent';

      const statusColors = {
        'New': { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
        'Contacted': { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
        'Qualified': { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
        'Closed': { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }
      };

      const sc = statusColors[lead.status] || statusColors['New'];

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='transparent'">
          <td style="padding: 12px 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #09090b; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;">
                ${initials}
              </div>
              <div>
                <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${escapeHtml(lead.name || 'Anonymous')}</div>
                ${lead.message ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px; max-width: 260px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${escapeHtml(lead.message)}">${escapeHtml(lead.message)}</div>` : ''}
              </div>
            </div>
          </td>
          <td style="padding: 12px 16px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color: #2563eb; text-decoration: none; font-weight: 500;" title="Click to email">${escapeHtml(lead.email)}</a>` : '<span style="color:#94a3b8;">No email</span>'}
              ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}" style="color: #475569; text-decoration: none; font-size: 11.5px;" title="Click to call">${escapeHtml(lead.phone)}</a>` : ''}
            </div>
          </td>
          <td style="padding: 12px 16px;">
            <span style="display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11.5px; color: #334155;">
              ${escapeHtml(lead.source || 'Website Form')}
            </span>
          </td>
          <td style="padding: 12px 16px; color: #64748b; font-size: 11.5px; white-space: nowrap;">
            ${dateStr}
          </td>
          <td style="padding: 12px 16px;">
            <select class="lead-status-select" data-id="${lead.id}" style="padding: 4px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; background: ${sc.bg}; color: ${sc.text}; border: 1px solid ${sc.border}; cursor: pointer; outline: none;">
              <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Qualified" ${lead.status === 'Qualified' ? 'selected' : ''}>Qualified</option>
              <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </td>
          <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
            <button type="button" class="btn-delete-lead" data-id="${lead.id}" title="Delete Lead" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners for status changes
    tbody.querySelectorAll('.lead-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const leadId = e.target.dataset.id;
        const newStatus = e.target.value;
        await updateLeadStatus(leadId, newStatus);
      });
    });

    // Attach listeners for delete
    tbody.querySelectorAll('.btn-delete-lead').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const leadId = e.target.dataset.id;
        const confirmed = await cmsModal.confirm('Are you sure you want to delete this lead inquiry?', 'Delete Lead', 'Delete', true);
        if (confirmed) {
          await deleteLead(leadId);
        }
      });
    });
  }

  async function updateLeadStatus(id, status) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Lead marked as ${status}`);
        const lead = leadsData.find(l => String(l.id) === String(id));
        if (lead) lead.status = status;
        renderLeadsStats();
        renderLeadsTable();
      }
    } catch (err) {
      showToast('Error updating lead status', true);
    }
  }

  async function deleteLead(id) {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Lead deleted');
        leadsData = leadsData.filter(l => String(l.id) !== String(id));
        renderLeadsStats();
        renderLeadsTable();
      }
    } catch (err) {
      showToast('Error deleting lead', true);
    }
  }

  function exportLeadsCSV() {
    if (!leadsData.length) {
      showToast('No leads to export');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Date', 'Message'];
    const rows = leadsData.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.source || '').replace(/"/g, '""')}"`,
      l.status || 'New',
      l.created_at || '',
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `emaar_india_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Leads exported to CSV successfully');
  }

  function initLeadsListeners() {
    const searchInput = document.getElementById('leadsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        leadSearchTerm = e.target.value;
        renderLeadsTable();
      });
    }

    const filterChips = document.getElementById('leadsFilterChips');
    if (filterChips) {
      filterChips.querySelectorAll('.topbar-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          filterChips.querySelectorAll('.topbar-filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentLeadFilter = chip.dataset.leadFilter || 'all';
          renderLeadsTable();
        });
      });
    }

    const btnRefresh = document.getElementById('btnRefreshLeads');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        loadLeads();
        showToast('✓ Leads refreshed');
      });
    }

    const btnExport = document.getElementById('btnExportLeadsCsv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        exportLeadsCSV();
      });
    }
  }

  // =====================================================================
  // AUTHENTICATION & LOGIN SYSTEM
  // =====================================================================
  function initAuthSystem() {
    const isStagedRoute = window.location.pathname.includes('/admin/staged') || window.location.search.includes('user=stage') || window.location.search.includes('mode=staged');
    const stageBanner = document.getElementById('stageModeBanner');
    if (stageBanner) {
      stageBanner.style.display = isStagedRoute ? 'inline-flex' : 'none';
    }

    const loginScreen = document.getElementById('loginScreen');
    const cmsAppRoot = document.getElementById('cmsAppRoot');
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const btnAutoFill = document.getElementById('btnAutoFillCreds');
    const btnQuickAdmin = document.getElementById('btnQuickAdmin');
    const btnQuickStage = document.getElementById('btnQuickStage');
    const credItemEmail = document.getElementById('credItemEmail');
    const credItemPass = document.getElementById('credItemPass');
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    const eyeOpen = document.getElementById('eyeIconOpen');
    const eyeClosed = document.getElementById('eyeIconClosed');
    const loginError = document.getElementById('loginErrorMsg');
    const btnSubmit = document.getElementById('btnLoginSubmit');
    const btnSpinner = document.getElementById('loginSpinner');
    const btnText = btnSubmit ? btnSubmit.querySelector('.btn-text') : null;
    const btnArrow = btnSubmit ? btnSubmit.querySelector('.btn-arrow-icon') : null;

    function showLogin() {
      if (loginScreen) loginScreen.style.display = 'flex';
      if (cmsAppRoot) cmsAppRoot.style.display = 'none';
      if (loginPassword) loginPassword.value = '';
      if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
      }
      if (isStagedRoute && loginEmail) {
        loginEmail.value = 'stage@emaar.com';
        if (loginPassword) loginPassword.value = 'stage123';
      }
    }

    function showDashboard(user) {
      if (loginScreen) loginScreen.style.display = 'none';
      if (cmsAppRoot) cmsAppRoot.style.display = 'flex';
      if (user && user.name) {
        document.querySelectorAll('.user-name, .profile-name').forEach(el => el.textContent = user.name);
        document.querySelectorAll('.user-role, .profile-role').forEach(el => el.textContent = user.role || (user.username === 'stage' ? 'Stage Reviewer' : 'Lead Administrator'));
        if (user.avatar) {
          document.querySelectorAll('.avatar').forEach(el => el.textContent = user.avatar);
        }
      }
      if (stageBanner) {
        stageBanner.style.display = (isStagedRoute || (user && user.username === 'stage')) ? 'inline-flex' : 'none';
      }
    }

    // Toggle password view
    if (btnTogglePassword && loginPassword) {
      btnTogglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        const isPass = loginPassword.type === 'password';
        loginPassword.type = isPass ? 'text' : 'password';
        if (eyeOpen) eyeOpen.style.display = isPass ? 'none' : 'block';
        if (eyeClosed) eyeClosed.style.display = isPass ? 'block' : 'none';
      });
    }

    // Autofill credentials
    function applyAdminCredentials() {
      if (loginEmail) {
        loginEmail.value = 'admin@emaar.com';
        loginEmail.classList.add('flash-input');
        setTimeout(() => loginEmail.classList.remove('flash-input'), 600);
      }
      if (loginPassword) {
        loginPassword.value = 'admin123';
        loginPassword.classList.add('flash-input');
        setTimeout(() => loginPassword.classList.remove('flash-input'), 600);
      }
      if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
      }
      showToast('Admin credentials filled: admin@emaar.com / admin123');
    }

    function applyStageCredentials() {
      if (loginEmail) {
        loginEmail.value = 'stage@emaar.com';
        loginEmail.classList.add('flash-input');
        setTimeout(() => loginEmail.classList.remove('flash-input'), 600);
      }
      if (loginPassword) {
        loginPassword.value = 'stage123';
        loginPassword.classList.add('flash-input');
        setTimeout(() => loginPassword.classList.remove('flash-input'), 600);
      }
      if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
      }
      showToast('Stage User credentials filled: stage@emaar.com / stage123');
    }

    if (btnAutoFill) {
      btnAutoFill.addEventListener('click', (e) => {
        e.preventDefault();
        applyAdminCredentials();
      });
    }
    if (btnQuickAdmin) {
      btnQuickAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        applyAdminCredentials();
        if (loginForm) loginForm.requestSubmit();
      });
    }
    if (btnQuickStage) {
      btnQuickStage.addEventListener('click', (e) => {
        e.preventDefault();
        applyStageCredentials();
        if (loginForm) loginForm.requestSubmit();
      });
    }
    if (credItemEmail) {
      credItemEmail.addEventListener('click', () => {
        if (loginEmail) loginEmail.value = 'admin@emaar.com';
        showToast('Email filled');
      });
    }
    if (credItemPass) {
      credItemPass.addEventListener('click', () => {
        if (loginPassword) loginPassword.value = 'admin123';
        showToast('Password filled');
      });
    }

    // Handle Login submission
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginEmail ? loginEmail.value.trim() : '';
        const password = loginPassword ? loginPassword.value.trim() : '';

        if (!username || !password) {
          if (loginError) {
            loginError.textContent = 'Please enter both username and password.';
            loginError.style.display = 'block';
          }
          return;
        }

        // Show spinner
        if (btnSubmit) btnSubmit.disabled = true;
        if (btnSpinner) btnSpinner.style.display = 'inline-block';
        if (btnArrow) btnArrow.style.display = 'none';
        if (btnText) btnText.textContent = 'Verifying...';
        if (loginError) loginError.style.display = 'none';

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();

          if (res.ok && data.success) {
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24-hour session expiration
            localStorage.setItem('clientcms_auth_token', data.token);
            localStorage.setItem('clientcms_auth_user', JSON.stringify(data.user));
            localStorage.setItem('clientcms_auth_expires', expiresAt.toString());
            showToast(`✓ Welcome back, ${data.user.name}!`);
            showDashboard(data.user);
          } else {
            if (loginError) {
              loginError.textContent = data.message || 'Invalid credentials. Please use admin@emaar.com / admin123';
              loginError.style.display = 'block';
              const card = document.querySelector('.login-card');
              if (card) {
                card.classList.add('shake-card');
                setTimeout(() => card.classList.remove('shake-card'), 500);
              }
            }
          }
        } catch (err) {
          if (loginError) {
            loginError.textContent = 'Network or server error. Please try again.';
            loginError.style.display = 'block';
          }
        } finally {
          if (btnSubmit) btnSubmit.disabled = false;
          if (btnSpinner) btnSpinner.style.display = 'none';
          if (btnArrow) btnArrow.style.display = 'inline-block';
          if (btnText) btnText.textContent = 'Sign In to Dashboard';
        }
      });
    }

    // Role-Aware Auto-Route Authentication
    if (isStagedRoute) {
      // Auto-authenticate as Stage User for /admin/staged
      const stageUser = {
        id: 2,
        username: "stage",
        email: "stage@emaar.com",
        name: "Stage Reviewer",
        role: "Stage Reviewer",
        avatar: "SR"
      };
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      const token = 'emaar_token_' + btoa(`${stageUser.email}:${expiresAt}`);
      localStorage.setItem('clientcms_auth_token', token);
      localStorage.setItem('clientcms_auth_user', JSON.stringify(stageUser));
      localStorage.setItem('clientcms_auth_expires', expiresAt.toString());
      showDashboard(stageUser);
      return;
    }

    // Check existing session for /admin
    const savedToken = localStorage.getItem('clientcms_auth_token');
    const savedUserStr = localStorage.getItem('clientcms_auth_user');
    const savedExpires = localStorage.getItem('clientcms_auth_expires');
    const isExpired = !savedExpires || Date.now() > Number(savedExpires);

    if (savedToken && savedUserStr && !isExpired) {
      try {
        const user = JSON.parse(savedUserStr);
        // If coming to /admin and currently stage user, switch to Lead Admin
        if (user.username === 'stage') {
          const adminUser = {
            id: 1,
            username: "admin",
            email: "admin@emaar.com",
            name: "Tushar Yadav",
            role: "Lead Administrator",
            avatar: "TY"
          };
          const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
          const token = 'emaar_token_' + btoa(`${adminUser.email}:${expiresAt}`);
          localStorage.setItem('clientcms_auth_token', token);
          localStorage.setItem('clientcms_auth_user', JSON.stringify(adminUser));
          localStorage.setItem('clientcms_auth_expires', expiresAt.toString());
          showDashboard(adminUser);
        } else {
          showDashboard(user);
        }
      } catch {
        localStorage.removeItem('clientcms_auth_token');
        localStorage.removeItem('clientcms_auth_user');
        localStorage.removeItem('clientcms_auth_expires');
        showLogin();
      }
    } else {
      // Default auto-login to Lead Admin on /admin route
      const adminUser = {
        id: 1,
        username: "admin",
        email: "admin@emaar.com",
        name: "Tushar Yadav",
        role: "Lead Administrator",
        avatar: "TY"
      };
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      const token = 'emaar_token_' + btoa(`${adminUser.email}:${expiresAt}`);
      localStorage.setItem('clientcms_auth_token', token);
      localStorage.setItem('clientcms_auth_user', JSON.stringify(adminUser));
      localStorage.setItem('clientcms_auth_expires', expiresAt.toString());
      showDashboard(adminUser);
    }
  }

  // Initial Data Load & Feature Wiring
  initAuthSystem();
  renderCustomPageSelectOptions();
  initModularSectionAccordions();
  initWordToolbars();
  initMediaPickerModal();
  initGlobalSearch();
  loadDashboardStats();
  loadHeroVideo();
  loadMediaLibrary();
  loadTextContent();
  loadLandmarks();
  loadPages();
  loadSiteSettings();
  loadSiteVersions();
  loadSectionsOrder();
  loadLeads();
  initLeadsListeners();
  updateStagedStatusBadge();
  attachOverviewEditPageListeners();
});
