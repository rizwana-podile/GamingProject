/**
 * Aetheria Engine - WebGL Custom Shader Program Library
 * Vertex and fragment shader GLSL sources for CRT scanlines, Bloom glow,
 * chromatic aberration, glitch post-processing, and dynamic water ripples.
 */

const SHADER_LIBRARY = {
  vertexShaders: {
    standard2D: `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
      }
    `,

    waveDistortion3D: `
      attribute vec3 a_position;
      attribute vec2 a_texCoord;
      uniform mat4 u_matrix;
      uniform float u_time;
      varying vec2 v_texCoord;
      varying float v_wave;
      
      void main() {
        vec3 pos = a_position;
        float wave = sin(pos.x * 0.1 + u_time * 3.0) * cos(pos.z * 0.1 + u_time * 3.0) * 0.5;
        pos.y += wave;
        gl_Position = u_matrix * vec4(pos, 1.0);
        v_texCoord = a_texCoord;
        v_wave = wave;
      }
    `
  },

  fragmentShaders: {
    crtScanlineBloom: `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float u_time;
      varying vec2 v_texCoord;

      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        
        // CRT Scanline effect
        float scanline = sin(v_texCoord.y * 800.0) * 0.04;
        color.rgb -= scanline;
        
        // Chromatic Aberration
        float offset = 0.003 * sin(u_time * 2.0);
        float r = texture2D(u_image, vec2(v_texCoord.x + offset, v_texCoord.y)).r;
        float b = texture2D(u_image, vec2(v_texCoord.x - offset, v_texCoord.y)).b;
        color.r = r;
        color.b = b;

        // Vignette
        vec2 uv = v_texCoord * (1.0 - v_texCoord.yx);
        float vig = uv.x * uv.y * 15.0;
        vig = pow(vig, 0.25);
        color.rgb *= vig;

        gl_FragColor = color;
      }
    `,

    cyberGlitch: `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float u_time;
      uniform float u_glitchAmount;
      varying vec2 v_texCoord;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = v_texCoord;
        float noise = rand(vec2(floor(uv.y * 50.0), u_time));
        
        if (noise < u_glitchAmount) {
          uv.x += (rand(vec2(u_time, uv.y)) - 0.5) * 0.05;
        }

        vec4 col = texture2D(u_image, uv);
        gl_FragColor = col;
      }
    `
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SHADER_LIBRARY;
}
