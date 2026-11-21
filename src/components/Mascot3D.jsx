import { Component, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function MascotFallback() {
  return (
    <div className="mascot-fallback" aria-hidden="true">
      <div className="fallback-cat">🐱</div>
      <span className="fallback-shadow" />
    </div>
  );
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <MascotFallback />;
    }
    return this.props.children;
  }
}

function ProgressRing3D({ progress }) {
  const ratio = Math.max(0, Math.min(1, Number(progress) || 0));
  const arc = ratio > 0 ? Math.max(0.06, ratio * Math.PI * 2) : 0;

  const progressGeom = useMemo(() => {
    if (arc <= 0) return null;
    return new THREE.TorusGeometry(1.6, 0.082, 12, 64, arc);
  }, [arc]);

  useEffect(() => {
    return () => {
      if (progressGeom) progressGeom.dispose();
    };
  }, [progressGeom]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.83, 0]}>
        <torusGeometry args={[1.6, 0.075, 12, 64]} />
        <meshToonMaterial color="#e6d8ff" transparent opacity={0.72} />
      </mesh>
      {progressGeom && (
        <mesh
          geometry={progressGeom}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
          position={[0, -0.81, 0]}
        >
          <meshToonMaterial color={ratio >= 1 ? "#62d4a5" : "#ff75a9"} />
        </mesh>
      )}
    </group>
  );
}

