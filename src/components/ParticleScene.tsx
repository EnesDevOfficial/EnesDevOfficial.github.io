import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'motion/react'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type ShaderMaterial } from 'three'

const vertexShader = `
uniform float uTime;
uniform float uProgress;
uniform float uSize;
uniform float uShift;
attribute vec3 aWave;
attribute vec2 aRing;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotateX(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

void main() {
  vec3 sphere = rotateY(position * (1.0 + 0.05 * sin(uTime * 1.4 + aSeed * 6.28)), uTime * 0.12) + vec3(uShift, 0.0, 0.0);

  vec3 wave = aWave;
  wave.y = sin(wave.x * 0.55 + uTime * 0.9) * 0.55 + cos(wave.z * 0.45 + uTime * 0.7) * 0.55 - 1.6;

  float u = aRing.x + uTime * 0.18;
  float tube = 2.7 + 0.65 * cos(aRing.y);
  vec3 ring = rotateX(vec3(tube * cos(u), tube * sin(u), 0.65 * sin(aRing.y)), 1.15) + vec3(uShift * 1.3, 0.0, 0.0);

  float toWave = smoothstep(0.18, 0.46, uProgress);
  float toRing = smoothstep(0.56, 0.84, uProgress);
  vec3 p = mix(mix(sphere, wave, toWave), ring, toRing);

  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * (0.5 + aSeed) / -view.z;

  float tint = fract(aSeed * 7.31 + p.y * 0.08);
  vColor = mix(vec3(0.42, 0.22, 0.95), vec3(0.85, 0.55, 1.0), tint);
  vColor = mix(vColor, vec3(1.0, 0.6, 0.9), step(0.94, aSeed));
  vAlpha = (0.35 + 0.65 * aSeed) * smoothstep(-30.0, -6.0, view.z);
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.0, 0.5, d)) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a);
}
`

function createAttributes(count: number) {
  const sphere = new Float32Array(count * 3)
  const wave = new Float32Array(count * 3)
  const ring = new Float32Array(count * 2)
  const seed = new Float32Array(count)
  const side = Math.ceil(Math.sqrt(count))

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const radius = 2.6 + (Math.random() - 0.5) * 0.12
    sphere.set([radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)], i * 3)
    wave.set([((i % side) / side - 0.5) * 18, 0, (Math.floor(i / side) / side - 0.5) * 14 - 2], i * 3)
    ring.set([Math.random() * Math.PI * 2, Math.random() * Math.PI * 2], i * 2)
    seed[i] = Math.random()
  }

  return { sphere, wave, ring, seed }
}

function Particles({ progress }: { progress: MotionValue<number> }) {
  const material = useRef<ShaderMaterial>(null)
  const reduceMotion = useReducedMotion()
  const attributes = useMemo(() => createAttributes(innerWidth < 768 ? 6000 : 14000), [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uProgress: { value: 0 }, uSize: { value: 0 }, uShift: { value: innerWidth < 768 ? 0 : 3 } }), [])

  useFrame(({ camera, pointer, viewport }, delta) => {
    const { uTime, uProgress, uSize } = material.current!.uniforms
    uSize.value = 34 * viewport.dpr
    uProgress.value += (progress.get() - uProgress.value) * Math.min(delta * 4, 1)
    if (reduceMotion) return
    uTime.value += Math.min(delta, 0.1)
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.sphere, 3]} />
        <bufferAttribute attach="attributes-aWave" args={[attributes.wave, 3]} />
        <bufferAttribute attach="attributes-aRing" args={[attributes.ring, 2]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
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

export default function ParticleScene({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  return (
    <Canvas className="scene" frameloop={active ? 'always' : 'never'} dpr={[1, innerWidth < 768 ? 1.5 : 2]} camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: false }}>
      <Particles progress={progress} />
    </Canvas>
  )
}
