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

void place(vec3 p, float size) {
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * size / -view.z;
}
`

const galaxyShader = `${head}
void main() {
  float r = aData.x;
  float angle = aData.y - uTime * (0.05 + 0.03 / (0.3 + r));
  vec3 p = vec3(cos(angle) * r, aData.z, sin(angle) * r);
  p = vec3(p.x, 0.36 * p.y - 0.93 * p.z, 0.93 * p.y + 0.36 * p.z);
  p = vec3(0.96 * p.x - 0.28 * p.y, 0.28 * p.x + 0.96 * p.y, p.z) + vec3(3.0, 0.0, 0.0);
  place(p, 0.5 + 0.7 * aData.w);
  float core = 1.0 - smoothstep(0.0, 1.2, r);
  vColor = mix(mix(vec3(0.5, 0.3, 0.95), vec3(0.75, 0.62, 1.0), fract(aData.w * 7.31)), vec3(0.96, 0.93, 1.0), core);
  vAlpha = (0.35 + 0.65 * aData.w) * (1.0 - smoothstep(2.6, 3.6, r));
}
`

const starShader = `${head}
void main() {
  place(position, 0.4 + 0.5 * aData.w);
  vColor = vec3(0.85, 0.82, 1.0);
  vAlpha = 0.15 + 0.45 * aData.w;
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

const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

function galaxy(count: number) {
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    const r = 0.05 + Math.pow(Math.random(), 1.6) * 3.6
    const arm = i % 5 === 0 ? Math.random() * Math.PI * 2 : (i % 2) * Math.PI + r * 1.7 + (gauss() * 0.5) / (0.4 + r * 0.5)
    data.set([r, arm, gauss() * (0.04 + 0.35 * Math.exp(-r * 2.5)), Math.random()], i * 4)
  }
  return { position: new Float32Array(count * 3), data }
}

function stars(count: number) {
  const position = new Float32Array(count * 3)
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    position.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, -3 - Math.random() * 8], i * 3)
    data[i * 4 + 3] = Math.random()
  }
  return { position, data }
}

const layers = [
  { ...stars(700), vertexShader: starShader, size: 30 },
  { ...galaxy(9000), vertexShader: galaxyShader, size: 30 },
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
