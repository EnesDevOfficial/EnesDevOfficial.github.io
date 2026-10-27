import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ShaderMaterial } from 'three'

const reduced = matchMedia('(prefers-reduced-motion: reduce)')

const vertexShader = `
uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uTilt;
uniform float uRadius;
uniform float uDim;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float c = cos(uTime * uSpeed);
  float s = sin(uTime * uSpeed);
  vec3 p = vec3(c * position.x + s * position.z, position.y, c * position.z - s * position.x);
  float t = cos(uTilt);
  float u = sin(uTilt);
  p = vec3(p.x, t * p.y - u * p.z, u * p.y + t * p.z);
  vec4 view = modelViewMatrix * vec4(p + vec3(3.0, 0.0, 0.0), 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * (0.6 + 0.6 * aSeed) / -view.z;
  vColor = mix(vec3(0.5, 0.27, 0.92), vec3(0.78, 0.66, 1.0), fract(aSeed * 7.31));
  vAlpha = uDim * mix(0.1, 1.0, smoothstep(-uRadius, uRadius, p.z));
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float a = smoothstep(0.5, 0.36, length(gl_PointCoord - 0.5)) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a);
}
`

const shell = (count: number, radius: number) => {
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    points.set([radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)], i * 3)
  }
  return points
}

const ring = (count: number, radius: number) => {
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const r = radius + (Math.random() - 0.5) * 0.18
    points.set([Math.cos(angle) * r, (Math.random() - 0.5) * 0.05, Math.sin(angle) * r], i * 3)
  }
  return points
}

const layers = [
  { points: shell(4800, 2.6), radius: 2.6, speed: 0.08, tilt: 0, size: 36, dim: 0.95 },
  { points: shell(900, 3.05), radius: 3.05, speed: -0.04, tilt: 0.4, size: 22, dim: 0.35 },
  { points: ring(1400, 3.55), radius: 3.55, speed: 0.14, tilt: 1.22, size: 30, dim: 0.85 },
]

function Dots({ points, radius, speed, tilt, size, dim }: (typeof layers)[number]) {
  const material = useRef<ShaderMaterial>(null)
  const seeds = useMemo(() => Float32Array.from({ length: points.length / 3 }, Math.random), [points])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 0 }, uSpeed: { value: speed }, uTilt: { value: tilt }, uRadius: { value: radius }, uDim: { value: dim } }), [speed, tilt, radius, dim])

  useFrame(({ camera, viewport, size: canvas }, delta) => {
    const { uTime, uSize } = material.current!.uniforms
    const fit = Math.max(1, 1.5 / (canvas.width / canvas.height))
    uSize.value = size * viewport.dpr * fit
    camera.position.z = 9 * fit
    if (!reduced.matches) uTime.value += Math.min(delta, 0.1)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthWrite={false} depthTest={false} transparent />
    </points>
  )
}

export default function ParticleScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(wrap.current!)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrap} className="orb" aria-hidden="true">
      <Canvas style={{ pointerEvents: 'none' }} frameloop={visible && !reduced.matches ? 'always' : 'demand'} dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: false }}>
        {layers.map((layer, i) => (
          <Dots key={i} {...layer} />
        ))}
      </Canvas>
    </div>
  )
}
