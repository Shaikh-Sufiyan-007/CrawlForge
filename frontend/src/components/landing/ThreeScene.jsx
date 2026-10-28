import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};


export const NODE_COORDINATES = [
  new THREE.Vector3(0.0, 0.2, -2.5),
  new THREE.Vector3(-1.8, 0.6, -6.5),
  new THREE.Vector3(1.7, -0.4, -10.5),
  new THREE.Vector3(-1.5, 0.5, -14.5),
  new THREE.Vector3(1.3, -0.3, -18.5),
  new THREE.Vector3(0.0, 0.1, -22.5),
];

export const JOURNEY_SEGMENTS = [
  { nodeIndex: 0, dwellStart: 0.38, dwellEnd: 0.50, travelEnd: 0.58 },
  { nodeIndex: 1, dwellStart: 0.58, dwellEnd: 0.64, travelEnd: 0.72 },
  { nodeIndex: 2, dwellStart: 0.72, dwellEnd: 0.78, travelEnd: 0.86 },
  { nodeIndex: 3, dwellStart: 0.86, dwellEnd: 0.91, travelEnd: 0.95 },
  { nodeIndex: 4, dwellStart: 0.95, dwellEnd: 0.975, travelEnd: 0.985 },
  { nodeIndex: 5, dwellStart: 0.985, dwellEnd: 1.00, travelEnd: 1.00 },
];

