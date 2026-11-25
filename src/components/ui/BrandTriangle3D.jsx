import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { ExtrudeGeometry, Shape } from "three";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function TrianglePrism({ followMouse, mouse }) {
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
    node.rotation.y += delta * 0.22;
    if (followMouse) {
      target.current.x += (mouse.current.y * 0.26 - target.current.x) * 0.06;
      target.current.y += (mouse.current.x * 0.26 - target.current.y) * 0.06;
      node.rotation.x = target.current.x;
      node.rotation.z = target.current.y * 0.35;
    }
  });

  return (
    <Center>
      <mesh ref={mesh} geometry={geometry} rotation={[0.15, 0.4, 0]}>
        <meshStandardMaterial
          color="#88c43c"
          roughness={0.92}
          metalness={0}
          flatShading
        />
      </mesh>
    </Center>
  );
}

function Scene({ followMouse, mouse }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 3.5, 2]} intensity={0.85} />
      <TrianglePrism followMouse={followMouse} mouse={mouse} />
    </>
  );
}

export default function BrandTriangle3D({ className = "" }) {
  const { reducedMotion, canTilt } = useMotionPrefs();
  const [webgl, setWebgl] = useState(true);
  const [visible, setVisible] = useState(false);
  const hostRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const use3d = !reducedMotion && webgl && canTilt;

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
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!use3d || !visible) return undefined;
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
  }, [use3d, visible]);

  const fallback = (
    <TriangleAccent className="h-full w-full opacity-30" />
  );

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {!use3d ? (
        fallback
      ) : visible ? (
        <Suspense fallback={fallback}>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            camera={{ position: [0, 0.2, 3.2], fov: 35 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <Scene followMouse={canTilt} mouse={mouse} />
          </Canvas>
        </Suspense>
      ) : null}
    </div>
  );
}