function MochiModel({ mood, celebrateKey, pokeKey, reduced }) {
  const catRef = useRef(null);
  const headRef = useRef(null);
  const tailRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const starsRef = useRef(null);

  const animRef = useRef({
    celebrateStart: -1,
    prevCelebrate: celebrateKey,
    squishStart: -1,
    prevPoke: pokeKey,
    nextBlinkAt: 2.8,
    blinkEndAt: -1
  });

  useEffect(() => {
    if (celebrateKey > 0 && celebrateKey !== animRef.current.prevCelebrate) {
      animRef.current.prevCelebrate = celebrateKey;
      animRef.current.celebrateStart = -2; // Tandai mulai pada frame berikutnya
    }
  }, [celebrateKey]);

  useEffect(() => {
    if (pokeKey > 0 && pokeKey !== animRef.current.prevPoke) {
      animRef.current.prevPoke = pokeKey;
      animRef.current.squishStart = -2;
    }
  }, [pokeKey]);

  const starPositions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return {
        key: i,
        pos: [Math.cos(a) * 1.18, Math.sin(a * 2) * 0.18 + 0.35, Math.sin(a) * 1.18],
        color: i % 2 === 0 ? "#ffd166" : "#b5f0d8"
      };
    });
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const anim = animRef.current;
    const damp = 1 - Math.exp(-8 * delta);

    if (anim.celebrateStart === -2) anim.celebrateStart = t;
    if (anim.squishStart === -2) anim.squishStart = t;

    // Kedip otomatis tiap 3-5 detik
    if (t >= anim.nextBlinkAt) {
      anim.blinkEndAt = t + 0.13;
      anim.nextBlinkAt = t + 3 + Math.random() * 2;
    }
    const targetEyeScaleY = t < anim.blinkEndAt ? 0.1 : 1;
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        targetEyeScaleY,
        0.45
      );
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.y,
        targetEyeScaleY,
        0.45
      );
    }

    // Kepala mengikuti kursor
    if (headRef.current) {
      const targetRotY = reduced ? 0 : THREE.MathUtils.clamp(state.pointer.x * 0.45, -0.45, 0.45);
      const targetRotX = reduced
        ? mood === "empty"
          ? 0.14
          : 0
        : THREE.MathUtils.clamp(-state.pointer.y * 0.24, -0.25, 0.25) +
          (mood === "empty" ? 0.12 : 0);
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetRotY,
        damp
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        targetRotX,
        damp
      );
    }

    // Gerak badan (lompat selebrasi & squish klik)
    if (catRef.current) {
      let yOffset = 0;
      let rotY = 0;
      let sx = 1;
      let sy = 1;

      if (!reduced && anim.celebrateStart >= 0) {
        const elapsed = t - anim.celebrateStart;
        const dur = 0.62;
        if (elapsed < dur) {
          const p = elapsed / dur;
          yOffset += Math.sin(p * Math.PI) * 0.62;
          rotY = p * Math.PI * 2;
        } else {
          anim.celebrateStart = -1;
        }
      }

      if (!reduced && anim.squishStart >= 0) {
        const elapsed = t - anim.squishStart;
        const dur = 0.36;
        if (elapsed < dur) {
          const p = elapsed / dur;
          const wave = Math.sin(p * Math.PI * 2) * (1 - p);
          sx = 1 + wave * 0.18;
          sy = 1 - wave * 0.18;
        } else {
          anim.squishStart = -1;
        }
      }

      catRef.current.position.y = -0.14 + yOffset;
      catRef.current.rotation.y = rotY;
      catRef.current.scale.set(sx, sy, sx);
    }

    if (!reduced && tailRef.current) {
      tailRef.current.rotation.z = -0.4 + Math.sin(t * 3.1) * 0.18;
    }

    if (!reduced && starsRef.current && mood === "happy") {
      starsRef.current.rotation.y = t * 1.3;
    }
  });

  const earAngle = mood === "empty" ? 0.55 : mood === "happy" ? 0.3 : 0.34;
  const mouthRotZ = mood === "empty" ? 0 : Math.PI;
  const mouthY = mood === "empty" ? -0.17 : mood === "happy" ? -0.1 : -0.11;

  return (
    <Float
      speed={reduced ? 0 : 2.2}
      rotationIntensity={reduced ? 0 : 0.08}
      floatIntensity={reduced ? 0 : 0.28}
    >
      <group ref={catRef} position={[0, -0.14, 0]}>
        {/* Badan */}
        <mesh scale={[1.04, 0.85, 0.96]} position={[0, -0.14, 0]}>
          <sphereGeometry args={[0.74, 28, 22]} />
          <meshToonMaterial color="#ffb8d2" />
        </mesh>

        {/* Perut krim */}
        <mesh scale={[0.95, 0.88, 0.4]} position={[0, -0.18, 0.59]}>
          <sphereGeometry args={[0.36, 24, 18]} />
          <meshToonMaterial color="#ffe6f0" />
        </mesh>

        {/* Kaki mungil */}
        <mesh scale={[1.05, 0.72, 1.2]} position={[-0.34, -0.58, 0.48]}>
          <sphereGeometry args={[0.17, 16, 12]} />
          <meshToonMaterial color="#ffe6f0" />
        </mesh>
        <mesh scale={[1.05, 0.72, 1.2]} position={[0.34, -0.58, 0.48]}>
          <sphereGeometry args={[0.17, 16, 12]} />
          <meshToonMaterial color="#ffe6f0" />
        </mesh>

        {/* Ekor */}
        <mesh
          ref={tailRef}
          position={[0.45, -0.32, -0.5]}
          rotation={[0.25, -0.7, -0.4]}
        >
          <torusGeometry args={[0.3, 0.085, 12, 24, Math.PI * 1.1]} />
          <meshToonMaterial color="#ffb8d2" />
        </mesh>

        {/* Kepala */}
        <group ref={headRef} position={[0, 0.54, 0.05]}>
          <mesh scale={[1.08, 0.9, 0.98]}>
            <sphereGeometry args={[0.66, 28, 22]} />
            <meshToonMaterial color="#ffb8d2" />
          </mesh>

          {/* Telinga kiri */}
          <group position={[-0.42, 0.5, 0.02]} rotation={[0.08, 0, earAngle]}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.23, 0.42, 4]} />
              <meshToonMaterial color="#ffb8d2" />
            </mesh>
            <mesh position={[0, -0.04, 0.09]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.12, 0.25, 4]} />
              <meshToonMaterial color="#ffe6f0" />
            </mesh>
          </group>

          {/* Telinga kanan */}
          <group position={[0.42, 0.5, 0.02]} rotation={[0.08, 0, -earAngle]}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.23, 0.42, 4]} />
              <meshToonMaterial color="#ffb8d2" />
            </mesh>
            <mesh position={[0, -0.04, 0.09]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.12, 0.25, 4]} />
              <meshToonMaterial color="#ffe6f0" />
            </mesh>
          </group>

          {/* Mata & kilau */}
          <mesh ref={leftEyeRef} position={[-0.25, 0.03, 0.59]}>
            <sphereGeometry args={[0.084, 16, 14]} />
            <meshToonMaterial color="#3b2347" />
            <mesh position={[0.028, 0.032, 0.068]}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </mesh>
          <mesh ref={rightEyeRef} position={[0.25, 0.03, 0.59]}>
            <sphereGeometry args={[0.084, 16, 14]} />
            <meshToonMaterial color="#3b2347" />
            <mesh position={[0.028, 0.032, 0.068]}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </mesh>

          {/* Pipi merona */}
          <mesh scale={[1.25, 0.72, 0.38]} position={[-0.4, -0.1, 0.52]}>
            <sphereGeometry args={[0.105, 14, 12]} />
            <meshToonMaterial color="#ff7aa8" />
          </mesh>
          <mesh scale={[1.25, 0.72, 0.38]} position={[0.4, -0.1, 0.52]}>
            <sphereGeometry args={[0.105, 14, 12]} />
            <meshToonMaterial color="#ff7aa8" />
          </mesh>

          {/* Hidung */}
          <mesh scale={[1.25, 0.85, 0.75]} position={[0, -0.05, 0.64]}>
            <sphereGeometry args={[0.045, 12, 10]} />
            <meshToonMaterial color="#d9487b" />
          </mesh>

          {/* Mulut */}
          <mesh position={[0, mouthY, 0.62]} rotation={[0, 0, mouthRotZ]}>
            <torusGeometry args={[0.088, 0.024, 10, 20, Math.PI]} />
            <meshToonMaterial color="#3b2347" />
          </mesh>
        </group>

        {/* Bintang bahagia saat semua tugas selesai */}
        {mood === "happy" && (
          <group ref={starsRef} position={[0, 0.55, 0]}>
            {starPositions.map((item) => (
              <mesh
                key={item.key}
                position={item.pos}
                scale={[1, 1.2, 0.45]}
              >
                <octahedronGeometry args={[0.11, 0]} />
                <meshToonMaterial color={item.color} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </Float>
  );
}

export default function Mascot3D({
  mood = "empty",
  progress = 0,
  celebrateKey = 0,
  pokeKey = 0
}) {
  const reduced = Boolean(useReducedMotion());
  const webglReady = useMemo(() => isWebGLAvailable(), []);

  if (!webglReady) {
    return <MascotFallback />;
  }

  return (
    <WebGLErrorBoundary>
      <Canvas
        flat
        dpr={[1, 2]}
        camera={{ position: [0, 1.12, 5.25], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <hemisphereLight args={["#fff6fc", "#d8c3ff", 1.38]} />
        <directionalLight position={[3.2, 5, 4.5]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-3.2, 2, 2.5]} intensity={0.55} color="#ffd2e6" />

        {/* Alas mint pastel */}
        <group position={[0, -0.82, 0]}>
          <mesh>
            <cylinderGeometry args={[1.12, 1.28, 0.24, 32]} />
            <meshToonMaterial color="#b5f0d8" />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.98, 1.02, 0.08, 32]} />
            <meshToonMaterial color="#fff5fa" />
          </mesh>
        </group>

        <ProgressRing3D progress={progress} />

        <MochiModel
          mood={mood}
          celebrateKey={celebrateKey}
          pokeKey={pokeKey}
          reduced={reduced}
        />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
