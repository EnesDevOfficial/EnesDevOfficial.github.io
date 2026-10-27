import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ShaderMaterial } from 'three'

const reduced = matchMedia('(prefers-reduced-motion: reduce)')

const head = `
uniform float uTime;
uniform float uSize;
attribute vec4 aData;
varying vec3 vColor;
varying float vAlpha;

vec3 spinY(vec3 p, float a) {
  return vec3(cos(a) * p.x + sin(a) * p.z, p.y, cos(a) * p.z - sin(a) * p.x);
}

vec3 spinX(vec3 p, float a) {
  return vec3(p.x, cos(a) * p.y - sin(a) * p.z, sin(a) * p.y + cos(a) * p.z);
}

void place(vec3 p, float size) {
  vec4 view = modelViewMatrix * vec4(p + vec3(3.0, 0.0, 0.0), 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * size / -view.z;
}
`

const shellShader = `${head}
void main() {
  vec3 p = spinY(position, uTime * 0.08);
  place(p, 0.6 + 0.6 * aData.w);
  vColor = mix(vec3(0.5, 0.27, 0.92), vec3(0.72, 0.56, 1.0), fract(aData.w * 7.31));
  vAlpha = mix(0.06, 0.9, smoothstep(-2.6, 2.6, p.z));
}
`

const coreShader = `${head}
void main() {
  float radius = aData.x * (1.0 + 0.1 * sin(uTime * 0.9 - aData.x * 2.5));
  float angle = aData.z + uTime * 0.6 / (0.4 + aData.x);
  vec3 p = spinY(spinX(vec3(cos(angle) * radius, 0.0, sin(angle) * radius), aData.y), aData.w * 6.2832 - uTime * 0.05);
  place(p, 0.5 + 0.5 * fract(aData.w * 13.7));
  vColor = mix(vec3(0.9, 0.85, 1.0), vec3(0.58, 0.36, 0.98), aData.x / 2.0);
  vAlpha = mix(0.35, 1.0, smoothstep(-2.0, 2.0, p.z));
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

function shell(count: number) {
  const position = new Float32Array(count * 3)
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    position.set([2.6 * Math.sin(phi) * Math.cos(theta), 2.6 * Math.cos(phi), 2.6 * Math.sin(phi) * Math.sin(theta)], i * 3)
    data[i * 4 + 3] = Math.random()
  }
  return { position, data }
}

function core(count: number) {
  const position = new Float32Array(count * 3)
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) data.set([0.2 + Math.pow(Math.random(), 0.8) * 1.8, (Math.random() - 0.5) * Math.PI, Math.random() * Math.PI * 2, Math.random()], i * 4)
  return { position, data }
}

const layers = [
  { ...shell(3600), vertexShader: shellShader, size: 36 },
  { ...core(3000), vertexShader: coreShader, size: 32 },
]

function Dots({ position, data, vertexShader, size }: (typeof layers)[number]) {
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 0 } }), [])

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
        <bufferAttribute attach="attributes-position" args={[position, 3]} />
        <bufferAttribute attach="attributes-aData" args={[data, 4]} />
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
