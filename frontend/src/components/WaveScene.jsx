import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

// 3D Simplex noise based on classic implementation
const vertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
       return mod289(((x*34.0)+10.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v)
  { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
  
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
  
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
  
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
  
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
  
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
  
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
  
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
  
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
  
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
  
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  varying float vSize;
  varying float vElevation;

  void main() {
    vec3 pos = position;
    
    // Organic noise generation
    float noiseFreq = 0.03;
    
    vec3 noisePos = vec3(pos.x * noiseFreq, pos.y * noiseFreq, uTime * 0.15);
    float n1 = snoise(noisePos);
    
    vec3 noisePos2 = vec3(pos.x * noiseFreq * 2.0, pos.y * noiseFreq * 2.0, uTime * 0.25);
    float n2 = snoise(noisePos2);
    
    float totalNoise = n1 + n2 * 0.5;
    
    // Displace Z to create the 3D wave
    pos.z += totalNoise * 5.0;
    
    // Create an organic mask based on X position and noise
    float gradient = smoothstep(-20.0, 15.0, pos.x);
    float mask = gradient + totalNoise * 0.4;
    
    // Convert local position to world position for pointer interaction
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    float pointerDist = distance(worldPosition.xy, uPointer);
    
    // Simple mouse repulsion (push down in Z)
    float interactionRadius = 15.0;
    float falloff = smoothstep(interactionRadius, 0.0, pointerDist);
    pos.z -= falloff * 8.0;

    // Size based on the mask
    float size = smoothstep(0.2, 0.9, mask) * 11.0;
    vSize = size;
    gl_PointSize = size;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vElevation = pos.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  varying float vSize;
  varying float vElevation;

  void main() {
    if (vSize < 0.5) discard;

    float dist = abs(gl_PointCoord.x - 0.5) + abs(gl_PointCoord.y - 0.5);
    if (dist > 0.5) discard;
    
    float mixFactor = smoothstep(2.0, -6.0, vElevation);
    vec3 finalColor = mix(uColor, uColor2, mixFactor);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const WaveParticles = () => {
  const materialRef = useRef();
  const pointsRef = useRef();
  
  const targetPointer = useRef(new THREE.Vector2(-1000, -1000));
  const currentPointer = useRef(new THREE.Vector2(-1000, -1000));
  // Stable scratch Vector3 so we don't allocate every frame
  const scratchVec = useRef(new THREE.Vector3());

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#000000') },
      uColor2: { value: new THREE.Color('#10b981') }, // emerald green
      uPointer: { value: new THREE.Vector2(-1000, -1000) },
    }),
    []
  );

  useFrame((state) => {
    const { clock, pointer, camera } = state;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      
      // Reuse the same Vector3 instead of allocating a new one every frame
      scratchVec.current.set(pointer.x, pointer.y, 0).unproject(camera);
      
      targetPointer.current.set(scratchVec.current.x, scratchVec.current.y);
      currentPointer.current.lerp(targetPointer.current, 0.1);
      
      materialRef.current.uniforms.uPointer.value.copy(currentPointer.current);
    }
    
    // Animate the entire cloud gently in the center of the canvas
    if (pointsRef.current) {
      pointsRef.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 2.5;
      pointsRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.25) * 0.05;
    }
  });

  return (
    <points ref={pointsRef} rotation={[0.2, -0.4, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[80, 120, 200, 300]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </points>
  );
};

export default function WaveScene() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-white">
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 20]} zoom={20} />
        <WaveParticles />
      </Canvas>
    </div>
  );
}
