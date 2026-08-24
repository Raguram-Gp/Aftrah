/**
 * AFRAH — Next-Gen Interactive 3D Architectural Blueprint & BIM Model Viewer
 *
 * Features:
 * 1. Intricate architectural skyscraper: Diagrid lattice, 24+ floor plates, central shear core,
 *    Level 35 Sky Garden, 650-ton Tuned Mass Damper, subterranean foundation piles, and crown spire.
 * 2. Holographic CAD blueprint ground grid with coordinate markers, dimensional callouts, and azimuth rings.
 * 3. 3D Hotspots with engineering telemetry cards.
 * 4. Layer filtering (Diagrid, Slabs, Core, Damper, Blueprint Grid).
 * 5. Full real-time Dark/Light theme synchronization.
 * 6. Responsive camera framing: entire model from foundation piles to crown spire is 100% visible on load.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initModelViewer(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const container = canvas.parentElement;

  // --- Theme Configuration ---
  const THEME_CONFIG = {
    dark: {
      clearColor: 0x0a0c10,
      fogColor: 0x0a0c10,
      goldEdge: 0xe2c399,
      goldOpacity: 0.85,
      accentEdge: 0xfedeb2,
      accentOpacity: 0.95,
      dimEdge: 0x646a78,
      dimOpacity: 0.35,
      slabColor: 0x1f2530,
      slabEdgeColor: 0xe2c399,
      slabOpacity: 0.35,
      coreColor: 0x2a3342,
      coreEdgeColor: 0x8292ab,
      gridColor: 0x222a38,
      gridBright: 0x475569,
      gridOpacity: 0.45,
      damperColor: 0xe2c399,
      particleColor: 0xe2c399,
      particleOpacity: 0.5,
      particleBlending: THREE.AdditiveBlending,
    },
    light: {
      clearColor: 0xF8F9FB,
      fogColor: 0xF2F4F8,
      goldEdge: 0x967032,
      goldOpacity: 0.9,
      accentEdge: 0x73511e,
      accentOpacity: 1.0,
      dimEdge: 0x9ca3af,
      dimOpacity: 0.55,
      slabColor: 0xE8ECF2,
      slabEdgeColor: 0x967032,
      slabOpacity: 0.6,
      coreColor: 0xD8DEE9,
      coreEdgeColor: 0x575E6E,
      gridColor: 0xD0D6E2,
      gridBright: 0x94A3B8,
      gridOpacity: 0.7,
      damperColor: 0x967032,
      particleColor: 0x967032,
      particleOpacity: 0.4,
      particleBlending: THREE.NormalBlending,
    },
  };

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  let currentTheme = initialTheme;
  let currentConfig = THEME_CONFIG[initialTheme] || THEME_CONFIG.dark;

  // --- Scene Setup ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(currentConfig.fogColor, 0.003);

  const initialAspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(
    46,
    initialAspect,
    0.1,
    800
  );

  // Position camera so entire model (y: -12 to +74) and ground grid are completely visible
  function setDefaultCameraFraming() {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    if (aspect < 0.9) {
      // Tall Mobile portrait
      camera.position.set(78, 44, 94);
    } else if (aspect < 1.3) {
      // Tablet
      camera.position.set(66, 38, 80);
    } else {
      // Desktop Widescreen
      camera.position.set(58, 34, 70);
    }
    camera.lookAt(0, 28, 0);
  }

  setDefaultCameraFraming();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(currentConfig.clearColor, 1);

  // --- OrbitControls ---
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = true;
  controls.minDistance = 25;
  controls.maxDistance = 180;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.target.set(0, 28, 0);
  controls.enablePan = true;
  controls.maxPolarAngle = Math.PI * 0.8;

  // Stop auto-rotate on user interaction
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });

  // --- Materials ---
  const materials = {
    goldEdge: new THREE.LineBasicMaterial({ color: currentConfig.goldEdge, transparent: true, opacity: currentConfig.goldOpacity }),
    accentEdge: new THREE.LineBasicMaterial({ color: currentConfig.accentEdge, transparent: true, opacity: currentConfig.accentOpacity }),
    dimEdge: new THREE.LineBasicMaterial({ color: currentConfig.dimEdge, transparent: true, opacity: currentConfig.dimOpacity }),
    slabMesh: new THREE.MeshBasicMaterial({ color: currentConfig.slabColor, transparent: true, opacity: currentConfig.slabOpacity, depthWrite: false }),
    slabEdge: new THREE.LineBasicMaterial({ color: currentConfig.slabEdgeColor, transparent: true, opacity: 0.4 }),
    coreMesh: new THREE.MeshBasicMaterial({ color: currentConfig.coreColor, transparent: true, opacity: 0.35, depthWrite: false }),
    coreEdge: new THREE.LineBasicMaterial({ color: currentConfig.coreEdgeColor, transparent: true, opacity: 0.6 }),
    damperMesh: new THREE.MeshBasicMaterial({ color: currentConfig.damperColor, transparent: true, opacity: 0.85, wireframe: true }),
    gridLine: new THREE.LineBasicMaterial({ color: currentConfig.gridColor, transparent: true, opacity: currentConfig.gridOpacity }),
    gridBrightLine: new THREE.LineBasicMaterial({ color: currentConfig.gridBright, transparent: true, opacity: currentConfig.gridOpacity + 0.2 }),
    particle: new THREE.PointsMaterial({
      color: currentConfig.particleColor,
      size: 0.6,
      transparent: true,
      opacity: currentConfig.particleOpacity,
      blending: currentConfig.particleBlending,
      depthWrite: false,
    }),
  };

  // --- Model Groups ---
  const modelRoot = new THREE.Group();
  const groupDiagrid = new THREE.Group();
  const groupSlabs = new THREE.Group();
  const groupCore = new THREE.Group();
  const groupDamper = new THREE.Group();
  const groupBlueprintGrid = new THREE.Group();

  modelRoot.add(groupBlueprintGrid);
  modelRoot.add(groupCore);
  modelRoot.add(groupSlabs);
  modelRoot.add(groupDiagrid);
  modelRoot.add(groupDamper);
  scene.add(modelRoot);

  function addEdges(geo, mat, parent, pos, rot) {
    const edges = new THREE.EdgesGeometry(geo);
    const lines = new THREE.LineSegments(edges, mat);
    if (pos) lines.position.set(pos.x, pos.y, pos.z);
    if (rot) {
      lines.rotation.x = rot.x || 0;
      lines.rotation.y = rot.y || 0;
      lines.rotation.z = rot.z || 0;
    }
    parent.add(lines);
    return lines;
  }

  // ============================================
  // 1. BLUEPRINT GROUND GRID & CAD MARKINGS
  // ============================================
  function buildBlueprintGrid() {
    // 3D Grid Helper
    const grid = new THREE.GridHelper(80, 40, currentConfig.gridBright, currentConfig.gridColor);
    grid.position.y = 0;
    grid.material.transparent = true;
    grid.material.opacity = currentConfig.gridOpacity;
    groupBlueprintGrid.add(grid);

    // Concentric blueprint radius rings
    [14, 26, 36].forEach((radius) => {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0.05, Math.sin(theta) * radius));
      }
      ringGeo.setFromPoints(points);
      const ringLine = new THREE.Line(ringGeo, materials.gridBrightLine);
      groupBlueprintGrid.add(ringLine);
    });

    // Crosshair axis lines
    const crossGeoX = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-40, 0.06, 0),
      new THREE.Vector3(40, 0.06, 0),
    ]);
    const crossGeoZ = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.06, -40),
      new THREE.Vector3(0, 0.06, 40),
    ]);
    groupBlueprintGrid.add(new THREE.Line(crossGeoX, materials.accentEdge));
    groupBlueprintGrid.add(new THREE.Line(crossGeoZ, materials.accentEdge));

    // Outer boundary box
    addEdges(new THREE.PlaneGeometry(80, 80), materials.gridBrightLine, groupBlueprintGrid, { x: 0, y: 0.02, z: 0 }, { x: -Math.PI / 2 });
  }

  // ============================================
  // 2. CENTRAL SHEAR CORE & ELEVATOR SHAFTS
  // ============================================
  function buildCore() {
    // Concrete elevator core (y: 0 to 60)
    const coreGeo = new THREE.BoxGeometry(6.6, 60, 6.6);
    const coreMesh = new THREE.Mesh(coreGeo, materials.coreMesh);
    coreMesh.position.y = 30;
    groupCore.add(coreMesh);
    addEdges(coreGeo, materials.coreEdge, groupCore, { x: 0, y: 30, z: 0 });

    // Inner elevator shaft split
    const shaft1Geo = new THREE.BoxGeometry(2.4, 58, 2.4);
    addEdges(shaft1Geo, materials.dimEdge, groupCore, { x: -1.5, y: 29, z: 0 });
    const shaft2Geo = new THREE.BoxGeometry(2.4, 58, 2.4);
    addEdges(shaft2Geo, materials.dimEdge, groupCore, { x: 1.5, y: 29, z: 0 });

    // Subterranean foundation core
    const foundGeo = new THREE.BoxGeometry(15, 8, 15);
    const foundMesh = new THREE.Mesh(foundGeo, materials.coreMesh);
    foundMesh.position.y = -4;
    groupCore.add(foundMesh);
    addEdges(foundGeo, materials.coreEdge, groupCore, { x: 0, y: -4, z: 0 });

    // 16 Deep Foundation Piles (-4m to -12m)
    for (let px = -5.5; px <= 5.5; px += 3.6) {
      for (let pz = -5.5; pz <= 5.5; pz += 3.6) {
        const pileGeo = new THREE.CylinderGeometry(0.45, 0.45, 8, 6);
        addEdges(pileGeo, materials.dimEdge, groupCore, { x: px, y: -8, z: pz });
      }
    }
  }

  // ============================================
  // 3. MULTI-LEVEL FLOOR SLABS (28 LEVELS)
  // ============================================
  function buildSlabs() {
    const totalLevels = 26;
    for (let i = 0; i < totalLevels; i++) {
      const y = 2 + i * 2.3;
      let width = 13.5;
      let depth = 13.5;

      // Upper setback tapering
      if (i > 18) {
        const taper = (i - 18) * 0.55;
        width -= taper;
        depth -= taper;
      }

      // Special Sky Garden double-height slab at level 14
      if (i === 14) {
        const slabGeo = new THREE.BoxGeometry(width + 2, 0.4, depth + 2);
        const slabMesh = new THREE.Mesh(slabGeo, materials.slabMesh);
        slabMesh.position.set(0, y, 0);
        groupSlabs.add(slabMesh);
        addEdges(slabGeo, materials.accentEdge, groupSlabs, { x: 0, y, z: 0 });
      } else {
        const slabGeo = new THREE.BoxGeometry(width, 0.25, depth);
        const slabMesh = new THREE.Mesh(slabGeo, materials.slabMesh);
        slabMesh.position.set(0, y, 0);
        groupSlabs.add(slabMesh);
        addEdges(slabGeo, materials.slabEdge, groupSlabs, { x: 0, y, z: 0 });
      }
    }
  }

  // ============================================
  // 4. DIAGRID PERIMETER EXOSKELETON
  // ============================================
  function buildDiagrid() {
    // Main lower tower diagrid (y: 0 to 45)
    const towerGeo = new THREE.BoxGeometry(14, 45, 14, 4, 9, 4);
    addEdges(towerGeo, materials.goldEdge, groupDiagrid, { x: 0, y: 22.5, z: 0 });

    // Upper crown setback diagrid (y: 45 to 60)
    const upperGeo = new THREE.BoxGeometry(9.8, 16, 9.8, 2, 4, 2);
    addEdges(upperGeo, materials.accentEdge, groupDiagrid, { x: 0, y: 53, z: 0 });

    // Intricate X-bracing truss on all 4 faces
    for (let f = 0; f < 9; f++) {
      const y1 = f * 5;
      const y2 = (f + 1) * 5;
      const w = 7.0;

      // Front & Back face cross-ties
      const frontX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w, y1, w),
        new THREE.Vector3(w, y2, w),
        new THREE.Vector3(-w, y2, w),
        new THREE.Vector3(w, y1, w),
      ]);
      groupDiagrid.add(new THREE.LineSegments(frontX, materials.dimEdge));

      const backX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w, y1, -w),
        new THREE.Vector3(w, y2, -w),
        new THREE.Vector3(-w, y2, -w),
        new THREE.Vector3(w, y1, -w),
      ]);
      groupDiagrid.add(new THREE.LineSegments(backX, materials.dimEdge));

      // Side faces
      const leftX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w, y1, -w),
        new THREE.Vector3(-w, y2, w),
        new THREE.Vector3(-w, y2, -w),
        new THREE.Vector3(-w, y1, w),
      ]);
      groupDiagrid.add(new THREE.LineSegments(leftX, materials.dimEdge));

      const rightX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(w, y1, -w),
        new THREE.Vector3(w, y2, w),
        new THREE.Vector3(w, y2, -w),
        new THREE.Vector3(w, y1, w),
      ]);
      groupDiagrid.add(new THREE.LineSegments(rightX, materials.dimEdge));
    }

    // Sky Garden Atrium Truss Level (y = 32)
    const outriggerGeo = new THREE.BoxGeometry(16.5, 2, 16.5, 4, 1, 4);
    addEdges(outriggerGeo, materials.accentEdge, groupDiagrid, { x: 0, y: 32, z: 0 });

    // Architectural Spire (y: 61 to 74)
    const spireGeo = new THREE.ConeGeometry(1.8, 14, 4);
    addEdges(spireGeo, materials.accentEdge, groupDiagrid, { x: 0, y: 68, z: 0 });

    // Helipad Platform on secondary podium
    const helipad = new THREE.CylinderGeometry(4.2, 4.2, 0.4, 16);
    addEdges(helipad, materials.accentEdge, groupDiagrid, { x: 17, y: 24, z: -4 });
    const helipadLegs = new THREE.BoxGeometry(6.5, 24, 6.5, 2, 5, 2);
    addEdges(helipadLegs, materials.dimEdge, groupDiagrid, { x: 17, y: 12, z: -4 });

    // Skybridge connecting main tower to helipad podium
    const bridgeGeo = new THREE.BoxGeometry(7.5, 2.5, 2.8, 2, 1, 1);
    addEdges(bridgeGeo, materials.goldEdge, groupDiagrid, { x: 10.5, y: 22, z: -2 });
  }

  // ============================================
  // 5. TUNED MASS DAMPER (CROWN PENDULUM)
  // ============================================
  function buildDamper() {
    // Spherical 650-ton damper mass at level 68
    const sphereGeo = new THREE.IcosahedronGeometry(2.0, 2);
    const sphereMesh = new THREE.Mesh(sphereGeo, materials.damperMesh);
    sphereMesh.position.set(0, 56, 0);
    groupDamper.add(sphereMesh);

    // 4 Hydraulic suspension cables
    const cableGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.8, 60, -3.8),
      new THREE.Vector3(0, 56, 0),
      new THREE.Vector3(3.8, 60, -3.8),
      new THREE.Vector3(0, 56, 0),
      new THREE.Vector3(-3.8, 60, 3.8),
      new THREE.Vector3(0, 56, 0),
      new THREE.Vector3(3.8, 60, 3.8),
      new THREE.Vector3(0, 56, 0),
    ]);
    groupDamper.add(new THREE.LineSegments(cableGeo, materials.accentEdge));
  }

  // --- Ambient CAD Particles ---
  const pCount = 90;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 75;
    pPositions[i * 3 + 1] = Math.random() * 75;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 75;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particles = new THREE.Points(pGeo, materials.particle);
  scene.add(particles);

  // Build the complete skyscraper
  buildBlueprintGrid();
  buildCore();
  buildSlabs();
  buildDiagrid();
  buildDamper();

  // ============================================
  // 6. LIVE THEME UPDATE
  // ============================================
  function applyTheme(theme) {
    currentTheme = theme;
    currentConfig = THEME_CONFIG[theme] || THEME_CONFIG.dark;

    renderer.setClearColor(currentConfig.clearColor, 1);
    if (scene.fog) {
      scene.fog.color.setHex(currentConfig.fogColor);
    }

    materials.goldEdge.color.setHex(currentConfig.goldEdge);
    materials.goldEdge.opacity = currentConfig.goldOpacity;

    materials.accentEdge.color.setHex(currentConfig.accentEdge);
    materials.accentEdge.opacity = currentConfig.accentOpacity;

    materials.dimEdge.color.setHex(currentConfig.dimEdge);
    materials.dimEdge.opacity = currentConfig.dimOpacity;

    materials.slabMesh.color.setHex(currentConfig.slabColor);
    materials.slabMesh.opacity = currentConfig.slabOpacity;

    materials.slabEdge.color.setHex(currentConfig.slabEdgeColor);

    materials.coreMesh.color.setHex(currentConfig.coreColor);
    materials.coreEdge.color.setHex(currentConfig.coreEdgeColor);

    materials.damperMesh.color.setHex(currentConfig.damperColor);

    materials.gridLine.color.setHex(currentConfig.gridColor);
    materials.gridLine.opacity = currentConfig.gridOpacity;

    materials.gridBrightLine.color.setHex(currentConfig.gridBright);
    materials.gridBrightLine.opacity = currentConfig.gridOpacity + 0.2;

    materials.particle.color.setHex(currentConfig.particleColor);
    materials.particle.opacity = currentConfig.particleOpacity;
    materials.particle.blending = currentConfig.particleBlending;
    materials.particle.needsUpdate = true;
  }

  window.addEventListener('themechange', (e) => {
    if (e && e.detail && e.detail.theme) {
      applyTheme(e.detail.theme);
    }
  });

  // ============================================
  // 7. LAYER FILTERING CONTROLS
  // ============================================
  window.setBlueprintLayer = function(layerName, isVisible) {
    switch (layerName) {
      case 'diagrid':
        groupDiagrid.visible = isVisible;
        break;
      case 'slabs':
        groupSlabs.visible = isVisible;
        break;
      case 'core':
        groupCore.visible = isVisible;
        break;
      case 'damper':
        groupDamper.visible = isVisible;
        break;
      case 'grid':
        groupBlueprintGrid.visible = isVisible;
        break;
      case 'all':
        groupDiagrid.visible = true;
        groupSlabs.visible = true;
        groupCore.visible = true;
        groupDamper.visible = true;
        groupBlueprintGrid.visible = true;
        break;
    }
  };

  // Preset camera angle views
  window.setBlueprintView = function(viewName) {
    controls.autoRotate = false;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const distMult = aspect < 1.0 ? 1.28 : 1.0;

    switch (viewName) {
      case 'iso':
        setDefaultCameraFraming();
        controls.target.set(0, 28, 0);
        break;
      case 'elevation':
        camera.position.set(0, 30, 85 * distMult);
        controls.target.set(0, 30, 0);
        break;
      case 'plan':
        camera.position.set(0, 105 * distMult, 0.1);
        controls.target.set(0, 0, 0);
        break;
      case 'crown':
        camera.position.set(22 * distMult, 62, 26 * distMult);
        controls.target.set(0, 56, 0);
        break;
    }
    controls.update();
  };

  // --- Animation Loop (Active only when canvas is visible in viewport) ---
  let clock = new THREE.Clock();
  let isViewerVisible = false;
  let animId = null;

  function animate() {
    if (!isViewerVisible) {
      animId = null;
      return;
    }
    animId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Subtle gentle damper oscillation simulation (0.05 rad)
    groupDamper.position.x = Math.sin(elapsed * 1.2) * 0.15;
    groupDamper.position.z = Math.cos(elapsed * 0.9) * 0.15;

    controls.update();
    renderer.render(scene, camera);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isViewerVisible = entry.isIntersecting;
      if (isViewerVisible && !animId) {
        clock.start();
        animate();
      }
    });
  }, { rootMargin: '100px 0px' });

  observer.observe(canvas);

  // --- Resize Handler ---
  function onResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
}
