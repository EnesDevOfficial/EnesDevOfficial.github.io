import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type ShaderMaterial } from 'three'

export type Field = 'orbits' | 'signal'

const vertexShader = `
uniform float uTime;
uniform float uSize;
attribute vec4 aData;
varying vec3 vColor;
varying float vAlpha;

vec3 rotateX(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

void main() {
  float size = 1.0;
#ifdef ORBITS
  vec3 p;
  float glow;
  if (aData.x < 0.5) {
    float radius = 2.0 + aData.y * 0.8;
    float angle = aData.z + aData.y * 2.4 + uTime * 0.32 / (1.0 + aData.y * 0.45);
    float head = pow(fract(aData.z / 6.2832 * (1.0 + mod(aData.y, 2.0))), 12.0);
    p = rotateX(vec3(cos(angle) * radius, 0.0, sin(angle) * radius), 0.42);
    glow = 0.1 + 0.9 * head;
    size = 1.0 + 2.2 * head;
  } else if (aData.x < 1.5) {
    float angle = aData.z + uTime * 0.12 / aData.y;
    p = rotateX(vec3(cos(angle) * aData.y, (aData.w - 0.5) * 0.18, sin(angle) * aData.y), 0.42);
    glow = 0.16;
  } else {
    p = vec3((fract(aData.y * 13.1) - 0.5) * 26.0, (fract(aData.y * 7.7) - 0.5) * 16.0, -2.0 - fract(aData.z * 3.3) * 10.0);
    glow = 0.25 + 0.25 * sin(uTime * 1.5 + aData.w * 50.0);
  }
#else
  float radius = fract(aData.y + uTime * 0.05) * 7.5;
  vec3 p = rotateX(vec3(cos(aData.x) * radius, sin(radius * 1.4 - uTime) * 0.1, sin(aData.x) * radius), 0.28) + vec3(0.0, -2.6, 0.0);
  float glow = smoothstep(0.0, 1.0, radius) * (1.0 - radius / 7.5);
#endif
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * size * (0.5 + aData.w) / -view.z;
  vColor = mix(vec3(0.42, 0.22, 0.95), vec3(0.88, 0.58, 1.0), fract(aData.w * 7.31));
  vAlpha = glow * (0.4 + 0.6 * aData.w);
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float a = (1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5))) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a);
}
`

const orbitPoint = (i: number, count: number) => {
  const share = i / count
  if (share < 0.45) return [0, i % 6, Math.random() * Math.PI * 2]
  if (share < 0.87) return [1, 1.8 + Math.random() * 5, Math.random() * Math.PI * 2]
  return [2, Math.random(), Math.random()]
}

const signalPoint = () => [Math.random() * Math.PI * 2, Math.floor(Math.random() * 7) / 7, 0]

function createData(field: Field, count: number) {
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) data.set([...(field === 'orbits' ? orbitPoint(i, count) : signalPoint()), Math.random()], i * 4)
  return data
}

function Points({ field }: { field: Field }) {
  const material = useRef<ShaderMaterial>(null)
  const reduceMotion = useReducedMotion()
  const count = (field === 'orbits' ? 10000 : 6000) / (innerWidth < 768 ? 2 : 1)
  const data = useMemo(() => createData(field, count), [field, count])
  const position = useMemo(() => new Float32Array(count * 3), [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 0 } }), [])

  useFrame(({ camera, pointer, viewport, size }, delta) => {
    const { uTime, uSize } = material.current!.uniforms
    const fit = Math.max(1, 0.85 / (size.width / size.height))
    uSize.value = 34 * viewport.dpr * fit
    camera.position.z = 9 * fit
    if (reduceMotion) return
    uTime.value += Math.min(delta, 0.1)
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[position, 3]} />
        <bufferAttribute attach="attributes-aData" args={[data, 4]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        defines={{ [field.toUpperCase()]: '' }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={AdditiveBlending}
        depthWrite={false}
        depthTest={false}
        transparent
      />
    </points>
  )
}

export default function FieldScene({ field }: { field: Field }) {
  return (
    <Canvas eventSource={document.getElementById('root')!} eventPrefix="client" dpr={[1, innerWidth < 768 ? 1.5 : 2]} camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: false }}>
      <Points field={field} />
    </Canvas>
  )
}
