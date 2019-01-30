<template>
  <div class="webGL_multPoint">
    <canvas id="webgl" width="500" height="500"></canvas>
  </div>
</template>

<script type="ts">
//辅助插件
import WebGLUtils from '../lib/webgl-utils.js';
import WebGLDebugUtils from '../lib/webgl-debug.js';

export default {
  name: 'about',
  data () {
    return {
      message: 1
    }
  },
  components: {
    WebGLUtils,WebGLDebugUtils
  },
  mounted(){
    let canvas = document.getElementById('webgl');//获取canvas元素
    let gl = this.getWebGLContext(canvas);//获取webgl上下文 getWebGLContext辅助函数，后续会提到
    if(!gl){//判断是否支持webGL
      console.log('failed WebGL');
      return;
    }

    //使用GLSL ES语言，预先处理成单个字符串形式给webGL引擎解析，拼接以\n结束，有助于检查源代码错误
    //顶点着色器
    let VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+//声明attribute变量（存储限定符+类型+变量名）位置
    'void main() {\n' +//同C语言，都有一个main函数
    'gl_Position = a_Position;\n'+
    '}\n';

    //片元着色器
    let FSHADER_SOURCE =
    'void main() {\n'+
    'gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'+
    '}\n';

    //初始化着色器
    if(!this.initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
      console.log('Failed');
      return;
    }
    //设置顶点位置
    let n = initVertexBuffers(gl);
    if(n<0){
      console.log('Faild');
      return;
    }

    gl.clearColor(0.0,0.0,0.0,1.0);//背景色

    gl.clear(gl.COLOR_BUFFER_BIT);//清空

    gl.drawArrays(gl.TRIANGLES, 0, n);//绘制，（POINTS点，从哪个顶点开始，绘制需要用到多少顶点）

    function initVertexBuffers(gl){
      let vertices = new Float32Array([//类型化数组，单精度32位浮点数
        0.0,0.5,-0.5,-0.5,0.5,-0.5
      ]);
      let n = 3;//点数
      //创建缓冲区对象
      let vertexBuffer = gl.createBuffer();
      if(!vertexBuffer){
        console.log('Faild');
        return;
      }
      //将缓冲区对象绑定到目标
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
      //向缓冲区对象中写入数据
      gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
      let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      //将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
      //开启attribute变量
      gl.enableVertexAttribArray(a_Position);
      return n;
    }

  },
  methods:{
    //辅助插件
    getWebGLContext(canvas, opt_debug) {
      // Get the rendering context for WebGL
      var gl = WebGLUtils.setupWebGL(canvas);
      if (!gl) return null;

      // if opt_debug is explicitly false, create the context for debugging
      if (arguments.length < 2 || opt_debug) {
        gl = WebGLDebugUtils.makeDebugContext(gl);
      }

      return gl;
    },
    initShaders(gl, vshader, fshader) {
      var program = this.createProgram(gl, vshader, fshader);
      if (!program) {
        console.log('Failed to create program');
        return false;
      }

      gl.useProgram(program);
      gl.program = program;

      return true;
    },
    createProgram(gl, vshader, fshader) {
      // Create shader object
      var vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vshader);
      var fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fshader);
      if (!vertexShader || !fragmentShader) {
        return null;
      }

      // Create a program object
      var program = gl.createProgram();
      if (!program) {
        return null;
      }

      // Attach the shader objects
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);

      // Link the program object
      gl.linkProgram(program);

      // Check the result of linking
      var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log('Failed to link program: ' + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
      }
      return program;
    },
    loadShader(gl, type, source) {
      // Create shader object
      var shader = gl.createShader(type);
      if (shader == null) {
        console.log('unable to create shader');
        return null;
      }

      // Set the shader program
      gl.shaderSource(shader, source);

      // Compile the shader
      gl.compileShader(shader);

      // Check the result of compilation
      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }
  }
};
</script>
