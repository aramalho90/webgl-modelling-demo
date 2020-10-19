var gl;

var canvas;
var offset=1;
var step=0;
var arm_offset=0;
var arm_rot=-20;
var base_rot=Math.PI;
// GLSL programs
var program;

// Render Mode
var WIREFRAME=1;
var FILLED=2;
var renderMode = WIREFRAME;

var projection;
var modelView;
var view;

matrixStack = [];

function pushMatrix()
{
    matrixStack.push(mat4(modelView[0], modelView[1], modelView[2], modelView[3]));
}

function popMatrix() 
{
    modelView = matrixStack.pop();
}

function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}

function multRotX(angle) {
    modelView = mult(modelView, rotateX(angle));
}

function multRotY(angle) {
    modelView = mult(modelView, rotateY(angle));
}

function multRotZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

function multMatrix(m) {
    modelView = mult(modelView, m);
}
function multScale(s) {
    modelView = mult(modelView, scalem(s));
}

function initialize() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    
    program = initShaders(gl, "vertex-shader-2", "fragment-shader-2");
    
    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    
    setupProjection();
    setupView();
}

function setupProjection() {
    projection = perspective(60, 1, 0.1, 100);
    //projection = ortho(-1,1,-1,1,0.1,100);
}

function setupView() {
    view = lookAt([0,0,5], [0,0,0], [0,1,0]);
    modelView = mat4(view[0], view[1], view[2], view[3]);
}

function setMaterialColor(color) {
    var uColor = gl.getUniformLocation(program, "color");
    gl.uniform3fv(uColor, color);
}

function sendMatrices()
{
    // Send the current model view matrix
    var mView = gl.getUniformLocation(program, "mView");
    gl.uniformMatrix4fv(mView, false, flatten(view));
    
    // Send the normals transformation matrix
    var mViewVectors = gl.getUniformLocation(program, "mViewVectors");
    gl.uniformMatrix4fv(mViewVectors, false, flatten(normalMatrix(view, false)));  

    // Send the current model view matrix
    var mModelView = gl.getUniformLocation(program, "mModelView");
    gl.uniformMatrix4fv(mModelView, false, flatten(modelView));
    
    // Send the normals transformation matrix
    var mNormals = gl.getUniformLocation(program, "mNormals");
    gl.uniformMatrix4fv(mNormals, false, flatten(normalMatrix(modelView, false)));  
}

function draw_sphere(color)
{
    setMaterialColor(color);
    sendMatrices();
    sphereDrawFilled(gl, program);
}

function draw_cube(color)
{
    setMaterialColor(color);
    sendMatrices();
    cubeDrawFilled(gl, program);
}

function draw_cylinder(color)
{
    setMaterialColor(color);
    sendMatrices();
    cylinderDrawFilled(gl, program);
}

function draw_scene()
{
 	
	pushMatrix();
		multTranslation([step,0,0]); //Movimento do carro
		pushMatrix();
			multRotY(base_rot);//Rotacao da base da grua
            
			pushMatrix();
			//Braço
				
				multTranslation([0,1,0]);
				
				pushMatrix();
				multScale([0.25,0.25,0.25]);
				multRotX(90);
				draw_cylinder([0,1,0]);
				popMatrix();

				pushMatrix();
					//multTranslation([0.1,0,0]);
			         multRotZ(arm_rot); //Rotacao do braço
					pushMatrix();
					multTranslation([offset,0,0]);
					multScale([1,0.15,0.2]);
					multTranslation([arm_offset,0,0]); //Extensao do braço
					draw_cube([1,0,0]);
					popMatrix();
			
					pushMatrix();
					multScale([1,0.2,0.24]);
					multTranslation([0.5,0,0]);
					draw_cube([1,0,0]);
					popMatrix();
				
				popMatrix();
    
			popMatrix();
			

			
			pushMatrix();
			multTranslation([0,-0.3,0]);
			multScale([0.2,2.5,0.24]);
			draw_cube([1,0,0]);
			popMatrix();
			
		popMatrix();
		
			//Carro
		pushMatrix();
			//Roda esq
			pushMatrix();
			multTranslation([-0.5,-2,0.1]);
			multScale([0.2,0.2,0.5]);
			multRotX(90);
			draw_cylinder([1,1,0]);
			popMatrix();
			//Roda dir
			pushMatrix();
			multTranslation([0.5,-2,0.1]);
			multScale([0.2,0.2,0.5]);
			multRotX(90);
			draw_cylinder([1,1,0]);
			popMatrix();
			//Base do carro
			pushMatrix();
			multTranslation([0,-1.9,0.1]);
			multScale([1.5,0.2,0.4]);
			draw_cube([1,0,0]);
			popMatrix();
			
		popMatrix();
		
        //Base da grua
			pushMatrix();
			multTranslation([0,-1.7,-0.1]);
			multScale([0.5,0.2,0.5]);
			draw_cylinder([0,1,0]);
			popMatrix();
    
	popMatrix();
	
	
	//Chão
	pushMatrix();
	multScale([5,1.5,4]);
	multTranslation([0,-2,0]);
	draw_cube([0.5,0.5,0.5]);
	popMatrix();

	
	
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    
    setupView();
    
    // Send the current projection matrix
    var mProjection = gl.getUniformLocation(program, "mProjection");
    gl.uniformMatrix4fv(mProjection, false, flatten(projection));
        
    draw_scene();
    
    requestAnimFrame(render);
}


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    initialize();
            
    render();
}

window.addEventListener("keydown", moveSomething, false);

function moveSomething(e) {
    switch(e.keyCode) {
        case 37: // left arrow
           if(step>-1.5) step-=0.1;
            break;
        case 39: // right arrow
            if(step<1.5) step+=0.1;
            break;
        case 38:
            // up arrow
           if(arm_rot>-160) arm_rot-=1;
            break;
        case 40:
            // down arrow
            if(arm_rot<-20) arm_rot+=1;
            break;
        case 79:
            // O button
           if(arm_offset>-0.35) arm_offset-=0.01;
            break;
        case 80:
            // P button
          if(arm_offset<0.5) arm_offset+=0.01;
            break;
            
        case 81:
            // Q button
            base_rot-=1;
            break;
        case 87:
            // W button
            base_rot+=1;
            break;    
            
    }   
}