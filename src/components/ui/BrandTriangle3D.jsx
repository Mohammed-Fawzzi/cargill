import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { ExtrudeGeometry, Shape } from "three";
import LogoTriangle from "@/components/ui/LogoTriangle";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function TrianglePrism({ followMouse, mouse, scrollTwist = 0, spin = 0.22 }) {
  const mesh = useRef(null);
  const target = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 1.1);
    shape.lineTo(-1, -0.75);
    shape.lineTo(1, -0.75);
    shape.closePath();
    const geo = new ExtrudeGeometry(shape, {
      depth: 0.28,
      bevelEnabled: false,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;
    node.rotation.y += delta * spin;
    const twist = (Number(scrollTwist) || 0) * (Math.PI / 180);
    if (followMouse) {
      target.current.x += (mouse.current.y * 0.26 - target.current.x) * 0.06;
      target.current.y += (mouse.current.x * 0.26 - target.current.y) * 0.06;
      node.rotation.x = target.current.x + twist * 0.35;
      node.rotation.z = target.current.y * 0.35 + twist;
    } else {
      node.rotation.x = 0.15 + twist * 0.35;
      node.rotation.z = twist;
    }
  });

  return (
    <Center>
      <mesh ref={mesh} geometry={geometry} rotation={[0.15, 0.4, 0]}>
        <meshStandardMaterial
          color="#8CC63F"
          roughness={0.88}
          metalness={0.05}
          flatShading
        />
      </mesh>
    </Center>
  );
}

function Scene({ followMouse, mouse, scrollTwist, softLight, spin }) {
  return (
    <>
      <ambientLight intensity={softLight ? 0.35 : 0.55} />
      <directionalLight
        position={[2.5, 3.5, 2]}
        intensity={softLight ? 0.55 : 0.85}
      />
      <TrianglePrism
        followMouse={followMouse}
        mouse={mouse}
        scrollTwist={scrollTwist}
        spin={spin}
      />
    </>
  );
}

export default function BrandTriangle3D({
  className = "",
  scrollTwist = 0,
  softLight = false,
  spin = 0.22,
  followMouse: followMouseProp,
}) {
  const { reducedMotion, canTilt } = useMotionPrefs();
  const [webgl, setWebgl] = useState(true);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const hostRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const followMouse =
    followMouseProp === undefined ? canTilt : Boolean(followMouseProp);
  const use3d = !reducedMotion && webgl;

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ok = !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
      setWebgl(ok);
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "200px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!use3d || !visible || !followMouse) return undefined;
    const onMove = (event) => {
      const node = hostRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      mouse.current = {
        x: Math.max(-1, Math.min(1, px)),
        y: Math.max(-1, Math.min(1, py)),
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [use3d, visible, followMouse]);

  return (
    <div ref={hostRef} className={`relative ${className}`} aria-hidden="true">
      <LogoTriangle
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
      {use3d && visible ? (
        <Suspense fallback={null}>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            camera={{ position: [0, 0.2, 3.2], fov: 35 }}
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              opacity: ready ? 1 : 0,
            }}
            onCreated={() => setReady(true)}
          >
            <Scene
              followMouse={followMouse && canTilt}
              mouse={mouse}
              scrollTwist={scrollTwist}
              softLight={softLight}
              spin={reducedMotion ? 0 : spin}
            />
          </Canvas>
        </Suspense>
      ) : null}
    </div>
  );
}
