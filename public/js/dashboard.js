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
      const vid = document.getElementById('fullResHeroVideo');
      if (vid) vid.play().catch(() => {});
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
    } else if (tabId === 'library') {
      loadMediaLibrary();
    } else if (tabId === 'pages') {
      loadPages();
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

  function setFullResVideo(url) {
    const vid = document.getElementById('fullResHeroVideo');
    const src = document.getElementById('fullResVideoSource');
    const nameEl = document.getElementById('fullResFileName');
    const input = document.getElementById('fullResVideoUrlInput');
    if (src) src.src = url;
    if (input) input.value = url;
    if (nameEl) nameEl.textContent = url.split('/').pop();
    if (vid) {
      vid.load();
      vid.play().catch(() => {});
    }
  }

  document.getElementById('videoFullFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Uploading full-resolution video...');
    const result = await uploadFile(file);
    if (result && result.url) {
      setFullResVideo(result.url);
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero_video: result.url })
      });
      showToast('Hero background video updated in full resolution!');
      loadDashboardStats();
    }
  });

  document.getElementById('btnResetVideoFull')?.addEventListener('click', async () => {
    const defUrl = '/videos/emaar.mp4';
    setFullResVideo(defUrl);
    await fetch('/api/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero_video: defUrl })
    });
    showToast('Reset to original hero video.');
  });

  document.getElementById('btnApplyFullResUrl')?.addEventListener('click', async () => {
    const input = document.getElementById('fullResVideoUrlInput');
    const url = input ? input.value.trim() : '';
    if (url) {
      setFullResVideo(url);
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero_video: url })
      });
      showToast('Video path updated!');
    }
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
        if (confirm(`Delete ${filename} to free up storage space?`)) {
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
      alert("Storage Quota Exceeded\n\nYour media library has reached its 100 MB capacity limit. To protect server performance, further uploads are paused until unused assets are removed.");
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
          alert("Storage Limit Notice\n\n" + data.message);
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
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const cmd = btn.dataset.cmd;
          if (!cmd) return;
          editorEl.focus();

          if (cmd === 'createLink') {
            const url = prompt('Enter destination URL for hyperlink (e.g. https://... or /contact):', 'https://');
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

    list.innerHTML = socialChannels.map((ch, idx) => `
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

    // Wire Paste SVG Code button
    list.querySelectorAll('.btn-paste-social-svg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        const channel = socialChannels[idx];
        if (!channel) return;
        const currentVal = channel.icon.startsWith('<svg') ? channel.icon : '';
        const raw = prompt(`Paste raw SVG XML code (or file URL) for "${channel.name}":`, currentVal || channel.icon);
        if (raw !== null && raw.trim()) {
          channel.icon = raw.trim();
          renderSocialChannelsEditor();
          syncSocialPreviews();
          showToast(`✓ SVG code applied for ${channel.name}!`);
        }
      });
    });

    // Wire Delete Channel button
    list.querySelectorAll('.btn-delete-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        if (confirm(`Remove "${socialChannels[idx]?.name || 'channel'}"?`)) {
          socialChannels.splice(idx, 1);
          renderSocialChannelsEditor();
          syncSocialPreviews();
          showToast('Channel removed');
        }
      });
    });
  }

  // Hook "+ Add Social Channel / SVG" button
  document.getElementById('btnAddSocialChannel')?.addEventListener('click', () => {
    socialChannels.push({
      id: 'social_' + Date.now(),
      name: 'New Platform',
      url: 'https://',
      icon: '<svg fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2" fill="none"></path></svg>'
    });
    renderSocialChannelsEditor();
    syncSocialPreviews();
    showToast('✓ Added new social channel! Click "Replace SVG" to set custom icon.');
    const inputs = document.querySelectorAll('#socialChannelsList .cms-social-name-input');
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus();
      inputs[inputs.length - 1].select();
    }
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

    // 6 Columns: sync titles, accordion labels, and render link lists as <li> items
    for (let i = 1; i <= 6; i++) {
      const colTitleIn = document.getElementById(`editFooterCol${i}Title`);
      const colLinksIn = document.getElementById(`editFooterCol${i}Links`);
      const pColTitle = document.getElementById(`previewFooterCol${i}Title`);
      const pColList = document.getElementById(`previewFooterCol${i}Links`);
      const accordionTitleLabel = document.getElementById(`accordionCol${i}TitleLabel`);
      if (colTitleIn) {
        const val = colTitleIn.value || `COLUMN ${i}`;
        if (pColTitle) pColTitle.textContent = val;
        if (accordionTitleLabel) accordionTitleLabel.textContent = val;
      }
      if (colLinksIn && pColList) {
        const links = colLinksIn.value.split(',').map(s => s.trim()).filter(Boolean);
        pColList.innerHTML = links.map(l => `<li><span>${l}</span></li>`).join('');
      }
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

        // Section 1: Legacy
        const legacy = data.data.legacy_intro || {};
        const legTitleEl = document.getElementById('editTextLegacyTitleRich');
        const legBodyEl = document.getElementById('editTextLegacyBodyRich');
        if (legTitleEl && legacy.title) legTitleEl.innerHTML = legacy.title;
        if (legBodyEl && legacy.content) legBodyEl.innerHTML = legacy.content;

        // Section 2: Walkthrough
        const walk = data.data.walkthrough || {};
        const walkTitleEl = document.getElementById('editTextWalkTitleRich');
        const walkBadgeEl = document.getElementById('editTextWalkBadge');
        const walkSubEl = document.getElementById('editTextWalkSubRich');
        const walkCapEl = document.getElementById('editTextWalkCaptionRich');
        if (walkTitleEl && walk.title) walkTitleEl.innerHTML = walk.title;
        if (walkBadgeEl && walk.badge) walkBadgeEl.value = walk.badge;
        if (walkSubEl && walk.subtitle) walkSubEl.innerHTML = walk.subtitle;
        if (walkCapEl && walk.content) walkCapEl.innerHTML = walk.content;

        if (walk.image) {
          let cleanWalkImg = walk.image;
          if (cleanWalkImg.includes('/_next/image') && cleanWalkImg.includes('url=')) {
            try {
              const parsed = new URL(cleanWalkImg, window.location.origin);
              cleanWalkImg = parsed.searchParams.get('url') || cleanWalkImg;
            } catch (e) {}
          }
          const prevImg = document.getElementById('previewWalkImg');
          const thumb = document.getElementById('walkCurrentImgThumb');
          const pathTxt = document.getElementById('walkCurrentImgPath');
          if (prevImg) prevImg.src = cleanWalkImg;
          if (thumb) thumb.src = cleanWalkImg;
          if (pathTxt) pathTxt.textContent = cleanWalkImg;
        }

        // Section 3: Blogs
        const blogs = data.data.blogs || {};
        const blogTitleEl = document.getElementById('editTextBlogTitleRich');
        const blogSubEl = document.getElementById('editTextBlogSubRich');
        if (blogTitleEl && blogs.title) blogTitleEl.innerHTML = blogs.title;
        if (blogSubEl && blogs.subtitle) blogSubEl.innerHTML = blogs.subtitle;

        if (blogs.posts && blogs.posts[0]) {
          const p1 = blogs.posts[0];
          const b1Img = document.getElementById('previewBlog1Img');
          const b1Thumb = document.getElementById('blog1ThumbImg');
          const b1Path = document.getElementById('blog1ImgPath');
          const b1Cap = document.getElementById('previewBlog1Caption');
          const b1CapRich = document.getElementById('editTextBlog1CaptionRich');
          if (b1Img && p1.image) b1Img.src = p1.image;
          if (b1Thumb && p1.image) b1Thumb.src = p1.image;
          if (b1Path && p1.image) b1Path.textContent = p1.image;
          if (b1Cap && p1.caption) b1Cap.textContent = p1.caption;
          if (b1CapRich && p1.caption) b1CapRich.innerHTML = p1.caption;
        }

        if (blogs.posts && blogs.posts[1]) {
          const p2 = blogs.posts[1];
          const b2Img = document.getElementById('previewBlog2Img');
          const b2Thumb = document.getElementById('blog2ThumbImg');
          const b2Path = document.getElementById('blog2ImgPath');
          const b2Cap = document.getElementById('previewBlog2Caption');
          const b2CapRich = document.getElementById('editTextBlog2CaptionRich');
          if (b2Img && p2.image) b2Img.src = p2.image;
          if (b2Thumb && p2.image) b2Thumb.src = p2.image;
          if (b2Path && p2.image) b2Path.textContent = p2.image;
          if (b2Cap && p2.caption) b2Cap.textContent = p2.caption;
          if (b2CapRich && p2.caption) b2CapRich.innerHTML = p2.caption;
        }

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

        for (let i = 1; i <= 6; i++) {
          if (document.getElementById(`editFooterCol${i}Title`) && footer[`col${i}_title`]) {
            document.getElementById(`editFooterCol${i}Title`).value = footer[`col${i}_title`];
          }
          if (document.getElementById(`editFooterCol${i}Links`) && footer[`col${i}_links`]) {
            document.getElementById(`editFooterCol${i}Links`).value = footer[`col${i}_links`];
          }
        }

        if (document.getElementById('editFooterLegal') && footer.legal_text) document.getElementById('editFooterLegal').value = footer.legal_text;
        if (document.getElementById('editFooterCopyRich') && footer.copyright_html) document.getElementById('editFooterCopyRich').innerHTML = footer.copyright_html;

        if (footer.logo) {
          const fPrev = document.getElementById('previewFooterLogo');
          const fThumb = document.getElementById('footerLogoThumbImg');
          const fPath = document.getElementById('footerLogoImgPath');
          if (fPrev) fPrev.src = footer.logo;
          if (fThumb) fThumb.src = footer.logo;
          if (fPath) fPath.textContent = footer.logo;
        }

        // Re-render chip lists after loading from API
        for (let i = 1; i <= 6; i++) {
          if (typeof renderColChips === 'function') renderColChips(i);
        }

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

  // ── Dropdown Items management for 6 footer columns ────────────────────────
  function renderColChips(colNum) {
    const textarea = document.getElementById(`editFooterCol${colNum}Links`);
    const container = document.getElementById(`chipsListCol${colNum}`);
    if (!textarea || !container) return;
    const links = textarea.value.split(',').map(s => s.trim()).filter(Boolean);
    container.innerHTML = links.map((link, idx) => `
      <div class="cms-dropdown-item-row" data-col="${colNum}" data-idx="${idx}">
        <span class="cms-item-bullet">•</span>
        <input type="text" class="cms-item-name-input" value="${link}" placeholder="Item name..." data-col="${colNum}" data-idx="${idx}">
        <button type="button" class="btn-item-delete" data-col="${colNum}" data-idx="${idx}" title="Delete item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    `).join('');

    // Wire input changes to update textarea and sync live preview immediately
    container.querySelectorAll('.cms-item-name-input').forEach(input => {
      input.addEventListener('input', () => {
        const c = parseInt(input.getAttribute('data-col'));
        const ix = parseInt(input.getAttribute('data-idx'));
        const ta = document.getElementById(`editFooterCol${c}Links`);
        if (!ta) return;
        const arr = ta.value.split(',').map(s => s.trim()).filter(Boolean);
        arr[ix] = input.value.trim();
        ta.value = arr.filter(Boolean).join(', ');
        syncAllModularPreviews();
      });
    });

    // Wire delete bin buttons
    container.querySelectorAll('.btn-item-delete').forEach(delBtn => {
      delBtn.addEventListener('click', () => {
        const c = parseInt(delBtn.getAttribute('data-col'));
        const ix = parseInt(delBtn.getAttribute('data-idx'));
        const ta = document.getElementById(`editFooterCol${c}Links`);
        if (!ta) return;
        const arr = ta.value.split(',').map(s => s.trim()).filter(Boolean);
        arr.splice(ix, 1);
        ta.value = arr.join(', ');
        renderColChips(c);
        syncAllModularPreviews();
      });
    });
  }

  function addColChip(colNum) {
    const textarea = document.getElementById(`editFooterCol${colNum}Links`);
    if (!textarea) return;
    const existing = textarea.value.split(',').map(s => s.trim()).filter(Boolean);
    existing.push('New Option');
    textarea.value = existing.join(', ');
    renderColChips(colNum);
    syncAllModularPreviews();
    // Focus the newly added input
    const container = document.getElementById(`chipsListCol${colNum}`);
    const inputs = container?.querySelectorAll('.cms-item-name-input');
    if (inputs && inputs.length > 0) {
      const lastInput = inputs[inputs.length - 1];
      lastInput.focus();
      lastInput.select();
    }
  }

  // Wire Add Item buttons for all 6 columns
  for (let col = 1; col <= 6; col++) {
    const addBtn = document.getElementById(`btnAddChipCol${col}`);
    if (addBtn) addBtn.addEventListener('click', () => addColChip(col));
    // Render initial dropdown items from the textarea's default value
    renderColChips(col);
  }

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
        const name = prompt('Enter Development Name:', 'SERENITY HILLS, GURUGRAM');
        if (!name) return;
        const location = prompt('Enter Location (e.g. Gurugram, Mohali):', 'Gurugram') || 'Gurugram';
        const category = prompt('Enter Category (Residential / Commercial):', 'Residential') || 'Residential';

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

      // 1. Built on Legacy
      const legacyPayload = {
        title: document.getElementById('editTextLegacyTitleRich')?.innerHTML || '',
        content: document.getElementById('editTextLegacyBodyRich')?.innerHTML || ''
      };

      let walkImg = document.getElementById('walkCurrentImgPath')?.textContent || state.sections?.walkthrough?.image || '/images/project-walkthrough.jpg';
      if (walkImg.includes('/_next/image') && walkImg.includes('url=')) {
        try {
          const parsed = new URL(walkImg, window.location.origin);
          walkImg = parsed.searchParams.get('url') || walkImg;
        } catch (e) {}
      }
      const walkPayload = {
        title: document.getElementById('editTextWalkTitleRich')?.innerHTML || '',
        badge: document.getElementById('editTextWalkBadge')?.value || '',
        subtitle: document.getElementById('editTextWalkSubRich')?.innerHTML || '',
        content: document.getElementById('editTextWalkCaptionRich')?.innerHTML || '',
        image: walkImg
      };

      // 3. Blogs & Captions
      const blogPosts = (state.sections?.blogs?.posts || [
        { id: 1, caption: "EMAAR INDIA: BESPOKE, LUXURIOUS & SUSTAINABLE LIVING", image: "/images/blog1.jpg", link: "/blogs/bespoke-living" },
        { id: 2, caption: "DIGI HOMES VS URBAN OASIS: SMART LUXURY IN SECTOR 62", image: "/images/blog2.jpg", link: "/blogs/digi-homes" }
      ]);
      const blog1Img = document.getElementById('blog1ImgPath')?.textContent;
      const blog2Img = document.getElementById('blog2ImgPath')?.textContent;
      const blog1Cap = document.getElementById('editTextBlog1CaptionRich')?.innerHTML;
      const blog2Cap = document.getElementById('editTextBlog2CaptionRich')?.innerHTML;

      if (blogPosts[0]) {
        if (blog1Img) blogPosts[0].image = blog1Img;
        if (blog1Cap) blogPosts[0].caption = blog1Cap;
      }
      if (blogPosts[1]) {
        if (blog2Img) blogPosts[1].image = blog2Img;
        if (blog2Cap) blogPosts[1].caption = blog2Cap;
      }

      const blogsPayload = {
        title: document.getElementById('editTextBlogTitleRich')?.innerHTML || '',
        subtitle: document.getElementById('editTextBlogSubRich')?.innerHTML || '',
        posts: blogPosts
      };

      // 4. Global Footer
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
        col1_title: document.getElementById('editFooterCol1Title')?.value || 'ABOUT EMAAR',
        col1_links: document.getElementById('editFooterCol1Links')?.value || '',
        col2_title: document.getElementById('editFooterCol2Title')?.value || 'PROJECTS',
        col2_links: document.getElementById('editFooterCol2Links')?.value || '',
        col3_title: document.getElementById('editFooterCol3Title')?.value || 'MASTER DEVELOPMENTS',
        col3_links: document.getElementById('editFooterCol3Links')?.value || '',
        col4_title: document.getElementById('editFooterCol4Title')?.value || 'LATEST LAUNCHES',
        col4_links: document.getElementById('editFooterCol4Links')?.value || '',
        col5_title: document.getElementById('editFooterCol5Title')?.value || 'EMAAR INTERNATIONAL',
        col5_links: document.getElementById('editFooterCol5Links')?.value || '',
        col6_title: document.getElementById('editFooterCol6Title')?.value || 'EMAAR HOSPITALITY',
        col6_links: document.getElementById('editFooterCol6Links')?.value || '',
        legal_text: document.getElementById('editFooterLegal')?.value || 'Privacy Policy • Disclaimer • Terms & Conditions • Country & Language • RERA Registered',
        copyright_html: document.getElementById('editFooterCopyRich')?.innerHTML || '© 2026 Emaar India Limited. All rights reserved. Visionary architecture & enduring spaces.'
      };

      await Promise.all([
        fetch('/api/sections/header', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(headerPayload)
        }),
        fetch('/api/sections/legacy_intro', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(legacyPayload)
        }),
        fetch('/api/sections/walkthrough', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(walkPayload)
        }),
        fetch('/api/sections/blogs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogsPayload)
        }),
        fetch('/api/sections/footer', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(footerPayload)
        })
      ]);

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
  // PAGE-SPECIFIC COMPONENT EDITING CONTROLLER
  // =====================================================================
  state.activeContentPageSlug = '/';

  function populateContentEditorPageSelect() {
    const select = document.getElementById('contentEditorPageSelect');
    if (!select) return;
    const currentVal = state.activeContentPageSlug || '/';
    select.innerHTML = `
      <option value="/">Home Page (/)</option>
      ${(state.pages || []).filter(p => p.slug !== '/').map(p => `
        <option value="${p.slug}">${p.title} (${p.slug})</option>
      `).join('')}
    `;
    select.value = currentVal;
  }

  function renderContentEditorForActivePage() {
    const slug = state.activeContentPageSlug || '/';
    const select = document.getElementById('contentEditorPageSelect');
    if (select) select.value = slug;
    const badge = document.getElementById('contentEditorActiveSlugBadge');
    if (badge) badge.textContent = slug;

    const homeWrapper = document.getElementById('homePageComponentsWrapper');
    const customWrapper = document.getElementById('customPageComponentsWrapper');

    if (slug === '/') {
      if (homeWrapper) homeWrapper.style.display = 'block';
      if (customWrapper) customWrapper.style.display = 'none';
    } else {
      if (homeWrapper) homeWrapper.style.display = 'none';
      if (customWrapper) customWrapper.style.display = 'block';

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
          previewBtn.href = (targetSlug && targetSlug !== '/') ? `/preview${targetSlug}` : '/preview';
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
        const initialBanner = page.hero_banner || '/images/landmarks/Serenity-hills-big.webp';

        if (heroTitleInput) heroTitleInput.value = page.hero_title || page.title || '';
        if (heroSubInput) heroSubInput.value = page.hero_subtitle || '';
        if (bodyContentInput) bodyContentInput.value = page.content || '';
        if (bannerPath) bannerPath.textContent = initialBanner;
        if (bannerThumb) bannerThumb.src = initialBanner;
        if (previewHeroTitle) previewHeroTitle.textContent = initialTitle;
        if (previewHeroSub) previewHeroSub.textContent = initialSub;
        if (previewHeroBg) previewHeroBg.src = initialBanner;

        // Active sections checkboxes
        const activeSecs = page.sections || ['hero', 'overview', 'projects', 'amenities', 'cta'];
        document.querySelectorAll('input[name="customPageSection"]').forEach(cb => {
          cb.checked = activeSecs.includes(cb.value);
        });
      }
    }
  }

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
        showToast('✓ Hero banner selected! Click "Save Staged Changes" to apply.');
      }
    });
  });

  document.getElementById('contentEditorPageSelect')?.addEventListener('change', (e) => {
    state.activeContentPageSlug = e.target.value;
    renderContentEditorForActivePage();
  });

  async function saveCustomPageContent() {
    const slug = state.activeContentPageSlug;
    const page = (state.pages || []).find(p => p.slug === slug);
    if (!page) return;

    const selectedSections = Array.from(document.querySelectorAll('input[name="customPageSection"]:checked')).map(cb => cb.value);
    const payload = {
      hero_title: document.getElementById('customEditHeroTitle')?.value.trim() || page.title,
      hero_subtitle: document.getElementById('customEditHeroSubtitle')?.value.trim() || '',
      hero_banner: document.getElementById('customEditHeroBannerPath')?.textContent.trim() || page.hero_banner,
      content: document.getElementById('customEditBodyContent')?.value.trim() || '',
      sections: selectedSections
    };

    try {
      showToast(`Saving changes for "${page.title}"...`);
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        Object.assign(page, payload);
        showToast(`✓ Changes saved for "${page.title}"!`);
        if (liveSyncChannel) {
          liveSyncChannel.postMessage({ type: 'STAGED_CHANGE', timestamp: Date.now() });
        }
        loadPages();
        loadDashboardStats();
      } else {
        showToast(d.message || 'Error saving page', true);
      }
    } catch (err) {
      showToast('Error saving page changes', true);
    }
  }

  document.getElementById('btnSaveCustomPageDirect')?.addEventListener('click', saveCustomPageContent);

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
        attachOverviewEditPageListeners();
      }
    } catch (e) {}
  }

  function renderPages() {
    const tbody = document.getElementById('dashboardPagesTable');
    if (tbody) {
      tbody.innerHTML = '';
      (state.pages || []).forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${p.title}</strong></td>
          <td><code style="color:#09090b;background:#f4f4f5;padding:2px 6px;border-radius:4px;font-weight:600;">${p.slug}</code></td>
          <td><span class="badge-pill">${p.template || 'standard'}</span></td>
          <td><span class="live-pill" style="${p.status === 'draft' ? 'background:#f1f5f9; color:#64748b;' : ''}">${p.status || 'published'}</span></td>
          <td class="text-right">
            <button type="button" class="btn btn-secondary btn-xs btn-edit-table-page" data-slug="${p.slug}" style="margin-right:4px;">Edit</button>
            ${p.slug !== '/' ? `<button type="button" class="btn btn-danger btn-xs btn-del-page" data-id="${p.id}" data-title="${p.title}">Delete</button>` : '<span style="font-size:11px;color:#94a3b8;">Home</span>'}
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
          if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
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
            <button type="button" class="btn-link btn-edit-page-direct" data-page-slug="${p.slug}">View & Edit ›</button>
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
      previewLink.href = (targetSlug && targetSlug !== '/') ? `/preview${targetSlug}` : '/preview';
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
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
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
            if (confirm(`Are you sure you want to rollback to ${ver}?\n\nThis will immediately restore the live website (port 3000) and CMS data to this safe snapshot.`)) {
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
    logoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeProfileDropdown();
      showToast('Logged out successfully.');
      setTimeout(() => {
        showToast('Session terminated.');
      }, 800);
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

  // Initial Data Load & Feature Wiring
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
  updateStagedStatusBadge();
  attachOverviewEditPageListeners();
});
