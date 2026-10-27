import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ShaderMaterial } from 'three'

const reduced = matchMedia('(prefers-reduced-motion: reduce)')

const vertexShader = `
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float c = cos(uTime);
  float s = sin(uTime);
  vec3 p = vec3(c * position.x + s * position.z, position.y, c * position.z - s * position.x);
  vec4 view = modelViewMatrix * vec4(p + vec3(3.0, 0.0, 0.0), 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * (0.6 + 0.6 * aSeed) / -view.z;
  vColor = mix(vec3(0.5, 0.27, 0.92), vec3(0.72, 0.56, 1.0), fract(aSeed * 7.31));
  vAlpha = mix(0.12, 0.95, smoothstep(-2.6, 2.6, p.z));
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

function createAttributes(count: number) {
  const sphere = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    sphere.set([2.6 * Math.sin(phi) * Math.cos(theta), 2.6 * Math.cos(phi), 2.6 * Math.sin(phi) * Math.sin(theta)], i * 3)
    seed[i] = Math.random()
  }
  return { sphere, seed }
}

function Sphere() {
  const material = useRef<ShaderMaterial>(null)
  const attributes = useMemo(() => createAttributes(4800), [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 0 } }), [])

  useFrame(({ camera, viewport, size }, delta) => {
    const { uTime, uSize } = material.current!.uniforms
    const fit = Math.max(1, 1.5 / (size.width / size.height))
    uSize.value = 36 * viewport.dpr * fit
    camera.position.z = 9 * fit
    if (!reduced.matches) uTime.value += Math.min(delta, 0.1) * 0.08
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.sphere, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seed, 1]} />
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
        <Sphere />
      </Canvas>
    </div>
  )
}
