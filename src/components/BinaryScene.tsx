import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, CanvasTexture, type ShaderMaterial } from 'three'

const vertexShader = `
uniform float uTime;
uniform float uProgress;
uniform float uSize;
uniform float uShift;
attribute vec3 aTunnel;
attribute vec3 aSphere;
attribute vec3 aInfo;
varying float vGlyph;
varying float vAlpha;
varying float vBright;

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

void main() {
  vec3 rain = position;
  rain.y = mod(aInfo.x * 26.0 - uTime * (2.0 + aInfo.x * 4.0) + position.y, 26.0) - 13.0;

  float angle = aTunnel.x + uTime * 0.35;
  vec3 tunnel = vec3(cos(angle) * aTunnel.y, sin(angle) * aTunnel.y, mod(aTunnel.z + uTime * 5.0, 42.0) - 36.0);

  vec3 sphere = rotateY(aSphere, uTime * 0.2 + uProgress * 3.0) + vec3(uShift, 0.0, -2.0);

  float toTunnel = smoothstep(0.12, 0.42, uProgress);
  float toSphere = smoothstep(0.5, 0.82, uProgress);
  vec3 p = mix(mix(rain, tunnel, toTunnel), sphere, toSphere);

  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = min(uSize * (0.7 + aInfo.z * 0.6) / -view.z, 72.0);

  vGlyph = step(0.5, fract(aInfo.z * 91.7 + floor(uTime * (0.4 + aInfo.z * 2.0)) * 0.37));
  vBright = mix(1.0 - aInfo.y, 0.45 + 0.55 * aInfo.z, toTunnel) * (1.0 - toSphere * 0.45);
  vAlpha = 0.8 * (0.6 + 0.4 * sin(uTime * (2.0 + aInfo.z * 6.0) + aInfo.z * 40.0))
    * smoothstep(-42.0, -8.0, view.z)
    * (1.0 - smoothstep(-2.5, -0.6, view.z));
}
`

const fragmentShader = `
uniform sampler2D uAtlas;
varying float vGlyph;
varying float vAlpha;
varying float vBright;

void main() {
  vec2 uv = vec2((gl_PointCoord.x + vGlyph) * 0.5, 1.0 - gl_PointCoord.y);
  float a = texture2D(uAtlas, uv).r * vAlpha * vBright;
  if (a < 0.02) discard;
  vec3 color = mix(vec3(0.0, 1.0, 0.4), vec3(0.85, 1.0, 0.9), pow(vBright, 8.0));
  gl_FragColor = vec4(color, a);
}
`

const trail = 14

function createAtlas() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const context = canvas.getContext('2d')!
  context.fillStyle = '#fff'
  context.font = 'bold 54px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('0', 32, 34)
  context.fillText('1', 96, 34)
  return new CanvasTexture(canvas)
}

function createAttributes(columns: number) {
  const count = columns * trail
  const position = new Float32Array(count * 3)
  const tunnel = new Float32Array(count * 3)
  const sphere = new Float32Array(count * 3)
  const info = new Float32Array(count * 3)

  for (let column = 0; column < columns; column++) {
    const x = Math.round(Math.random() * 56 - 28) * 0.5
    const z = Math.random() * -20 + 2
    const seed = Math.random()
    for (let step = 0; step < trail; step++) {
      const i = (column * trail + step) * 3
      const phi = Math.acos(1 - (2 * (i / 3 + 0.5)) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i / 3)
      position.set([x, step * 0.55, z], i)
      tunnel.set([Math.random() * Math.PI * 2, 2.4 + Math.random() * 1.8, Math.random() * -42], i)
      sphere.set([4.2 * Math.sin(phi) * Math.cos(theta), 4.2 * Math.cos(phi), 4.2 * Math.sin(phi) * Math.sin(theta)], i)
      info.set([seed, step / trail, Math.random()], i)
    }
  }

  return { position, tunnel, sphere, info }
}

function Digits({ progress }: { progress: MotionValue<number> }) {
  const material = useRef<ShaderMaterial>(null)
  const reduceMotion = useReducedMotion()
  const attributes = useMemo(() => createAttributes(innerWidth < 768 ? 160 : 420), [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uProgress: { value: 0 }, uSize: { value: 260 }, uShift: { value: innerWidth < 768 ? 0 : 3.5 }, uAtlas: { value: createAtlas() } }), [])

  useEffect(() => () => uniforms.uAtlas.value.dispose(), [uniforms])

  useFrame(({ camera, pointer, viewport }, delta) => {
    const { uTime, uProgress, uSize } = material.current!.uniforms
    uSize.value = 260 * viewport.dpr
    uProgress.value += (progress.get() - uProgress.value) * Math.min(delta * 4, 1)
    if (reduceMotion) return
    uTime.value += delta
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.04
    camera.lookAt(0, 0, -4)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.position, 3]} />
        <bufferAttribute attach="attributes-aTunnel" args={[attributes.tunnel, 3]} />
        <bufferAttribute attach="attributes-aSphere" args={[attributes.sphere, 3]} />
        <bufferAttribute attach="attributes-aInfo" args={[attributes.info, 3]} />
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

export default function BinaryScene({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  return (
    <Canvas className="scene" frameloop={active ? 'always' : 'never'} dpr={[1, innerWidth < 768 ? 1.5 : 2]} camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: false }}>
      <Digits progress={progress} />
    </Canvas>
  )
}
