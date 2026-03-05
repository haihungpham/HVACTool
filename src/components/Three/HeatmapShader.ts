export const HeatmapShader = {
  uniforms: {
    uData: { value: null }, // Data texture
    uMinVal: { value: 16.0 },
    uMaxVal: { value: 30.0 },
    uOpacity: { value: 0.6 },
    uMode: { value: 0 }, // 0: Temp, 1: Vel, 2: CO2
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uData;
    uniform float uMinVal;
    uniform float uMaxVal;
    uniform float uOpacity;
    uniform int uMode;

    vec3 getTempColor(float t) {
      vec3 c1 = vec3(0.0, 0.0, 1.0); // Blue
      vec3 c2 = vec3(0.0, 1.0, 1.0); // Cyan
      vec3 c3 = vec3(0.0, 1.0, 0.0); // Green
      vec3 c4 = vec3(1.0, 1.0, 0.0); // Yellow
      vec3 c5 = vec3(1.0, 0.0, 0.0); // Red
      if (t < 0.25) return mix(c1, c2, t * 4.0);
      if (t < 0.5) return mix(c2, c3, (t - 0.25) * 4.0);
      if (t < 0.75) return mix(c3, c4, (t - 0.5) * 4.0);
      return mix(c4, c5, (t - 0.75) * 4.0);
    }

    vec3 getVelColor(float t) {
      return mix(vec3(0.95, 0.95, 1.0), vec3(0.0, 0.2, 0.8), t);
    }

    vec3 getCO2Color(float t) {
      vec3 c1 = vec3(0.2, 0.8, 0.2); // Good
      vec3 c2 = vec3(1.0, 0.8, 0.0); // Warning
      vec3 c3 = vec3(1.0, 0.2, 0.0); // Danger
      if (t < 0.5) return mix(c1, c2, t * 2.0);
      return mix(c2, c3, (t - 0.5) * 2.0);
    }

    void main() {
      float val = texture2D(uData, vUv).r;
      float t = (val - uMinVal) / (uMaxVal - uMinVal);
      t = clamp(t, 0.0, 1.0);
      
      vec3 color;
      if (uMode == 0) color = getTempColor(t);
      else if (uMode == 1) color = getVelColor(t);
      else color = getCO2Color(t);

      gl_FragColor = vec4(color, uOpacity);
    }
  `,
};
