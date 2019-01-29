<template>
  <div class="webGL_point">
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
    'attribute float a_PointSize;\n'+//大小
    'void main() {\n' +//同C语言，都有一个main函数
    'gl_Position = a_Position;\n'+
    'gl_PointSize = a_PointSize;\n' +
    '}\n';

    //片元着色器
    let FSHADER_SOURCE =
    'precision mediump float;\n'+//精度限定词
    'uniform vec4 u_FragColor;\n'+//声明uniform变量
    'void main() {\n'+
    'gl_FragColor = u_FragColor;\n'+
    '}\n';

    //初始化着色器
    if(!this.initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
      console.log('Failed');
      return;
    }

    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');//获取变量存储位置，坐标
    let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');//大小
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');//颜色
    if(a_Position<0){
      console.log('Faild');
      return;
    }

    gl.vertexAttrib1f(a_PointSize, 15.0);//大小

    gl.clearColor(0.0,0.0,0.0,1.0);//背景色

    canvas.onmousedown = function(ev){click(ev,gl,canvas,a_Position,u_FragColor);};

    gl.clear(gl.COLOR_BUFFER_BIT);//清空canvas

    let g_points = [];
    let g_colors = [];

    //点击事件
    function click(ev, gl, canvas, a_Position, u_FragColor){
      //点击坐标获取
      let x = ev.clientX;
      let y = ev.clientY;
      let rect = ev.target.getBoundingClientRect();
      x = ((x-rect.left) - canvas.height/2)/(canvas.height/2);
      y = (canvas.width/2 - (y-rect.top))/(canvas.width/2);
      g_points.push([x,y]);

      //颜色象限随机
      if(x>=0.0 && y>=0.0){
        g_colors.push([1.0,0.0,0.0,1.0]);
      }else if(x<0.0 && y<0.0){
        g_colors.push([0.0,1.0,0.0,1.0]);
      }else{
        g_colors.push([1.0,1.0,1.0,1.0]);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);//清空

      //将每个点循环渲染出来
      let len = g_points.length;
      for(let i = 0;i <len;i++){
        let rgba = g_colors[i];
        let xy = g_points[i];
        gl.vertexAttrib3f(a_Position,xy[0],xy[1],0.0);//将位置传给a_Position变量
        gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3])//绘制颜色
        gl.drawArrays(gl.POINTS, 0, 1);//绘制，（POINTS点，从哪个顶点开始，绘制需要用到多少顶点）
      }
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
