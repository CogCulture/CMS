"use client";

import { useEffect, useState, useRef } from "react";

export default function VisualEditor() {
  const [isActive, setIsActive] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, layers: [], imageTarget: null, opensLeft: false });
  const [selectedLayer, setSelectedLayer] = useState(null);
  
  // Modals
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  // Disable background page scrolling when any modal is open
  useEffect(() => {
    if (mediaPickerOpen || cropModalOpen || codeModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow || "";
      };
    }
  }, [mediaPickerOpen, cropModalOpen, codeModalOpen]);
  
  // Media state
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Crop state
  const [cropScale, setCropScale] = useState(100);
  const [cropPosX, setCropPosX] = useState(50);
  const [cropPosY, setCropPosY] = useState(50);
  const [cropFit, setCropFit] = useState("cover");
  
  // Code inspector state
  const [rawCode, setRawCode] = useState("");
  
  // Slots & Shapes
  const [slots, setSlots] = useState([]);
  const [activeTool, setActiveTool] = useState(null); // 'text' | 'image' | 'video' | null
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ clientX: 0, clientY: 0, pageX: 0, pageY: 0 });
  const [drawCurrent, setDrawCurrent] = useState({ clientX: 0, clientY: 0, pageX: 0, pageY: 0 });
  const [drawnShapes, setDrawnShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [resizingNode, setResizingNode] = useState(null);
  const [draggingShape, setDraggingShape] = useState(null);
  const [multiSelectedElements, setMultiSelectedElements] = useState([]);

  // Active Element Selection & Transform Box State
  const [activeBoxInfo, setActiveBoxInfo] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [resizingElement, setResizingElement] = useState(null);
  const [boxWidthDropdownOpen, setBoxWidthDropdownOpen] = useState(false);
  const [isTextEditing, setIsTextEditing] = useState(false);

  // Section Add Divider on hover
  const [hoveredDivider, setHoveredDivider] = useState(null);

  // Publish Progress State
  const [publishModal, setPublishModal] = useState({
    open: false,
    step: 1,
    status: "idle",
    message: "",
    version: "",
    timestamp: "",
    errorMsg: ""
  });

  // Section & Grid Layout Modal State
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [hoverGridCols, setHoverGridCols] = useState(0);
  const [hoverGridRows, setHoverGridRows] = useState(0);
  const [gridContentType, setGridContentType] = useState("image"); // 'image' | 'video' | 'text' | 'stats'
  const [presetCategory, setPresetCategory] = useState("all"); // 'all' | 'text' | 'video' | 'gallery' | 'stats'
  const [gridFrameStyle, setGridFrameStyle] = useState("modern"); // 'modern' | 'framed' | 'dark' | 'minimal' | 'elevated'
  const [gridAspect, setGridAspect] = useState("16/10"); // '16/10' | '4/3' | '1/1' | '3/4'
  const [gridRounding, setGridRounding] = useState("12px"); // '0px' | '8px' | '12px' | '20px'
  const [gridHoverZoom, setGridHoverZoom] = useState(true);
  const [scrollTick, setScrollTick] = useState(0);

  // Helper to open Add Section & Grid Modal cleanly with mutual exclusivity
  const handleOpenSectionModal = () => {
    setActiveTool(null);
    activeTextRef.current = null;
    setActiveBoxInfo(null);
    setTextPillBar((prev) => ({ ...prev, visible: false }));
    setSelectedShapeId(null);
    setMultiSelectedElements([]);
    setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
    setSectionModalOpen(true);
  };

  const [toastMsg, setToastMsg] = useState("");
  const [textPillBar, setTextPillBar] = useState({ visible: false, x: 0, y: 0, placement: "top", arrowOffset: 250 });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    align: "left",
    block: "p",
    color: "#0f172a",
    fontSize: 12
  });
  const [fontSizeInput, setFontSizeInput] = useState(12);

  useEffect(() => {
    setFontSizeInput(activeFormats.fontSize || 12);
  }, [activeFormats.fontSize]);
  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);

  // Immediately close block dropdown when user clicks anything else in the toolbar or in the app
  useEffect(() => {
    if (!blockDropdownOpen) return;
    const handleOutsideClick = (e) => {
      const wrapper = document.getElementById("blockFormatDropdownWrapper");
      if (wrapper && !wrapper.contains(e.target)) {
        setBlockDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("touchstart", handleOutsideClick, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("touchstart", handleOutsideClick, true);
    };
  }, [blockDropdownOpen]);

  // Synchronize multi-selected element overlay on scroll to prevent detached/freezing blue boxes
  useEffect(() => {
    if (!multiSelectedElements || multiSelectedElements.length === 0) return;
    const handleMultiSelectScroll = () => {
      setScrollTick((prev) => (prev + 1) % 1000);
    };
    window.addEventListener("scroll", handleMultiSelectScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleMultiSelectScroll);
  }, [multiSelectedElements]);

  const [hoveredImage, setHoveredImage] = useState(null);
  const activeTextRef = useRef(null);
  const savedSelectionRangeRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  // Undo / Redo History System (Ctrl+Z and Ctrl+Y)
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const initialTextRef = useRef(null);
  const dragStartShapesRef = useRef(null);
  const drawnShapesRef = useRef(drawnShapes);
  drawnShapesRef.current = drawnShapes;

  const updateHistoryState = () => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const pushHistory = (action) => {
    undoStackRef.current.push(action);
    if (undoStackRef.current.length > 50) undoStackRef.current.shift();
    redoStackRef.current = [];
    updateHistoryState();
  };

  const handleUndo = () => {
    if (undoStackRef.current.length > 0) {
      const action = undoStackRef.current.pop();
      try {
        action.undo();
        redoStackRef.current.push(action);
        updateHistoryState();
        showToast(`Undo: ${action.desc || "action"}`);
      } catch (err) {
        console.error("Undo error:", err);
      }
    } else {
      try {
        document.execCommand("undo", false, null);
        showToast("Undo");
      } catch (e) {}
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length > 0) {
      const action = redoStackRef.current.pop();
      try {
        action.redo();
        undoStackRef.current.push(action);
        updateHistoryState();
        showToast(`Redo: ${action.desc || "action"}`);
      } catch (err) {
        console.error("Redo error:", err);
      }
    } else {
      try {
        document.execCommand("redo", false, null);
        showToast("Redo");
      } catch (e) {}
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const updateBoxRect = (target = activeTextRef.current) => {
    if (!target || !document.body.contains(target)) {
      setActiveBoxInfo(null);
      setTextPillBar((prev) => ({ ...prev, visible: false }));
      return;
    }
    const rect = target.getBoundingClientRect();
    setActiveBoxInfo({
      el: target,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      tag: target.tagName.toLowerCase()
    });
    const pillWidth = 560;
    const pillHeight = 44;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const topBarHeight = 54;
    const margin = 12;

    const targetCenterX = rect.left + rect.width / 2;
    const halfWidth = pillWidth / 2;

    let pillCenterX;
    if (pillWidth + margin * 2 >= vw) {
      pillCenterX = vw / 2;
    } else {
      pillCenterX = Math.max(halfWidth + margin, Math.min(vw - halfWidth - margin, targetCenterX));
    }

    // SMART DROPDOWN DETECTION:
    // If the element has an open dropdown menu underneath it (e.g. navbar links like PROJECTS), do NOT overlap the dropdown!
    let dropdownBottom = null;
    const headerEl = document.querySelector("header") || target.closest("header, nav") || target.parentElement;
    if (headerEl) {
      const candidates = headerEl.querySelectorAll(
        '[class*="absolute"], [class*="shadow-lg"], [class*="shadow-md"], [class*="dropdown"], [class*="menu"], ul, div[style*="position: absolute"]'
      );
      for (const d of candidates) {
        if (d.contains(target) || target.contains(d)) continue;
        const dRect = d.getBoundingClientRect();
        if (dRect.height > 20 && dRect.width > 30 && dRect.bottom > rect.bottom && dRect.top <= rect.bottom + 90) {
          if (!dropdownBottom || dRect.bottom > dropdownBottom) {
            dropdownBottom = dRect.bottom;
          }
        }
      }
    }

    const isTopHeaderElement = rect.top - 6 < 74;
    const bottomClearance = isTopHeaderElement ? 34 : 14;
    const fitsAbove = rect.top - pillHeight - 16 >= topBarHeight + 10;
    let placement = "top";
    let y = rect.top - 12;

    if (dropdownBottom) {
      // An active dropdown is open under this item! Place toolbar comfortably BELOW the entire dropdown!
      placement = "bottom";
      y = dropdownBottom + 16;
    } else if (!fitsAbove) {
      placement = "bottom";
      y = Math.max(topBarHeight + bottomClearance, rect.bottom + bottomClearance);
    }

    const pillLeft = pillCenterX - halfWidth;
    const arrowPos = Math.max(20, Math.min(pillWidth - 20, targetCenterX - pillLeft));

    setTextPillBar({
      visible: true,
      x: pillCenterX,
      y: y,
      placement,
      arrowOffset: arrowPos
    });
  };

  // Continuous Bounding Box Position Sync (tracks moving carousel / Swiper tray / transitions / open dropdowns)
  useEffect(() => {
    if (!activeBoxInfo) return;
    let animId;
    let lastRect = null;
    let lastDropdownBottom = null;

    const syncActiveBox = () => {
      const el = activeTextRef.current;
      if (el && document.body.contains(el)) {
        const wrapper = el.tagName === "IMG" ? getImgWrapper(el) : null;
        const target = wrapper || el;
        const r = target.getBoundingClientRect();

        // Check if a dropdown under this item opened or closed
        const headerEl = document.querySelector("header") || target.closest("header, nav");
        let curDropdownBottom = null;
        if (headerEl) {
          const candidates = headerEl.querySelectorAll(
            '[class*="absolute"], [class*="shadow-lg"], [class*="shadow-md"], [class*="dropdown"], [class*="menu"], ul, div[style*="position: absolute"]'
          );
          for (const d of candidates) {
            if (d.contains(target) || target.contains(d)) continue;
            const dRect = d.getBoundingClientRect();
            if (dRect.height > 20 && dRect.width > 30 && dRect.bottom > r.bottom && dRect.top <= r.bottom + 90) {
              if (!curDropdownBottom || dRect.bottom > curDropdownBottom) {
                curDropdownBottom = dRect.bottom;
              }
            }
          }
        }

        if (curDropdownBottom !== lastDropdownBottom) {
          lastDropdownBottom = curDropdownBottom;
          updateBoxRect(target);
        }

        if (!lastRect || Math.abs(r.left - lastRect.left) > 0.5 || Math.abs(r.top - lastRect.top) > 0.5 || Math.abs(r.width - lastRect.width) > 0.5 || Math.abs(r.height - lastRect.height) > 0.5) {
          lastRect = { left: r.left, top: r.top, width: r.width, height: r.height };
          setActiveBoxInfo((prev) => prev ? {
            ...prev,
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height
          } : null);
        }
      } else {
        setActiveBoxInfo(null);
      }
      animId = requestAnimationFrame(syncActiveBox);
    };
    animId = requestAnimationFrame(syncActiveBox);
    return () => cancelAnimationFrame(animId);
  }, [activeBoxInfo?.el]);

  const handleDuplicateActiveElement = () => {
    const el = activeTextRef.current;
    if (!el || !el.parentNode) return;
    try {
      const clone = el.cloneNode(true);
      if (clone.id) {
        clone.id = `${clone.id}_dup_${Date.now().toString().slice(-4)}`;
      }
      const parent = el.parentNode;
      const nextSibling = el.nextSibling;
      if (nextSibling) {
        parent.insertBefore(clone, nextSibling);
      } else {
        parent.appendChild(clone);
      }

      clone.style.outline = "2px solid #2563eb";
      setTimeout(() => {
        if (clone) clone.style.outline = "";
      }, 1500);

      pushHistory({
        desc: "Duplicate block",
        undo: () => {
          if (clone.parentNode) clone.parentNode.removeChild(clone);
          activeTextRef.current = el;
          updateBoxRect(el);
        },
        redo: () => {
          if (nextSibling) {
            parent.insertBefore(clone, nextSibling);
          } else {
            parent.appendChild(clone);
          }
          activeTextRef.current = clone;
          updateBoxRect(clone);
        }
      });

      activeTextRef.current = clone;
      updateBoxRect(clone);
      showToast("✓ Duplicated block! Drag anywhere to reposition or click to edit.");
    } catch (err) {
      console.error("Failed to duplicate element:", err);
    }
  };

  const handleDeleteActiveElement = () => {
    const el = activeTextRef.current;
    if (!el || !el.parentNode) return;
    const parent = el.parentNode;
    const nextSibling = el.nextSibling;

    pushHistory({
      desc: "Delete block",
      undo: () => {
        if (nextSibling && nextSibling.parentNode === parent) {
          parent.insertBefore(el, nextSibling);
        } else {
          parent.appendChild(el);
        }
        activeTextRef.current = el;
        updateBoxRect(el);
      },
      redo: () => {
        if (el.parentNode) el.parentNode.removeChild(el);
        activeTextRef.current = null;
        setActiveBoxInfo(null);
        setTextPillBar((prev) => ({ ...prev, visible: false }));
        setBlockDropdownOpen(false);
      }
    });

    parent.removeChild(el);
    activeTextRef.current = null;
    setActiveBoxInfo(null);
    setTextPillBar((prev) => ({ ...prev, visible: false }));
    setBlockDropdownOpen(false);
    showToast("✓ Deleted block. Press Ctrl+Z to undo.");
  };

  const handleDeleteMultiSelected = () => {
    if (!multiSelectedElements || multiSelectedElements.length === 0) return;

    const domItems = multiSelectedElements.filter((item) => item.type === "dom" && item.el?.parentNode);
    const shapeItems = multiSelectedElements.filter((item) => item.type === "shape");

    const prevShapes = drawnShapesRef.current;
    const shapeIdsToDelete = new Set(shapeItems.map((s) => s.id));
    const nextShapes = prevShapes.filter((s) => !shapeIdsToDelete.has(s.id));

    const domRecords = domItems.map((item) => ({
      el: item.el,
      parent: item.el.parentNode,
      nextSibling: item.el.nextSibling
    }));

    domRecords.forEach(({ el, parent }) => {
      if (el.parentNode === parent) {
        parent.removeChild(el);
      }
    });

    // Check if any parent grid containers or sections were left empty and clean them up
    const emptyContainerCleanups = [];
    const parentsChecked = new Set();
    domRecords.forEach(({ parent }) => {
      if (!parent || !parent.parentNode || parentsChecked.has(parent)) return;
      parentsChecked.add(parent);
      const isGrid = parent.classList?.contains("cms-grid-container") ||
        parent.style?.display === "grid" ||
        (typeof window !== "undefined" && window.getComputedStyle(parent).display === "grid");
      if (isGrid && parent.children.length === 0) {
        emptyContainerCleanups.push({
          el: parent,
          parent: parent.parentNode,
          nextSibling: parent.nextSibling
        });
        const sec = parent.closest("section.custom-added-section, section");
        if (sec && sec.parentNode && !parentsChecked.has(sec)) {
          parentsChecked.add(sec);
          const remainingContent = Array.from(sec.querySelectorAll("img, p, h1, h2, h3, a, button")).filter(
            (item) => !domItems.some((d) => d.el === item || d.el.contains(item))
          );
          if (remainingContent.length <= 1) {
            emptyContainerCleanups.push({
              el: sec,
              parent: sec.parentNode,
              nextSibling: sec.nextSibling
            });
          }
        }
      }
    });

    emptyContainerCleanups.forEach(({ el, parent }) => {
      if (el.parentNode === parent) {
        parent.removeChild(el);
      }
    });

    if (shapeIdsToDelete.size > 0) {
      setDrawnShapes(nextShapes);
    }

    pushHistory({
      desc: `Delete ${multiSelectedElements.length} items`,
      undo: () => {
        emptyContainerCleanups.forEach(({ el, parent, nextSibling }) => {
          if (nextSibling && nextSibling.parentNode === parent) {
            parent.insertBefore(el, nextSibling);
          } else {
            parent.appendChild(el);
          }
        });
        domRecords.forEach(({ el, parent, nextSibling }) => {
          if (nextSibling && nextSibling.parentNode === parent) {
            parent.insertBefore(el, nextSibling);
          } else {
            parent.appendChild(el);
          }
        });
        if (shapeIdsToDelete.size > 0) {
          setDrawnShapes(prevShapes);
        }
        setMultiSelectedElements(multiSelectedElements);
      },
      redo: () => {
        domRecords.forEach(({ el, parent }) => {
          if (el.parentNode === parent) {
            parent.removeChild(el);
          }
        });
        emptyContainerCleanups.forEach(({ el, parent }) => {
          if (el.parentNode === parent) {
            parent.removeChild(el);
          }
        });
        if (shapeIdsToDelete.size > 0) {
          setDrawnShapes(nextShapes);
        }
        setMultiSelectedElements([]);
      }
    });

    const count = multiSelectedElements.length;
    setMultiSelectedElements([]);
    showToast(`✓ Deleted ${count} selected items. Press Ctrl+Z to undo.`);
  };

  const getImgWrapper = (imgEl) => {
    if (!imgEl || imgEl.tagName !== "IMG") return null;
    let curr = imgEl.parentElement;
    while (curr && curr !== document.body) {
      if (["SECTION", "MAIN", "BODY", "HEADER", "FOOTER", "NAV"].includes(curr.tagName)) break;
      if (curr.classList && (curr.classList.contains("swiper-wrapper") || curr.classList.contains("swiper"))) break;
      const cl = curr.className || "";
      const isWrapperClass = typeof cl === "string" && (
        cl.includes("aspect-") ||
        cl.includes("overflow-hidden") ||
        cl.includes("relative") ||
        cl.includes("group")
      );
      if (curr.tagName === "FIGURE" || curr.tagName === "PICTURE" || isWrapperClass) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return imgEl.parentElement;
  };

  const enterTextEditing = (targetNode, clientX, clientY) => {
    const target = targetNode || activeTextRef.current;
    if (!target) return;
    if (target.tagName === "IMG" || target.querySelector("img")) return;
    target.contentEditable = "true";
    target.focus();
    setIsTextEditing(true);

    if (clientX !== undefined && clientY !== undefined && document.caretRangeFromPoint) {
      try {
        const range = document.caretRangeFromPoint(clientX, clientY);
        if (range && target.contains(range.startContainer)) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch (err) {}
    }
  };

  const exitTextEditing = () => {
    if (activeTextRef.current) {
      try {
        activeTextRef.current.contentEditable = "false";
        activeTextRef.current.blur();
      } catch (e) {}
    }
    setIsTextEditing(false);
  };

  const handleStartDragElement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeTextRef.current) return;
    const rawEl = activeTextRef.current;

    // For images, drag the container/wrapper as a unified entity so the image is never clipped or cut!
    const wrapper = rawEl.tagName === "IMG" ? getImgWrapper(rawEl) : null;
    const el = wrapper || rawEl;

    // Reset raw <img> internal translation so it doesn't get clipped by the wrapper
    if (rawEl.tagName === "IMG") {
      rawEl.style.left = "0px";
      rawEl.style.top = "0px";
      rawEl.style.position = "relative";
    }

    const comp = window.getComputedStyle(el);
    if (comp.position === "static") {
      el.style.position = "relative";
    }
    if (comp.display === "inline") {
      el.style.display = "inline-block";
    }

    const curLeft = parseFloat(el.style.left) || 0;
    const curTop = parseFloat(el.style.top) || 0;
    const rect = el.getBoundingClientRect();

    dragStartShapesRef.current = {
      target: el,
      rawImg: rawEl.tagName === "IMG" ? rawEl : null,
      left: el.style.left,
      top: el.style.top,
      position: el.style.position,
      transition: el.style.transition
    };

    el.style.transition = "none";

    // Cache alignment targets from sibling & container elements
    const container = el.closest("nav, aside, header, section, main, [data-section]") || el.parentElement;
    const candidates = [];
    if (container) {
      const peers = container.querySelectorAll("h1, h2, h3, h4, p, a, button, li, div, span, img");
      peers.forEach((peer) => {
        if (peer === el || peer.contains(el) || el.contains(peer)) return;
        const r = peer.getBoundingClientRect();
        if (r.width > 15 && r.height > 8) {
          candidates.push({
            left: Math.round(r.left),
            centerX: Math.round(r.left + r.width / 2),
            right: Math.round(r.right),
            top: Math.round(r.top),
            centerY: Math.round(r.top + r.height / 2),
            bottom: Math.round(r.bottom)
          });
        }
      });
    }

    setDraggingElement({
      el,
      rawImg: rawEl.tagName === "IMG" ? rawEl : null,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: curLeft,
      origTop: curTop,
      initBoxLeft: rect.left,
      initBoxTop: rect.top,
      initBoxWidth: rect.width,
      initBoxHeight: rect.height,
      initPillX: textPillBar.x,
      initPillY: textPillBar.y,
      candidates: candidates.slice(0, 40)
    });

    document.body.style.userSelect = "none";
    document.body.style.cursor = "move";
  };

  const handleStartResizeElement = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeTextRef.current) return;
    const rawEl = activeTextRef.current;
    const wrapper = rawEl.tagName === "IMG" ? getImgWrapper(rawEl) : null;
    const el = rawEl;
    const targetToMeasure = wrapper || el;
    const rect = targetToMeasure.getBoundingClientRect();
    const curLeft = parseFloat(targetToMeasure.style.left) || 0;

    // Reset raw <img> internal translation so it doesn't get clipped by the wrapper
    if (rawEl.tagName === "IMG") {
      rawEl.style.left = "0px";
      rawEl.style.top = "0px";
    }

    dragStartShapesRef.current = {
      elWidth: el.style.width,
      elMaxWidth: el.style.maxWidth,
      elHeight: el.style.height,
      elMinHeight: el.style.minHeight,
      elLeft: el.style.left,
      elTop: el.style.top,
      elPosition: el.style.position,
      wrapperCss: wrapper ? wrapper.style.cssText : null
    };

    setResizingElement({
      el,
      wrapper,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      origWidth: rect.width,
      origHeight: rect.height,
      origLeft: curLeft
    });
  };

  const handleAlignBoxLeft = () => {
    if (!activeTextRef.current) return;
    const el = activeTextRef.current;
    const prevCss = el.style.cssText;

    // Remove any translation, centering margins or right shifts, align box and text to start from left
    el.style.position = "relative";
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.transform = "none";
    el.style.setProperty("margin-left", "0px", "important");
    el.style.setProperty("margin-right", "auto", "important");
    el.style.setProperty("text-align", "left", "important");
    el.style.setProperty("align-self", "flex-start", "important");
    el.style.setProperty("width", "100%", "important");
    el.style.setProperty("max-width", "100%", "important");

    if (el.parentElement) {
      el.parentElement.style.setProperty("text-align", "left", "important");
    }
    el.querySelectorAll("*").forEach((child) => {
      child.style.setProperty("text-align", "left", "important");
    });

    setActiveFormats((prev) => ({ ...prev, align: "left" }));
    updateBoxRect(el);

    const nextCss = el.style.cssText;
    pushHistory({
      desc: "Start from left",
      undo: () => {
        el.style.cssText = prevCss;
        updateBoxRect(el);
      },
      redo: () => {
        el.style.cssText = nextCss;
        updateBoxRect(el);
      }
    });

    syncTextToCMS(el);
    showToast("✓ Box aligned to start from left!");
  };

  const handleSetBoxWidth = (mode) => {
    if (!activeTextRef.current) return;
    const el = activeTextRef.current;
    const prevCss = el.style.cssText;

    if (mode === "full") {
      el.style.setProperty("width", "100%", "important");
      el.style.setProperty("max-width", "100%", "important");
      showToast("✓ Box set to 100% full width");
    } else if (mode === "narrow") {
      el.style.setProperty("width", "560px", "important");
      el.style.setProperty("max-width", "100%", "important");
      showToast("✓ Box set to 560px width");
    } else if (mode === "fit") {
      el.style.setProperty("width", "max-content", "important");
      el.style.setProperty("max-width", "100%", "important");
      showToast("✓ Box set to fit content");
    } else if (mode === "reset") {
      el.style.width = "";
      el.style.maxWidth = "";
      el.style.minHeight = "";
      el.style.height = "";
      el.style.left = "";
      el.style.top = "";
      el.style.position = "";
      el.style.transform = "";
      el.style.marginLeft = "";
      el.style.marginRight = "";
      showToast("✓ Box sizing & position reset");
    }

    updateBoxRect(el);

    const nextCss = el.style.cssText;
    pushHistory({
      desc: `Box width: ${mode}`,
      undo: () => {
        el.style.cssText = prevCss;
        updateBoxRect(el);
      },
      redo: () => {
        el.style.cssText = nextCss;
        updateBoxRect(el);
      }
    });

    syncTextToCMS(el);
    setBoxWidthDropdownOpen(false);
  };

  const syncTextToCMS = (element = activeTextRef.current) => {
    if (!element) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const text = element.innerText?.trim() || "";
        const html = element.innerHTML || "";
        const tag = element.tagName.toLowerCase();

        // Push text typing history snapshot if content changed
        if (initialTextRef.current && initialTextRef.current.el === element && initialTextRef.current.html !== html) {
          const prevHTML = initialTextRef.current.html;
          const nextHTML = html;
          const el = element;
          pushHistory({
            desc: "Text edit",
            undo: () => {
              el.innerHTML = prevHTML;
              activeTextRef.current = el;
              syncTextToCMS(el);
            },
            redo: () => {
              el.innerHTML = nextHTML;
              activeTextRef.current = el;
              syncTextToCMS(el);
            }
          });
          initialTextRef.current.html = nextHTML;
        }

        let payload = { sections: {} };

        const headerEl = element.closest("header, nav");
        if (headerEl) {
          const link = element.closest("a, button");
          const href = link?.getAttribute("href") || "";
          const cmsNav = link?.getAttribute("data-cms-nav") || "";

          const navLinks = Array.from(headerEl.querySelectorAll("nav a, nav button"))
            .map((el) => el.innerText.trim())
            .filter(Boolean);

          payload.sections.header = {
            nav_links: navLinks.join(", ")
          };

          if (cmsNav === "about" || href.includes("about") || text.toUpperCase().includes("ABOUT")) {
            payload.sections.header.about_text = text;
          } else if (cmsNav === "launches" || href.includes("latest-launches") || text.toUpperCase().includes("LAUNCH")) {
            payload.sections.header.launches_text = text;
          } else if (cmsNav === "projects" || text.toUpperCase().includes("PROJECT")) {
            payload.sections.header.projects_text = text;
          } else if (cmsNav === "sustainability" || href.includes("sustainability") || text.toUpperCase().includes("SUSTAIN")) {
            payload.sections.header.sustainability_text = text;
          } else if (link?.innerText?.includes("TOUCH") || link?.innerText?.includes("SCHEDULE") || href.includes("contact")) {
            payload.sections.header.cta_text = text;
          }
        } else if (element.closest("section")?.querySelector('[href*="walkthrough"], img[src*="walkthrough"]') || element.closest('[class*="walkthrough"]')) {
          payload.sections.walkthrough = {};
          if (tag.startsWith("h") || text.toUpperCase().includes("WALKTHROUGH")) {
            payload.sections.walkthrough.title = text;
          } else if (element.classList?.contains("badge") || text === "NEW") {
            payload.sections.walkthrough.badge = text;
          } else {
            payload.sections.walkthrough.content = text;
          }
        } else if (element.closest("section")?.innerText?.includes("BLOGS") || element.closest('[class*="blog"]')) {
          payload.sections.blogs = {};
          if (tag.startsWith("h") || text.toUpperCase().includes("BLOG")) {
            payload.sections.blogs.title = text;
          } else if (text.toUpperCase().includes("VIEW") || element.tagName === "A" || element.closest("a")) {
            payload.sections.blogs.view_all_text = text;
          } else {
            payload.sections.blogs.subtitle = text;
          }
        } else if (text.includes("LEGACY") || text.includes("BUILT ON") || (tag.startsWith("h") && element.closest("section")?.innerText?.includes("LEGACY"))) {
          payload.sections.legacy_intro = { title: html };
        } else if (text.includes("Emaar has shaped") || element.closest("section")?.innerText?.includes("LEGACY")) {
          payload.sections.legacy_intro = { content: html };
        } else {
          payload.sections.legacy_intro = {
            ...(tag.startsWith("h") ? { title: html } : { content: html })
          };
        }

        // If editing a custom route (e.g. /test), also sync custom page sections directly
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
        if (currentPath && currentPath !== "/") {
          const customAddedEls = Array.from(document.querySelectorAll(".custom-added-section"));
          const customSections = customAddedEls.map((sec, idx) => ({
            id: "custom-sec-" + (idx + 1),
            html: sec.innerHTML.replace(/<div style="position: absolute; top: 14px; right: 24px[\s\S]*?<\/div>/, ""),
            title: sec.querySelector("h2")?.innerText.trim() || "",
            content: sec.querySelector("p")?.innerText.trim() || ""
          }));
          try {
            const pagesRes = await fetch("http://localhost:5000/api/pages");
            const pagesData = await pagesRes.json();
            if (pagesData.success && Array.isArray(pagesData.data)) {
              const cleanPath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
              const targetPage = pagesData.data.find((p) => p.slug === cleanPath || p.slug === currentPath);
              if (targetPage) {
                await fetch(`http://localhost:5000/api/pages/${targetPage.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sections: customSections })
                });
              }
            }
          } catch (pErr) {}
        }

        const res = await fetch("http://localhost:5000/api/site-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data?.success) {
          try {
            const bc = new BroadcastChannel("cms_live_sync");
            bc.postMessage({ type: "STAGED_CHANGE" });
          } catch (e) {}
        }
      } catch (e) {
        console.error("Auto-sync error:", e);
      }
    }, 400);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("editor") === "true") {
      setIsActive(true);
      if (params.get("openSection") === "true") {
        setTimeout(() => handleOpenSectionModal(), 200);
      }
    }

    // Top-level listener: always ready to open modal and activate editor from blank canvas or anywhere
    const handleOpenModal = () => {
      setIsActive(true);
      setTimeout(() => handleOpenSectionModal(), 60);
    };

    window.__cmsOpenSectionModal = handleOpenModal;
    window.addEventListener("cms-open-section-modal", handleOpenModal);

    return () => {
      window.removeEventListener("cms-open-section-modal", handleOpenModal);
      delete window.__cmsOpenSectionModal;
    };
  }, []);

  // Set up inline text editing and right click listener
  useEffect(() => {
    if (!isActive) return;

    // Read and update active formatting from target element or selection
    const updateActiveFormats = (target) => {
      if (!target) return;
      try {
        const sel = window.getSelection();
        let sampleNode = target;
        if (sel && !sel.isCollapsed && target.contains(sel.anchorNode)) {
          sampleNode = sel.anchorNode.nodeType === Node.TEXT_NODE ? sel.anchorNode.parentElement : sel.anchorNode;
        } else if (savedSelectionRangeRef.current && !savedSelectionRangeRef.current.collapsed && target.contains(savedSelectionRangeRef.current.commonAncestorContainer)) {
          const rNode = savedSelectionRangeRef.current.commonAncestorContainer;
          sampleNode = rNode.nodeType === Node.TEXT_NODE ? rNode.parentElement : rNode;
        }
        const comp = window.getComputedStyle(sampleNode || target);
        const isBold = comp.fontWeight === "bold" || parseInt(comp.fontWeight, 10) >= 600;
        const isItalic = comp.fontStyle === "italic";
        const isUnderline = comp.textDecorationLine?.includes("underline") || comp.textDecoration?.includes("underline");
        const isStrike = comp.textDecorationLine?.includes("line-through") || comp.textDecoration?.includes("line-through");
        const textAlign = comp.textAlign || "left";
        const tagName = target.tagName.toLowerCase();
        const block = ["h1", "h2", "h3"].includes(tagName) ? tagName : "p";
        const color = comp.color;

        const parsedFontSize = parseInt(comp.fontSize, 10) || 12;

        setActiveFormats({
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
          strikeThrough: isStrike,
          align: textAlign.includes("center") ? "center" : (textAlign.includes("right") ? "right" : "left"),
          block,
          color,
          fontSize: parsedFontSize
        });
      } catch (e) {}
    };

    // Helper to find editable text target (including navbar links, buttons, headers, paragraphs)
    const findEditableTextTarget = (el) => {
      if (!el || el.closest("#visualEditorStudioBar") || el.closest(".visual-editor-portal") || el.closest("#dynamicTextPillBar")) return null;
      if (["VIDEO", "IMG", "INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return null;

      // Priority 1: Heading or paragraph block ancestor
      const blockAncestor = el.closest("h1, h2, h3, h4, h5, h6, p");
      if (blockAncestor && !blockAncestor.closest("#visualEditorStudioBar") && !blockAncestor.closest(".visual-editor-portal")) {
        return blockAncestor;
      }

      // Priority 2: Links, buttons, list items
      const linkOrBtn = el.closest("a, button, li");
      if (linkOrBtn && !linkOrBtn.closest("#visualEditorStudioBar") && !linkOrBtn.closest(".visual-editor-portal")) {
        return linkOrBtn;
      }

      if (["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "BUTTON", "A", "LI", "LABEL"].includes(el.tagName)) {
        return el;
      }
      if (el.tagName === "DIV") {
        const text = el.innerText?.trim();
        const hasMajorSections = el.querySelector("section, header, footer, nav");
        if (text && text.length > 0 && !hasMajorSections) {
          return el;
        }
      }
      return null;
    };

    // Enable contentEditable on text elements or select image with container bounding box
    const handleTextClick = (e) => {
      if (
        e.target.closest("#visualEditorStudioBar") ||
        e.target.closest(".visual-editor-portal") ||
        e.target.closest("#dynamicTextPillBar") ||
        e.target.closest("#activeElementBoxOverlay")
      ) return;

      // Direct image click support
      const clickedImg = e.target.tagName === "IMG" ? e.target : e.target.querySelector("img");
      if (clickedImg && !e.target.closest("#visualEditorStudioBar") && !e.target.closest(".visual-editor-portal")) {
        setSelectedShapeId(null);
        setMultiSelectedElements([]);
        if (clickedImg.style.left && clickedImg.style.left !== "0px") clickedImg.style.left = "0px";
        if (clickedImg.style.top && clickedImg.style.top !== "0px") clickedImg.style.top = "0px";
        activeTextRef.current = clickedImg;
        const wrapper = getImgWrapper(clickedImg);
        updateBoxRect(wrapper || clickedImg);
        setTextPillBar((prev) => ({ ...prev, visible: false }));
        return;
      }

      const target = findEditableTextTarget(e.target);
      if (target) {
        setSelectedShapeId(null);
        setMultiSelectedElements([]);
        if (target.tagName === "A" || target.closest("a") || target.tagName === "BUTTON") {
          e.preventDefault();
        }

        const isAlreadySelected = activeTextRef.current === target;

        if (isAlreadySelected) {
          // Deliberate click on the text of the already selected box -> enter text editing mode
          enterTextEditing(target, e.clientX, e.clientY);
        } else {
          // First click: select box object in mover mode (no cursor blink)
          exitTextEditing();
          target.contentEditable = "false";
          activeTextRef.current = target;
          setIsTextEditing(false);
        }

        if (initialTextRef.current?.el !== target) {
          initialTextRef.current = { el: target, html: target.innerHTML };
        }

        updateBoxRect(target);
        updateActiveFormats(target);
      } else {
        exitTextEditing();
        setTextPillBar((prev) => ({ ...prev, visible: false }));
        setActiveBoxInfo(null);
        activeTextRef.current = null;
        setBlockDropdownOpen(false);
      }
    };

    // Image and navbar logo hover blur and edit detection (disabled to prevent intrusive overlay over small icons)
    const handleMouseOver = (e) => {
      // Intrusive hover pill removed - bounding box shown on select, right click to edit
    };

    const handleScroll = () => {
      setHoveredDivider(null);
      setHoveredImage(null);
      if (activeTextRef.current) {
        const wrapper = activeTextRef.current.tagName === "IMG" ? getImgWrapper(activeTextRef.current) : null;
        updateBoxRect(wrapper || activeTextRef.current);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mouseover", handleMouseOver);

    // Right-click layer detection (Windows style)
    const handleContextMenu = (e) => {
      if (e.target.closest("#visualEditorStudioBar") || e.target.closest("#contextMenuPortal")) return;
      e.preventDefault();

      const elementsAtPoint = Array.from(document.elementsFromPoint?.(e.clientX, e.clientY) || []);
      const layers = [];

      // Smart Hero Banner Detection & Stacked Layer Arrangement (ONLY in Hero section)
      const heroSection = document.querySelector("section:first-of-type, [data-testid='property-hero'], #property-hero-section, header + main > section:first-child");
      const isInsideHero = heroSection && (heroSection.contains(e.target) || (heroSection.getBoundingClientRect().top <= e.clientY && heroSection.getBoundingClientRect().bottom >= e.clientY));

      if (isInsideHero) {
        const heroVideo = heroSection.querySelector("video") || document.querySelector("video");
        const heroLayers = [];

        // Layer 1: Front-most interactive text, heading, or search control
        let frontElement = elementsAtPoint.find((el) =>
          el !== heroSection &&
          el !== heroVideo &&
          !el.closest("#visualEditorStudioBar") &&
          el.id !== "contextMenuPortal" &&
          (["H1", "H2", "H3", "P", "SPAN", "BUTTON", "A", "INPUT"].includes(el.tagName) || el.closest("form, [class*='search'], [class*='PropertySearch']"))
        );

        if (frontElement) {
          const txt = frontElement.innerText?.trim() || frontElement.getAttribute("placeholder") || "";
          const name = txt ? `Text: "${txt.slice(0, 22)}"` : (frontElement.tagName === "INPUT" ? "Property Search Bar" : "Hero Controls & Text");
          heroLayers.push({ name, el: frontElement, type: "text" });
        } else {
          const searchInput = heroSection.querySelector("input, form, button");
          if (searchInput) {
            heroLayers.push({ name: "Hero Search & Controls", el: searchInput, type: "text" });
          } else {
            const heading = heroSection.querySelector("h1, h2, h3, p");
            if (heading) {
              const txt = heading.innerText?.trim() || "";
              heroLayers.push({ name: txt ? `Heading: "${txt.slice(0, 22)}"` : "Hero Headline", el: heading, type: "text" });
            }
          }
        }

        // Layer 2: Hero Background Video
        if (heroVideo) {
          heroLayers.push({ name: "Hero Background Video", el: heroVideo, type: "video" });
        }

        // Layer 3: Hero Section Container
        heroLayers.push({ name: "Hero Section Container", el: heroSection, type: "section" });

        layers.push(...heroLayers);
      }

      // Check if target or any layer element is an image, logo, or icon
      let imgTarget = null;
      if (e.target.tagName === "IMG") {
        imgTarget = e.target;
      } else if (e.target.closest("#activeElementBoxOverlay") && activeTextRef.current) {
        imgTarget = activeTextRef.current.tagName === "IMG" ? activeTextRef.current : activeTextRef.current.querySelector("img");
      }
      if (!imgTarget) {
        imgTarget = e.target.querySelector("img") || e.target.closest("a, button, div, figure, li")?.querySelector("img");
      }
      if (!imgTarget) {
        for (const el of elementsAtPoint) {
          if (el.closest("#visualEditorStudioBar") || el.id === "contextMenuPortal") continue;
          if (el.tagName === "IMG") { imgTarget = el; break; }
          const childImg = el.querySelector("img");
          if (childImg) { imgTarget = childImg; break; }
        }
      }
      if (!imgTarget && activeTextRef.current) {
        imgTarget = activeTextRef.current.tagName === "IMG" ? activeTextRef.current : activeTextRef.current.querySelector("img");
      }

      if (imgTarget) {
        if (imgTarget.style.left && imgTarget.style.left !== "0px") imgTarget.style.left = "0px";
        if (imgTarget.style.top && imgTarget.style.top !== "0px") imgTarget.style.top = "0px";
        activeTextRef.current = imgTarget;
        const wrapper = getImgWrapper(imgTarget);
        updateBoxRect(wrapper || imgTarget);
      }

      let posX = e.clientX;
      let posY = e.clientY;
      const menuWidth = 265;
      const subflyoutWidth = 215;

      // If menu would overflow right edge, position it safely
      if (posX + menuWidth > window.innerWidth - 10) {
        posX = Math.max(10, window.innerWidth - menuWidth - 16);
      }
      if (posY + 260 > window.innerHeight - 10) {
        posY = Math.max(10, window.innerHeight - 270);
      }

      const opensLeft = (posX + menuWidth + subflyoutWidth > window.innerWidth - 10);

      setTextPillBar((prev) => ({ ...prev, visible: false }));
      setContextMenu({
        visible: true,
        x: posX,
        y: posY,
        layers: isInsideHero ? layers : [],
        isHero: isInsideHero,
        imageTarget: imgTarget,
        opensLeft
      });
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest("#contextMenuPortal")) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
      if (!e.target.closest(".visual-editor-shape") && !e.target.closest("#canvasDrawingLayer") && !e.target.closest("#visualEditorStudioBar")) {
        setSelectedShapeId(null);
      }
      if (
        !e.target.closest("#activeElementBoxOverlay") &&
        !e.target.closest("#dynamicTextPillBar") &&
        !e.target.closest("#visualEditorStudioBar") &&
        !e.target.closest(".visual-editor-portal") &&
        !findEditableTextTarget(e.target) &&
        !e.target.closest(".visual-editor-shape")
      ) {
        exitTextEditing();
        activeTextRef.current = null;
        setActiveBoxInfo(null);
        setTextPillBar((prev) => ({ ...prev, visible: false }));
        setMultiSelectedElements([]);
      }
      if (!e.target.closest("#blockFormatDropdownWrapper")) {
        setBlockDropdownOpen(false);
      }
    };

    const handleMouseMove = (e) => {
      // Don't show divider while drawing shapes or dragging/resizing
      if (activeTool || isDrawing || resizingNode || draggingShape || draggingElement || resizingElement) {
        setHoveredDivider(null);
        return;
      }
      if (e.target.closest("#sectionAddDivider")) {
        return; // Stay open while cursor is over the divider button itself
      }
      if (e.target.closest("#visualEditorStudioBar") || e.target.closest(".visual-editor-portal") || e.target.closest("#contextMenuPortal")) {
        setHoveredDivider(null);
        return;
      }

      // Check above footer with hysteresis to eliminate flickering / blinking
      const footerEl = document.querySelector("footer");
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          const dist = Math.abs(e.clientY - rect.top);
          const threshold = hoveredDivider ? 48 : 26; // Hysteresis buffer prevents jitter
          if (dist <= threshold && e.clientX >= rect.left && e.clientX <= rect.right) {
            if (!hoveredDivider || Math.abs(hoveredDivider.y - rect.top) > 2) {
              setHoveredDivider({
                targetEl: footerEl,
                y: rect.top
              });
            }
            return;
          }
        }
      }
      if (hoveredDivider) setHoveredDivider(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isTextEditing) {
          exitTextEditing();
          return;
        }
        setActiveTool(null);
        setIsDrawing(false);
        setSelectedShapeId(null);
        setHoveredDivider(null);
        setBlockDropdownOpen(false);
        setMultiSelectedElements([]);
        return;
      }

      // Undo: Ctrl+Z (or Cmd+Z on Mac) without Shift
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y (Windows) or Ctrl+Shift+Z / Cmd+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete selected box, shape, or multi-selected area via keyboard Delete key
      if (e.key === "Delete" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        if (multiSelectedElements && multiSelectedElements.length > 0) {
          e.preventDefault();
          handleDeleteMultiSelected();
          return;
        }
        if (activeTextRef.current) {
          e.preventDefault();
          handleDeleteActiveElement();
          return;
        }
        if (selectedShapeId) {
          e.preventDefault();
          const prevShapes = drawnShapesRef.current;
          const deletedId = selectedShapeId;
          const newShapes = prevShapes.filter((s) => s.id !== deletedId);
          setDrawnShapes(newShapes);
          setSelectedShapeId(null);
          pushHistory({
            desc: "Delete shape",
            undo: () => setDrawnShapes(prevShapes),
            redo: () => setDrawnShapes(newShapes)
          });
          showToast("Shape deleted");
          return;
        }
      }

      // Backspace: deletes box if not typing inside or if content is empty
      if (e.key === "Backspace" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        if (multiSelectedElements && multiSelectedElements.length > 0 && !e.target.isContentEditable) {
          e.preventDefault();
          handleDeleteMultiSelected();
          return;
        }
        if (activeTextRef.current && (!e.target.isContentEditable || activeTextRef.current.innerText.trim() === "")) {
          e.preventDefault();
          handleDeleteActiveElement();
          return;
        }
        if (selectedShapeId && !e.target.isContentEditable) {
          e.preventDefault();
          const prevShapes = drawnShapesRef.current;
          const deletedId = selectedShapeId;
          const newShapes = prevShapes.filter((s) => s.id !== deletedId);
          setDrawnShapes(newShapes);
          setSelectedShapeId(null);
          pushHistory({
            desc: "Delete shape",
            undo: () => setDrawnShapes(prevShapes),
            redo: () => setDrawnShapes(newShapes)
          });
          showToast("Shape deleted");
          return;
        }
      }
    };

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (activeTextRef.current && sel && sel.rangeCount > 0 && activeTextRef.current.contains(sel.anchorNode)) {
        if (!sel.isCollapsed) {
          savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
        updateActiveFormats(activeTextRef.current);
      }
    };

    const handleDocumentInput = (e) => {
      if (activeTextRef.current && (e.target === activeTextRef.current || activeTextRef.current.contains(e.target))) {
        syncTextToCMS(activeTextRef.current);
        updateBoxRect(activeTextRef.current);
      }
    };

    // Intercept clicks on images or logo links so clicking them shows bounding box only (no direct popup)
    const handleImageClick = (e) => {
      if (e.target.closest("#visualEditorStudioBar") || e.target.closest(".visual-editor-portal") || e.target.closest("#dynamicTextPillBar")) return;
      const img = e.target.tagName === "IMG" ? e.target : e.target.closest("img");
      const linkWithImg = (e.target.tagName === "A" && e.target.querySelector("img")) ? e.target.querySelector("img") : (e.target.closest("a")?.querySelector("img"));
      const targetImg = img || linkWithImg;
      if (targetImg && !targetImg.closest("#visualEditorStudioBar") && !targetImg.closest(".visual-editor-portal")) {
        e.preventDefault();
        e.stopPropagation();
        activeTextRef.current = targetImg;
        updateBoxRect(targetImg);
        setTextPillBar((prev) => ({ ...prev, visible: false }));
        setHoveredImage(null);
      }
    };

    // Intercept clicks on links in editor mode so clicking them enables text editing instead of navigating away (e.g. to 404)
    const handleLinkClickCapture = (e) => {
      if (e.target.closest("#visualEditorStudioBar") || e.target.closest(".visual-editor-portal") || e.target.closest("#dynamicTextPillBar")) return;
      const link = e.target.closest("a");
      if (link && !link.closest("#visualEditorStudioBar") && !link.closest(".visual-editor-portal")) {
        e.preventDefault();
      }
    };

    document.addEventListener("click", handleLinkClickCapture, true);
    document.addEventListener("click", handleImageClick, true);
    document.addEventListener("click", handleTextClick, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("input", handleDocumentInput);

    return () => {
      document.removeEventListener("click", handleLinkClickCapture, true);
      document.removeEventListener("click", handleImageClick, true);
      document.removeEventListener("click", handleTextClick, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("input", handleDocumentInput);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isActive, activeTool, isDrawing, resizingNode, draggingShape]);

  // Window listeners for corner node resizing and shape dragging, plus element dragging and resizing
  useEffect(() => {
    if (!resizingNode && !draggingShape && !draggingElement && !resizingElement) return;

    const handleWindowMouseMove = (e) => {
      if (resizingNode) {
        const dx = e.clientX - resizingNode.startX;
        const dy = e.clientY - resizingNode.startY;

        setDrawnShapes((prev) =>
          prev.map((s) => {
            if (s.id !== resizingNode.shapeId) return s;

            let newW = resizingNode.origW;
            let newH = resizingNode.origH;
            let newX = resizingNode.origX;
            let newY = resizingNode.origY;

            if (resizingNode.corner === "br") {
              newW = Math.max(50, resizingNode.origW + dx);
              newH = Math.max(35, resizingNode.origH + dy);
            } else if (resizingNode.corner === "bl") {
              newW = Math.max(50, resizingNode.origW - dx);
              newX = resizingNode.origX + (resizingNode.origW - newW);
              newH = Math.max(35, resizingNode.origH + dy);
            } else if (resizingNode.corner === "tr") {
              newW = Math.max(50, resizingNode.origW + dx);
              newH = Math.max(35, resizingNode.origH - dy);
              newY = resizingNode.origY + (resizingNode.origH - newH);
            } else if (resizingNode.corner === "tl") {
              newW = Math.max(50, resizingNode.origW - dx);
              newX = resizingNode.origX + (resizingNode.origW - newW);
              newH = Math.max(35, resizingNode.origH - dy);
              newY = resizingNode.origY + (resizingNode.origH - newH);
            } else if (resizingNode.corner === "e") {
              newW = Math.max(50, resizingNode.origW + dx);
            } else if (resizingNode.corner === "w") {
              newW = Math.max(50, resizingNode.origW - dx);
              newX = resizingNode.origX + (resizingNode.origW - newW);
            }

            return { ...s, x: newX, y: newY, width: newW, height: newH };
          })
        );
      } else if (draggingShape) {
        const dx = e.clientX - draggingShape.startX;
        const dy = e.clientY - draggingShape.startY;

        setDrawnShapes((prev) =>
          prev.map((s) => {
            if (s.id !== draggingShape.shapeId) return s;
            return {
              ...s,
              x: Math.max(0, draggingShape.origX + dx),
              y: Math.max(50, draggingShape.origY + dy)
            };
          })
        );
      } else if (draggingElement) {
        let dx = e.clientX - draggingElement.startX;
        let dy = e.clientY - draggingElement.startY;
        const el = draggingElement.el;

        const currentBoxLeft = draggingElement.initBoxLeft + dx;
        const currentBoxTop = draggingElement.initBoxTop + dy;
        const currentBoxWidth = draggingElement.initBoxWidth || el.offsetWidth;
        const currentBoxHeight = draggingElement.initBoxHeight || el.offsetHeight;
        const currentBoxCenterX = currentBoxLeft + currentBoxWidth / 2;
        const currentBoxCenterY = currentBoxTop + currentBoxHeight / 2;

        const SNAP_THRESHOLD = 7;
        let alignedX = null;
        let alignedY = null;

        if (draggingElement.candidates && draggingElement.candidates.length > 0) {
          for (const c of draggingElement.candidates) {
            if (alignedX === null) {
              if (Math.abs(currentBoxLeft - c.left) <= SNAP_THRESHOLD) {
                dx = c.left - draggingElement.initBoxLeft;
                alignedX = c.left;
              } else if (Math.abs(currentBoxCenterX - c.centerX) <= SNAP_THRESHOLD) {
                dx = (c.centerX - currentBoxWidth / 2) - draggingElement.initBoxLeft;
                alignedX = c.centerX;
              } else if (Math.abs((currentBoxLeft + currentBoxWidth) - c.right) <= SNAP_THRESHOLD) {
                dx = (c.right - currentBoxWidth) - draggingElement.initBoxLeft;
                alignedX = c.right;
              }
            }

            if (alignedY === null) {
              if (Math.abs(currentBoxTop - c.top) <= SNAP_THRESHOLD) {
                dy = c.top - draggingElement.initBoxTop;
                alignedY = c.top;
              } else if (Math.abs(currentBoxCenterY - c.centerY) <= SNAP_THRESHOLD) {
                dy = (c.centerY - currentBoxHeight / 2) - draggingElement.initBoxTop;
                alignedY = c.centerY;
              } else if (Math.abs((currentBoxTop + currentBoxHeight) - c.bottom) <= SNAP_THRESHOLD) {
                dy = (c.bottom - currentBoxHeight) - draggingElement.initBoxTop;
                alignedY = c.bottom;
              }
            }

            if (alignedX !== null && alignedY !== null) break;
          }
        }

        const guideX = document.getElementById("visualEditorGuideLineX");
        if (guideX) {
          if (alignedX !== null) {
            guideX.style.display = "block";
            guideX.style.left = `${alignedX}px`;
          } else {
            guideX.style.display = "none";
          }
        }

        const guideY = document.getElementById("visualEditorGuideLineY");
        if (guideY) {
          if (alignedY !== null) {
            guideY.style.display = "block";
            guideY.style.top = `${alignedY}px`;
          } else {
            guideY.style.display = "none";
          }
        }

        el.style.left = `${draggingElement.origLeft + dx}px`;
        el.style.top = `${draggingElement.origTop + dy}px`;
        if (draggingElement.rawImg) {
          draggingElement.rawImg.style.left = "0px";
          draggingElement.rawImg.style.top = "0px";
        }

        const boxEl = document.getElementById("activeElementBoxOverlay");
        if (boxEl) {
          boxEl.style.left = `${draggingElement.initBoxLeft + dx - 6}px`;
          boxEl.style.top = `${draggingElement.initBoxTop + dy - 6}px`;
        }
        const pillEl = document.getElementById("dynamicTextPillBar");
        if (pillEl) {
          pillEl.style.left = `${draggingElement.initPillX + dx}px`;
          pillEl.style.top = `${draggingElement.initPillY + dy}px`;
        }
      } else if (resizingElement) {
        const dx = e.clientX - resizingElement.startX;
        const dy = e.clientY - resizingElement.startY;
        // Require 4px threshold so a simple tap or touch doesn't trigger resizing
        if (Math.hypot(dx, dy) < 4) return;

        const el = resizingElement.el;
        const wrapper = resizingElement.wrapper;
        const dir = resizingElement.dir;

        el.style.boxSizing = "border-box";
        const comp = window.getComputedStyle(el);
        if (comp.display === "inline") {
          el.style.display = "inline-block";
        }

        const isImg = el.tagName === "IMG" || Boolean(el.querySelector("img")) || (resizingElement.origWidth <= 80 && resizingElement.origHeight <= 80);

        if (isImg && (dir === "se" || dir === "tl" || dir === "tr" || dir === "sw")) {
          // Proportional diagonal scaling of the whole box & container
          const origW = resizingElement.origWidth || 16;
          const origH = resizingElement.origHeight || 16;
          const aspect = origW / origH || 1;

          let rawDelta = 0;
          if (dir === "se") {
            rawDelta = (dx + dy) / 2;
          } else if (dir === "tl") {
            rawDelta = (-dx - dy) / 2;
          } else if (dir === "tr") {
            rawDelta = (dx - dy) / 2;
          } else if (dir === "sw") {
            rawDelta = (-dx + dy) / 2;
          }

          // Subtract deadzone threshold so movement starts gradually from 0 (no sudden jump)
          const deadzone = 4;
          let adjustedDelta = 0;
          if (rawDelta > deadzone) {
            adjustedDelta = rawDelta - deadzone;
          } else if (rawDelta < -deadzone) {
            adjustedDelta = rawDelta + deadzone;
          } else {
            return;
          }

          // Damped scale factor: icons scale smoothly at 0.35x speed
          const speedFactor = origW < 60 ? 0.35 : (origW < 120 ? 0.55 : 0.85);
          const delta = adjustedDelta * speedFactor;

          // Support large image container sizes up to 2400px (was restricted to 600px)
          const newW = Math.max(20, Math.min(2400, Math.round(origW + delta)));
          const newH = Math.max(20, Math.min(2400, Math.round(newW / aspect)));

          if (wrapper) {
            // Apply size to the ACTUAL CONTAINER so the grid cell & card expand!
            wrapper.style.setProperty("width", `${newW}px`, "important");
            wrapper.style.setProperty("max-width", "none", "important");
            wrapper.style.setProperty("height", `${newH}px`, "important");
            wrapper.style.setProperty("min-height", `${newH}px`, "important");
            wrapper.style.setProperty("aspect-ratio", "auto", "important");
            wrapper.style.setProperty("box-sizing", "border-box", "important");

            // Make sure the image inside fills the container 100% cleanly without getting cropped
            el.style.setProperty("width", "100%", "important");
            el.style.setProperty("max-width", "100%", "important");
            el.style.setProperty("height", "100%", "important");
            el.style.setProperty("min-height", "100%", "important");
            el.style.setProperty("object-fit", "cover", "important");
            el.style.setProperty("left", "0px", "important");
            el.style.setProperty("top", "0px", "important");
          } else {
            el.style.setProperty("width", `${newW}px`, "important");
            el.style.setProperty("max-width", `${newW}px`, "important");
            el.style.setProperty("height", `${newH}px`, "important");
            el.style.setProperty("min-height", `${newH}px`, "important");
            el.style.setProperty("object-fit", "contain", "important");
          }

          if (dir === "tl" || dir === "sw") {
            const shiftTarget = wrapper || el;
            const targetComp = window.getComputedStyle(shiftTarget);
            if (targetComp.position === "static") {
              shiftTarget.style.position = "relative";
            }
            const shiftW = newW - origW;
            shiftTarget.style.left = `${resizingElement.origLeft - (dir === "tl" ? shiftW : 0)}px`;
          }
        } else {
          const minW = Math.min(resizingElement.origWidth, 24);
          const minH = Math.min(resizingElement.origHeight, 18);

          if (wrapper) {
            if (dir === "e" || dir === "se" || dir === "tr") {
              const newW = Math.max(minW, resizingElement.origWidth + dx);
              wrapper.style.setProperty("width", `${newW}px`, "important");
              wrapper.style.setProperty("max-width", "none", "important");
              wrapper.style.setProperty("aspect-ratio", "auto", "important");
            } else if (dir === "w" || dir === "sw" || dir === "tl") {
              const newW = Math.max(minW, resizingElement.origWidth - dx);
              wrapper.style.setProperty("width", `${newW}px`, "important");
              wrapper.style.setProperty("max-width", "none", "important");
              wrapper.style.setProperty("aspect-ratio", "auto", "important");
              const targetComp = window.getComputedStyle(wrapper);
              if (targetComp.position === "static") wrapper.style.position = "relative";
              wrapper.style.left = `${resizingElement.origLeft + dx}px`;
            }

            if (dir === "s" || dir === "se" || dir === "sw") {
              const newH = Math.max(minH, resizingElement.origHeight + dy);
              wrapper.style.setProperty("height", `${newH}px`, "important");
              wrapper.style.setProperty("min-height", `${newH}px`, "important");
              wrapper.style.setProperty("aspect-ratio", "auto", "important");
            }

            el.style.setProperty("width", "100%", "important");
            el.style.setProperty("max-width", "100%", "important");
            el.style.setProperty("height", "100%", "important");
            el.style.setProperty("min-height", "100%", "important");
            el.style.setProperty("object-fit", "cover", "important");
            el.style.setProperty("left", "0px", "important");
            el.style.setProperty("top", "0px", "important");
          } else {
            if (dir === "e" || dir === "se" || dir === "tr") {
              const newW = Math.max(minW, resizingElement.origWidth + dx);
              el.style.setProperty("width", `${newW}px`, "important");
              el.style.setProperty("max-width", `${newW}px`, "important");
            } else if (dir === "w" || dir === "sw" || dir === "tl") {
              const newW = Math.max(minW, resizingElement.origWidth - dx);
              el.style.setProperty("width", `${newW}px`, "important");
              el.style.setProperty("max-width", `${newW}px`, "important");
              if (comp.position === "static") {
                el.style.position = "relative";
              }
              el.style.left = `${resizingElement.origLeft + dx}px`;
            }

            if (dir === "s" || dir === "se" || dir === "sw") {
              const newH = Math.max(minH, resizingElement.origHeight + dy);
              el.style.setProperty("min-height", `${newH}px`, "important");
            }
          }
        }

        updateBoxRect(wrapper || el);
      }
    };

    const handleWindowMouseUp = () => {
      if (dragStartShapesRef.current && (resizingNode || draggingShape)) {
        const prevShapes = dragStartShapesRef.current;
        const nextShapes = drawnShapesRef.current;
        if (JSON.stringify(prevShapes) !== JSON.stringify(nextShapes)) {
          pushHistory({
            desc: resizingNode ? "Resize shape" : "Move shape",
            undo: () => setDrawnShapes(prevShapes),
            redo: () => setDrawnShapes(nextShapes)
          });
        }
      }

      const guideX = document.getElementById("visualEditorGuideLineX");
      if (guideX) guideX.style.display = "none";
      const guideY = document.getElementById("visualEditorGuideLineY");
      if (guideY) guideY.style.display = "none";

      if (draggingElement) {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        const el = draggingElement.el;
        const rawImg = draggingElement.rawImg;
        el.style.transition = dragStartShapesRef.current?.transition || "";
        const prevData = dragStartShapesRef.current;
        const nextData = {
          left: el.style.left,
          top: el.style.top,
          position: el.style.position
        };
        const hasMoved = prevData && (prevData.left !== nextData.left || prevData.top !== nextData.top);
        if (hasMoved) {
          pushHistory({
            desc: "Move box position",
            undo: () => {
              el.style.left = prevData?.left || "";
              el.style.top = prevData?.top || "";
              el.style.position = prevData?.position || "";
              if (rawImg) {
                rawImg.style.left = "0px";
                rawImg.style.top = "0px";
              }
              updateBoxRect(el);
            },
            redo: () => {
              el.style.left = nextData.left;
              el.style.top = nextData.top;
              el.style.position = nextData.position;
              if (rawImg) {
                rawImg.style.left = "0px";
                rawImg.style.top = "0px";
              }
              updateBoxRect(el);
            }
          });
          syncTextToCMS(el);
          showToast("✓ Box moved to new position");
        } else {
          // Clicked box without moving: deliberate click to edit text
          if (!rawImg && el.tagName !== "IMG" && !el.querySelector("img")) {
            enterTextEditing(el);
          }
        }
        setDraggingElement(null);
        updateBoxRect(el);
      }

      if (resizingElement) {
        const el = resizingElement.el;
        const wrapper = resizingElement.wrapper;
        const prevData = dragStartShapesRef.current;
        const nextData = {
          elWidth: el.style.width,
          elMaxWidth: el.style.maxWidth,
          elHeight: el.style.height,
          elMinHeight: el.style.minHeight,
          elLeft: el.style.left,
          elTop: el.style.top,
          wrapperCss: wrapper ? wrapper.style.cssText : null
        };
        const hasChanged = prevData && (
          prevData.elWidth !== nextData.elWidth ||
          prevData.elHeight !== nextData.elHeight ||
          prevData.wrapperCss !== nextData.wrapperCss ||
          prevData.elLeft !== nextData.elLeft
        );
        if (hasChanged) {
          pushHistory({
            desc: "Resize box",
            undo: () => {
              if (wrapper && prevData?.wrapperCss !== undefined) {
                wrapper.style.cssText = prevData.wrapperCss || "";
              }
              el.style.width = prevData?.elWidth || "";
              el.style.maxWidth = prevData?.elMaxWidth || "";
              el.style.height = prevData?.elHeight || "";
              el.style.minHeight = prevData?.elMinHeight || "";
              el.style.left = prevData?.elLeft || "";
              el.style.top = prevData?.elTop || "";
              updateBoxRect(wrapper || el);
            },
            redo: () => {
              if (wrapper && nextData.wrapperCss !== null) {
                wrapper.style.cssText = nextData.wrapperCss;
              }
              el.style.width = nextData.elWidth;
              el.style.maxWidth = nextData.elMaxWidth;
              el.style.height = nextData.elHeight;
              el.style.minHeight = nextData.elMinHeight;
              el.style.left = nextData.elLeft;
              el.style.top = nextData.elTop;
              updateBoxRect(wrapper || el);
            }
          });
          const targetBox = wrapper || el;
          const finalW = Math.round(targetBox.getBoundingClientRect().width);
          const finalH = Math.round(targetBox.getBoundingClientRect().height);
          syncTextToCMS(targetBox);
          showToast(`✓ Resized container to ${finalW}×${finalH}px`);
        }
        setResizingElement(null);
        updateBoxRect(wrapper || el);
      }

      dragStartShapesRef.current = null;
      setResizingNode(null);
      setDraggingShape(null);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [resizingNode, draggingShape, draggingElement, resizingElement]);

  // Canvas drawing handlers (Shape Maker)
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDrawing(true);
    setDrawStart({
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY
    });
    setDrawCurrent({
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    setDrawCurrent({
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY
    });

    // Auto-scroll the page smoothly while dragging area selector near top/bottom screen edges
    if (activeTool === "select") {
      const edgeThreshold = 80;
      const vh = typeof window !== "undefined" ? window.innerHeight : 800;
      if (e.clientY > vh - edgeThreshold) {
        const factor = Math.min(32, Math.max(8, (e.clientY - (vh - edgeThreshold)) * 0.5));
        window.scrollBy({ top: factor, behavior: "auto" });
      } else if (e.clientY < edgeThreshold + 48) {
        const factor = Math.min(32, Math.max(8, ((edgeThreshold + 48) - e.clientY) * 0.5));
        window.scrollBy({ top: -factor, behavior: "auto" });
      }
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const dragW = Math.abs(e.pageX - drawStart.pageX);
    const dragH = Math.abs(e.pageY - drawStart.pageY);

    if (activeTool === "select") {
      setIsDrawing(false);
      // Use document coordinates (pageX/pageY) so selections work across the entire page height
      const selPageX1 = Math.min(drawStart.pageX, e.pageX);
      const selPageY1 = Math.min(drawStart.pageY, e.pageY);
      const selPageX2 = Math.max(drawStart.pageX, e.pageX);
      const selPageY2 = Math.max(drawStart.pageY, e.pageY);

      const selW = selPageX2 - selPageX1;
      const selH = selPageY2 - selPageY1;

      if (selW < 8 || selH < 8) {
        setMultiSelectedElements([]);
        return;
      }

      const selected = [];

      drawnShapesRef.current.forEach((shape) => {
        const shapeX1 = shape.x;
        const shapeY1 = shape.y;
        const shapeX2 = shape.x + shape.width;
        const shapeY2 = shape.y + shape.height;

        const intersects = !(selPageX2 < shapeX1 || selPageX1 > shapeX2 || selPageY2 < shapeY1 || selPageY1 > shapeY2);
        if (intersects) {
          selected.push({ type: "shape", id: shape.id, shape });
        }
      });

      // Candidates for marquee selection: sections, grids, cards, and individual items
      const candidates = Array.from(
        document.querySelectorAll(
          "section.custom-added-section, section, [data-section-id], .cms-grid-container, div[style*='display: grid'], div[style*='display:grid'], .cms-grid-card, div.group, h1, h2, h3, h4, p, img, a, button, [contenteditable]"
        )
      );
      const matchedDom = [];

      candidates.forEach((el) => {
        if (
          el.closest("#visualEditorStudioBar") ||
          el.closest(".visual-editor-portal") ||
          el.closest("#canvasDrawingLayer") ||
          el.closest("#activeElementBoxOverlay") ||
          el.id === "contextMenuPortal"
        ) return;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const elPageLeft = rect.left + (typeof window !== "undefined" ? window.scrollX : 0);
        const elPageTop = rect.top + (typeof window !== "undefined" ? window.scrollY : 0);
        const elPageRight = elPageLeft + rect.width;
        const elPageBottom = elPageTop + rect.height;

        const intersects = !(selPageX2 < elPageLeft || selPageX1 > elPageRight || selPageY2 < elPageTop || selPageY1 > elPageBottom);
        if (intersects) {
          matchedDom.push(el);
        }
      });

      // Helper to check if an element is a grid container
      const isGridContainer = (el) => {
        if (!el || el.nodeType !== 1) return false;
        if (el.classList && (el.classList.contains("cms-grid-container") || el.classList.contains("grid"))) return true;
        const style = el.getAttribute("style") || "";
        if (style.includes("display: grid") || style.includes("display:grid")) return true;
        try {
          return window.getComputedStyle(el).display === "grid";
        } catch {
          return false;
        }
      };

      // Helper to check if an element is a grid card
      const isGridCard = (el) => {
        if (!el || el.nodeType !== 1) return false;
        if (el.classList && el.classList.contains("cms-grid-card")) return true;
        return Boolean(el.parentElement && isGridContainer(el.parentElement));
      };

      // Find closest grid card for an element
      const getParentCard = (el) => {
        let cur = el;
        while (cur && cur !== document.body && !cur.classList?.contains("visual-editor-portal")) {
          if (isGridCard(cur)) return cur;
          cur = cur.parentElement;
        }
        return null;
      };

      // Build target element set:
      // When a grid card's contents are selected, select the card (border + img + title + desc)
      // When all/majority of a grid's cards or the grid container itself is selected, select the GRID / SECTION so deleting removes the grid entirely!
      const matchedSet = new Set(matchedDom);
      const elevatedSet = new Set();

      matchedDom.forEach((el) => {
        const card = getParentCard(el);
        if (card && (matchedSet.has(card) || card.contains(el))) {
          elevatedSet.add(card);
        } else {
          elevatedSet.add(el);
        }
      });

      // Check if grid containers should absorb cards or if parent section should absorb grid
      const gridContainersToCheck = new Set();
      elevatedSet.forEach((el) => {
        if (isGridContainer(el)) {
          gridContainersToCheck.add(el);
        } else if (isGridCard(el) && el.parentElement && isGridContainer(el.parentElement)) {
          gridContainersToCheck.add(el.parentElement);
        }
      });

      gridContainersToCheck.forEach((gridEl) => {
        const allCards = Array.from(gridEl.children).filter((c) => c.nodeType === 1);
        const selectedCardsCount = allCards.filter((c) => elevatedSet.has(c)).length;
        const gridCovered = elevatedSet.has(gridEl) || (allCards.length > 0 && selectedCardsCount >= allCards.length);

        if (gridCovered) {
          // Remove all child cards and children
          allCards.forEach((c) => elevatedSet.delete(c));

          // If inside a custom-added-section, elevate to the section so the entire section container is deleted cleanly
          const parentSec = gridEl.closest("section.custom-added-section, section");
          if (parentSec && (parentSec.classList?.contains("custom-added-section") || parentSec.querySelectorAll(".cms-grid-container, [style*='display: grid']").length <= 1)) {
            elevatedSet.add(parentSec);
            elevatedSet.delete(gridEl);
          } else {
            elevatedSet.add(gridEl);
          }
        }
      });

      // Filter out any child elements whose ancestor is already in elevatedSet
      const finalDomArray = Array.from(elevatedSet).filter((el) => {
        for (const other of elevatedSet) {
          if (other !== el && other.contains(el)) {
            return false;
          }
        }
        return true;
      });

      finalDomArray.forEach((el) => selected.push({ type: "dom", el }));

      setMultiSelectedElements(selected);
      setActiveTool(null);
      setSelectedShapeId(null);
      activeTextRef.current = null;
      setActiveBoxInfo(null);
      setTextPillBar((prev) => ({ ...prev, visible: false }));

      if (selected.length > 0) {
        showToast(`✓ Selected ${selected.length} items (grids/cards/blocks). Press Delete key to remove all.`);
      } else {
        showToast("No items found in selected area.");
      }
      return;
    }

    let width = dragW >= 25 ? dragW : (activeTool === "text" ? 280 : 320);
    let height = dragH >= 20 ? dragH : (activeTool === "text" ? 90 : 200);

    const x = dragW >= 25 ? Math.min(drawStart.pageX, e.pageX) : (drawStart.pageX - width / 2);
    const y = dragH >= 20 ? Math.min(drawStart.pageY, e.pageY) : (drawStart.pageY - height / 2);

    const newShape = {
      id: "shape_" + Date.now(),
      type: activeTool,
      x: Math.max(10, x),
      y: Math.max(60, y),
      width,
      height,
      text: activeTool === "text" ? "Type your headline or text here..." : "",
      mediaUrl: activeTool === "image" ? "/images/projects/caccia/gallery-1.webp" : (activeTool === "video" ? "/videos/emaar.mp4" : "")
    };

    const prevShapes = drawnShapesRef.current;
    const nextShapes = [...prevShapes, newShape];
    setDrawnShapes(nextShapes);
    setSelectedShapeId(newShape.id);
    setActiveTool(null);
    activeTextRef.current = null;
    setActiveBoxInfo(null);
    setTextPillBar((prev) => ({ ...prev, visible: false }));
    setMultiSelectedElements([]);

    pushHistory({
      desc: `Create ${newShape.type} shape`,
      undo: () => {
        setDrawnShapes(prevShapes);
        setSelectedShapeId(null);
      },
      redo: () => {
        setDrawnShapes(nextShapes);
        setSelectedShapeId(newShape.id);
      }
    });
    showToast(`Created new ${newShape.type} shape! Drag corners to resize.`);
  };

  const handleResizeNodeStart = (e, shape, corner) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartShapesRef.current = [...drawnShapesRef.current];
    setResizingNode({
      shapeId: shape.id,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      origX: shape.x,
      origY: shape.y,
      origW: shape.width,
      origH: shape.height
    });
  };

  const handleShapeDragStart = (e, shape) => {
    if (e.target.contentEditable === "true" || e.target.closest("button") || e.target.closest("input")) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    dragStartShapesRef.current = [...drawnShapesRef.current];
    setDraggingShape({
      shapeId: shape.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: shape.x,
      origY: shape.y
    });
  };

  // Insert Custom Section Helper
  const insertCustomSection = (html) => {
    const newSec = document.createElement("section");
    newSec.className = "custom-added-section";
    newSec.style.minHeight = "280px";
    newSec.style.backgroundColor = "#ffffff";
    newSec.style.position = "relative";
    newSec.style.width = "100%";
    newSec.style.boxSizing = "border-box";
    newSec.style.transition = "all 0.3s ease";

    newSec.innerHTML = `
      <div style="position: absolute; top: 14px; right: 24px; display: flex; gap: 8px; z-index: 10;">
        <button type="button" class="remove-sec-btn" style="background: #ffffff; border: 1px solid #e2e8f0; color: #ef4444; font-size: 11.5px; font-weight: 600; padding: 5px 10px; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span>Remove Section</span>
        </button>
      </div>
      ${html}
    `;

    const delBtn = newSec.querySelector(".remove-sec-btn");
    if (delBtn) {
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to remove this section?")) {
          newSec.remove();
          showToast("Section removed");
        }
      };
    }

    // Hide the empty blank canvas card if present
    const emptyCard = document.getElementById("canvasAddSectionBtn")?.closest(".container") || document.querySelector(".container.mx-auto.px-4.py-24");
    if (emptyCard) {
      emptyCard.style.display = "none";
    }

    const mainEl = document.querySelector("main");
    const footer = document.querySelector("footer");
    if (mainEl) {
      mainEl.appendChild(newSec);
    } else if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(newSec, footer);
    } else {
      document.body.appendChild(newSec);
    }

    pushHistory({
      desc: "Insert Section",
      undo: () => {
        newSec.remove();
        if (emptyCard && !document.querySelector(".custom-added-section")) {
          emptyCard.style.display = "";
        }
      },
      redo: () => {
        if (emptyCard) emptyCard.style.display = "none";
        if (mainEl) {
          mainEl.appendChild(newSec);
        } else if (footer && footer.parentNode) {
          footer.parentNode.insertBefore(newSec, footer);
        }
      }
    });

    setSectionModalOpen(false);
    setHoveredDivider(null);
    showToast("✓ Section layout added to page!");

    // Automatically stage new section into CMS so changes are never lost
    setTimeout(() => {
      handleSaveStaged(true);
    }, 200);

    setTimeout(() => {
      newSec.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Insert MS Word-Style Grid Layout with Customizable Content Type (Images, Videos, Text Boxes, Stats)
  const handleInsertGrid = (cols, rows, customOpts = null) => {
    const cType = customOpts?.contentType || gridContentType;
    const fStyle = customOpts?.frameStyle || gridFrameStyle;
    const aspect = customOpts?.aspect || gridAspect;
    const rounding = customOpts?.rounding || gridRounding;
    const hoverZoom = customOpts?.hoverZoom !== undefined ? customOpts.hoverZoom : gridHoverZoom;

    const totalCells = cols * rows;
    const sampleImages = [
      "/images/landmarks/Serenity-hills-big.webp",
      "/images/landmarks/business-centre.jpg",
      "/images/landmarks/elite-oasis.jpg",
      "/images/landmarks/urban-ascent.jpg",
      "/images/landmarks/mohali-hills.jpg",
      "/images/blog1.jpg",
      "/images/blog2.jpg",
      "/images/project-walkthrough.jpg"
    ];

    let cardBg = "#ffffff";
    let cardBorder = "1px solid #e2e8f0";
    let cardShadow = "0 4px 14px rgba(0,0,0,0.05)";
    let cardPadding = "14px";
    let imgBorder = "none";
    let titleColor = "#0f172a";
    let descColor = "#64748b";

    if (fStyle === "framed") {
      cardBg = "#faf8f5";
      cardBorder = "2px solid #c5a880";
      cardShadow = "0 6px 20px rgba(197,168,128,0.15)";
      cardPadding = "16px";
      imgBorder = "1px solid #e5d5be";
      titleColor = "#1c1917";
      descColor = "#78716c";
    } else if (fStyle === "dark") {
      cardBg = "#09090b";
      cardBorder = "1px solid #27272a";
      cardShadow = "0 8px 24px rgba(0,0,0,0.4)";
      cardPadding = "16px";
      imgBorder = "1px solid #1e293b";
      titleColor = "#fafafa";
      descColor = "#a1a1aa";
    } else if (fStyle === "minimal") {
      cardBg = "transparent";
      cardBorder = "none";
      cardShadow = "none";
      cardPadding = "0px";
      imgBorder = "none";
      titleColor = "#0f172a";
      descColor = "#64748b";
    } else if (fStyle === "elevated") {
      cardBg = "#ffffff";
      cardBorder = "1px solid rgba(0,0,0,0.06)";
      cardShadow = "0 14px 32px -6px rgba(0,0,0,0.14)";
      cardPadding = "16px";
      imgBorder = "none";
      titleColor = "#0f172a";
      descColor = "#64748b";
    }

    const hoverScale = hoverZoom
      ? `transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);`
      : "";
    const hoverImgOn = hoverZoom ? `onmouseover="this.style.transform='scale(1.06)'"` : "";
    const hoverImgOff = hoverZoom ? `onmouseout="this.style.transform='scale(1)'"` : "";

    let sectionHeading = "Grid Showcase";
    let sectionSub = `Custom ${cols}×${rows} responsive layout grid`;
    if (cType === "video") {
      sectionHeading = "Cinematic Video Gallery";
      sectionSub = `Curated ${cols}×${rows} high-definition video motion showcases`;
    } else if (cType === "text") {
      sectionHeading = "Editorial Highlights";
      sectionSub = `Curated ${cols}×${rows} responsive text box articles & narratives`;
    } else if (cType === "stats") {
      sectionHeading = "Key Milestones & Numbers";
      sectionSub = `Benchmark metrics and global achievement data`;
    }

    const renderCard = (i) => {
      if (cType === "video") {
        return `
          <div class="cms-grid-card" style="background: ${cardBg}; border: ${cardBorder}; border-radius: ${rounding}; overflow: hidden; padding: ${cardPadding}; box-shadow: ${cardShadow}; display: flex; flex-direction: column; gap: 12px; transition: transform 0.25s ease, box-shadow 0.25s ease;">
            <div style="aspect-ratio: ${aspect}; border-radius: ${rounding === '0px' ? '0px' : 'calc(' + rounding + ' - 3px)'}; overflow: hidden; position: relative; border: ${imgBorder}; background: #000000;">
              <video src="/videos/emaar.mp4" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
            </div>
            <div style="${cardPadding === '0px' ? 'padding: 8px 4px 0;' : ''}">
              <h3 contenteditable="true" style="font-size: 16px; font-weight: 600; color: ${titleColor}; margin-bottom: 4px; outline: none;">Cinematic Reel ${i + 1}</h3>
              <p contenteditable="true" style="font-size: 13px; color: ${descColor}; line-height: 1.5; outline: none;">Interactive video walkthrough & architectural motion showcase ${i + 1}.</p>
            </div>
          </div>
        `;
      }
      if (cType === "text") {
        return `
          <div class="cms-grid-card" style="background: ${cardBg}; border: ${cardBorder}; border-radius: ${rounding}; overflow: hidden; padding: 24px; box-shadow: ${cardShadow}; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; transition: transform 0.25s ease, box-shadow 0.25s ease;">
            <div>
              <span style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2563eb; display: inline-block; margin-bottom: 10px;">SECTION 0${i + 1}</span>
              <h3 contenteditable="true" style="font-size: 19px; font-weight: 600; color: ${titleColor}; margin-bottom: 10px; line-height: 1.35; outline: none; font-family: 'Playfair Display', Georgia, serif;">Editorial Heading ${i + 1}</h3>
              <p contenteditable="true" style="font-size: 13.5px; color: ${descColor}; line-height: 1.6; outline: none;">Crafted with meticulous attention to detail, enduring architectural heritage, and an unwavering commitment to quality living.</p>
            </div>
            <div style="margin-top: 18px; border-top: 1px solid ${fStyle === 'dark' ? '#27272a' : '#e2e8f0'}; padding-top: 12px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: #2563eb; letter-spacing: 0.05em; text-transform: uppercase;">READ STORY →</span>
              <span style="font-size: 11px; color: #94a3b8;">Article</span>
            </div>
          </div>
        `;
      }
      if (cType === "stats") {
        const statNums = ['45M+', '25+', '12K+', '99%', '150+', '4.9★'];
        const statLabels = ['Sq Ft Developed', 'Years of Heritage', 'Happy Residents', 'On-Time Handover', 'Global Destinations', 'Customer Rating'];
        return `
          <div class="cms-grid-card" style="background: ${cardBg}; border: ${cardBorder}; border-radius: ${rounding}; overflow: hidden; padding: 28px 20px; box-shadow: ${cardShadow}; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; transition: transform 0.25s ease, box-shadow 0.25s ease;">
            <span contenteditable="true" style="font-size: 40px; font-weight: 800; color: #2563eb; line-height: 1; outline: none; letter-spacing: -0.02em;">${statNums[i % statNums.length]}</span>
            <h3 contenteditable="true" style="font-size: 14.5px; font-weight: 700; color: ${titleColor}; margin-top: 4px; outline: none; text-transform: uppercase; letter-spacing: 0.05em;">${statLabels[i % statLabels.length]}</h3>
            <p contenteditable="true" style="font-size: 12.5px; color: ${descColor}; line-height: 1.5; outline: none; max-width: 240px;">Setting global benchmarks for excellence across premium residential communities.</p>
          </div>
        `;
      }
      // default: image
      return `
        <div class="cms-grid-card" style="background: ${cardBg}; border: ${cardBorder}; border-radius: ${rounding}; overflow: hidden; padding: ${cardPadding}; box-shadow: ${cardShadow}; display: flex; flex-direction: column; gap: 12px; transition: transform 0.25s ease, box-shadow 0.25s ease;">
          <div style="aspect-ratio: ${aspect}; border-radius: ${rounding === '0px' ? '0px' : 'calc(' + rounding + ' - 3px)'}; overflow: hidden; position: relative; border: ${imgBorder}; background: #e2e8f0;">
            <img src="${sampleImages[i % sampleImages.length]}" alt="Grid Item ${i + 1}" style="width: 100%; height: 100%; object-fit: cover; display: block; ${hoverScale}" ${hoverImgOn} ${hoverImgOff} />
          </div>
          <div style="${cardPadding === '0px' ? 'padding: 8px 4px 0;' : ''}">
            <h3 contenteditable="true" style="font-size: 16px; font-weight: 600; color: ${titleColor}; margin-bottom: 4px; outline: none;">Item Title ${i + 1}</h3>
            <p contenteditable="true" style="font-size: 13px; color: ${descColor}; line-height: 1.5; outline: none;">Custom editable caption narrative for destination ${i + 1}.</p>
          </div>
        </div>
      `;
    };

    const html = `
      <div style="max-width: 1280px; margin: 0 auto; width: 100%; padding: 60px 24px;">
        <div style="text-align: center; margin-bottom: 36px;">
          <h2 contenteditable="true" style="font-size: 32px; font-weight: 300; letter-spacing: 0.04em; color: ${fStyle === 'dark' ? '#fafafa' : '#0f172a'}; margin-bottom: 8px; outline: none; font-family: 'Playfair Display', Georgia, serif;">${sectionHeading}</h2>
          <p contenteditable="true" style="font-size: 14px; color: ${fStyle === 'dark' ? '#a1a1aa' : '#64748b'}; max-width: 500px; margin: 0 auto; outline: none;">${sectionSub}</p>
        </div>
        <div class="cms-grid-container" style="display: grid; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); gap: 24px;">
          ${Array.from({ length: totalCells }).map((_, i) => renderCard(i)).join('')}
        </div>
      </div>
    `;
    insertCustomSection(html);
  };

  // Insert Modern CMS Section Presets
  const handleInsertPreset = (presetKey) => {
    if (presetKey === "images-grid") {
      const html = `
        <div style="max-width: 1280px; margin: 0 auto; width: 100%; padding: 60px 24px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #2563eb; text-transform: uppercase;">PHOTO GALLERY</span>
            <h2 contenteditable="true" style="font-size: 34px; font-weight: 300; letter-spacing: 0.03em; color: #0f172a; margin-top: 6px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Curated Luxury Living</h2>
            <p contenteditable="true" style="font-size: 15px; color: #64748b; max-width: 540px; margin: 8px auto 0; outline: none;">Explore architectural elegance and iconic living spaces crafted by Emaar India.</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px;">
            ${[
              { title: "Serenity Hills", desc: "Foothills of Aravallis with expansive green vistas", img: "/images/landmarks/Serenity-hills-big.webp" },
              { title: "Urban Ascent", desc: "Contemporary high-rise living with skyline panoramas", img: "/images/landmarks/urban-ascent.jpg" },
              { title: "Elite Oasis", desc: "Private sanctuary of bespoke residences & clubhouse", img: "/images/landmarks/elite-oasis.jpg" }
            ].map((item) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
                <div style="aspect-ratio: 16 / 11; overflow: hidden;">
                  <img src="${item.img}" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="${item.title}" />
                </div>
                <div style="padding: 20px;">
                  <h3 contenteditable="true" style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 6px; outline: none;">${item.title}</h3>
                  <p contenteditable="true" style="font-size: 13.5px; color: #64748b; line-height: 1.6; outline: none;">${item.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "video-gallery") {
      const html = `
        <div style="max-width: 1280px; margin: 0 auto; width: 100%; padding: 60px 24px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #2563eb; text-transform: uppercase;">CINEMATIC SHOWCASES</span>
            <h2 contenteditable="true" style="font-size: 34px; font-weight: 300; letter-spacing: 0.03em; color: #0f172a; margin-top: 6px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Life In Motion</h2>
            <p contenteditable="true" style="font-size: 15px; color: #64748b; max-width: 540px; margin: 8px auto 0; outline: none;">Experience architectural elegance through motion and visual storytelling.</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px;">
            ${[
              { title: "Serenity Hills Walkthrough", desc: "Experience mountain foothills and dawn vistas", video: "/videos/emaar.mp4" },
              { title: "Urban Ascent Architecture", desc: "Skyline living with panoramic cityscapes", video: "/videos/emaar.mp4" },
              { title: "Elite Oasis Clubhouse", desc: "Curated bespoke private amenities and lifestyle", video: "/videos/emaar.mp4" }
            ].map((item) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
                <div style="aspect-ratio: 16 / 10; overflow: hidden; background: #000000; position: relative;">
                  <video src="${item.video}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
                </div>
                <div style="padding: 20px;">
                  <h3 contenteditable="true" style="font-size: 17px; font-weight: 600; color: #0f172a; margin-bottom: 6px; outline: none;">${item.title}</h3>
                  <p contenteditable="true" style="font-size: 13.5px; color: #64748b; line-height: 1.6; outline: none;">${item.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "text-columns") {
      const html = `
        <div style="max-width: 1200px; margin: 0 auto; width: 100%; padding: 70px 24px;">
          <div style="text-align: center; margin-bottom: 48px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #2563eb; text-transform: uppercase;">TEXT & EDITORIAL</span>
            <h2 contenteditable="true" style="font-size: 36px; font-weight: 300; letter-spacing: 0.03em; color: #0f172a; margin-top: 8px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Core Pillars of Distinctive Living</h2>
            <p contenteditable="true" style="font-size: 15px; color: #64748b; max-width: 580px; margin: 8px auto 0; outline: none;">Thoughtfully articulated principles that define every community we create.</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px;">
            ${[
              { tag: "SUSTAINABILITY", title: "Eco-Conscious Masterplanning", body: "Designed to conserve natural topography, maximize solar shading, and promote renewable harmony across every square meter." },
              { tag: "HERITAGE", title: "Enduring Global Legacy", body: "Over two decades of shaping iconic world landmarks, bringing visionary engineering and uncompromising distinction to India." },
              { tag: "COMMUNITY", title: "Holistic Wellness Spaces", body: "Sprawling green parks, modern recreational hubs, and pedestrian-first walkways curated for multi-generational living." }
            ].map((col) => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 32px 26px; display: flex; flex-direction: column; justify-content: space-between; min-height: 260px;">
                <div>
                  <span style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; color: #2563eb;">${col.tag}</span>
                  <h3 contenteditable="true" style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 12px 0 10px; line-height: 1.35; outline: none; font-family: 'Playfair Display', Georgia, serif;">${col.title}</h3>
                  <p contenteditable="true" style="font-size: 14px; color: #64748b; line-height: 1.65; outline: none;">${col.body}</p>
                </div>
                <div style="margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 14px;">
                  <span style="font-size: 11px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">LEARN MORE →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "stats-banner") {
      const html = `
        <div style="background: #0f172a; width: 100%; padding: 70px 24px; color: #ffffff;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 40px;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">BY THE NUMBERS</span>
              <h2 contenteditable="true" style="font-size: 34px; font-weight: 300; letter-spacing: 0.03em; color: #ffffff; margin-top: 6px; outline: none; font-family: 'Playfair Display', Georgia, serif;">A Legacy Measured In Excellence</h2>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px;">
              ${[
                { num: "45M+", label: "Sq Ft Developed", sub: "Iconic commercial & luxury residences" },
                { num: "25+", label: "Years Experience", sub: "Pioneering real estate globally" },
                { num: "12,000+", label: "Happy Families", sub: "Thriving across premier communities" },
                { num: "100%", label: "Handover Trust", sub: "Delivered with precision and care" }
              ].map((s) => `
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 26px 18px; text-align: center;">
                  <div contenteditable="true" style="font-size: 38px; font-weight: 800; color: #60a5fa; line-height: 1; outline: none; letter-spacing: -0.02em;">${s.num}</div>
                  <div contenteditable="true" style="font-size: 14px; font-weight: 700; color: #ffffff; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.05em; outline: none;">${s.label}</div>
                  <div contenteditable="true" style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.4; outline: none;">${s.sub}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "video-hero") {
      const html = `
        <div style="position: relative; width: 100%; min-height: 480px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #000000;">
          <video src="/videos/emaar.mp4" autoplay loop muted playsinline style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55;"></video>
          <div style="position: relative; z-index: 2; text-align: center; max-width: 800px; padding: 40px 24px; color: #ffffff;">
            <span style="font-size: 11.5px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #60a5fa; margin-bottom: 12px; display: inline-block;">IMMERSIVE CINEMATIC EXPERIENCE</span>
            <h2 contenteditable="true" style="font-size: 42px; font-weight: 300; letter-spacing: 0.05em; line-height: 1.2; margin-bottom: 16px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Visionary Architecture In Motion</h2>
            <p contenteditable="true" style="font-size: 16px; color: #e2e8f0; line-height: 1.7; max-width: 620px; margin: 0 auto 28px; outline: none;">Step inside a world crafted with precision, enduring heritage, and uncompromising attention to detail.</p>
            <a href="/contact" style="display: inline-block; background: #ffffff; color: #0f172a; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 12px 28px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">EXPLORE DESTINATIONS</a>
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "story") {
      const html = `
        <div style="max-width: 1080px; margin: 0 auto; width: 100%; padding: 80px 24px;">
          <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 32px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #64748b;">EDITORIAL STORY</span>
            <h2 contenteditable="true" style="font-size: 38px; font-weight: 300; letter-spacing: 0.03em; color: #0f172a; margin-top: 8px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Crafted For Distinction, Engineered For Generations</h2>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 15px; color: #475569; line-height: 1.8;">
            <p contenteditable="true" style="outline: none;">
              For decades, Emaar has set benchmarks across the world by shaping distinctive skylines and landmark master developments. Every destination is an ode to visionary planning, blending urban convenience with enduring serenity.
            </p>
            <p contenteditable="true" style="outline: none;">
              In India, this ethos continues to pioneer lifestyle destinations that bring together discerning residences, state-of-the-art commercial hubs, and green ecosystems designed to enrich everyday living.
            </p>
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "features") {
      const html = `
        <div style="max-width: 1280px; margin: 0 auto; width: 100%; padding: 70px 24px;">
          <div style="text-align: center; margin-bottom: 44px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #2563eb; text-transform: uppercase;">DISTINCT ADVANTAGES</span>
            <h2 contenteditable="true" style="font-size: 34px; font-weight: 300; color: #0f172a; margin-top: 6px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Why Choose Emaar India</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px;">
            ${[
              { title: "Prime Locations", desc: "Strategically situated across thriving residential and commercial epicenters with seamless transit." },
              { title: "World-Class Amenities", desc: "Clubhouses, temperature-regulated pools, sporting courts and curated wellness retreats." },
              { title: "Sustainable Living", desc: "Eco-conscious infrastructure, solar energy integration, and vast landscaped open greens." }
            ].map((item, i) => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px 22px; text-align: left; display: flex; flex-direction: column; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800;">
                  0${i + 1}
                </div>
                <h3 contenteditable="true" style="font-size: 18px; font-weight: 600; color: #0f172a; outline: none;">${item.title}</h3>
                <p contenteditable="true" style="font-size: 14px; color: #64748b; line-height: 1.6; outline: none;">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "split-media") {
      const html = `
        <div style="max-width: 1280px; margin: 0 auto; width: 100%; padding: 70px 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
            <div style="border-radius: 16px; overflow: hidden; aspect-ratio: 4 / 3; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
              <img src="/images/landmarks/business-centre.jpg" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Showcase Media" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #2563eb; text-transform: uppercase;">BESPOKE SPACES</span>
              <h2 contenteditable="true" style="font-size: 34px; font-weight: 300; color: #0f172a; margin: 8px 0 16px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Designed for Modern Pioneers</h2>
              <p contenteditable="true" style="font-size: 15px; color: #64748b; line-height: 1.7; margin-bottom: 24px; outline: none;">
                Experience the pinnacle of commercial and residential excellence. Each space is tailored to foster innovation, comfort, and sustainable prosperity.
              </p>
              <a href="/contact" style="display: inline-block; background: #0f172a; color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 24px; border-radius: 6px; text-decoration: none;">SCHEDULE A PRIVATE VISIT</a>
            </div>
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else if (presetKey === "cta") {
      const html = `
        <div style="width: 100%; background: #0f172a; color: #ffffff; padding: 70px 24px; text-align: center;">
          <div style="max-width: 700px; margin: 0 auto;">
            <h2 contenteditable="true" style="font-size: 36px; font-weight: 300; letter-spacing: 0.04em; margin-bottom: 12px; outline: none; font-family: 'Playfair Display', Georgia, serif;">Begin Your Journey With Emaar India</h2>
            <p contenteditable="true" style="font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; outline: none;">Connect with our dedicated destination consultants for private previews, master development walkthroughs, and personalized investment assistance.</p>
            <div style="display: flex; justify-content: center; gap: 14px;">
              <a href="/contact" style="background: #ffffff; color: #0f172a; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 26px; border-radius: 6px; text-decoration: none;">ENQUIRE NOW</a>
              <a href="tel:+911244421155" style="border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 24px; border-radius: 6px; text-decoration: none;">CALL +91 124 4421155</a>
            </div>
          </div>
        </div>
      `;
      insertCustomSection(html);
    } else {
      // Blank Section
      const html = `
        <div style="max-width: 800px; margin: 0 auto; width: 100%; text-align: center; padding: 80px 24px;">
          <h2 contenteditable="true" style="font-size: 32px; font-weight: 300; letter-spacing: 0.04em; color: #0f172a; margin-bottom: 14px; outline: none; font-family: 'Playfair Display', Georgia, serif;">
            New Section Title
          </h2>
          <p contenteditable="true" style="font-size: 15px; color: #64748b; line-height: 1.7; outline: none; font-family: system-ui, sans-serif; max-width: 580px; margin: 0 auto;">
            This is an empty section. Click here to edit this text, or use the <strong>Tt</strong> and <strong>Image</strong> tools in the studio bar to draw text and image shapes anywhere in this space.
          </p>
        </div>
      `;
      insertCustomSection(html);
    }
  };

  const handleAddEmptySection = () => {
    setSectionModalOpen(true);
  };

  // Fetch Media Library
  const fetchMedia = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/media");
      const data = await res.json();
      const files = Array.isArray(data.data) ? data.data : (Array.isArray(data.files) ? data.files : []);
      if (files.length > 0) {
        setMediaFiles(files);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      showToast("Uploading media...");
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast("File uploaded successfully!");
        await fetchMedia();
        if (data.url) {
          setSelectedMedia({ url: data.url, name: data.filename || file.name });
        }
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    }
  };

  const handleOpenMediaPicker = (layer) => {
    setSelectedLayer(layer);
    setContextMenu({ visible: false, x: 0, y: 0, layers: [] });
    fetchMedia();
    setMediaPickerOpen(true);
  };

  const handleApplyMedia = async () => {
    if (!selectedMedia || !selectedLayer?.el) return;
    const el = selectedLayer.el;

    if (el.tagName === "VIDEO") {
      el.src = selectedMedia.url;
      const source = el.querySelector("source");
      if (source) source.src = selectedMedia.url;
      el.load();
      el.play?.().catch(() => {});
      showToast("Hero video replaced successfully!");
    } else if (el.tagName === "IMG") {
      el.src = selectedMedia.url;
      if (el.srcset) el.removeAttribute("srcset");
      const isLogo = el.closest("header, nav") || el.alt?.toLowerCase().includes("logo") || el.src?.includes("logo");
      if (isLogo) {
        showToast("Navbar logo updated successfully!");
        try {
          fetch("/api/site-settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ site_logo: selectedMedia.url })
          }).catch(() => {});
          fetch("/api/sections/header", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logo: selectedMedia.url })
          }).catch(() => {});
        } catch (err) {}
      } else {
        showToast("Image replaced successfully!");
      }
    } else {
      el.style.backgroundImage = `url('${selectedMedia.url}')`;
      el.style.backgroundSize = "cover";
      showToast("Background media applied!");
    }

    setMediaPickerOpen(false);
  };

  const handleOpenCrop = (layer) => {
    setSelectedLayer(layer);
    setContextMenu({ visible: false, x: 0, y: 0, layers: [] });
    let initScale = 100;
    let initX = 50;
    let initY = 50;
    let initFit = "cover";
    if (layer?.el) {
      if (layer.el.style.objectFit) {
        initFit = layer.el.style.objectFit;
      }
      if (layer.el.style.objectPosition) {
        const parts = layer.el.style.objectPosition.split(" ");
        if (parts.length >= 2) {
          const px = parseFloat(parts[0]);
          const py = parseFloat(parts[1]);
          if (!isNaN(px)) initX = Math.round(px);
          if (!isNaN(py)) initY = Math.round(py);
        }
      }
      if (layer.el.style.transform) {
        const match = layer.el.style.transform.match(/scale\(([^)]+)\)/);
        if (match && match[1]) {
          const s = parseFloat(match[1]);
          if (!isNaN(s)) initScale = Math.round(s * 100);
        }
      }
    }
    setCropScale(initScale);
    setCropPosX(initX);
    setCropPosY(initY);
    setCropFit(initFit);
    setCropModalOpen(true);
  };

  const handleApplyCrop = () => {
    if (selectedLayer?.el) {
      const el = selectedLayer.el;
      el.style.objectFit = cropFit;
      el.style.objectPosition = `${cropPosX}% ${cropPosY}%`;
      el.style.transform = `scale(${cropScale / 100})`;
      showToast("Crop and framing boundaries applied!");
    }
    setCropModalOpen(false);
  };

  const handleOpenCode = (layer) => {
    setSelectedLayer(layer);
    setContextMenu({ visible: false, x: 0, y: 0, layers: [] });
    setRawCode(layer.el.outerHTML);
    setCodeModalOpen(true);
  };

  const handleApplyCode = () => {
    if (selectedLayer?.el) {
      try {
        const temp = document.createElement("div");
        temp.innerHTML = rawCode.trim();
        const newEl = temp.firstElementChild;
        if (newEl) {
          selectedLayer.el.replaceWith(newEl);
          showToast("Element code successfully updated!");
        }
      } catch (e) {
        showToast("Error parsing code: " + e.message);
      }
    }
    setCodeModalOpen(false);
  };

  const handleRemoveLayer = (layer) => {
    setContextMenu({ visible: false, x: 0, y: 0, layers: [] });
    if (layer?.el && layer.el !== document.body) {
      layer.el.style.display = "none";
      showToast("Layer hidden from view");
    }
  };

  // Font size stepper & direct input control (- 12 +)
  const handleApplyExactFontSize = (sizeInput) => {
    const target = activeTextRef.current;
    if (!target) return;
    target.contentEditable = "true";

    const num = parseInt(sizeInput, 10);
    const newSize = Math.max(8, Math.min(140, isNaN(num) ? 12 : num));

    const prevInnerHTML = target.innerHTML;
    const prevCssText = target.style.cssText;

    const sel = window.getSelection();
    let range = null;
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && target.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRangeRef.current && !savedSelectionRangeRef.current.collapsed && target.contains(savedSelectionRangeRef.current.commonAncestorContainer)) {
      range = savedSelectionRangeRef.current;
    }

    if (range && !range.collapsed) {
      // Restore range in selection if not active
      try {
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {}

      // Find if range is already inside an existing styled span OR contains one
      let targetSpan = null;
      let cur = range.commonAncestorContainer;
      if (cur.nodeType === Node.TEXT_NODE) cur = cur.parentElement;
      while (cur && cur !== target) {
        if (cur.tagName === "SPAN" && (cur.style.fontSize || cur.getAttribute("style")?.includes("font-size"))) {
          targetSpan = cur;
          break;
        }
        cur = cur.parentElement;
      }

      if (!targetSpan) {
        const spans = target.querySelectorAll("span");
        for (const s of spans) {
          if (range.intersectsNode ? range.intersectsNode(s) : (target.contains(s) && range.toString().includes(s.textContent.trim()))) {
            targetSpan = s;
            break;
          }
        }
      }

      if (targetSpan) {
        // Direct update on existing span - NEVER nest tags or call execCommand
        targetSpan.style.setProperty("font-size", `${newSize}px`, "important");
        targetSpan.querySelectorAll("*").forEach((c) => c.style.removeProperty("font-size"));
        try {
          const newRange = document.createRange();
          newRange.selectNodeContents(targetSpan);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedSelectionRangeRef.current = newRange.cloneRange();
        } catch (e) {}
      } else {
        // First-time wrap: extract selected contents and place inside a single clean span
        try {
          const extracted = range.extractContents();
          const span = document.createElement("span");
          span.style.setProperty("font-size", `${newSize}px`, "important");
          span.appendChild(extracted);
          span.querySelectorAll("*").forEach((c) => c.style.removeProperty("font-size"));
          range.insertNode(span);

          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedSelectionRangeRef.current = newRange.cloneRange();
        } catch (err) {}
      }
    } else {
      // No sub-selection: resize target element as a whole block
      target.style.setProperty("font-size", `${newSize}px`, "important");
      target.querySelectorAll("span, font, p, h1, h2, h3, h4, h5, h6, a, button, b, strong, i, em").forEach((c) => {
        c.style.removeProperty("font-size");
      });
    }

    setActiveFormats((prev) => ({ ...prev, fontSize: newSize }));
    setFontSizeInput(newSize);
    updateBoxRect(target);
    syncTextToCMS(target);

    const nextInnerHTML = target.innerHTML;
    const nextCssText = target.style.cssText;
    pushHistory({
      desc: `Font size: ${newSize}px`,
      undo: () => {
        target.innerHTML = prevInnerHTML;
        target.style.cssText = prevCssText;
        activeTextRef.current = target;
        updateBoxRect(target);
        syncTextToCMS(target);
      },
      redo: () => {
        target.innerHTML = nextInnerHTML;
        target.style.cssText = nextCssText;
        activeTextRef.current = target;
        updateBoxRect(target);
        syncTextToCMS(target);
      }
    });
  };

  const handleChangeFontSize = (delta) => {
    const currentSize = parseInt(fontSizeInput || activeFormats.fontSize, 10) || 12;
    handleApplyExactFontSize(currentSize + delta);
  };

  // Text Pill Formatting Helpers
  const applyFormat = (command, value = null) => {
    setBlockDropdownOpen(false);
    if (!activeTextRef.current) return;
    const target = activeTextRef.current;
    const prevInnerHTML = target.innerHTML;
    const prevCssText = target.style.cssText;

    if (command === "foreColor") {
      const selection = window.getSelection();
      const hasSelection = selection && !selection.isCollapsed && target.contains(selection.anchorNode);

      if (hasSelection) {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("foreColor", false, value);
      } else {
        target.style.setProperty("color", value, "important");
        const children = target.querySelectorAll("span, p, a, div, h1, h2, h3, h4, h5, h6, button, b, strong, i, em");
        children.forEach((c) => {
          c.style.setProperty("color", value, "important");
        });
      }
      setActiveFormats((prev) => ({ ...prev, color: value }));
      showToast(`Text color updated to ${value}`);
      syncTextToCMS(target);

      const nextInnerHTML = target.innerHTML;
      const nextCssText = target.style.cssText;
      pushHistory({
        desc: `Color (${value})`,
        undo: () => {
          target.innerHTML = prevInnerHTML;
          target.style.cssText = prevCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        },
        redo: () => {
          target.innerHTML = nextInnerHTML;
          target.style.cssText = nextCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        }
      });
      return;
    }

    if (command === "justifyLeft" || command === "justifyCenter" || command === "justifyRight") {
      const alignVal = command === "justifyLeft" ? "left" : (command === "justifyCenter" ? "center" : "right");
      target.style.setProperty("text-align", alignVal, "important");
      if (alignVal === "left") {
        target.style.setProperty("margin-left", "0px", "important");
        target.style.setProperty("margin-right", "auto", "important");
        target.style.setProperty("align-self", "flex-start", "important");
      }
      if (window.getComputedStyle(target).display === "inline") {
        target.style.setProperty("display", "block", "important");
      }
      target.querySelectorAll("*").forEach((c) => c.style.setProperty("text-align", alignVal, "important"));
      setActiveFormats((prev) => ({ ...prev, align: alignVal }));
      updateBoxRect(target);
      syncTextToCMS(target);

      const nextInnerHTML = target.innerHTML;
      const nextCssText = target.style.cssText;
      pushHistory({
        desc: `Align ${alignVal}`,
        undo: () => {
          target.innerHTML = prevInnerHTML;
          target.style.cssText = prevCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        },
        redo: () => {
          target.innerHTML = nextInnerHTML;
          target.style.cssText = nextCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        }
      });
      return;
    }

    if (command === "formatBlock") {
      const newTag = value.toLowerCase(); // 'h1', 'h2', 'h3', or 'p'

      const oldTag = target.tagName.toLowerCase();
      const oldHTML = target.innerHTML;
      const oldAttrs = Array.from(target.attributes).map((a) => ({ name: a.name, value: a.value }));
      const oldStyles = Array.from(target.style).map((p) => ({
        property: p,
        value: target.style.getPropertyValue(p),
        priority: target.style.getPropertyPriority(p)
      }));

      const newEl = document.createElement(newTag);
      newEl.innerHTML = target.innerHTML;

      // Copy non-class, non-style attributes
      for (let attr of target.attributes) {
        if (attr.name !== "class" && attr.name !== "style") {
          newEl.setAttribute(attr.name, attr.value);
        }
      }

      // Filter out any Tailwind font-size, font-weight, leading classes that would override the new tag
      const cleanClasses = (target.className || "")
        .split(/\s+/)
        .filter((c) => !c.match(/^(md:|lg:|xl:)?(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|\[\d+px\])|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|leading-)/))
        .join(" ");
      if (cleanClasses) {
        newEl.className = cleanClasses;
      }

      // Copy existing inline styles, but remove old font-size, font-weight, line-height, margin
      for (let i = 0; i < target.style.length; i++) {
        const prop = target.style[i];
        if (!["font-size", "font-weight", "line-height", "margin"].includes(prop)) {
          newEl.style.setProperty(prop, target.style.getPropertyValue(prop), target.style.getPropertyPriority(prop));
        }
      }

      // Explicit typography styling for each block type with !important
      const typoPresets = {
        h1: { fontSize: "38px", fontWeight: "800", lineHeight: "1.2", margin: "16px 0 8px 0" },
        h2: { fontSize: "28px", fontWeight: "700", lineHeight: "1.25", margin: "14px 0 6px 0" },
        h3: { fontSize: "22px", fontWeight: "600", lineHeight: "1.3", margin: "10px 0 4px 0" },
        p:  { fontSize: "16px", fontWeight: "400", lineHeight: "1.6", margin: "8px 0" }
      };

      const preset = typoPresets[newTag] || typoPresets.p;
      newEl.style.setProperty("font-size", preset.fontSize, "important");
      newEl.style.setProperty("font-weight", preset.fontWeight, "important");
      newEl.style.setProperty("line-height", preset.lineHeight, "important");
      newEl.style.setProperty("margin", preset.margin, "important");
      newEl.contentEditable = "true";

      // Also clean any children with conflicting inline font sizes/weights
      newEl.querySelectorAll("*").forEach((c) => {
        c.style.removeProperty("font-size");
        c.style.removeProperty("font-weight");
      });

      target.replaceWith(newEl);
      activeTextRef.current = newEl;

      // Keep focus on new element
      newEl.focus();

      // Recalculate floating bar position
      updateBoxRect(newEl);

      setActiveFormats((prev) => ({
        ...prev,
        block: newTag,
        bold: parseInt(preset.fontWeight, 10) >= 600
      }));

      showToast(`Transformed to ${newTag === "p" ? "Paragraph" : newTag.toUpperCase()}`);
      syncTextToCMS(newEl);

      pushHistory({
        desc: `Format as ${newTag === "p" ? "Paragraph" : newTag.toUpperCase()}`,
        undo: () => {
          const restored = document.createElement(oldTag);
          restored.innerHTML = oldHTML;
          oldAttrs.forEach((a) => restored.setAttribute(a.name, a.value));
          oldStyles.forEach((s) => restored.style.setProperty(s.property, s.value, s.priority));
          restored.contentEditable = "true";
          if (newEl.parentNode) {
            newEl.replaceWith(restored);
            activeTextRef.current = restored;
            restored.focus();
            syncTextToCMS(restored);
          }
        },
        redo: () => {
          if (target && target.parentNode) {
            target.replaceWith(newEl);
          }
          activeTextRef.current = newEl;
          newEl.focus();
          syncTextToCMS(newEl);
        }
      });
      return;
    }

    // Bold, Italic, Underline, Strikethrough
    if (command === "bold") {
      const comp = window.getComputedStyle(target);
      const isCurrentlyBold = comp.fontWeight === "bold" || parseInt(comp.fontWeight, 10) >= 600;
      const newVal = isCurrentlyBold ? "400" : "700";

      const sel = window.getSelection();
      const hasSubSelection = sel && !sel.isCollapsed && target.contains(sel.anchorNode);
      if (hasSubSelection) {
        document.execCommand("bold", false, null);
      } else {
        target.style.setProperty("font-weight", newVal, "important");
        target.querySelectorAll("*").forEach((c) => c.style.setProperty("font-weight", newVal, "important"));
      }
      setActiveFormats((prev) => ({ ...prev, bold: !isCurrentlyBold }));
      syncTextToCMS(target);

      const nextInnerHTML = target.innerHTML;
      const nextCssText = target.style.cssText;
      pushHistory({
        desc: isCurrentlyBold ? "Normal font" : "Bold font",
        undo: () => {
          target.innerHTML = prevInnerHTML;
          target.style.cssText = prevCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        },
        redo: () => {
          target.innerHTML = nextInnerHTML;
          target.style.cssText = nextCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        }
      });
      return;
    }

    if (command === "italic") {
      const comp = window.getComputedStyle(target);
      const isCurrentlyItalic = comp.fontStyle === "italic";
      const newVal = isCurrentlyItalic ? "normal" : "italic";

      const sel = window.getSelection();
      const hasSubSelection = sel && !sel.isCollapsed && target.contains(sel.anchorNode);
      if (hasSubSelection) {
        document.execCommand("italic", false, null);
      } else {
        target.style.setProperty("font-style", newVal, "important");
        target.querySelectorAll("*").forEach((c) => c.style.setProperty("font-style", newVal, "important"));
      }
      setActiveFormats((prev) => ({ ...prev, italic: !isCurrentlyItalic }));
      syncTextToCMS(target);

      const nextInnerHTML = target.innerHTML;
      const nextCssText = target.style.cssText;
      pushHistory({
        desc: isCurrentlyItalic ? "Normal font" : "Italic font",
        undo: () => {
          target.innerHTML = prevInnerHTML;
          target.style.cssText = prevCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        },
        redo: () => {
          target.innerHTML = nextInnerHTML;
          target.style.cssText = nextCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        }
      });
      return;
    }

    if (command === "underline" || command === "strikeThrough") {
      const comp = window.getComputedStyle(target);
      const curDec = (comp.textDecorationLine || comp.textDecoration || "").toLowerCase();
      const currentUnderline = curDec.includes("underline");
      const currentStrike = curDec.includes("line-through");

      let nextUnderline = currentUnderline;
      let nextStrike = currentStrike;

      if (command === "underline") {
        nextUnderline = !currentUnderline;
      } else {
        nextStrike = !currentStrike;
      }

      // Build combined CSS text-decoration value
      const parts = [];
      if (nextUnderline) parts.push("underline");
      if (nextStrike) parts.push("line-through");
      const combinedVal = parts.length > 0 ? parts.join(" ") : "none";

      const sel = window.getSelection();
      const hasSubSelection = sel && !sel.isCollapsed && target.contains(sel.anchorNode);
      if (hasSubSelection) {
        document.execCommand(command, false, null);
      } else {
        target.style.setProperty("text-decoration-line", combinedVal, "important");
        target.style.setProperty("text-decoration", combinedVal, "important");
        target.querySelectorAll("*").forEach((c) => {
          c.style.setProperty("text-decoration-line", combinedVal, "important");
          c.style.setProperty("text-decoration", combinedVal, "important");
        });
      }

      setActiveFormats((prev) => ({
        ...prev,
        underline: nextUnderline,
        strikeThrough: nextStrike
      }));
      syncTextToCMS(target);

      const nextInnerHTML = target.innerHTML;
      const nextCssText = target.style.cssText;
      pushHistory({
        desc: `Toggle ${command}`,
        undo: () => {
          target.innerHTML = prevInnerHTML;
          target.style.cssText = prevCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        },
        redo: () => {
          target.innerHTML = nextInnerHTML;
          target.style.cssText = nextCssText;
          activeTextRef.current = target;
          syncTextToCMS(target);
        }
      });
      return;
    }

    document.execCommand(command, false, value);
    if (activeTextRef.current) {
      activeTextRef.current.focus();
    }
    syncTextToCMS(target);
  };

  const handleSaveTextPill = async () => {
    if (!activeTextRef.current) return;
    syncTextToCMS(activeTextRef.current);
  };

  // Add Custom Draggable/Resizable Slot
  const handleAddSlot = (type) => {
    const newSlot = {
      id: Date.now(),
      type,
      x: 60,
      y: 120 + slots.length * 30,
      w: 320,
      h: 200,
      text: "Custom editable text slot",
      src: type === "video" ? "/videos/emaar.mp4" : "/images/landmarks/Serenity-hills-big.webp"
    };
    setSlots([...slots, newSlot]);
    showToast(`Added new ${type} slot template. Drag and resize freely!`);
  };

  // Save Staged Content to Backend (Comprehensive full-page DOM collection)
  const handleSaveStaged = async (isSilent = false) => {
    try {
      if (!isSilent) showToast("Staging changes...");

      // 1. Header Navigation & Branding
      const headerEl = document.querySelector("header");
      let headerPayload = {};
      if (headerEl) {
        const aboutEl = headerEl.querySelector('[data-cms-nav="about"], a[href*="about"]');
        const launchesEl = headerEl.querySelector('[data-cms-nav="launches"], a[href*="latest-launches"]');
        const projectsEl = headerEl.querySelector('[data-cms-nav="projects"], button');
        const sustainEl = headerEl.querySelector('[data-cms-nav="sustainability"], a[href*="sustainability"]');
        const ctaEl = headerEl.querySelector('a[href*="contact"], a[href*="visit"]');
        const logoImg = headerEl.querySelector('img[alt*="Logo"], img[alt*="Emaar"]');

        const navLinks = Array.from(headerEl.querySelectorAll("nav a, nav button"))
          .map((el) => el.innerText.trim())
          .filter(Boolean);

        headerPayload = {
          nav_links: navLinks.join(", "),
          ...(aboutEl ? { about_text: aboutEl.innerText.trim() } : {}),
          ...(launchesEl ? { launches_text: launchesEl.innerText.trim() } : {}),
          ...(projectsEl ? { projects_text: projectsEl.innerText.trim() } : {}),
          ...(sustainEl ? { sustainability_text: sustainEl.innerText.trim() } : {}),
          ...(logoImg?.getAttribute("src")
            ? {
                logo:
                  logoImg.getAttribute("src").includes("/_next/image") && logoImg.getAttribute("src").includes("url=")
                    ? new URL(logoImg.getAttribute("src"), window.location.origin).searchParams.get("url") || logoImg.getAttribute("src")
                    : logoImg.getAttribute("src")
              }
            : {})
        };
      }

      // 2. Hero & Settings
      const heroVid =
        document.querySelector("video")?.getAttribute("src") ||
        document.querySelector("video source")?.getAttribute("src");
      const heroSearchInput = document.querySelector('input[placeholder*="Search"]');

      // 3. Legacy / Intro Section
      const sections = Array.from(document.querySelectorAll("section"));
      let legacyTitle = "";
      let legacyContent = "";
      for (const sec of sections) {
        if (
          sec.innerText.includes("LEGACY") ||
          sec.innerText.includes("BUILT ON") ||
          sec.querySelector("h2")?.innerText?.includes("LEGACY")
        ) {
          const h = sec.querySelector("h2");
          const p = sec.querySelector(".font-light, p");
          if (h) legacyTitle = h.innerHTML;
          if (p) legacyContent = p.innerHTML;
          break;
        }
      }

      // 4. Discover Section (Walkthrough & Blogs)
      let walkthroughPayload = {};
      let blogsPayload = {};
      for (const sec of sections) {
        if (sec.innerText.includes("WALKTHROUGH")) {
          const badge = sec.querySelector('[class*="badge"], span');
          const title = sec.querySelector("h2, h3");
          const subtitle = sec.querySelector(".subtitle, p");
          const img = sec.querySelector("img");
          const rawWalkSrc = img?.getAttribute("src");
          const cleanWalkSrc =
            rawWalkSrc && rawWalkSrc.includes("/_next/image") && rawWalkSrc.includes("url=")
              ? new URL(rawWalkSrc, window.location.origin).searchParams.get("url") || rawWalkSrc
              : rawWalkSrc;
          walkthroughPayload = {
            ...(badge ? { badge: badge.innerText.trim() } : {}),
            ...(title ? { title: title.innerText.trim() } : {}),
            ...(subtitle ? { subtitle: subtitle.innerText.trim() } : {}),
            ...(cleanWalkSrc ? { image: cleanWalkSrc } : {}),
            ...(cta ? { cta_text: cta.innerText.trim() } : {})
          };
        }
        if (sec.innerText.includes("BLOGS") || sec.innerText.includes("VIEW ALL")) {
          const title = sec.querySelector("h2, h3");
          const subtitle = sec.querySelector(".subtitle, p");
          const viewAll = Array.from(sec.querySelectorAll("a, button")).find((a) => a.innerText?.toUpperCase().includes("VIEW") || a.innerText?.toUpperCase().includes("ALL"));
          blogsPayload = {
            ...(title ? { title: title.innerText.trim() } : {}),
            ...(subtitle ? { subtitle: subtitle.innerText.trim() } : {}),
            ...(viewAll ? { view_all_text: viewAll.innerText.trim() } : {})
          };
        }
      }

      // 5. Custom Added Sections
      const customAddedEls = Array.from(document.querySelectorAll(".custom-added-section"));
      const customSections = customAddedEls.map((sec, idx) => ({
        id: "custom-sec-" + (idx + 1),
        html: sec.innerHTML.replace(/<div style="position: absolute; top: 14px; right: 24px[\s\S]*?<\/div>/, ""),
        title: sec.querySelector("h2")?.innerText.trim() || "",
        content: sec.querySelector("p")?.innerText.trim() || ""
      }));

      const payload = {
        settings: {
          ...(heroVid ? { hero_video: heroVid } : {}),
          ...(heroSearchInput?.getAttribute("placeholder")
            ? { hero_search_placeholder: heroSearchInput.getAttribute("placeholder") }
            : {})
        },
        sections: {
          ...(Object.keys(headerPayload).length > 0 ? { header: headerPayload } : {}),
          ...(legacyTitle || legacyContent
            ? {
                legacy_intro: {
                  ...(legacyTitle ? { title: legacyTitle } : {}),
                  ...(legacyContent ? { content: legacyContent } : {})
                }
              }
            : {}),
          ...(Object.keys(walkthroughPayload).length > 0 ? { walkthrough: walkthroughPayload } : {}),
          ...(Object.keys(blogsPayload).length > 0 ? { blogs: blogsPayload } : {}),
          custom_sections: customSections,
          custom_slots: slots
        }
      };

      // If currently on a custom route (e.g. /test), save custom sections to that page
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
      if (currentPath && currentPath !== "/") {
        try {
          const pagesRes = await fetch("http://localhost:5000/api/pages");
          const pagesData = await pagesRes.json();
          if (pagesData.success && Array.isArray(pagesData.data)) {
            const cleanPath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
            const targetPage = pagesData.data.find((p) => p.slug === cleanPath || p.slug === currentPath);
            if (targetPage) {
              await fetch(`http://localhost:5000/api/pages/${targetPage.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sections: customSections
                })
              });
            }
          }
        } catch (pageErr) {
          console.error("Custom page sync error in handleSaveStaged:", pageErr);
        }
      }

      const res = await fetch("http://localhost:5000/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (!isSilent) showToast("All staged edits saved successfully to CMS!");
        try {
          const bc = new BroadcastChannel("cms_live_sync");
          bc.postMessage({ type: "STAGED_CHANGE" });
        } catch (e) {}
        return true;
      } else {
        if (!isSilent) showToast("Error saving: " + data.message);
        return false;
      }
    } catch (e) {
      if (!isSilent) showToast("Save failed: " + e.message);
      return false;
    }
  };

  // Publish Live with Animated Step-by-Step Progress Feedback
  const handlePublishLive = async () => {
    if (publishModal.status === "saving" || publishModal.status === "publishing") return;

    setPublishModal({
      open: true,
      step: 1,
      status: "saving",
      message: "Scanning page and staging all live edits...",
      version: "",
      timestamp: "",
      errorMsg: ""
    });

    try {
      // Step 1: Scanning & Staging
      await new Promise((r) => setTimeout(r, 400));
      setPublishModal((prev) => ({
        ...prev,
        step: 2,
        message: "Synchronizing staged modifications with CMS backend..."
      }));

      const saveOk = await handleSaveStaged(true);
      if (!saveOk) {
        throw new Error("Failed to save staged changes to CMS server.");
      }

      // Step 2 -> 3: Creating Version Snapshot
      await new Promise((r) => setTimeout(r, 450));
      setPublishModal((prev) => ({
        ...prev,
        step: 3,
        status: "publishing",
        message: "Generating production release snapshot & updating live catalog..."
      }));

      const res = await fetch("http://localhost:5000/api/publish", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to publish live version.");
      }

      // Step 4: Finalizing & Refreshing Live Website
      await new Promise((r) => setTimeout(r, 400));
      try {
        const bc = new BroadcastChannel("cms_live_sync");
        bc.postMessage({ type: "PUBLISHED", timestamp: Date.now() });
      } catch (e) {}

      setPublishModal({
        open: true,
        step: 4,
        status: "success",
        message: data.message || "All changes published live to website!",
        version: data.version?.version_number || "Live Release",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        errorMsg: ""
      });

      showToast(`✓ Published live as ${data.version?.version_number || "latest release"}! Live site on :3000 is updated.`);
    } catch (e) {
      setPublishModal((prev) => ({
        ...prev,
        status: "error",
        errorMsg: e.message || "Unknown error during publish"
      }));
      showToast("Publish failed: " + e.message, true);
    }
  };

  if (!isActive) return null;

  return (
    <div className="visual-editor-portal">
      {/* Push website header, sidebar drawer, and body down so nothing overlaps with the studio bar */}
      <style>{`
        header.fixed,
        header[class*="fixed"],
        header {
          top: 48px !important;
        }
        aside.fixed {
          top: 48px !important;
          height: calc(100vh - 48px) !important;
          transition: top 0.2s ease, transform 0.5s ease-in-out !important;
        }
        header ~ div.fixed.inset-0,
        .fixed.inset-0:not(.visual-editor-portal *) {
          top: 48px !important;
          height: calc(100vh - 48px) !important;
        }
        body {
          padding-top: 48px !important;
        }
        [contenteditable="true"]:focus,
        [contenteditable="true"] {
          outline: none !important;
        }
      `}</style>

      {/* 1. TOP STUDIO BAR */}
      <div
        id="visualEditorStudioBar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "48px",
          background: "rgba(9, 9, 11, 0.98)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 2000005,
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "13px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }}></span>
            <span>Emaar Live Studio</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Undo Button */}
            <button
              type="button"
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              style={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                color: canUndo ? "#ffffff" : "#71717a",
                opacity: canUndo ? 1 : 0.45,
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: canUndo ? "pointer" : "default",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6"></path>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
              </svg>
              <span style={{ fontSize: "11px", fontWeight: "600" }}>Undo</span>
            </button>

            {/* Redo Button */}
            <button
              type="button"
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              style={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                color: canRedo ? "#ffffff" : "#71717a",
                opacity: canRedo ? 1 : 0.45,
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: canRedo ? "pointer" : "default",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6"></path>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
              </svg>
              <span style={{ fontSize: "11px", fontWeight: "600" }}>Redo</span>
            </button>

            <span style={{ width: "1px", height: "18px", background: "#3f3f46", margin: "0 3px" }} />

            {/* Tt (Text Tool) */}
            <button
              type="button"
              onClick={() => {
                const next = activeTool === "text" ? null : "text";
                setActiveTool(next);
                activeTextRef.current = null;
                setActiveBoxInfo(null);
                setTextPillBar((prev) => ({ ...prev, visible: false }));
                setSelectedShapeId(null);
                setMultiSelectedElements([]);
              }}
              title={activeTool === "text" ? "Text Tool Active - Click to deactivate" : "Text Tool - Click to activate, then drag on page to draw text box"}
              style={{
                background: activeTool === "text" ? "#2563eb" : "#18181b",
                border: activeTool === "text" ? "1.5px solid #60a5fa" : "1px solid #3f3f46",
                color: activeTool === "text" ? "#ffffff" : "#e4e4e7",
                padding: "5px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTool === "text" ? "0 0 12px rgba(37,99,235,0.7), inset 0 0 4px rgba(255,255,255,0.2)" : "none",
                transform: activeTool === "text" ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: "bold", lineHeight: 1 }}>Tt</span>
              {activeTool === "text" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 6px #60a5fa" }} />}
            </button>

            {/* Image Tool */}
            <button
              type="button"
              onClick={() => {
                const next = activeTool === "image" ? null : "image";
                setActiveTool(next);
                activeTextRef.current = null;
                setActiveBoxInfo(null);
                setTextPillBar((prev) => ({ ...prev, visible: false }));
                setSelectedShapeId(null);
                setMultiSelectedElements([]);
              }}
              title={activeTool === "image" ? "Image Tool Active - Click to deactivate" : "Image Tool - Click to activate, then drag on page to draw image box"}
              style={{
                background: activeTool === "image" ? "#2563eb" : "#18181b",
                border: activeTool === "image" ? "1.5px solid #60a5fa" : "1px solid #3f3f46",
                color: activeTool === "image" ? "#ffffff" : "#e4e4e7",
                padding: "5px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTool === "image" ? "0 0 12px rgba(37,99,235,0.7), inset 0 0 4px rgba(255,255,255,0.2)" : "none",
                transform: activeTool === "image" ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              {activeTool === "image" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 6px #60a5fa" }} />}
            </button>

            {/* Video Tool */}
            <button
              type="button"
              onClick={() => {
                const next = activeTool === "video" ? null : "video";
                setActiveTool(next);
                activeTextRef.current = null;
                setActiveBoxInfo(null);
                setTextPillBar((prev) => ({ ...prev, visible: false }));
                setSelectedShapeId(null);
                setMultiSelectedElements([]);
              }}
              title={activeTool === "video" ? "Video Tool Active - Click to deactivate" : "Video Tool - Click to activate, then drag on page to draw video box"}
              style={{
                background: activeTool === "video" ? "#2563eb" : "#18181b",
                border: activeTool === "video" ? "1.5px solid #60a5fa" : "1px solid #3f3f46",
                color: activeTool === "video" ? "#ffffff" : "#e4e4e7",
                padding: "5px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTool === "video" ? "0 0 12px rgba(37,99,235,0.7), inset 0 0 4px rgba(255,255,255,0.2)" : "none",
                transform: activeTool === "video" ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              {activeTool === "video" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 6px #60a5fa" }} />}
            </button>

            <span style={{ width: "1px", height: "18px", background: "#3f3f46", margin: "0 3px" }} />

            {/* Area Multi-Selector Tool */}
            <button
              type="button"
              id="cmsMultiSelectToolBtn"
              onClick={() => {
                const next = activeTool === "select" ? null : "select";
                setActiveTool(next);
                activeTextRef.current = null;
                setActiveBoxInfo(null);
                setTextPillBar((prev) => ({ ...prev, visible: false }));
                setSelectedShapeId(null);
                setMultiSelectedElements([]);
              }}
              title={activeTool === "select" ? "Area Selector Active - Click to deactivate" : "Area Multi-Select Tool - Click, then draw a rectangle on page to select multiple items"}
              style={{
                background: activeTool === "select" ? "#2563eb" : "#18181b",
                border: activeTool === "select" ? "1.5px solid #60a5fa" : "1px solid #3f3f46",
                color: activeTool === "select" ? "#ffffff" : "#e4e4e7",
                padding: "5px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTool === "select" ? "0 0 12px rgba(37,99,235,0.7), inset 0 0 4px rgba(255,255,255,0.2)" : "none",
                transform: activeTool === "select" ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span style={{ fontSize: "11px", fontWeight: "600" }}>Area Select</span>
              {activeTool === "select" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 6px #60a5fa" }} />}
            </button>

            {/* Status indicator when a tool is active */}
            {activeTool && (
              <span style={{ fontSize: "11px", color: "#60a5fa", background: "rgba(37, 99, 235, 0.15)", padding: "3px 8px", borderRadius: "4px", border: "1px solid rgba(96, 165, 250, 0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{activeTool === "select" ? "Draw a rectangle to select multiple items" : `Drag on page to draw ${activeTool}`}</span>
                <span onClick={() => setActiveTool(null)} style={{ cursor: "pointer", fontWeight: "bold", marginLeft: "4px", color: "#93c5fd" }} title="Cancel tool">✕</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleSaveStaged}
            style={{ background: "#2563eb", border: "none", color: "#fff", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}
          >
            Save Staged Changes
          </button>
          <button
            type="button"
            onClick={handlePublishLive}
            disabled={publishModal.status === "saving" || publishModal.status === "publishing"}
            style={{
              background: publishModal.status === "saving" || publishModal.status === "publishing" ? "#047857" : "#059669",
              border: "none",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "12px",
              cursor: publishModal.status === "saving" || publishModal.status === "publishing" ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: publishModal.status === "saving" || publishModal.status === "publishing" ? 0.8 : 1,
              transition: "all 0.15s ease"
            }}
          >
            {publishModal.status === "saving" || publishModal.status === "publishing" ? (
              <>
                <svg
                  style={{ animation: "spin 1s linear infinite" }}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10"></path>
                </svg>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span>Publish Live</span>
              </>
            )}
          </button>
          <a
            href="http://localhost:5000/"
            style={{ background: "#27272a", border: "1px solid #3f3f46", color: "#fafafa", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "12px", fontWeight: "500" }}
          >
            Back to CMS
          </a>
        </div>
      </div>

      {/* 2. RIGHT-CLICK ACTION MENU (CLEAN, DIRECT & NO OVERLAPPING FLYOUTS) */}
      {contextMenu.visible && (
        <div
          id="contextMenuPortal"
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            width: "250px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 14px 34px rgba(0,0,0,0.18), 0 3px 10px rgba(0,0,0,0.06)",
            zIndex: 2000000,
            padding: "6px",
            boxSizing: "border-box",
            fontSize: "12px",
            color: "#0f172a",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {/* STACKED LAYERS DETECTED AT CURSOR (HERO SECTION ONLY) */}
            {contextMenu.isHero && contextMenu.layers && contextMenu.layers.length > 0 && (
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", marginBottom: "6px" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", padding: "2px 6px 6px 6px", letterSpacing: "0.5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Hero Layers:</span>
                  <span style={{ fontSize: "9px", background: "#f1f5f9", color: "#475569", padding: "1px 5px", borderRadius: "3px", fontWeight: "600" }}>{contextMenu.layers.length} Layers</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {contextMenu.layers.slice(0, 4).map((l, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                        if (l.type === "video") {
                          handleOpenMediaPicker(l);
                        } else if (l.type === "image") {
                          handleOpenMediaPicker(l);
                        } else if (l.type === "section") {
                          activeTextRef.current = l.el;
                          updateBoxRect(l.el);
                        } else {
                          activeTextRef.current = l.el;
                          if (l.el.tagName === "INPUT") {
                            l.el.focus();
                          } else {
                            l.el.contentEditable = "true";
                            l.el.focus();
                          }
                          updateBoxRect(l.el);
                        }
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "5px 8px",
                        borderRadius: "5px",
                        background: l.type === "video" ? "#f0fdf4" : (activeTextRef.current === l.el ? "#eff6ff" : "transparent"),
                        color: l.type === "video" ? "#166534" : (activeTextRef.current === l.el ? "#1d4ed8" : "#334155"),
                        fontSize: "11px",
                        fontWeight: "500",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                        border: l.type === "video" ? "1px solid #bbf7d0" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = l.type === "video" ? "#dcfce7" : "#f1f5f9"; e.currentTarget.style.color = l.type === "video" ? "#166534" : "#2563eb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = l.type === "video" ? "#f0fdf4" : (activeTextRef.current === l.el ? "#eff6ff" : "transparent"); e.currentTarget.style.color = l.type === "video" ? "#166534" : (activeTextRef.current === l.el ? "#1d4ed8" : "#334155"); }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", minWidth: 0 }}>
                        <span style={{ fontSize: "9.5px", fontWeight: "700", color: l.type === "video" ? "#15803d" : "#2563eb", background: l.type === "video" ? "#dcfce7" : "#eff6ff", padding: "1px 5px", borderRadius: "3px", whiteSpace: "nowrap" }}>
                          Layer {idx + 1}
                        </span>
                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "140px" }}>
                          {l.name}
                        </span>
                      </div>
                      <span style={{ fontSize: "9px", color: l.type === "video" ? "#15803d" : "#94a3b8", textTransform: "uppercase", fontWeight: "700", whiteSpace: "nowrap" }}>
                        {l.type === "video" ? "Replace" : l.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const targetImg = contextMenu.imageTarget || (activeTextRef.current?.tagName === "IMG" ? activeTextRef.current : activeTextRef.current?.querySelector("img"));
              if (targetImg) {
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                        handleOpenMediaPicker({
                          name: targetImg.alt ? `Image (${targetImg.alt.slice(0, 20)})` : (targetImg.src?.includes("logo") ? "Brand Logo" : "Logo / Icon"),
                          el: targetImg,
                          type: "image"
                        });
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "7px 10px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "6px",
                        color: "#1d4ed8",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>
                        {targetImg.src?.toLowerCase().includes("logo") || targetImg.alt?.toLowerCase().includes("logo") || targetImg.closest("header, nav")
                          ? "Edit Logo / Icon"
                          : "Edit Image"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                        handleOpenCrop({
                          name: targetImg.alt ? `Image (${targetImg.alt.slice(0, 20)})` : "Image",
                          el: targetImg,
                          type: "image"
                        });
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "7px 10px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        color: "#334155",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#2563eb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#334155"; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                        <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                        <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                      </svg>
                      <span>Crop & Framing</span>
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", borderTop: "1px solid #f1f5f9", paddingTop: "5px", marginTop: "3px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", padding: "1px 6px" }}>Border / Style:</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", padding: "0 2px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            targetImg.style.border = "none";
                            targetImg.style.boxShadow = "none";
                            showToast("Image border removed");
                            setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                          }}
                          style={{ padding: "4px", fontSize: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", cursor: "pointer", color: "#475569" }}
                        >
                          Clean
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            targetImg.style.border = "2px solid #c5a880";
                            targetImg.style.borderRadius = "8px";
                            targetImg.style.boxShadow = "0 4px 15px rgba(197,168,128,0.2)";
                            showToast("Luxury Gold border applied");
                            setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                          }}
                          style={{ padding: "4px", fontSize: "10px", background: "#faf8f5", border: "1px solid #c5a880", color: "#92400e", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
                        >
                          Gold 2px
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            targetImg.style.border = "1px solid #cbd5e1";
                            targetImg.style.borderRadius = "8px";
                            targetImg.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                            showToast("Modern Card border applied");
                            setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                          }}
                          style={{ padding: "4px", fontSize: "10px", background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Card 1px
                        </button>
                      </div>
                    </div>

                    {(Boolean(targetImg.style?.width) || Boolean(targetImg.style?.height) || Boolean(targetImg.style?.minHeight) || Boolean(getImgWrapper(targetImg)?.style?.width) || Boolean(getImgWrapper(targetImg)?.style?.height)) && (
                      <button
                        type="button"
                        onClick={() => {
                          const img = targetImg;
                          const wrapper = getImgWrapper(img);
                          if (wrapper) {
                            wrapper.style.width = "";
                            wrapper.style.maxWidth = "";
                            wrapper.style.height = "";
                            wrapper.style.minHeight = "";
                            wrapper.style.aspectRatio = "";
                            wrapper.style.left = "";
                            wrapper.style.top = "";
                            wrapper.style.position = "";
                          }
                          img.style.width = "";
                          img.style.maxWidth = "";
                          img.style.height = "";
                          img.style.minHeight = "";
                          img.style.left = "";
                          img.style.top = "";
                          img.style.position = "";
                          setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                          updateBoxRect(wrapper || img);
                          showToast("✓ Image & container reset to default");
                        }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      color: "#475569",
                      fontSize: "11.5px",
                      fontWeight: "500",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    <span>Reset to Original Size</span>
                    </button>
                  )}
                </>
              );
            }
            return (
              <button
                type="button"
                onClick={() => {
                  if (activeTextRef.current) {
                    activeTextRef.current.contentEditable = "true";
                    activeTextRef.current.focus();
                  }
                  setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  color: "#1d4ed8",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit Content</span>
              </button>
            );
          })()}

            {contextMenu.layers?.some((l) => l.type === "video") && (
              <button
                type="button"
                onClick={() => {
                  const vidLayer = contextMenu.layers.find((l) => l.type === "video");
                  setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                  if (vidLayer) handleOpenMediaPicker(vidLayer);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  marginTop: "2px"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <span>Change Hero Video</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleOpenSectionModal();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                color: "#166534",
                fontSize: "11.5px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                marginTop: "2px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Section & Grid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setContextMenu({ visible: false, x: 0, y: 0, layers: [], imageTarget: null });
                handleDeleteActiveElement();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                background: "#ffffff",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#dc2626",
                fontSize: "11.5px",
                fontWeight: "500",
                cursor: "pointer",
                textAlign: "left",
                marginTop: "2px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete Element</span>
            </button>
          </div>
        </div>
      )}

      {/* DYNAMIC FLOATING TEXT PILL BAR (RICH ICONS, COLOR PICKER & DEPTH SHADOW) */}
      {textPillBar.visible && (
        <div
          id="dynamicTextPillBar"
          style={{
            position: "fixed",
            left: `${textPillBar.x}px`,
            top: `${textPillBar.y}px`,
            transform: textPillBar.placement === "bottom" ? "translate(-50%, 0)" : "translate(-50%, -100%)",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "14px",
            boxShadow: "0 22px 50px -10px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.06), 0 8px 18px -4px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "5px 10px",
            zIndex: 1000002,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "12px",
            color: "#0f172a",
            animation: "pillPop 0.15s cubic-bezier(0, 0, 0.2, 1)",
            maxWidth: "calc(100vw - 24px)",
            boxSizing: "border-box"
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* DRAG HANDLE TO REPOSITION TOOLBAR FREELY ANYWHERE */}
          <div
            title="Drag toolbar to reposition anywhere on screen"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const initX = textPillBar.x;
              const initY = textPillBar.y;
              const onMove = (me) => {
                const dx = me.clientX - startX;
                const dy = me.clientY - startY;
                setTextPillBar((prev) => ({
                  ...prev,
                  x: Math.max(100, Math.min(window.innerWidth - 100, initX + dx)),
                  y: Math.max(102, Math.min(window.innerHeight - 30, initY + dy))
                }));
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
            style={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              padding: "4px 6px 4px 2px",
              color: "#94a3b8",
              fontSize: "13px",
              borderRight: "1px solid #e2e8f0",
              marginRight: "2px",
              userSelect: "none"
            }}
          >
            ⋮⋮
          </div>

          {/* DUPLICATE BLOCK BUTTON (CLIPBOARD WITH + SIGN) */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setBlockDropdownOpen(false);
              handleDuplicateActiveElement();
            }}
            title="Duplicate block (creates a copy in the section/grid)"
            style={{
              padding: "5px 9px",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
              borderRadius: "6px",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: "600",
              transition: "all 0.15s ease",
              marginRight: "3px"
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>Duplicate</span>
          </button>

          {/* Caret arrow pointing to active text */}
          <div
            style={{
              position: "absolute",
              ...(textPillBar.placement === "bottom"
                ? {
                    top: "-6px",
                    borderLeft: "1px solid #cbd5e1",
                    borderTop: "1px solid #cbd5e1"
                  }
                : {
                    bottom: "-6px",
                    borderRight: "1px solid #cbd5e1",
                    borderBottom: "1px solid #cbd5e1"
                  }),
              left: `${textPillBar.arrowOffset ?? 250}px`,
              transform: "translateX(-50%) rotate(45deg)",
              width: "12px",
              height: "12px",
              background: "#ffffff",
              pointerEvents: "none"
            }}
          />

          {/* Typography Formatting */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("bold")}
            title="Bold"
            style={{
              fontWeight: "800",
              padding: "5px 8px",
              background: activeFormats.bold ? "#eff6ff" : "none",
              border: activeFormats.bold ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.bold ? "#2563eb" : "#0f172a",
              fontSize: "13px",
              transition: "all 0.15s ease"
            }}
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("italic")}
            title="Italic"
            style={{
              fontStyle: "italic",
              padding: "5px 8px",
              background: activeFormats.italic ? "#eff6ff" : "none",
              border: activeFormats.italic ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.italic ? "#2563eb" : "#0f172a",
              fontSize: "13px",
              fontFamily: "serif",
              transition: "all 0.15s ease"
            }}
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("underline")}
            title="Underline"
            style={{
              textDecoration: "underline",
              padding: "5px 8px",
              background: activeFormats.underline ? "#eff6ff" : "none",
              border: activeFormats.underline ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.underline ? "#2563eb" : "#0f172a",
              fontSize: "13px",
              transition: "all 0.15s ease"
            }}
          >
            U
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("strikeThrough")}
            title="Strikethrough"
            style={{
              textDecoration: "line-through",
              padding: "5px 8px",
              background: activeFormats.strikeThrough ? "#eff6ff" : "none",
              border: activeFormats.strikeThrough ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.strikeThrough ? "#2563eb" : "#64748b",
              fontSize: "13px",
              transition: "all 0.15s ease"
            }}
          >
            S
          </button>

          <span style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 3px" }} />

          {/* Typography Hierarchy Dropdown (H1, H2, H3, Paragraph) */}
          <div id="blockFormatDropdownWrapper" style={{ position: "relative" }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                setBlockDropdownOpen(!blockDropdownOpen);
              }}
              title="Heading & Paragraph Styles"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 8px",
                background: blockDropdownOpen ? "#eff6ff" : (["h1", "h2", "h3"].includes(activeFormats.block) ? "#eff6ff" : "none"),
                border: blockDropdownOpen || ["h1", "h2", "h3"].includes(activeFormats.block) ? "1px solid #93c5fa" : "1px solid #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
                color: ["h1", "h2", "h3"].includes(activeFormats.block) ? "#2563eb" : "#334155",
                fontSize: "11.5px",
                fontWeight: "700",
                minWidth: "64px",
                justifyContent: "space-between",
                transition: "all 0.15s ease"
              }}
            >
              <span>
                {activeFormats.block === "h1"
                  ? "H1"
                  : activeFormats.block === "h2"
                  ? "H2"
                  : activeFormats.block === "h3"
                  ? "H3"
                  : "Para"}
              </span>
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: blockDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease"
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {blockDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: "0",
                  width: "155px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18), 0 4px 6px -2px rgba(0,0,0,0.05)",
                  padding: "4px",
                  zIndex: 1000005,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                {[
                  { tag: "h1", label: "Heading 1", short: "H1", style: { fontSize: "14px", fontWeight: "800" } },
                  { tag: "h2", label: "Heading 2", short: "H2", style: { fontSize: "13px", fontWeight: "700" } },
                  { tag: "h3", label: "Heading 3", short: "H3", style: { fontSize: "12px", fontWeight: "600" } },
                  { tag: "p", label: "Paragraph", short: "Para", style: { fontSize: "11.5px", fontWeight: "400" } }
                ].map((item) => {
                  const isSelected = activeFormats.block === item.tag;
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        applyFormat("formatBlock", item.tag);
                        setBlockDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        borderRadius: "5px",
                        border: "none",
                        background: isSelected ? "#eff6ff" : "transparent",
                        color: isSelected ? "#2563eb" : "#1e293b",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "background 0.12s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={item.style}>{item.label}</span>
                      <span style={{ fontSize: "10px", color: isSelected ? "#2563eb" : "#94a3b8", fontWeight: "600" }}>
                        {item.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 3px" }} />

          {/* Font Size Stepper (- 12 +) */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "1px 2px",
              gap: "2px"
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleChangeFontSize(-1)}
              title="Decrease Font Size"
              style={{
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#0f172a",
                fontSize: "13px",
                fontWeight: "700",
                lineHeight: "1"
              }}
            >
              -
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={fontSizeInput}
              onMouseDown={(e) => {
                e.stopPropagation();
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0 && !sel.isCollapsed && activeTextRef.current?.contains(sel.anchorNode)) {
                  savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setFontSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyExactFontSize(fontSizeInput);
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                handleApplyExactFontSize(fontSizeInput);
              }}
              title="Type font size in px and press Enter"
              style={{
                width: "28px",
                height: "20px",
                textAlign: "center",
                border: "none",
                background: "transparent",
                fontSize: "11px",
                fontWeight: "700",
                color: "#0f172a",
                padding: "0 1px",
                outline: "none"
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleChangeFontSize(1)}
              title="Increase Font Size"
              style={{
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#0f172a",
                fontSize: "13px",
                fontWeight: "700",
                lineHeight: "1"
              }}
            >
              +
            </button>
          </div>

          <span style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 3px" }} />

          {/* Alignment Icons */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("justifyLeft")}
            title="Align Left"
            style={{
              padding: "5px 7px",
              background: activeFormats.align === "left" ? "#eff6ff" : "none",
              border: activeFormats.align === "left" ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.align === "left" ? "#2563eb" : "#334155",
              display: "flex",
              alignItems: "center",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="15" y1="12" x2="3" y2="12"></line>
              <line x1="19" y1="18" x2="3" y2="18"></line>
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("justifyCenter")}
            title="Align Center"
            style={{
              padding: "5px 7px",
              background: activeFormats.align === "center" ? "#eff6ff" : "none",
              border: activeFormats.align === "center" ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.align === "center" ? "#2563eb" : "#334155",
              display: "flex",
              alignItems: "center",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="6"></line>
              <line x1="21" y1="12" x2="3" y2="12"></line>
              <line x1="18" y1="18" x2="6" y2="18"></line>
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("justifyRight")}
            title="Align Right"
            style={{
              padding: "5px 7px",
              background: activeFormats.align === "right" ? "#eff6ff" : "none",
              border: activeFormats.align === "right" ? "1px solid #93c5fd" : "1px solid transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: activeFormats.align === "right" ? "#2563eb" : "#334155",
              display: "flex",
              alignItems: "center",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="12" x2="9" y2="12"></line>
              <line x1="21" y1="18" x2="5" y2="18"></line>
            </svg>
          </button>

          <span style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 3px" }} />

          {/* Quick Color Swatches */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0 3px" }}>
            {[
              { color: "#0f172a", title: "Black" },
              { color: "#2563eb", title: "Royal Blue" },
              { color: "#b45309", title: "Emaar Luxury Gold" },
              { color: "#059669", title: "Emerald Green" },
              { color: "#dc2626", title: "Crimson Red" },
              { color: "#ffffff", title: "Pure White", border: "1px solid #cbd5e1" }
            ].map((swatch, idx) => (
              <span
                key={idx}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("foreColor", swatch.color)}
                title={swatch.title}
                style={{
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  background: swatch.color,
                  cursor: "pointer",
                  border: swatch.border || "1px solid #94a3b8",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  outline: activeFormats.color === swatch.color ? `2px solid ${swatch.color === "#ffffff" ? "#0f172a" : swatch.color}` : "none",
                  outlineOffset: "1.5px",
                  transform: activeFormats.color === swatch.color ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.15s ease"
                }}
              />
            ))}

            <label
              title="Custom Color Picker"
              onMouseDown={(e) => e.preventDefault()}
              style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "2px" }}
            >
              <input
                type="color"
                onChange={(e) => applyFormat("foreColor", e.target.value)}
                style={{ position: "absolute", opacity: 0, width: "16px", height: "16px", cursor: "pointer" }}
              />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a7 7 0 0 0-7 7c0 4 7 13 7 13s7-9 7-13a7 7 0 0 0-7-7z"></path>
              </svg>
            </label>
          </div>
        </div>
      )}

      {/* SMART ALIGNMENT SNAP GUIDE LINES (DOTTED ASSISTANT LINES) */}
      <div
        id="visualEditorGuideLineX"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          width: "0px",
          borderLeft: "1.5px dashed #000000",
          pointerEvents: "none",
          zIndex: 1000000,
          display: "none"
        }}
      />
      <div
        id="visualEditorGuideLineY"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: "0px",
          borderTop: "1.5px dashed #000000",
          pointerEvents: "none",
          zIndex: 1000000,
          display: "none"
        }}
      />

      {/* ACTIVE ELEMENT TRANSFORM & RESIZE SELECTION FRAME (TIDY BOX, ZERO OVERLAP ON TEXT) */}
      {activeBoxInfo && activeTextRef.current && (() => {
        const pad = 6;
        const boxLeft = activeBoxInfo.left - pad;
        const boxTop = activeBoxInfo.top - pad;
        const boxWidth = activeBoxInfo.width + pad * 2;
        const boxHeight = activeBoxInfo.height + pad * 2;
        // Detect small icons / logos: only show bounding box outline, no resize handles or drag borders
        const isSmallIcon =
          (activeBoxInfo.width <= 75 && activeBoxInfo.height <= 75) ||
          activeBoxInfo.tag === "img" ||
          activeBoxInfo.tag === "svg" ||
          activeTextRef.current?.tagName === "IMG" ||
          activeTextRef.current?.tagName === "SVG" ||
          Boolean(activeTextRef.current?.closest("a")?.querySelector("img"));
        const isCompact = activeBoxInfo.width < 120 || activeBoxInfo.height < 55;

        return (
          <div
            id="activeElementBoxOverlay"
            title={activeBoxInfo.tag || "Block"}
            style={{
              position: "fixed",
              left: `${boxLeft}px`,
              top: `${boxTop}px`,
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              border: "1.5px solid #000000",
              borderRadius: "3px",
              pointerEvents: "none",
              zIndex: 100000,
              boxSizing: "border-box"
            }}
          >
            {/* DRAGGABLE BOX INTERIOR (ALLOWS MOVING THE WHOLE BOX EASILY) */}
            <div
              onMouseDown={(e) => {
                if (isTextEditing) return;
                handleStartDragElement(e);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                enterTextEditing(activeTextRef.current, e.clientX, e.clientY);
              }}
              title={isTextEditing ? "" : "Click or double-click to edit text • Drag to move box"}
              style={{
                position: "absolute",
                inset: "2px",
                cursor: isTextEditing ? "text" : "move",
                pointerEvents: isTextEditing ? "none" : "auto",
                background: "transparent",
                zIndex: 1
              }}
            />

            {/* DRAGGABLE BORDER EDGES - DISABLED FOR SMALL ICONS */}
            {!isSmallIcon && (
              <>
                <div
                  onMouseDown={handleStartDragElement}
                  title="Drag box to reposition"
                  style={{
                    position: "absolute",
                    top: "-6px",
                    left: "6px",
                    right: "6px",
                    height: "12px",
                    cursor: "move",
                    pointerEvents: "auto",
                    background: "transparent"
                  }}
                />
                <div
                  onMouseDown={handleStartDragElement}
                  title="Drag box to reposition"
                  style={{
                    position: "absolute",
                    bottom: "-6px",
                    left: "6px",
                    right: "6px",
                    height: "12px",
                    cursor: "move",
                    pointerEvents: "auto",
                    background: "transparent"
                  }}
                />
                <div
                  onMouseDown={handleStartDragElement}
                  title="Drag box to reposition"
                  style={{
                    position: "absolute",
                    left: "-6px",
                    top: "6px",
                    bottom: "6px",
                    width: "12px",
                    cursor: "move",
                    pointerEvents: "auto",
                    background: "transparent"
                  }}
                />
                <div
                  onMouseDown={handleStartDragElement}
                  title="Drag box to reposition"
                  style={{
                    position: "absolute",
                    right: "-6px",
                    top: "6px",
                    bottom: "6px",
                    width: "12px",
                    cursor: "move",
                    pointerEvents: "auto",
                    background: "transparent"
                  }}
                />
              </>
            )}

            {/* CORNER RESIZE NODES:
                For small icons: Two diagonal nodes (top-left & bottom-right) that proportionally scale the whole box.
                For regular elements: All 4 corner nodes. */}
            {isSmallIcon ? (
              <>
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "tl")}
                  title="Drag diagonally to scale whole box"
                  style={{
                    position: "absolute",
                    left: "-4px",
                    top: "-4px",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: 4
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "se")}
                  title="Drag diagonally to scale whole box"
                  style={{
                    position: "absolute",
                    right: "-4px",
                    bottom: "-4px",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: 4
                  }}
                />
              </>
            ) : (
              <>
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "tl")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    left: "-4px",
                    top: "-4px",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: 4
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "tr")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    right: "-4px",
                    top: "-4px",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "nesw-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: 4
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "se")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    right: "-4px",
                    bottom: "-4px",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: 4
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "sw")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    left: "-4px",
                    bottom: "-4px",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "nesw-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: 4
                  }}
                />
              </>
            )}

            {/* Edge handles only for large containers */}
            {!isSmallIcon && !isCompact && (
              <>
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "e")}
                  style={{
                    position: "absolute",
                    right: "-4px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "w")}
                  style={{
                    position: "absolute",
                    left: "-4px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "s")}
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "ns-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }}
                />
                <div
                  onMouseDown={(e) => handleStartResizeElement(e, "n")}
                  style={{
                    position: "absolute",
                    top: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "7px",
                    height: "7px",
                    background: "#ffffff",
                    border: "1.5px solid #000000",
                    borderRadius: "2px",
                    cursor: "ns-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }}
                />
              </>
            )}
          </div>
        );
      })()}

      {/* CANVAS DRAWING LAYER (SHAPE MAKER / CROSSHAIR) */}
      {activeTool && (
        <div
          id="canvasDrawingLayer"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999998,
            cursor: "crosshair",
            background: "rgba(0, 0, 0, 0.01)"
          }}
        >
          {isDrawing && (
            <div
              style={{
                position: "fixed",
                left: `${Math.min(drawStart.pageX, drawCurrent.pageX) - (typeof window !== "undefined" ? window.scrollX : 0)}px`,
                top: `${Math.min(drawStart.pageY, drawCurrent.pageY) - (typeof window !== "undefined" ? window.scrollY : 0)}px`,
                width: `${Math.abs(drawCurrent.pageX - drawStart.pageX)}px`,
                height: `${Math.abs(drawCurrent.pageY - drawStart.pageY)}px`,
                border: "2px dashed #2563eb",
                background: "rgba(37, 99, 235, 0.12)",
                borderRadius: "4px",
                pointerEvents: "none",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "-24px",
                  right: 0,
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
              >
                {Math.round(Math.abs(drawCurrent.pageX - drawStart.pageX))} × {Math.round(Math.abs(drawCurrent.pageY - drawStart.pageY))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MULTI-SELECT VISUAL HIGHLIGHTS & BATCH DELETE CONTROL */}
      {multiSelectedElements && multiSelectedElements.length > 0 && (
        <>
          {multiSelectedElements.map((item, idx) => {
            let rect = null;
            if (item.type === "dom" && item.el) {
              const r = item.el.getBoundingClientRect();
              rect = {
                left: r.left + (typeof window !== "undefined" ? window.scrollX : 0),
                top: r.top + (typeof window !== "undefined" ? window.scrollY : 0),
                width: r.width,
                height: r.height
              };
            } else if (item.type === "shape" && item.shape) {
              rect = {
                left: item.shape.x,
                top: item.shape.y,
                width: item.shape.width,
                height: item.shape.height
              };
            }
            if (!rect || rect.width <= 0 || rect.height <= 0) return null;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `${rect.left}px`,
                  top: `${rect.top}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  border: "2px solid #2563eb",
                  background: "rgba(37, 99, 235, 0.12)",
                  borderRadius: "4px",
                  pointerEvents: "none",
                  zIndex: 999990,
                  boxSizing: "border-box"
                }}
              />
            );
          })}

          <div
            style={{
              position: "fixed",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "12px",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.45)",
              zIndex: 999999,
              color: "#fafafa"
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "600" }}>
              {multiSelectedElements.length} Items Selected
            </span>
            <button
              type="button"
              onClick={handleDeleteMultiSelected}
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "7px",
                padding: "6px 14px",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)"
              }}
            >
              <span>🗑 Delete All Selected (Del)</span>
            </button>
            <button
              type="button"
              onClick={() => setMultiSelectedElements([])}
              style={{
                background: "transparent",
                border: "1px solid #52525b",
                color: "#a1a1aa",
                borderRadius: "7px",
                padding: "6px 12px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Deselect
            </button>
          </div>
        </>
      )}

      {/* DRAWN SHAPES WITH 4 SMALL CORNER NODES */}
      {drawnShapes.map((shape) => {
        const isSelected = selectedShapeId === shape.id;
        return (
          <div
            key={shape.id}
            id={shape.id}
            className="visual-editor-shape"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedShapeId(shape.id);
              activeTextRef.current = null;
              setActiveBoxInfo(null);
              setTextPillBar((prev) => ({ ...prev, visible: false }));
              setMultiSelectedElements([]);
            }}
            onMouseDown={(e) => handleShapeDragStart(e, shape)}
            style={{
              position: "absolute",
              left: `${shape.x}px`,
              top: `${shape.y}px`,
              width: `${shape.width}px`,
              height: shape.type === "text" ? "auto" : `${shape.height}px`,
              minHeight: shape.type === "text" ? `${Math.max(48, shape.height || 48)}px` : undefined,
              boxSizing: "border-box",
              border: isSelected ? "1.5px solid #2563eb" : (shape.styleMode === "card" ? "1px solid #e2e8f0" : "none"),
              borderRadius: "6px",
              zIndex: isSelected ? 99995 : 99990,
              background: shape.styleMode === "card" ? (shape.background || "#ffffff") : "transparent",
              boxShadow: isSelected ? "0 10px 30px rgba(37, 99, 235, 0.22)" : (shape.styleMode === "card" ? "0 4px 14px rgba(0,0,0,0.06)" : "none"),
              cursor: isSelected ? "move" : "pointer",
              overflow: "visible"
            }}
          >
            {/* Top Action Pill for Selected Shape */}
            {isSelected && (
              <div
                style={{
                  position: "absolute",
                  top: "-42px",
                  left: "0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
                  zIndex: 30,
                  fontSize: "11.5px",
                  color: "#0f172a",
                  whiteSpace: "nowrap"
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span style={{ color: "#64748b", textTransform: "capitalize", fontWeight: "600", fontSize: "11px", padding: "0 4px" }}>
                  {shape.type} Block
                </span>

                {/* Duplicate Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dupShape = {
                      ...shape,
                      id: "shape_" + Date.now(),
                      x: shape.x + 28,
                      y: shape.y + 28
                    };
                    const prevShapes = drawnShapesRef.current;
                    const nextShapes = [...prevShapes, dupShape];
                    setDrawnShapes(nextShapes);
                    setSelectedShapeId(dupShape.id);
                    pushHistory({
                      desc: `Duplicate ${shape.type} block`,
                      undo: () => setDrawnShapes(prevShapes),
                      redo: () => setDrawnShapes(nextShapes)
                    });
                    showToast(`✓ Duplicated ${shape.type} block! Drag anywhere to place.`);
                  }}
                  title="Duplicate block"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    borderRadius: "6px",
                    padding: "4px 9px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                  </svg>
                  <span>Duplicate</span>
                </button>

                {/* Style Mode Toggle: Transparent vs Card Frame */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMode = shape.styleMode === "card" ? "transparent" : "card";
                    setDrawnShapes((prev) => prev.map((s) => (s.id === shape.id ? { ...s, styleMode: newMode } : s)));
                  }}
                  title={shape.styleMode === "card" ? "Switch to Transparent (blends with page background)" : "Switch to Card Frame"}
                  style={{
                    background: shape.styleMode === "card" ? "#eff6ff" : "#ffffff",
                    border: shape.styleMode === "card" ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                    color: shape.styleMode === "card" ? "#1d4ed8" : "#334155",
                    borderRadius: "6px",
                    padding: "4px 9px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => { if (shape.styleMode !== "card") e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (shape.styleMode !== "card") e.currentTarget.style.background = "#ffffff"; }}
                >
                  {shape.styleMode === "card" ? "Frame: Card" : "Frame: Transparent"}
                </button>

                {shape.type === "image" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMediaPicker({
                        name: "Drawn Image Shape",
                        el: {
                          tagName: "IMG",
                          set src(val) {
                            setDrawnShapes((prev) => prev.map((s) => (s.id === shape.id ? { ...s, mediaUrl: val } : s)));
                          }
                        },
                        type: "image"
                      });
                    }}
                    style={{
                      background: "#2563eb",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(37,99,235,0.25)"
                    }}
                  >
                    Change Image
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawnShapes((prev) => prev.filter((s) => s.id !== shape.id));
                    setSelectedShapeId(null);
                  }}
                  title="Delete this shape"
                  style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", padding: "4px 6px", display: "inline-flex", alignItems: "center", borderRadius: "4px" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            )}

            {/* Shape Content */}
            {shape.type === "text" ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  const val = e.currentTarget.innerText;
                  const newH = e.currentTarget.offsetHeight || e.currentTarget.scrollHeight;
                  if (newH && newH > (shape.height || 48)) {
                    setDrawnShapes((prev) =>
                      prev.map((s) => (s.id === shape.id ? { ...s, text: val, height: newH } : s))
                    );
                  }
                }}
                onBlur={(e) => {
                  const val = e.currentTarget.innerText;
                  const newH = e.currentTarget.offsetHeight || e.currentTarget.scrollHeight;
                  setDrawnShapes((prev) =>
                    prev.map((s) => (s.id === shape.id ? { ...s, text: val, height: Math.max(s.height || 48, newH || 48) } : s))
                  );
                }}
                style={{
                  width: "100%",
                  height: "auto",
                  minHeight: shape.height ? `${Math.max(48, shape.height)}px` : "48px",
                  padding: "10px 14px",
                  outline: "none",
                  fontSize: "16px",
                  lineHeight: 1.5,
                  color: "#0f172a",
                  overflow: "visible",
                  overflowY: "visible",
                  wordBreak: "break-word",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  boxSizing: "border-box",
                  cursor: "text"
                }}
              >
                {shape.text || "Type your text here..."}
              </div>
            ) : shape.type === "image" ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "6px",
                  background: shape.mediaUrl ? "transparent" : "#f8fafc",
                  border: shape.mediaUrl ? "none" : "1.5px dashed #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={(e) => {
                  if (!shape.mediaUrl) {
                    e.stopPropagation();
                    handleOpenMediaPicker({
                      name: "Drawn Image Shape",
                      el: {
                        tagName: "IMG",
                        set src(val) {
                          setDrawnShapes((prev) => prev.map((s) => (s.id === shape.id ? { ...s, mediaUrl: val } : s)));
                        }
                      },
                      type: "image"
                    });
                  }
                }}
                onDoubleClick={() => {
                  handleOpenMediaPicker({
                    name: "Drawn Image Shape",
                    el: {
                      tagName: "IMG",
                      set src(val) {
                        setDrawnShapes((prev) => prev.map((s) => (s.id === shape.id ? { ...s, mediaUrl: val } : s)));
                      }
                    },
                    type: "image"
                  });
                }}
              >
                {shape.mediaUrl ? (
                  <img
                    src={shape.mediaUrl}
                    alt="Shape Image"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "16px", textAlign: "center", cursor: "pointer", userSelect: "none" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b", display: "block" }}>
                        Click to Upload Image
                      </span>
                      <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                        Choose from library or upload new
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius: "5px" }}>
                <video
                  src={shape.mediaUrl || "/videos/emaar.mp4"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {/* 4 VERY SMALL CORNER NODES TO RESIZE THE WHOLE SHAPE */}
            {isSelected && (
              <>
                {/* Top-Left */}
                <div
                  onMouseDown={(e) => handleResizeNodeStart(e, shape, "tl")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    top: "-4px",
                    left: "-4px",
                    width: "8px",
                    height: "8px",
                    background: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                    zIndex: 25,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.35)"
                  }}
                />
                {/* Top-Right */}
                <div
                  onMouseDown={(e) => handleResizeNodeStart(e, shape, "tr")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "8px",
                    height: "8px",
                    background: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "2px",
                    cursor: "nesw-resize",
                    zIndex: 25,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.35)"
                  }}
                />
                {/* Bottom-Left */}
                <div
                  onMouseDown={(e) => handleResizeNodeStart(e, shape, "bl")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: "-4px",
                    width: "8px",
                    height: "8px",
                    background: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "2px",
                    cursor: "nesw-resize",
                    zIndex: 25,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.35)"
                  }}
                />
                {/* Bottom-Right */}
                <div
                  onMouseDown={(e) => handleResizeNodeStart(e, shape, "br")}
                  title="Resize"
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    width: "8px",
                    height: "8px",
                    background: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                    zIndex: 25,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.35)"
                  }}
                />

                {/* Right Edge Width Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeNodeStart(e, shape, "e")}
                  title="Drag to adjust width"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-4px",
                    transform: "translateY(-50%)",
                    width: "7px",
                    height: "12px",
                    background: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                    zIndex: 25,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.35)"
                  }}
                />

                {/* Left Edge Width Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeNodeStart(e, shape, "w")}
                  title="Drag to adjust width"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "-4px",
                    transform: "translateY(-50%)",
                    width: "7px",
                    height: "12px",
                    background: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                    zIndex: 25,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.35)"
                  }}
                />
              </>
            )}
          </div>
        );
      })}

      {/* SECTION ADD DIVIDER (ON HOVER BETWEEN SECTIONS) */}
      {hoveredDivider && !activeTool && (
        <div
          id="sectionAddDivider"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: `${hoveredDivider.y}px`,
            transform: "translateY(-50%)",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999980,
            pointerEvents: "auto",
            transition: "opacity 0.2s ease"
          }}
        >
          {/* Centered Add Section Button */}
          <button
            type="button"
            onClick={handleOpenSectionModal}
            style={{
              position: "relative",
              zIndex: 2,
              pointerEvents: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#2563eb",
              color: "#ffffff",
              border: "2px solid #ffffff",
              borderRadius: "9999px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
              transition: "transform 0.15s ease, background 0.15s ease",
              transform: "scale(1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.background = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "#2563eb";
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span>
            <span>Add Section</span>
          </button>
        </div>
      )}

      {/* 3. MODAL: MEDIA LIBRARY PICKER */}
      {mediaPickerOpen && (
        <div
          style={{
            position: "fixed",
            top: "48px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(8px)",
            zIndex: 2000010,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMediaPickerOpen(false);
          }}
        >
          <style>{`
            .library-thin-scroll::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
            .library-thin-scroll::-webkit-scrollbar-track {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
            }
            .library-thin-scroll::-webkit-scrollbar-thumb {
              background: #cbd5e1 !important;
              border-radius: 999px !important;
              border: none !important;
            }
            .library-thin-scroll::-webkit-scrollbar-thumb:hover {
              background: #94a3b8 !important;
            }
            .library-thin-scroll {
              scrollbar-width: thin;
              scrollbar-color: #cbd5e1 transparent;
            }
          `}</style>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "calc(100vh - 76px)",
              color: "#0f172a",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 50px -10px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ padding: "14px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.01em", margin: 0 }}>Upload Library</h3>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>Select or upload media for this component</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#2563eb", color: "#ffffff", padding: "6px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Upload Media</span>
                  <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
                <button
                  onClick={() => setMediaPickerOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="library-thin-scroll" style={{ padding: "16px 22px", maxHeight: "calc(100vh - 220px)", overflowY: "auto", background: "#ffffff", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "14px" }}>
                {mediaFiles.map((f, i) => {
                  const isSelected = selectedMedia?.url === f.url;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedMedia(f)}
                      style={{
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        background: "#f8fafc",
                        borderRadius: "9px",
                        overflow: "hidden",
                        cursor: "pointer",
                        aspectRatio: "16 / 10",
                        position: "relative",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 0 0 2px rgba(37, 99, 235, 0.25), 0 4px 12px rgba(0,0,0,0.08)" : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#94a3b8";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {/\.(mp4|webm|ogg)$/i.test(f.url) ? (
                        <video src={f.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                      ) : (
                        <img src={f.url} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                      <span style={{ position: "absolute", bottom: "5px", left: "5px", right: "5px", background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", fontSize: "9px", color: "#ffffff", padding: "2px 6px", borderRadius: "4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {f.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "14px 22px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#f8fafc" }}>
              <button
                onClick={() => setMediaPickerOpen(false)}
                style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "7px 16px", borderRadius: "7px", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#334155"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyMedia}
                disabled={!selectedMedia}
                style={{
                  background: selectedMedia ? "#2563eb" : "#94a3b8",
                  border: "none",
                  color: "#ffffff",
                  padding: "7px 16px",
                  borderRadius: "7px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: selectedMedia ? "pointer" : "not-allowed",
                  opacity: selectedMedia ? 1 : 0.6,
                  transition: "all 0.15s ease",
                  boxShadow: selectedMedia ? "0 2px 8px rgba(37,99,235,0.25)" : "none"
                }}
              >
                Apply Selected Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: CROP & FRAMING */}
      {cropModalOpen && (() => {
        const cropTargetImgSrc = (() => {
          if (!selectedLayer?.el) return "";
          const el = selectedLayer.el;
          if (el.tagName === "IMG") return el.currentSrc || el.src || "";
          const childImg = el.querySelector?.("img");
          if (childImg) return childImg.currentSrc || childImg.src || "";
          try {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== "none") {
              const match = bg.match(/url\(["']?([^"']*)["']?\)/);
              if (match && match[1]) return match[1];
            }
          } catch (e) {}
          return "";
        })();

        const handleCanvasPointer = (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const px = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
            const py = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
            setCropPosX(px);
            setCropPosY(py);
          }
        };

        return (
          <div style={{ position: "fixed", top: "48px", left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", zIndex: 2000010, display: "flex", alignItems: "center", justifyContent: "center", padding: "14px" }}>
            <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px", width: "100%", maxWidth: "660px", maxHeight: "88vh", display: "flex", flexDirection: "column", color: "#0f172a", overflow: "hidden", boxShadow: "0 20px 50px -12px rgba(15,23,42,0.35), 0 0 0 1px rgba(0,0,0,0.06)" }}>
              {/* Modal Header */}
              <div style={{ padding: "10px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.01em", margin: 0 }}>Photo Editor Framing</h3>
                  </div>
                </div>
                <button
                  onClick={() => setCropModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                >
                  &times;
                </button>
              </div>

              {/* Modal Body: 2-Column Studio Layout */}
              <div style={{ padding: "14px 18px", background: "#ffffff", overflowY: "auto", display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", alignItems: "start" }}>
                {/* LEFT COLUMN: Live Studio Viewport & Presets */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#475569" }}>
                      Framing Viewport
                    </span>
                    {/* Cover / Contain Toggle */}
                    <div style={{ display: "flex", gap: "2px", background: "#f1f5f9", padding: "2px", borderRadius: "5px", border: "1px solid #e2e8f0" }}>
                      <button
                        type="button"
                        onClick={() => setCropFit("cover")}
                        style={{
                          border: "none",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontSize: "10.5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          background: cropFit === "cover" ? "#0f172a" : "transparent",
                          color: cropFit === "cover" ? "#ffffff" : "#64748b",
                          transition: "all 0.15s ease"
                        }}
                      >
                        Cover
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropFit("contain")}
                        style={{
                          border: "none",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontSize: "10.5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          background: cropFit === "contain" ? "#0f172a" : "transparent",
                          color: cropFit === "contain" ? "#ffffff" : "#64748b",
                          transition: "all 0.15s ease"
                        }}
                      >
                        Contain
                      </button>
                    </div>
                  </div>

                  <div
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture?.(e.pointerId);
                      handleCanvasPointer(e);
                    }}
                    onPointerMove={(e) => {
                      if (e.buttons === 1) handleCanvasPointer(e);
                    }}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "165px",
                      background: "#09090b",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #1e293b",
                      cursor: "crosshair",
                      userSelect: "none",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                    }}
                  >
                    {cropTargetImgSrc ? (
                      <img
                        src={cropTargetImgSrc}
                        alt="Framing Canvas"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: cropFit,
                          objectPosition: `${cropPosX}% ${cropPosY}%`,
                          transform: `scale(${cropScale / 100})`,
                          transition: "transform 0.08s ease-out, object-position 0.08s ease-out",
                          pointerEvents: "none"
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "11px" }}>
                        Preview Target Active
                      </div>
                    )}

                    {/* Rule of Thirds Grid Overlay */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                      {/* Vertical Grid Lines */}
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: "33.33%", width: "1px", background: "rgba(255,255,255,0.22)", borderRight: "1px dashed rgba(0,0,0,0.3)" }} />
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: "66.66%", width: "1px", background: "rgba(255,255,255,0.22)", borderRight: "1px dashed rgba(0,0,0,0.3)" }} />
                      {/* Horizontal Grid Lines */}
                      <div style={{ position: "absolute", left: 0, right: 0, top: "33.33%", height: "1px", background: "rgba(255,255,255,0.22)", borderBottom: "1px dashed rgba(0,0,0,0.3)" }} />
                      <div style={{ position: "absolute", left: 0, right: 0, top: "66.66%", height: "1px", background: "rgba(255,255,255,0.22)", borderBottom: "1px dashed rgba(0,0,0,0.3)" }} />

                      {/* Corner Framing L-Brackets */}
                      <div style={{ position: "absolute", top: "6px", left: "6px", width: "10px", height: "10px", borderTop: "2px solid rgba(255,255,255,0.85)", borderLeft: "2px solid rgba(255,255,255,0.85)" }} />
                      <div style={{ position: "absolute", top: "6px", right: "6px", width: "10px", height: "10px", borderTop: "2px solid rgba(255,255,255,0.85)", borderRight: "2px solid rgba(255,255,255,0.85)" }} />
                      <div style={{ position: "absolute", bottom: "6px", left: "6px", width: "10px", height: "10px", borderBottom: "2px solid rgba(255,255,255,0.85)", borderLeft: "2px solid rgba(255,255,255,0.85)" }} />
                      <div style={{ position: "absolute", bottom: "6px", right: "6px", width: "10px", height: "10px", borderBottom: "2px solid rgba(255,255,255,0.85)", borderRight: "2px solid rgba(255,255,255,0.85)" }} />

                      {/* Focal Point Reticle Crosshairs */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${cropPosX}%`,
                          top: `${cropPosY}%`,
                          width: "22px",
                          height: "22px",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "50%",
                          border: "2px solid #ffffff",
                          boxShadow: "0 0 0 1px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "left 0.08s ease-out, top 0.08s ease-out"
                        }}
                      >
                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#ffffff" }} />
                        <div style={{ position: "absolute", width: "10px", height: "1px", background: "rgba(255,255,255,0.9)" }} />
                        <div style={{ position: "absolute", height: "10px", width: "1px", background: "rgba(255,255,255,0.9)" }} />
                      </div>

                      {/* Canvas Overlay Tag */}
                      <div style={{ position: "absolute", bottom: "6px", left: "8px", background: "rgba(15,23,42,0.75)", backdropFilter: "blur(3px)", padding: "1px 6px", borderRadius: "3px", color: "#e2e8f0", fontSize: "9px", fontWeight: "600" }}>
                        Click/drag to focus
                      </div>
                    </div>
                  </div>

                  {/* Preset Shortcuts (Compact) */}
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => { setCropPosX(50); setCropPosY(50); }}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCropPosX(50); setCropPosY(0); }}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Top
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCropPosX(50); setCropPosY(100); }}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Bottom
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCropScale(100); setCropPosX(50); setCropPosY(50); setCropFit("cover"); }}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      ↺ Reset
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: 3 Calibrated Photo Editor Rollers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* ROLLER 1: Zoom Scale */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155" }}>
                          Zoom Roller
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => setCropScale((v) => Math.max(100, v - 5))}
                          style={{ width: "19px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "3px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#334155" }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "10.5px", fontWeight: "700", fontFamily: "monospace", color: "#0f172a", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "1px 6px", borderRadius: "4px", minWidth: "48px", textAlign: "center" }}>
                          {(cropScale / 100).toFixed(2)}x
                        </span>
                        <button
                          type="button"
                          onClick={() => setCropScale((v) => Math.min(250, v + 5))}
                          style={{ width: "19px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "3px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#334155" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="250"
                      step="1"
                      value={cropScale}
                      onChange={(e) => setCropScale(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#0f172a", cursor: "ew-resize", display: "block", margin: "2px 0 0 0" }}
                    />
                    {/* Calibrated Ruler Ticks */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px", marginTop: "2px" }}>
                      {[...Array(21)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: "1px",
                            height: i % 5 === 0 ? "5px" : "3px",
                            background: i % 5 === 0 ? "#64748b" : "#cbd5e1"
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b", marginTop: "1px", fontWeight: "500" }}>
                      <span onClick={() => setCropScale(100)} style={{ cursor: "pointer" }}>1.0x (Fit)</span>
                      <span onClick={() => setCropScale(175)} style={{ cursor: "pointer" }}>1.75x</span>
                      <span onClick={() => setCropScale(250)} style={{ cursor: "pointer" }}>2.5x (Max)</span>
                    </div>
                  </div>

                  {/* ROLLER 2: Horizontal Focal Position (X) */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155" }}>
                          Focal Roller X
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => setCropPosX((v) => Math.max(0, v - 5))}
                          style={{ width: "19px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "3px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#334155" }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "10.5px", fontWeight: "700", fontFamily: "monospace", color: "#0f172a", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "1px 6px", borderRadius: "4px", minWidth: "48px", textAlign: "center" }}>
                          X: {cropPosX}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setCropPosX((v) => Math.min(100, v + 5))}
                          style={{ width: "19px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "3px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#334155" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cropPosX}
                      onChange={(e) => setCropPosX(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#0f172a", cursor: "ew-resize", display: "block", margin: "2px 0 0 0" }}
                    />
                    {/* Calibrated Ruler Ticks */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px", marginTop: "2px" }}>
                      {[...Array(21)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: "1px",
                            height: i === 10 ? "6px" : i % 5 === 0 ? "5px" : "3px",
                            background: i === 10 ? "#0f172a" : i % 5 === 0 ? "#64748b" : "#cbd5e1"
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b", marginTop: "1px", fontWeight: "500" }}>
                      <span onClick={() => setCropPosX(0)} style={{ cursor: "pointer" }}>Left (0%)</span>
                      <span onClick={() => setCropPosX(50)} style={{ cursor: "pointer" }}>Center (50%)</span>
                      <span onClick={() => setCropPosX(100)} style={{ cursor: "pointer" }}>Right (100%)</span>
                    </div>
                  </div>

                  {/* ROLLER 3: Vertical Focal Position (Y) */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155" }}>
                          Focal Roller Y
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => setCropPosY((v) => Math.max(0, v - 5))}
                          style={{ width: "19px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "3px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#334155" }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "10.5px", fontWeight: "700", fontFamily: "monospace", color: "#0f172a", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "1px 6px", borderRadius: "4px", minWidth: "48px", textAlign: "center" }}>
                          Y: {cropPosY}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setCropPosY((v) => Math.min(100, v + 5))}
                          style={{ width: "19px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "3px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#334155" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cropPosY}
                      onChange={(e) => setCropPosY(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#0f172a", cursor: "ew-resize", display: "block", margin: "2px 0 0 0" }}
                    />
                    {/* Calibrated Ruler Ticks */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px", marginTop: "2px" }}>
                      {[...Array(21)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: "1px",
                            height: i === 10 ? "6px" : i % 5 === 0 ? "5px" : "3px",
                            background: i === 10 ? "#0f172a" : i % 5 === 0 ? "#64748b" : "#cbd5e1"
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b", marginTop: "1px", fontWeight: "500" }}>
                      <span onClick={() => setCropPosY(0)} style={{ cursor: "pointer" }}>Top (0%)</span>
                      <span onClick={() => setCropPosY(50)} style={{ cursor: "pointer" }}>Middle (50%)</span>
                      <span onClick={() => setCropPosY(100)} style={{ cursor: "pointer" }}>Bottom (100%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Compact) */}
              <div style={{ padding: "10px 18px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "8px", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  style={{ background: "#0f172a", border: "none", color: "#ffffff", padding: "6px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(15,23,42,0.2)", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#0f172a"; }}
                >
                  Apply Framing
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. MODAL: RAW CODE / SVG INSPECTOR */}
      {codeModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)", zIndex: 2000000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", width: "100%", maxWidth: "680px", color: "#0f172a", overflow: "hidden", boxShadow: "0 20px 50px -10px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.01em" }}>Raw HTML / SVG Code Inspector</h3>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Edit raw markup directly for advanced customization</p>
              </div>
              <button
                onClick={() => setCodeModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "4px", borderRadius: "6px" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "20px 22px" }}>
              <textarea
                value={rawCode}
                onChange={(e) => setRawCode(e.target.value)}
                style={{ width: "100%", height: "260px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a", fontFamily: "monospace", fontSize: "12px", padding: "12px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ padding: "14px 22px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setCodeModalOpen(false)} style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#475569", padding: "7px 16px", borderRadius: "7px", fontSize: "12.5px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleApplyCode} style={{ background: "#2563eb", border: "none", color: "#ffffff", padding: "7px 18px", borderRadius: "7px", fontSize: "12.5px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>Apply Code</button>
            </div>
          </div>
        </div>
      )}

      {/* 5B. PUBLISH PROGRESS MODAL */}
      {publishModal.open && (
        <div
          id="publishProgressModalBackdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000000
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              width: "480px",
              maxWidth: "92vw",
              overflow: "hidden",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#0f172a"
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#ffffff"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background:
                      publishModal.status === "success"
                        ? "#ecfdf5"
                        : publishModal.status === "error"
                        ? "#fef2f2"
                        : "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      publishModal.status === "success"
                        ? "#10b981"
                        : publishModal.status === "error"
                        ? "#ef4444"
                        : "#2563eb"
                  }}
                >
                  {publishModal.status === "success" ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : publishModal.status === "error" ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                    {publishModal.status === "success"
                      ? "Release Published Live!"
                      : publishModal.status === "error"
                      ? "Publish Failed"
                      : "Publishing Live Release"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Target: Live Website (http://localhost:3000)
                  </p>
                </div>
              </div>

              {(publishModal.status === "success" || publishModal.status === "error") && (
                <button
                  type="button"
                  onClick={() => setPublishModal((prev) => ({ ...prev, open: false }))}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "22px",
                    lineHeight: "1",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  &times;
                </button>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: "24px", background: "#ffffff" }}>
              {/* Animated Progress Bar */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "8px"
                  }}
                >
                  <span>
                    {publishModal.status === "success"
                      ? "100% Completed"
                      : publishModal.status === "error"
                      ? "Interrupted"
                      : `Step ${publishModal.step} of 4`}
                  </span>
                  <span style={{ color: publishModal.status === "error" ? "#ef4444" : "#0f172a", fontWeight: "600" }}>
                    {publishModal.step === 1
                      ? "25%"
                      : publishModal.step === 2
                      ? "55%"
                      : publishModal.step === 3
                      ? "85%"
                      : "100%"}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    background: "#e2e8f0",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${
                        publishModal.step === 1
                          ? 25
                          : publishModal.step === 2
                          ? 55
                          : publishModal.step === 3
                          ? 85
                          : 100
                      }%`,
                      background:
                        publishModal.status === "error"
                          ? "#ef4444"
                          : "#0f172a",
                      borderRadius: "3px",
                      transition: "width 0.4s ease"
                    }}
                  />
                </div>
              </div>

              {/* Step Checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {[
                  { id: 1, label: "Scan & stage all page modifications" },
                  { id: 2, label: "Save structured updates to CMS database" },
                  { id: 3, label: "Generate release snapshot in version history" },
                  { id: 4, label: "Broadcast live release & refresh cache on :3000" }
                ].map((item) => {
                  const isDone = publishModal.step > item.id || publishModal.status === "success";
                  const isCurrent =
                    publishModal.step === item.id &&
                    publishModal.status !== "success" &&
                    publishModal.status !== "error";
                  const isErr = publishModal.step === item.id && publishModal.status === "error";

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: isCurrent ? "#f8fafc" : "transparent",
                        border: isCurrent ? "1px solid #e2e8f0" : "1px solid transparent"
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: isDone
                            ? "#10b981"
                            : isErr
                            ? "#ef4444"
                            : isCurrent
                            ? "#2563eb"
                            : "#f1f5f9",
                          color: isDone || isErr || isCurrent ? "#ffffff" : "#94a3b8"
                        }}
                      >
                        {isDone ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : isErr ? (
                          "!"
                        ) : isCurrent ? (
                          <svg
                            style={{ animation: "spin 1s linear infinite" }}
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10"></path>
                          </svg>
                        ) : (
                          item.id
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: isDone ? "#0f172a" : isCurrent ? "#1e293b" : "#94a3b8",
                          fontWeight: isCurrent ? "600" : "500"
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Message / Info Box */}
              {publishModal.status === "success" && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>
                      {publishModal.version}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#15803d", marginTop: "2px" }}>
                      Published live at {publishModal.timestamp}
                    </div>
                  </div>
                  <span
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: "700",
                      letterSpacing: "0.5px"
                    }}
                  >
                    LIVE
                  </span>
                </div>
              )}

              {publishModal.status === "error" && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    fontSize: "12.5px"
                  }}
                >
                  <strong>Error: </strong> {publishModal.errorMsg}
                </div>
              )}

              {publishModal.status !== "success" && publishModal.status !== "error" && (
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                  {publishModal.message}
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: "14px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              {publishModal.status === "success" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPublishModal((prev) => ({ ...prev, open: false }))}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      color: "#475569",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.open("http://localhost:3000/", "_blank");
                    }}
                    style={{
                      background: "#10b981",
                      border: "none",
                      color: "#ffffff",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    <span>View Live Website (:3000)</span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </button>
                </>
              ) : publishModal.status === "error" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPublishModal((prev) => ({ ...prev, open: false }))}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      color: "#475569",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishLive}
                    style={{
                      background: "#2563eb",
                      border: "none",
                      color: "#ffffff",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Retry Publish
                  </button>
                </>
              ) : (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <svg
                    style={{ animation: "spin 1s linear infinite" }}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                  </svg>
                  <span>Publishing release in progress...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD SECTION & GRID LAYOUT MODAL (MS WORD TABLE GRID HOVER & MODERN PRESETS) */}
      {sectionModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSectionModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "740px",
              maxWidth: "96vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>
                  Add Section & Grid Layout
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Insert an interactive responsive table grid or pick a ready-made modern section preset
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSectionModalOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* SECTION A: MS WORD-STYLE TABLE GRID SELECTOR */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px"
                }}
              >
                {/* Header of Section A */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "700", color: "#0f172a" }}>
                        Responsive Grid Builder (Text, Video & Image Cards)
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                        Choose your card content type (Text Box, Video Player, Image, or Stats) then pick grid size
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      background: hoverGridCols > 0 && hoverGridRows > 0 ? "#2563eb" : "#e2e8f0",
                      color: hoverGridCols > 0 && hoverGridRows > 0 ? "#ffffff" : "#64748b",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {hoverGridCols > 0 && hoverGridRows > 0
                      ? `${hoverGridCols} Cols × ${hoverGridRows} Rows (${hoverGridCols * hoverGridRows} Cards)`
                      : "Hover to pick size"}
                  </span>
                </div>

                {/* 1. CONTENT TYPE SELECTOR (TEXT BOX, VIDEO, IMAGE, STATS) */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.04em" }}>
                    1. Select Grid Content Type:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {[
                      { id: "image", icon: "🖼️", label: "Image Cards", desc: "Photos & Showcase" },
                      { id: "video", icon: "🎬", label: "Video Players", desc: "Looping Reels & Motion" },
                      { id: "text", icon: "📝", label: "Text Boxes", desc: "Headings & Paragraphs" },
                      { id: "stats", icon: "📊", label: "Stats & Numbers", desc: "Milestones & Key Data" }
                    ].map((ct) => {
                      const isSel = gridContentType === ct.id;
                      return (
                        <button
                          key={ct.id}
                          type="button"
                          onClick={() => setGridContentType(ct.id)}
                          style={{
                            padding: "9px 10px",
                            borderRadius: "8px",
                            border: isSel ? "2px solid #2563eb" : "1px solid #cbd5e1",
                            background: isSel ? "#eff6ff" : "#ffffff",
                            color: isSel ? "#1d4ed8" : "#334155",
                            cursor: "pointer",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                            boxShadow: isSel ? "0 2px 8px rgba(37,99,235,0.2)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>{ct.icon}</span>
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>{ct.label}</span>
                          <span style={{ fontSize: "9.5px", color: isSel ? "#2563eb" : "#64748b" }}>{ct.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Top Row: Grid Selector & Live Card Preview Side-by-Side */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px", alignItems: "center" }}>
                  {/* 5 columns x 4 rows interactive grid */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.04em" }}>
                      2. Pick Grid Size (Columns × Rows):
                    </div>
                    <div
                      onMouseLeave={() => {
                        setHoverGridCols(0);
                        setHoverGridRows(0);
                      }}
                      style={{
                        display: "inline-grid",
                        gridTemplateColumns: "repeat(5, 36px)",
                        gridTemplateRows: "repeat(4, 36px)",
                        gap: "6px",
                        padding: "10px",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px"
                      }}
                    >
                      {Array.from({ length: 4 }).map((_, rIdx) => {
                        const rowNum = rIdx + 1;
                        return Array.from({ length: 5 }).map((_, cIdx) => {
                          const colNum = cIdx + 1;
                          const isHovered = colNum <= hoverGridCols && rowNum <= hoverGridRows;
                          return (
                            <div
                              key={`${rowNum}-${colNum}`}
                              onMouseEnter={() => {
                                setHoverGridCols(colNum);
                                setHoverGridRows(rowNum);
                              }}
                              onClick={() => handleInsertGrid(colNum, rowNum)}
                              title={`Insert ${colNum} Columns × ${rowNum} Rows Grid`}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "6px",
                                border: isHovered ? "1.5px solid #1d4ed8" : "1.5px solid #cbd5e1",
                                background: isHovered ? "#2563eb" : "#f8fafc",
                                cursor: "pointer",
                                transition: "background 0.1s ease, border-color 0.1s ease"
                              }}
                            />
                          );
                        });
                      })}
                    </div>
                  </div>

                  {/* Live Visual Card Preview */}
                  <div style={{ background: gridFrameStyle === "dark" ? "#09090b" : "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: gridFrameStyle === "dark" ? "#a1a1aa" : "#64748b", letterSpacing: "0.04em" }}>
                        Live {gridContentType === "video" ? "Video" : gridContentType === "text" ? "Text Box" : gridContentType === "stats" ? "Stats" : "Image"} Preview
                      </span>
                      <span style={{ fontSize: "10.5px", fontWeight: "600", color: "#2563eb", background: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>
                        {gridContentType.toUpperCase()} • {gridFrameStyle.toUpperCase()}
                      </span>
                    </div>

                    {/* Preview card rendered dynamically based on selected content type */}
                    <div
                      style={{
                        background: gridFrameStyle === "dark" ? "#18181b" : (gridFrameStyle === "framed" ? "#faf8f5" : (gridFrameStyle === "minimal" ? "transparent" : "#ffffff")),
                        border: gridFrameStyle === "framed" ? "2px solid #c5a880" : (gridFrameStyle === "dark" ? "1px solid #27272a" : (gridFrameStyle === "minimal" ? "none" : "1px solid #e2e8f0")),
                        borderRadius: gridRounding,
                        boxShadow: gridFrameStyle === "elevated" ? "0 10px 25px rgba(0,0,0,0.12)" : (gridFrameStyle === "framed" ? "0 4px 15px rgba(197,168,128,0.15)" : "0 2px 6px rgba(0,0,0,0.04)"),
                        padding: gridFrameStyle === "minimal" && gridContentType !== "text" && gridContentType !== "stats" ? "0" : "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        overflow: "hidden",
                        minHeight: "100px"
                      }}
                    >
                      {gridContentType === "video" ? (
                        <>
                          <div
                            style={{
                              aspectRatio: gridAspect,
                              height: "90px",
                              borderRadius: gridRounding === "0px" ? "0px" : `calc(${gridRounding} - 2px)`,
                              overflow: "hidden",
                              position: "relative",
                              border: gridFrameStyle === "framed" ? "1px solid #e5d5be" : "none",
                              background: "#000000"
                            }}
                          >
                            <video
                              src="/videos/emaar.mp4"
                              autoPlay
                              loop
                              muted
                              playsInline
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                            <div style={{ position: "absolute", bottom: "4px", right: "6px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "8.5px", padding: "1px 5px", borderRadius: "3px", fontWeight: "700" }}>
                              ▶ VIDEO
                            </div>
                          </div>
                          <div style={{ padding: gridFrameStyle === "minimal" ? "4px 2px 0" : "0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: gridFrameStyle === "dark" ? "#fafafa" : "#0f172a" }}>
                              Cinematic Reel Title
                            </div>
                            <div style={{ fontSize: "10px", color: gridFrameStyle === "dark" ? "#a1a1aa" : "#64748b" }}>
                              Interactive architectural motion walkthrough
                            </div>
                          </div>
                        </>
                      ) : gridContentType === "text" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "4px" }}>
                          <span style={{ fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase" }}>SECTION 01</span>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: gridFrameStyle === "dark" ? "#fafafa" : "#0f172a", lineHeight: 1.3 }}>
                            Pure Text Box Headline
                          </div>
                          <div style={{ fontSize: "10.5px", color: gridFrameStyle === "dark" ? "#a1a1aa" : "#64748b", lineHeight: 1.5 }}>
                            Rich responsive narrative paragraph copy with typography layout.
                          </div>
                          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "6px", marginTop: "4px", fontSize: "9.5px", fontWeight: "700", color: "#2563eb" }}>
                            READ MORE →
                          </div>
                        </div>
                      ) : gridContentType === "stats" ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", padding: "10px 4px" }}>
                          <span style={{ fontSize: "28px", fontWeight: "800", color: "#2563eb", lineHeight: 1 }}>45M+</span>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: gridFrameStyle === "dark" ? "#fafafa" : "#0f172a", textTransform: "uppercase" }}>
                            Sq Ft Delivered
                          </div>
                          <div style={{ fontSize: "9.5px", color: gridFrameStyle === "dark" ? "#a1a1aa" : "#64748b" }}>
                            Global real estate benchmark
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              aspectRatio: gridAspect,
                              height: "90px",
                              borderRadius: gridRounding === "0px" ? "0px" : `calc(${gridRounding} - 2px)`,
                              overflow: "hidden",
                              position: "relative",
                              border: gridFrameStyle === "framed" ? "1px solid #e5d5be" : "none",
                              background: "#e2e8f0"
                            }}
                          >
                            <img
                              src="/images/landmarks/Serenity-hills-big.webp"
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition: gridHoverZoom ? "transform 0.3s ease" : "none"
                              }}
                            />
                          </div>
                          <div style={{ padding: gridFrameStyle === "minimal" ? "4px 2px 0" : "0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: gridFrameStyle === "dark" ? "#fafafa" : "#0f172a" }}>
                              Serenity Hills
                            </div>
                            <div style={{ fontSize: "10px", color: gridFrameStyle === "dark" ? "#a1a1aa" : "#64748b" }}>
                              Custom styled architectural destination
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* OPTION 2: FRAMING & BORDER STYLE */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.04em" }}>
                    3. Card Framing & Theme Style:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                    {[
                      { id: "modern", title: "Modern Card", sub: "Clean Light Border", icon: "▫️" },
                      { id: "framed", title: "Luxury Gold", sub: "2px Gold Accent", icon: "👑" },
                      { id: "dark", title: "Dark Studio", sub: "Obsidian Contrast", icon: "◼️" },
                      { id: "minimal", title: "Clean Flush", sub: "Borderless Minimal", icon: "◽" },
                      { id: "elevated", title: "Floating Glow", sub: "Raised Elevation", icon: "🪟" }
                    ].map((opt) => {
                      const isSel = gridFrameStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setGridFrameStyle(opt.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: isSel ? "2px solid #2563eb" : "1px solid #cbd5e1",
                            background: isSel ? "#eff6ff" : "#ffffff",
                            color: isSel ? "#1d4ed8" : "#334155",
                            cursor: "pointer",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                            boxShadow: isSel ? "0 2px 8px rgba(37,99,235,0.2)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>{opt.icon}</span>
                          <span style={{ fontSize: "11.5px", fontWeight: "700" }}>{opt.title}</span>
                          <span style={{ fontSize: "9.5px", color: isSel ? "#2563eb" : "#64748b" }}>{opt.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* OPTION 3: ASPECT RATIO & CORNER CURVATURE */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Aspect Ratio (Relevant for media / card heights) */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.04em" }}>
                      4. Media Aspect Ratio / Card Proportions:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                      {[
                        { id: "16/10", label: "16:10", desc: "Wide" },
                        { id: "4/3", label: "4:3", desc: "Classic" },
                        { id: "1/1", label: "1:1", desc: "Square" },
                        { id: "3/4", label: "3:4", desc: "Portrait" }
                      ].map((asp) => {
                        const isSel = gridAspect === asp.id;
                        return (
                          <button
                            key={asp.id}
                            type="button"
                            onClick={() => setGridAspect(asp.id)}
                            style={{
                              padding: "6px 4px",
                              borderRadius: "6px",
                              border: isSel ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                              background: isSel ? "#eff6ff" : "#ffffff",
                              color: isSel ? "#1d4ed8" : "#475569",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer",
                              textAlign: "center"
                            }}
                          >
                            <div>{asp.label}</div>
                            <div style={{ fontSize: "9px", color: isSel ? "#2563eb" : "#94a3b8" }}>{asp.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Corner Curvature & Hover Zoom */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.04em" }}>
                      5. Corners & Hover Animation:
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {[
                        { id: "0px", label: "Sharp" },
                        { id: "8px", label: "Subtle" },
                        { id: "12px", label: "Rounded" },
                        { id: "20px", label: "Pill" }
                      ].map((rnd) => {
                        const isSel = gridRounding === rnd.id;
                        return (
                          <button
                            key={rnd.id}
                            type="button"
                            onClick={() => setGridRounding(rnd.id)}
                            style={{
                              flex: 1,
                              padding: "6px 2px",
                              borderRadius: "6px",
                              border: isSel ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                              background: isSel ? "#eff6ff" : "#ffffff",
                              color: isSel ? "#1d4ed8" : "#475569",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            {rnd.label}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setGridHoverZoom(!gridHoverZoom)}
                        title="Toggle smooth hover zoom on cards"
                        style={{
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: gridHoverZoom ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                          background: gridHoverZoom ? "#ecfdf5" : "#ffffff",
                          color: gridHoverZoom ? "#047857" : "#64748b",
                          fontSize: "10.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {gridHoverZoom ? "✓ Zoom ON" : "Zoom OFF"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Insert Action */}
                <div style={{ marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Selected: <strong>{hoverGridCols > 0 && hoverGridRows > 0 ? `${hoverGridCols}×${hoverGridRows}` : "3×2"} {gridContentType === "video" ? "Video" : gridContentType === "text" ? "Text Box" : gridContentType === "stats" ? "Stats" : "Image"} Grid</strong> • <strong>{gridFrameStyle.toUpperCase()} Style</strong>
                  </span>
                  <button
                    type="button"
                    id="modalInsertGridActionBtn"
                    onClick={() => handleInsertGrid(hoverGridCols || 3, hoverGridRows || 2)}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "7px",
                      padding: "9px 20px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      boxShadow: "0 3px 10px rgba(37,99,235,0.35)",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; }}
                  >
                    <span>+ Insert {hoverGridCols > 0 && hoverGridRows > 0 ? `${hoverGridCols}×${hoverGridRows}` : "3×2"} {gridContentType === "video" ? "Video" : gridContentType === "text" ? "Text Box" : gridContentType === "stats" ? "Stats" : "Image"} Grid</span>
                  </button>
                </div>
              </div>

              {/* SECTION B: MODERN READY-MADE SECTION PRESETS */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                      Curated Section Templates (Text, Video & Media)
                    </h4>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                      Select a ready-to-use template with pre-styled typography, video players or photo layouts
                    </p>
                  </div>

                  {/* Template Category Filters */}
                  <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "7px", border: "1px solid #e2e8f0" }}>
                    {[
                      { id: "all", label: "All Templates" },
                      { id: "text", label: "📝 Text & Story" },
                      { id: "video", label: "🎬 Video" },
                      { id: "gallery", label: "🖼️ Gallery" },
                      { id: "stats", label: "📊 Stats" }
                    ].map((tab) => {
                      const isActive = presetCategory === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPresetCategory(tab.id)}
                          style={{
                            border: "none",
                            padding: "3px 9px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                            background: isActive ? "#0f172a" : "transparent",
                            color: isActive ? "#ffffff" : "#64748b",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                  {[
                    {
                      id: "video-gallery",
                      category: "video",
                      title: "Cinematic Video Showcase (3-Reels)",
                      desc: "3-column interactive video motion cards with auto-play & custom titles",
                      tag: "Video"
                    },
                    {
                      id: "video-hero",
                      category: "video",
                      title: "Full-Width Cinematic Video Hero",
                      desc: "Immersive background video player with centered headline & action button",
                      tag: "Video"
                    },
                    {
                      id: "text-columns",
                      category: "text",
                      title: "Text Box Pillars (3-Columns)",
                      desc: "Pure editorial typography cards with tags, headings, paragraphs & read more links",
                      tag: "Text"
                    },
                    {
                      id: "story",
                      category: "text",
                      title: "Editorial Story Narrative",
                      desc: "Prominent luxury headline banner with 2-column editorial copy & border accent",
                      tag: "Text"
                    },
                    {
                      id: "stats-banner",
                      category: "stats",
                      title: "By The Numbers (4-Stats)",
                      desc: "High-impact obsidian milestone metrics with large numbers and descriptions",
                      tag: "Stats"
                    },
                    {
                      id: "features",
                      category: "text",
                      title: "Feature List Cards (3-Cards)",
                      desc: "Numbered distinct advantage cards with modern styling and descriptive copy",
                      tag: "Text"
                    },
                    {
                      id: "images-grid",
                      category: "gallery",
                      title: "Images Gallery Grid (3-Col)",
                      desc: "Curated 3-column photo gallery with editable headings & captions",
                      tag: "Gallery"
                    },
                    {
                      id: "split-media",
                      category: "gallery",
                      title: "Split Media & Text (50/50)",
                      desc: "Balanced side-by-side showcase card with image & copy",
                      tag: "Split"
                    },
                    {
                      id: "cta",
                      category: "text",
                      title: "Call to Action Banner",
                      desc: "High-contrast dark banner with contact & enquiry action links",
                      tag: "Banner"
                    },
                    {
                      id: "blank",
                      category: "all",
                      title: "Blank Canvas Section",
                      desc: "Clean minimal section container ready for freehand text & media",
                      tag: "Empty"
                    }
                  ]
                    .filter((p) => presetCategory === "all" || p.category === presetCategory || (presetCategory === "text" && ["text", "features"].includes(p.category)))
                    .map((preset) => {
                      // Render miniaturized visual layout mockup preview for each preset
                      const renderPresetMockup = () => {
                        switch (preset.id) {
                          case "video-gallery":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#090d16", border: "1px solid #1e293b", padding: "6px 8px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                                    <span style={{ fontSize: "7.5px", fontWeight: "700", color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" }}>Cinematic Showcase</span>
                                  </div>
                                  <span style={{ fontSize: "7px", color: "#94a3b8", background: "rgba(255,255,255,0.08)", padding: "1px 4px", borderRadius: "3px" }}>3 Reels</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                                  {[1, 2, 3].map((v) => (
                                    <div key={v} style={{ background: "#1e293b", borderRadius: "5px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                                      <div style={{ height: "40px", position: "relative", background: "#000000", overflow: "hidden" }}>
                                        <video src="/videos/emaar.mp4" autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                          <div style={{ width: "15px", height: "15px", borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "7px", paddingLeft: "1px" }}>
                                            ▶
                                          </div>
                                        </div>
                                        <div style={{ position: "absolute", bottom: "2px", right: "2px", background: "rgba(0,0,0,0.75)", color: "#ffffff", fontSize: "6.5px", fontWeight: "700", padding: "0 3px", borderRadius: "2px" }}>
                                          REEL
                                        </div>
                                      </div>
                                      <div style={{ padding: "3px 4px", background: "#0f172a" }}>
                                        <div style={{ height: "3.5px", width: "80%", background: "#ffffff", borderRadius: "2px", marginBottom: "2px" }} />
                                        <div style={{ height: "2.5px", width: "55%", background: "#64748b", borderRadius: "1.5px" }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          case "video-hero":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", position: "relative", background: "#000000", border: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                                <video src="/videos/emaar.mp4" autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,23,42,0.4), rgba(15,23,42,0.85))" }} />
                                <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "3px", padding: "0 12px" }}>
                                  <span style={{ fontSize: "7px", fontWeight: "800", letterSpacing: "0.12em", color: "#60a5fa", textTransform: "uppercase" }}>IMMERSIVE VIDEO HERO</span>
                                  <div style={{ height: "6px", width: "140px", background: "#ffffff", borderRadius: "3px" }} />
                                  <div style={{ height: "3.5px", width: "95px", background: "#cbd5e1", borderRadius: "2px" }} />
                                  <div style={{ marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", paddingLeft: "1px", boxShadow: "0 0 8px rgba(37,99,235,0.6)" }}>
                                      ▶
                                    </div>
                                    <div style={{ background: "#ffffff", color: "#0f172a", fontSize: "7.5px", fontWeight: "700", padding: "2px 7px", borderRadius: "3px" }}>
                                      EXPLORE NOW
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          case "text-columns":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 8px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontSize: "7.5px", fontWeight: "800", color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase" }}>Editorial Pillars</span>
                                  <span style={{ fontSize: "7px", color: "#64748b" }}>3 Columns</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                                  {[
                                    { tag: "ECO", w: "80%" },
                                    { tag: "LEGACY", w: "70%" },
                                    { tag: "COMMUNITY", w: "85%" }
                                  ].map((col, idx) => (
                                    <div key={idx} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", padding: "5px 4px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "60px" }}>
                                      <div>
                                        <span style={{ fontSize: "6px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "1px 3px", borderRadius: "2px", display: "inline-block" }}>
                                          {col.tag}
                                        </span>
                                        <div style={{ height: "4px", width: col.w, background: "#0f172a", borderRadius: "2px", marginTop: "3px", marginBottom: "2px" }} />
                                        <div style={{ height: "2.5px", width: "95%", background: "#94a3b8", borderRadius: "1.5px", marginBottom: "2px" }} />
                                        <div style={{ height: "2.5px", width: "70%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                      </div>
                                      <div style={{ fontSize: "6.5px", fontWeight: "700", color: "#2563eb", borderTop: "1px solid #f1f5f9", paddingTop: "2px" }}>
                                        READ MORE →
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          case "story":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#ffffff", border: "1px solid #e2e8f0", padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                                <div>
                                  <span style={{ fontSize: "7px", fontWeight: "800", color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>EDITORIAL STORY</span>
                                  <div style={{ height: "6px", width: "85%", background: "#0f172a", borderRadius: "2px", marginTop: "3px" }} />
                                  <div style={{ height: "1.5px", width: "100%", background: "#0f172a", marginTop: "5px" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "2px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                    <div style={{ height: "3px", width: "100%", background: "#64748b", borderRadius: "1.5px" }} />
                                    <div style={{ height: "3px", width: "95%", background: "#94a3b8", borderRadius: "1.5px" }} />
                                    <div style={{ height: "3px", width: "88%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                    <div style={{ height: "3px", width: "60%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", borderLeft: "1px dashed #e2e8f0", paddingLeft: "8px" }}>
                                    <div style={{ height: "3px", width: "100%", background: "#64748b", borderRadius: "1.5px" }} />
                                    <div style={{ height: "3px", width: "92%", background: "#94a3b8", borderRadius: "1.5px" }} />
                                    <div style={{ height: "3px", width: "80%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                    <div style={{ height: "3px", width: "50%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                  </div>
                                </div>
                              </div>
                            );
                          case "stats-banner":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#0f172a", border: "1px solid #1e293b", padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                                <div style={{ textAlign: "center" }}>
                                  <span style={{ fontSize: "7px", fontWeight: "800", color: "#60a5fa", letterSpacing: "0.12em", textTransform: "uppercase" }}>BY THE NUMBERS</span>
                                  <div style={{ height: "5px", width: "90px", background: "#ffffff", borderRadius: "2px", margin: "2px auto 0" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                                  {[
                                    { n: "45M+", lbl: "SQ FT" },
                                    { n: "25+", lbl: "YEARS" },
                                    { n: "12K+", lbl: "HOMES" },
                                    { n: "100%", lbl: "TRUST" }
                                  ].map((st, i) => (
                                    <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "4px 2px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", lineHeight: 1 }}>{st.n}</span>
                                      <span style={{ fontSize: "6.5px", fontWeight: "700", color: "#cbd5e1", marginTop: "2px" }}>{st.lbl}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          case "features":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 8px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontSize: "7.5px", fontWeight: "800", color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase" }}>Feature Cards</span>
                                  <span style={{ fontSize: "7px", color: "#64748b" }}>Numbered</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                                  {[
                                    { n: "01", t: "Prime Location" },
                                    { n: "02", t: "Amenities" },
                                    { n: "03", t: "Eco Green" }
                                  ].map((f, i) => (
                                    <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "5px 4px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "60px" }}>
                                      <div style={{ width: "15px", height: "15px", borderRadius: "4px", background: "#eff6ff", color: "#2563eb", fontSize: "7.5px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {f.n}
                                      </div>
                                      <div>
                                        <div style={{ height: "4px", width: "80%", background: "#0f172a", borderRadius: "2px", marginBottom: "2px" }} />
                                        <div style={{ height: "2.5px", width: "95%", background: "#94a3b8", borderRadius: "1.5px", marginBottom: "2px" }} />
                                        <div style={{ height: "2.5px", width: "65%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          case "images-grid":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#ffffff", border: "1px solid #e2e8f0", padding: "6px 8px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontSize: "7.5px", fontWeight: "800", color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase" }}>Photo Gallery</span>
                                  <span style={{ fontSize: "7px", color: "#64748b" }}>3 Columns</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                                  {[
                                    { img: "/images/landmarks/Serenity-hills-big.webp", t: "Serenity" },
                                    { img: "/images/landmarks/urban-ascent.jpg", t: "Urban" },
                                    { img: "/images/landmarks/elite-oasis.jpg", t: "Oasis" }
                                  ].map((im, i) => (
                                    <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                      <div style={{ height: "38px", overflow: "hidden", background: "#e2e8f0" }}>
                                        <img src={im.img} alt={im.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                      </div>
                                      <div style={{ padding: "3px 4px" }}>
                                        <div style={{ height: "4px", width: "70%", background: "#0f172a", borderRadius: "2px", marginBottom: "2px" }} />
                                        <div style={{ height: "2.5px", width: "90%", background: "#94a3b8", borderRadius: "1.5px" }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          case "split-media":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#ffffff", border: "1px solid #e2e8f0", padding: "7px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignItems: "center", boxSizing: "border-box" }}>
                                <div style={{ height: "76px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                                  <img src="/images/landmarks/business-centre.jpg" alt="Split Showcase" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px" }}>
                                  <span style={{ fontSize: "6.5px", fontWeight: "800", color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase" }}>BESPOKE SPACES</span>
                                  <div style={{ height: "5px", width: "90%", background: "#0f172a", borderRadius: "2px" }} />
                                  <div style={{ height: "2.5px", width: "100%", background: "#64748b", borderRadius: "1.5px" }} />
                                  <div style={{ height: "2.5px", width: "85%", background: "#94a3b8", borderRadius: "1.5px" }} />
                                  <div style={{ height: "2.5px", width: "65%", background: "#cbd5e1", borderRadius: "1.5px" }} />
                                  <div style={{ marginTop: "2px", background: "#0f172a", color: "#ffffff", fontSize: "6px", fontWeight: "700", padding: "2px 6px", borderRadius: "3px", display: "inline-block", width: "fit-content" }}>
                                    VISIT NOW →
                                  </div>
                                </div>
                              </div>
                            );
                          case "cta":
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#0f172a", border: "1px solid #1e293b", padding: "8px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "4px", boxSizing: "border-box" }}>
                                <span style={{ fontSize: "7px", fontWeight: "800", color: "#60a5fa", letterSpacing: "0.12em", textTransform: "uppercase" }}>CALL TO ACTION</span>
                                <div style={{ height: "6px", width: "130px", background: "#ffffff", borderRadius: "2px" }} />
                                <div style={{ height: "3px", width: "160px", background: "#94a3b8", borderRadius: "1.5px" }} />
                                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                                  <div style={{ background: "#ffffff", color: "#0f172a", fontSize: "7px", fontWeight: "700", padding: "2px 7px", borderRadius: "3px" }}>
                                    ENQUIRE NOW
                                  </div>
                                  <div style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#ffffff", fontSize: "7px", fontWeight: "700", padding: "2px 7px", borderRadius: "3px" }}>
                                    CALL US
                                  </div>
                                </div>
                              </div>
                            );
                          case "blank":
                          default:
                            return (
                              <div style={{ width: "100%", height: "92px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", border: "2px dashed #cbd5e1", padding: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "3px", boxSizing: "border-box" }}>
                                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                                  +
                                </div>
                                <span style={{ fontSize: "9px", fontWeight: "700", color: "#475569" }}>Blank Canvas Section</span>
                                <span style={{ fontSize: "7.5px", color: "#94a3b8" }}>Add your custom text, video, or image elements freehand</span>
                              </div>
                            );
                        }
                      };

                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleInsertPreset(preset.id)}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            padding: "12px",
                            background: "#ffffff",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#3b82f6";
                            e.currentTarget.style.boxShadow = "0 6px 18px rgba(37,99,235,0.12)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {/* Mini Visual Layout Mockup Preview */}
                          {renderPresetMockup()}

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                              {preset.title}
                            </span>
                            <span
                              style={{
                                fontSize: "9.5px",
                                fontWeight: "700",
                                background: preset.tag === "Video" ? "#ecfdf5" : preset.tag === "Text" ? "#eff6ff" : preset.tag === "Stats" ? "#fef3c7" : "#f1f5f9",
                                color: preset.tag === "Video" ? "#047857" : preset.tag === "Text" ? "#2563eb" : preset.tag === "Stats" ? "#b45309" : "#475569",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                textTransform: "uppercase"
                              }}
                            >
                              {preset.tag}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "11.5px", color: "#64748b", lineHeight: 1.45 }}>
                            {preset.desc}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                borderBottomLeftRadius: "16px",
                borderBottomRightRadius: "16px",
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              <button
                type="button"
                onClick={() => setSectionModalOpen(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#18181b",
            border: "1px solid #27272a",
            color: "#fafafa",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            fontSize: "13px",
            zIndex: 9999999
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