export const ThreeScene = ({
  scrollProgressRef,
  onSceneReady,
  onUpdateCards,
  onActiveCardChange,
  reducedMotion = false,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050706, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x050706, 0);
    container.appendChild(renderer.domElement);


    const projectedVector = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    const cameraLookAt = new THREE.Vector3(0, 0, 0);
    const mousePos = { x: 0, y: 0, targetX: 0, targetY: 0 };


    const worldGroup = new THREE.Group();
    scene.add(worldGroup);


    const orbGroup = new THREE.Group();
    worldGroup.add(orbGroup);
    orbGroup.scale.setScalar(reducedMotion ? 1 : 0.001);


    const interiorGroup = new THREE.Group();
    worldGroup.add(interiorGroup);


    const coreGeo = new THREE.SphereGeometry(1.65, 48, 48);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#39FF14') },
        uColor2: { value: new THREE.Color('#0a3610') },
        uColor3: { value: new THREE.Color('#8CFF68') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          // Subtle pulsation
          float pulse = sin(position.x * 2.0 + uTime * 2.5) * cos(position.y * 2.0 + uTime * 2.0) * 0.04;
          vec3 newPos = position + normal * pulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
          float band = sin(vPosition.y * 5.0 + uTime * 3.0) * 0.5 + 0.5;
          vec3 baseColor = mix(uColor2, uColor1, band * 0.6 + 0.4);
          vec3 finalColor = mix(baseColor, uColor3, fresnel * 0.85);
          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      transparent: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(coreMesh);


    const shellGeo = new THREE.SphereGeometry(2.35, 64, 64);
    const shellMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDissolve: { value: 0.0 },
        uColor: { value: new THREE.Color('#39FF14') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        uniform float uTime;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uDissolve;
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        void main() {
          // Fresnel rim
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          // Electric wireframe noise pattern
          float noise = sin(vPosition.x * 7.0 + uTime * 2.0) * cos(vPosition.y * 7.0 - uTime * 1.5) * sin(vPosition.z * 7.0 + uTime);
          float alpha = fresnel * 0.75 + smoothstep(0.7, 0.95, noise) * 0.35;

          // Dissolve smoothly when camera gets close / passes through shell
          alpha = alpha * (1.0 - smoothstep(0.0, 1.0, uDissolve));

          if (alpha < 0.005) discard;

          vec3 col = uColor + vec3(0.2, 0.4, 0.1) * fresnel;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    orbGroup.add(shellMesh);


    const rings = [];
    const ringSpecs = [
      { radius: 2.7, tube: 0.02, tiltX: 0.6, tiltY: 0.3, tiltZ: 0.2, speed: 0.9 },
      { radius: 3.1, tube: 0.018, tiltX: -0.7, tiltY: 0.8, tiltZ: -0.4, speed: -0.7 },
      { radius: 3.5, tube: 0.015, tiltX: 1.1, tiltY: -0.5, tiltZ: 0.9, speed: 1.1 },
    ];

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    ringSpecs.forEach((spec) => {
      const ringGeo = new THREE.TorusGeometry(spec.radius, spec.tube, 16, 90);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat.clone());
      ringMesh.rotation.set(spec.tiltX, spec.tiltY, spec.tiltZ);
      orbGroup.add(ringMesh);
      rings.push({ mesh: ringMesh, spec });
    });

    function makeCircleTexture() {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');

      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.7, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    }
    const circleTex = makeCircleTexture();

    const outerPartCount = 380;
    const outerPartPos = new Float32Array(outerPartCount * 3);
    const outerPartScales = new Float32Array(outerPartCount);

    for (let i = 0; i < outerPartCount; i++) {
      const radius = 2.8 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      outerPartPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      outerPartPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      outerPartPos[i * 3 + 2] = radius * Math.cos(phi);
      outerPartScales[i] = 0.5 + Math.random() * 1.5;
    }

    const outerPartGeo = new THREE.BufferGeometry();
    outerPartGeo.setAttribute('position', new THREE.BufferAttribute(outerPartPos, 3));
    outerPartGeo.setAttribute('scale', new THREE.BufferAttribute(outerPartScales, 1));

    const outerPartMat = new THREE.PointsMaterial({
      color: 0x8cff68,
      size: 0.15,
      map: circleTex,
      alphaTest: 0.01,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const outerPoints = new THREE.Points(outerPartGeo, outerPartMat);
    orbGroup.add(outerPoints);


    const networkCurve = new THREE.CatmullRomCurve3(NODE_COORDINATES, false, 'catmullrom', 0.2);

    const tubeGeo = new THREE.TubeGeometry(networkCurve, 180, 0.04, 8, false);
    const tubeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPulseProgress: { value: 0 },
        uPulseStart: { value: 0 },
        uPulseEnd: { value: 1 },
        uColor: { value: new THREE.Color('#39FF14') },
        uBaseColor: { value: new THREE.Color('#0c3814') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPulseProgress;
        uniform vec3 uColor;
        uniform vec3 uBaseColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          // Continuous subtle energy flow
          float flow = sin(vUv.x * 40.0 - uTime * 4.0) * 0.5 + 0.5;

          // Traveling energetic pulse packet linked to scroll progress
          float pulseDist = abs(vUv.x - uPulseProgress);
          float pulse = smoothstep(0.09, 0.0, pulseDist) * 1.6;

          vec3 finalColor = mix(uBaseColor, uColor, flow * 0.35 + pulse);
          float alpha = 0.55 + pulse * 0.45;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    interiorGroup.add(tubeMesh);

    const secondaryPairs = [
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
    ];
    const secLineMat = new THREE.LineBasicMaterial({
      color: 0x1e6827,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    secondaryPairs.forEach(([from, to]) => {
      const p1 = NODE_COORDINATES[from];
      const p2 = NODE_COORDINATES[to];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.x += (Math.random() - 0.5) * 1.2;
      mid.y += (Math.random() - 0.5) * 1.2;

      const subCurve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = subCurve.getPoints(24);
      const secGeo = new THREE.BufferGeometry().setFromPoints(points);
      const secLine = new THREE.Line(secGeo, secLineMat);
      interiorGroup.add(secLine);
    });

    const nodeMarkers = [];
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.9,
    });
    const ringBeaconMat = new THREE.MeshBasicMaterial({
      color: 0x8cff68,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    NODE_COORDINATES.forEach((coord, i) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(coord);

      // Sphere beacon
      const sphGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sphMesh = new THREE.Mesh(sphGeo, beaconMat.clone());
      markerGroup.add(sphMesh);

      // Pulsing horizontal ring
      const ringGeo = new THREE.RingGeometry(0.2, 0.28, 24);
      const ringMesh = new THREE.Mesh(ringGeo, ringBeaconMat.clone());
      ringMesh.rotation.x = Math.PI / 2;
      markerGroup.add(ringMesh);

      // Soft vertical anchor line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.6, 0),
        new THREE.Vector3(0, 0.6, 0),
      ]);
      const lineMesh = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: 0x39ff14,
          transparent: true,
          opacity: 0.4,
        })
      );
      markerGroup.add(lineMesh);

      interiorGroup.add(markerGroup);
      nodeMarkers.push({ group: markerGroup, sphere: sphMesh, ring: ringMesh });
    });

    // Interior Floating Ambient Dust
    const innerDustCount = 280;
    const innerDustPos = new Float32Array(innerDustCount * 3);
    for (let i = 0; i < innerDustCount; i++) {
      innerDustPos[i * 3] = (Math.random() - 0.5) * 8;
      innerDustPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      innerDustPos[i * 3 + 2] = -Math.random() * 26; // spans along Z corridor
    }

    const innerDustGeo = new THREE.BufferGeometry();
    innerDustGeo.setAttribute('position', new THREE.BufferAttribute(innerDustPos, 3));

    const innerDustMat = new THREE.PointsMaterial({
      color: 0x39ff14,
      size: 0.08,
      map: makeCircleTexture(),
      alphaTest: 0.01,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const innerDustPoints = new THREE.Points(innerDustGeo, innerDustMat);
    interiorGroup.add(innerDustPoints);


    const handleMouseMove = (e) => {

      const p = scrollProgressRef?.current || 0;
      if (p > 0.3) {
        mousePos.targetX = 0;
        mousePos.targetY = 0;
        return;
      }
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.targetX = normX * 0.8;
      mousePos.targetY = normY * 0.6;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });


    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
    window.addEventListener('resize', handleResize);


    if (onSceneReady) {
      onSceneReady({ orbGroup });
    }


    let lastTime = performance.now();
    let idleRotationZ = 0;

    const renderTick = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const elapsedTime = now * 0.001;

      const p = Math.max(0, Math.min(1, scrollProgressRef?.current || 0));

      coreMat.uniforms.uTime.value = elapsedTime;
      shellMat.uniforms.uTime.value = elapsedTime;
      tubeMat.uniforms.uTime.value = elapsedTime;


      mousePos.x += (mousePos.targetX - mousePos.x) * 0.05;
      mousePos.y += (mousePos.targetY - mousePos.y) * 0.05;


      rings.forEach(({ mesh, spec }) => {
        mesh.rotation.z += spec.speed * delta * 0.6;
      });


      const scrollRoll = p * Math.PI * 1.5;
      orbGroup.rotation.z = -scrollRoll;
      orbGroup.rotation.y = elapsedTime * 0.15 + mousePos.x * 0.15;
      orbGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.05 + mousePos.y * 0.15;

      if (p <= 0.35) {
        const diveP = p / 0.35;

        const startZ = 11.0;
        const targetZ = 1.0;
        camera.position.z = startZ - (startZ - targetZ) * Math.pow(diveP, 1.4);
        camera.position.x = mousePos.x * (1.0 - diveP * 0.8);
        camera.position.y = mousePos.y * (1.0 - diveP * 0.8);

        cameraTarget.set(0, 0, 0);

        const dissolveNorm = Math.max(0, Math.min(1, (p - 0.18) / 0.17));
        shellMat.uniforms.uDissolve.value = dissolveNorm;

        rings.forEach(({ mesh }, idx) => {
          const ringScale = 1.0 + diveP * (1.5 + idx * 0.5);
          mesh.scale.setScalar(ringScale);
          mesh.material.opacity = Math.max(0, 0.85 * (1.0 - dissolveNorm));
        });

        coreMat.opacity = Math.max(0.05, 0.95 * (1.0 - dissolveNorm * 0.85));

        tubeMat.uniforms.uPulseProgress.value = 0.0;
      }
      else {
        shellMat.uniforms.uDissolve.value = 1.0;
        coreMat.opacity = 0.05;

        let curveT = 0;
        let currentActiveCard = 0;
        const cardOpacities = [0, 0, 0, 0, 0, 0];
        const cardScales = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9];

        if (p < 0.38) {
          curveT = 0.0;
          currentActiveCard = 0;
          const entryFrac = (p - 0.35) / 0.03;
          cardOpacities[0] = entryFrac;
          cardScales[0] = 0.9 + entryFrac * 0.1;

          const targetNodePos = NODE_COORDINATES[0];
          camera.position.x = targetNodePos.x;
          camera.position.y = 0.2 + entryFrac * 0.15;
          camera.position.z = 1.0 - entryFrac * (1.0 - (targetNodePos.z + 3.2));
          cameraTarget.copy(targetNodePos);
          tubeMat.uniforms.uPulseProgress.value = 0.0;
        }
        else {
          if (p >= 0.38 && p <= 0.50) {
            curveT = 0.0;
            currentActiveCard = 0;
            cardOpacities[0] = 1.0;
            cardScales[0] = 1.0;
          } else if (p > 0.50 && p < 0.58) {
            const frac = (p - 0.50) / (0.58 - 0.50);
            const eased = frac * frac * (3 - 2 * frac);
            curveT = (0 + eased) * 0.2;
            currentActiveCard = frac < 0.5 ? 0 : 1;
            cardOpacities[0] = 1.0 - frac;
            cardOpacities[1] = frac;
            cardScales[0] = 1.0 - frac * 0.1;
            cardScales[1] = 0.9 + frac * 0.1;
          } else if (p >= 0.58 && p <= 0.64) {
            curveT = 0.2;
            currentActiveCard = 1;
            cardOpacities[1] = 1.0;
            cardScales[1] = 1.0;
          } else if (p > 0.64 && p < 0.72) {
            const frac = (p - 0.64) / (0.72 - 0.64);
            const eased = frac * frac * (3 - 2 * frac);
            curveT = (1 + eased) * 0.2;
            currentActiveCard = frac < 0.5 ? 1 : 2;
            cardOpacities[1] = 1.0 - frac;
            cardOpacities[2] = frac;
            cardScales[1] = 1.0 - frac * 0.1;
            cardScales[2] = 0.9 + frac * 0.1;
          } else if (p >= 0.72 && p <= 0.78) {
            // Node 2 Dwell
            curveT = 0.4;
            currentActiveCard = 2;
            cardOpacities[2] = 1.0;
            cardScales[2] = 1.0;
          } else if (p > 0.78 && p < 0.86) {
            // Travel 2 -> 3
            const frac = (p - 0.78) / (0.86 - 0.78);
            const eased = frac * frac * (3 - 2 * frac);
            curveT = (2 + eased) * 0.2;
            currentActiveCard = frac < 0.5 ? 2 : 3;
            cardOpacities[2] = 1.0 - frac;
            cardOpacities[3] = frac;
            cardScales[2] = 1.0 - frac * 0.1;
            cardScales[3] = 0.9 + frac * 0.1;
          } else if (p >= 0.86 && p <= 0.91) {
            // Node 3 Dwell
            curveT = 0.6;
            currentActiveCard = 3;
            cardOpacities[3] = 1.0;
            cardScales[3] = 1.0;
          } else if (p > 0.91 && p < 0.95) {
            // Travel 3 -> 4
            const frac = (p - 0.91) / (0.95 - 0.91);
            const eased = frac * frac * (3 - 2 * frac);
            curveT = (3 + eased) * 0.2;
            currentActiveCard = frac < 0.5 ? 3 : 4;
            cardOpacities[3] = 1.0 - frac;
            cardOpacities[4] = frac;
            cardScales[3] = 1.0 - frac * 0.1;
            cardScales[4] = 0.9 + frac * 0.1;
          } else if (p >= 0.95 && p <= 0.975) {
            // Node 4 Dwell
            curveT = 0.8;
            currentActiveCard = 4;
            cardOpacities[4] = 1.0;
            cardScales[4] = 1.0;
          } else if (p > 0.975 && p < 0.985) {
            // Travel 4 -> 5
            const frac = (p - 0.975) / (0.985 - 0.975);
            const eased = frac * frac * (3 - 2 * frac);
            curveT = (4 + eased) * 0.2;
            currentActiveCard = frac < 0.5 ? 4 : 5;
            cardOpacities[4] = 1.0 - frac;
            cardOpacities[5] = frac;
            cardScales[4] = 1.0 - frac * 0.1;
            cardScales[5] = 0.9 + frac * 0.1;
          } else if (p >= 0.985) {
            // Node 5 Dwell (CTA)
            curveT = 1.0;
            currentActiveCard = 5;
            cardOpacities[5] = 1.0;
            cardScales[5] = 1.0;
          }

          // Camera position along CatmullRom Curve
          const clampedCurveT = Math.max(0, Math.min(1, curveT));
          const currentCurvePoint = networkCurve.getPoint(clampedCurveT);
          const lookAheadT = Math.min(1, clampedCurveT + 0.04);
          const lookPoint = networkCurve.getPoint(lookAheadT);

          camera.position.x = currentCurvePoint.x;
          camera.position.y = currentCurvePoint.y + 0.35;
          camera.position.z = currentCurvePoint.z + 3.2;

          cameraTarget.copy(lookPoint);
          tubeMat.uniforms.uPulseProgress.value = clampedCurveT;
        }

        // 5. Node Beacons Pulsing Animation
        nodeMarkers.forEach(({ ring }, idx) => {
          const ringPulse = 1.0 + Math.sin(elapsedTime * 3.0 + idx * 1.2) * 0.15;
          ring.scale.set(ringPulse, ringPulse, 1);
        });

        // 6. Project 3D Nodes to 2D Screen Coordinates & Determine Active Card
        const cardsProjectedState = [];

        NODE_COORDINATES.forEach((coord, idx) => {
          projectedVector.copy(coord);
          projectedVector.project(camera);

          const screenX = (projectedVector.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (-(projectedVector.y * 0.5) + 0.5) * window.innerHeight;

          const cardOpacity = cardOpacities[idx];
          const cardScale = cardScales[idx];
          const inFocus = idx === currentActiveCard && cardOpacity > 0.4;

          const isMobile = window.innerWidth < 640;
          const cardWidth = isMobile ? window.innerWidth - 32 : 440;
          const cardHeight = 240;

          let finalX = screenX + (isMobile ? -cardWidth / 2 : 40);
          let finalY = screenY - cardHeight / 2;

          // Viewport bounding clamp
          finalX = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, finalX));
          finalY = Math.max(80, Math.min(window.innerHeight - cardHeight - 20, finalY));

          cardsProjectedState.push({
            x: finalX,
            y: finalY,
            opacity: cardOpacity,
            scale: cardScale,
            active: cardOpacity > 0.05,
            inFocus,
          });
        });

        if (onUpdateCards) {
          onUpdateCards(cardsProjectedState);
        }

        if (onActiveCardChange && currentActiveCard !== -1) {
          onActiveCardChange(currentActiveCard);
        }
      }

      // Smooth camera lookAt interpolation
      cameraLookAt.lerp(cameraTarget, 0.15);
      camera.lookAt(cameraLookAt);

      renderer.render(scene, camera);
    };

    // Add to GSAP ticker so scroll and 3D are in lockstep
    gsap.ticker.add(renderTick);

    return () => {
      gsap.ticker.remove(renderTick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      renderer.forceContextLoss();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef, onSceneReady, onUpdateCards, onActiveCardChange, reducedMotion]);

  return (
    <div
      ref={containerRef}
      id="three-canvas-container"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

export default ThreeScene;
