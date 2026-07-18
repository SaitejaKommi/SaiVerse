'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WaterProps {
  position?: [number, number, number]
  size?: [number, number]
  color?: string
  opacity?: number
}

export function Water({
  position = [0, -0.1, 0],
  size = [40, 40],
  color = '#1a5276',
  opacity = 0.75,
}: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  const [width, depth] = size

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, 64, 64)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [width, depth])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3) },
        uCameraPos: { value: new THREE.Vector3(0, 10, 0) },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vHeight;

        void main() {
          vec3 pos = position;
          float wave1 = sin(pos.x * 0.3 + uTime * 0.8) * 0.15;
          float wave2 = sin(pos.z * 0.5 + uTime * 1.2 + 1.0) * 0.1;
          float wave3 = sin((pos.x + pos.z) * 0.2 + uTime * 0.5) * 0.08;
          float wave4 = sin(pos.x * 0.7 + pos.z * 0.4 + uTime * 1.5) * 0.06;
          pos.y += wave1 + wave2 + wave3 + wave4;
          vHeight = pos.y;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;

          vec3 tangent1 = normalize(vec3(
            1.0,
            cos(pos.x * 0.3 + uTime * 0.8) * 0.3 * 0.15 +
            cos((pos.x + pos.z) * 0.2 + uTime * 0.5) * 0.2 * 0.08 +
            cos(pos.x * 0.7 + pos.z * 0.4 + uTime * 1.5) * 0.7 * 0.06,
            0.0
          ));
          vec3 tangent2 = normalize(vec3(
            0.0,
            cos(pos.z * 0.5 + uTime * 1.2 + 1.0) * 0.5 * 0.1 +
            cos((pos.x + pos.z) * 0.2 + uTime * 0.5) * 0.2 * 0.08 +
            cos(pos.x * 0.7 + pos.z * 0.4 + uTime * 1.5) * 0.4 * 0.06,
            1.0
          ));
          vNormal = normalize(cross(tangent2, tangent1));

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform vec3 uSunDirection;
        uniform vec3 uCameraPos;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vHeight;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(uCameraPos - vWorldPosition);
          vec3 lightDir = normalize(uSunDirection);

          float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
          fresnel = pow(fresnel, 3.0);

          vec3 reflectionColor = vec3(0.6, 0.75, 0.9);
          vec3 deepColor = vec3(0.05, 0.15, 0.35);

          float diff = max(dot(normal, lightDir), 0.0) * 0.4 + 0.3;
          float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 32.0);

          vec3 baseColor = mix(deepColor, uColor, 0.5 + vHeight * 2.0);
          vec3 finalColor = mix(baseColor, reflectionColor, fresnel * 0.6);
          finalColor = finalColor * diff + vec3(1.0) * spec * 0.5;
          finalColor += vec3(0.3, 0.5, 0.7) * fresnel * 0.15;

          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [color, opacity])

  useFrame((state) => {
    timeRef.current += state.clock.getDelta() * 0.6
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial
    const uTime = mat.uniforms['uTime']
    const uCamPos = mat.uniforms['uCameraPos']
    const uSunDir = mat.uniforms['uSunDirection']
    if (uTime) uTime.value = timeRef.current
    if (uCamPos) uCamPos.value.copy(state.camera.position)
    if (uSunDir) uSunDir.value.set(0.5, 0.8, 0.3).normalize()
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      receiveShadow
    />
  )
}
