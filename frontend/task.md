# Task: Implement Animated Halftone Wave for Auth Layout

## Objective
Create a split-screen authentication layout featuring a static form on the left and a dynamic, animated 3D particle wave (halftone effect) on the right, matching the reference design.

## Tech Stack
*   **Framework:** React
*   **Styling:** Tailwind CSS
*   **3D Graphics:** `three`, `@react-three/fiber`, `@react-three/drei`

## Layout Specifications
1.  **Main Container:** Full viewport height (`h-screen`), flex or grid layout to divide the screen.
2.  **Left Column (Form):** White background, center-aligned flexbox containing the login/signup form fields, styled with Tailwind CSS.
3.  **Right Column (Visual):** Relative container, taking up the remaining width, overflowing hidden, hosting the `<Canvas>` component from React Three Fiber.

## Animation Specifications (Three.js / GLSL)
The visual relies on a custom shader manipulating a dense grid of points to create a flowing, liquid-like wave of halftone dots.

### 1. Geometry
*   Use a `PlaneGeometry` with high segment density (e.g., `args={[10, 10, 128, 128]}`).
*   Render the geometry using `<points>`.

### 2. Material & Shaders
*   Use a `shaderMaterial`.
*   **Uniforms:** 
    *   `uTime`: Updated every frame to drive the wave animation.
    *   `uColor`: Set to pure black (`#000000`).
*   **Vertex Shader:**
    *   Import a classic 3D Perlin Noise or Simplex Noise function.
    *   Calculate the `z` displacement of each vertex based on its `x` and `y` coordinates combined with `uTime`.
    *   Calculate the point size (`gl_PointSize`). The size should ideally scale dynamically based on the camera distance or the noise value to enhance the halftone illusion.
*   **Fragment Shader:**
    *   Render the points as sharp squares (or circles, using `distance(gl_PointCoord, vec2(0.5))`).
    *   Apply the `uColor`.

### 3. Animation Loop
*   Use the `useFrame((state) => { ... })` hook from `@react-three/fiber` to increment the `uTime` uniform on the shader material reference during every render tick.

## Implementation Steps for the Agent

1.  **Initialize Dependencies:**
    ```bash
    npm install three @react-three/fiber @react-three/drei
    ```

2.  **Scaffold the UI:**
    Create `AuthLayout.jsx` with a two-column Tailwind layout. 

3.  **Build the Scene:**
    Create `WaveParticleScene.jsx`. Set up the R3F `<Canvas>` with an `OrthographicCamera` or a carefully positioned `PerspectiveCamera`.

4.  **Write the Shaders:**
    Define the GLSL vertex and fragment shaders. Focus on smooth, slow-rolling noise algorithms in the vertex shader.

5.  **Integrate and Polish:**
    Mount the scene in the right column of the layout. Adjust the camera angle, point density, and noise frequency until the wave closely matches the organic, dotted flow of the reference image.