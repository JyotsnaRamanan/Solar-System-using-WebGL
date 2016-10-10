var gl;
var aspect = 1.0;
var moveX = 0.0;
var moveZ = -30.0;
var angle = 0.0;
var baseRotation = mat4();

var trackedPlanet = -1;
var topView = false;


var theAngle = 0.0;
var theAxis = [];

var theTrackingMove = false;
var theScalingMove = false;

var	theLastPos = [];
var	theCurtX, theCurtY;
var	theStartX, theStartY;
var	theCurtQuat = [1, 0, 0, 0];
var	theScale = 1.0;
var theInit = true;

var speed = 1;

var EARTH_BASE_RADIUS = 0.4;
var EARTH_BASE_POSITION = 3.5;
var EARTH_BASE_ORBIT_SPEED = 0.3 * speed;

var POLYGON_COUNT = 30;

var eye = vec3(0.0, 0.0, -10.0);
var at = vec3(0.0, 0.0, 0.0001);
var up = vec3(0.0, 1.0, 0.0);




  ////////////////////
 //    MERCURY     //
////////////////////

var mercuryVBOPoints;
var mercuryProgram;
var mercuryPoints = [];
var mercuryOrbit = mat4();
var mercuryCenter = vec3(EARTH_BASE_POSITION * 0.313, 0.0, 0.0);

var mercuryCurPos = mercuryCenter;

function initMercury() {
    mercuryProgram = initShaders(gl, 'mercury-vertex-shader', 'mercury-fragment-shader');
    gl.useProgram(mercuryProgram);
    createSphere(EARTH_BASE_RADIUS * 0.38, POLYGON_COUNT, POLYGON_COUNT, mercuryPoints, mercuryCenter);

    gl.activeTexture(gl.TEXTURE0);


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["mercury_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["mercury_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["mercury_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["mercury_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["mercury_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["mercury_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

    mercuryVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mercuryVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(mercuryPoints), gl.STATIC_DRAW);
}

function drawMercury(p, mv) {
    gl.activeTexture(gl.TEXTURE0);
    gl.useProgram(mercuryProgram);

    mercuryOrbit = mult(mercuryOrbit, rotate(EARTH_BASE_ORBIT_SPEED / 0.241, vec3(0.0, 1.0, 0.0)));
    mv = mult(mv, mercuryOrbit);
    mercuryCurPos = curPlanetLocation(mv, mercuryCenter);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(mercuryProgram, "projectionMatrix"),
        false, flatten(p));
       
    gl.uniformMatrix4fv( gl.getUniformLocation(mercuryProgram, "modelViewMatrix"), 
        false, flatten(mv));

    gl.uniform1i(gl.getUniformLocation(mercuryProgram, "texMap"), 0);

    gl.uniform3fv(gl.getUniformLocation(mercuryProgram, "vCenter"), mercuryCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(mercuryProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, mercuryVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, mercuryPoints.length);
}


  ////////////////////
 //    VENUS       //
////////////////////

var venusVBOPoints;
var venusProgram;
var venusPoints = [];
var venusOrbit = mat4();
var venusCenter = vec3(EARTH_BASE_POSITION * 0.731, 0.0, 0.0);
var venusCurPos = venusCenter;

function initVenus() {
    venusProgram = initShaders(gl, 'venus-vertex-shader', 'venus-fragment-shader');
    gl.useProgram(venusProgram);
    createSphere(EARTH_BASE_RADIUS * 0.95, POLYGON_COUNT, POLYGON_COUNT, venusPoints, venusCenter);

    gl.activeTexture(gl.TEXTURE1);


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["venus_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["venus_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["venus_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["venus_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["venus_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["venus_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

    venusVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(venusPoints), gl.STATIC_DRAW);
}

function drawVenus(p, mv) {
    gl.activeTexture(gl.TEXTURE1);
    gl.useProgram(venusProgram);

    venusOrbit = mult(venusOrbit, rotate(EARTH_BASE_ORBIT_SPEED / 0.615, vec3(0.0, 1.0, 0.0)));
    mv = mult(mv, venusOrbit);
    venusCurPos = curPlanetLocation(mv, venusCenter);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(venusProgram, "projectionMatrix"),
        false, flatten(p));
       
    gl.uniformMatrix4fv( gl.getUniformLocation(venusProgram, "modelViewMatrix"), 
        false, flatten(mv));

    gl.uniform1i(gl.getUniformLocation(venusProgram, "texMap"), 1);

    gl.uniform3fv(gl.getUniformLocation(venusProgram, "vCenter"), venusCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(venusProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, venusPoints.length);
}



  ////////////////////
 //     EARTH      //
////////////////////

var earthVBOPoints;
var earthProgram;
var earthPoints = [];
var earthOrbit = mat4();
var earthCenter = vec3(EARTH_BASE_POSITION, 0.0, 0.0);
var earthCurPos = earthCenter

function initEarth() {

	earthProgram = initShaders(gl, 'earth-vertex-shader', 'earth-fragment-shader');
	gl.useProgram(earthProgram);
	createSphere(EARTH_BASE_RADIUS, POLYGON_COUNT, POLYGON_COUNT, earthPoints, earthCenter);

    gl.activeTexture(gl.TEXTURE2);


	var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["earth_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["earth_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["earth_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["earth_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["earth_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["earth_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

	earthVBOPoints = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, earthVBOPoints);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(earthPoints), gl.STATIC_DRAW);
}

function drawEarth(p, mv) {
    gl.activeTexture(gl.TEXTURE2);
	gl.useProgram(earthProgram);

	earthOrbit = mult(earthOrbit, rotate(EARTH_BASE_ORBIT_SPEED, vec3(0.0, 1.0, 0.0)));
	mv = mult(mv, earthOrbit);
    earthCurPos = curPlanetLocation(mv, earthCenter);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(earthProgram, "projectionMatrix"),
		false, flatten(p));
	   
	gl.uniformMatrix4fv( gl.getUniformLocation(earthProgram, "modelViewMatrix"), 
		false, flatten(mv));

	gl.uniform1i(gl.getUniformLocation(earthProgram, "texMap"), 2);

	gl.uniform3fv(gl.getUniformLocation(earthProgram, "vCenter"), earthCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(earthProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, earthPoints.length);
}

  ////////////////////
 //      MARS      //
////////////////////

var marsVBOPoints;
var marsProgram;
var marsPoints = [];
var marsOrbit = mat4();
var marsCenter = vec3(EARTH_BASE_POSITION * 1.405, 0.0, 0.0);

var mercuryCurPos = marsCenter;

function initMars() {
	marsProgram = initShaders(gl, 'mars-vertex-shader', 'mars-fragment-shader');
	gl.useProgram(marsProgram);
	createSphere(EARTH_BASE_RADIUS * 0.53, POLYGON_COUNT, POLYGON_COUNT, marsPoints, marsCenter);
    gl.activeTexture(gl.TEXTURE3);


	var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["mars_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["mars_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["mars_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["mars_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["mars_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["mars_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

	marsVBOPoints = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, marsVBOPoints);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(marsPoints), gl.STATIC_DRAW);
}

function drawMars(p, mv) {
    gl.activeTexture(gl.TEXTURE3);
	gl.useProgram(marsProgram);
	marsOrbit = mult(marsOrbit, rotate(EARTH_BASE_ORBIT_SPEED / 1.881, vec3(0.0, 1.0, 0.0)));
	mv = mult(mv, marsOrbit);
    marsCurPos = curPlanetLocation(mv, marsCenter);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(marsProgram, "projectionMatrix"),
		false, flatten(p));
	   
	gl.uniformMatrix4fv( gl.getUniformLocation(marsProgram, "modelViewMatrix"), 
		false, flatten(mv));

	gl.uniform1i(gl.getUniformLocation(marsProgram, "texMap"), 3);

	gl.uniform3fv(gl.getUniformLocation(marsProgram, "vCenter"), marsCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(marsProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, marsVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, marsPoints.length);
}


  ////////////////////
 //    JUPITER     //
////////////////////

var jupiterVBOPoints;
var jupiterProgram;
var jupiterPoints = [];
var jupiterOrbit = mat4();
var jupiterCenter = vec3(EARTH_BASE_POSITION * 5.034, 0.0, 0.0);

var jupiterCurPos = jupiterCenter;

function initJupiter() {
    jupiterProgram = initShaders(gl, 'jupiter-vertex-shader', 'jupiter-fragment-shader');
    gl.useProgram(jupiterProgram);
    createSphere(EARTH_BASE_RADIUS * 11.2, POLYGON_COUNT, POLYGON_COUNT, jupiterPoints, jupiterCenter);

    gl.activeTexture(gl.TEXTURE4);


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["jupiter_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["jupiter_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["jupiter_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["jupiter_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["jupiter_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["jupiter_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

    jupiterVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(jupiterPoints), gl.STATIC_DRAW);
}

function drawJupiter(p, mv) {
    gl.activeTexture(gl.TEXTURE4);
    gl.useProgram(jupiterProgram);
    jupiterOrbit = mult(jupiterOrbit, rotate(EARTH_BASE_ORBIT_SPEED / 11.862, vec3(0.0, 1.0, 0.0)));
    mv = mult(mv, jupiterOrbit);

    jupiterCurPos = curPlanetLocation(mv, jupiterCenter);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(jupiterProgram, "projectionMatrix"),
        false, flatten(p));
       
    gl.uniformMatrix4fv( gl.getUniformLocation(jupiterProgram, "modelViewMatrix"), 
        false, flatten(mv));

    gl.uniform1i(gl.getUniformLocation(jupiterProgram, "texMap"), 4);

    gl.uniform3fv(gl.getUniformLocation(jupiterProgram, "vCenter"), jupiterCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(jupiterProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, jupiterPoints.length);
}

  ////////////////////
 //     SATURN     //
////////////////////

var saturnVBOPoints;
var saturnProgram;
var saturnPoints = [];
var saturnOrbit = mat4();
var saturnCenter = vec3(EARTH_BASE_POSITION * 9.195, 0.0, 0.0);

var saturnCurPos = saturnCenter;

function initSaturn() {
    saturnProgram = initShaders(gl, 'saturn-vertex-shader', 'saturn-fragment-shader');
    gl.useProgram(saturnProgram);
    createSphere(EARTH_BASE_RADIUS * 9.45, POLYGON_COUNT, POLYGON_COUNT, saturnPoints, saturnCenter);

    gl.activeTexture(gl.TEXTURE5);


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["saturn_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["saturn_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["saturn_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["saturn_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["saturn_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["saturn_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

    saturnVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(saturnPoints), gl.STATIC_DRAW);
}

function drawSaturn(p, mv) {
    gl.activeTexture(gl.TEXTURE5);
    gl.useProgram(saturnProgram);
    saturnOrbit = mult(saturnOrbit, rotate(EARTH_BASE_ORBIT_SPEED / 29.457, vec3(0.0, 1.0, 0.0)));
    mv = mult(mv, saturnOrbit);

    saturnCurPos = curPlanetLocation(mv, saturnCenter);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(saturnProgram, "projectionMatrix"),
        false, flatten(p));
       
    gl.uniformMatrix4fv( gl.getUniformLocation(saturnProgram, "modelViewMatrix"), 
        false, flatten(mv));

    gl.uniform1i(gl.getUniformLocation(saturnProgram, "texMap"), 5);

    gl.uniform3fv(gl.getUniformLocation(saturnProgram, "vCenter"), saturnCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(saturnProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, saturnPoints.length);
}

  ////////////////////
 //       SUN      //
////////////////////

var sunVBOPoints;
var sunProgram;
var sunPoints = [];
var sunOrbit = mat4();
var sunCenter = vec3(0.0, 0.0, 0.0);

function initSun() {
	sunProgram = initShaders(gl, 'sun-vertex-shader', 'sun-fragment-shader');
	gl.useProgram(sunProgram);
	createSphere(0.8, POLYGON_COUNT, POLYGON_COUNT, sunPoints, sunCenter);

    gl.activeTexture(gl.TEXTURE6);


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    var faces = [["sun_right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["sun_left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["sun_top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["sun_bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["sun_front.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["sun_back.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);

        image.src = faces[i][0];
    }

	sunVBOPoints = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sunVBOPoints);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sunPoints), gl.STATIC_DRAW);
}

function drawSun(p, mv) {
    gl.activeTexture(gl.TEXTURE6);
	gl.useProgram(sunProgram);

    sunOrbit = mult(sunOrbit, rotate(EARTH_BASE_ORBIT_SPEED / 5.0, vec3(0.0, 1.0, 0.0)));
    mv = mult(mv, sunOrbit);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(sunProgram, "projectionMatrix"),
		false, flatten(p));
	   
	gl.uniformMatrix4fv( gl.getUniformLocation(sunProgram, "modelViewMatrix"), 
		false, flatten(mv));

    gl.uniform1i(gl.getUniformLocation(sunProgram, "texMap"), 6);

    gl.uniform3fv(gl.getUniformLocation(sunProgram, "vCenter"), sunCenter);
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(sunProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, sunVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, sunPoints.length);
}

function createSphere(radius, latBands, longBands, pointArray, offset) {
	for(var lat = 1; lat <= latBands; lat++) {
		var lat0 = Math.PI * (-0.5 + (lat - 1) / latBands);
		var z0 = Math.sin(lat0);
		var zr0 = Math.cos(lat0);

		var lat1 = Math.PI * (-0.5 + lat / latBands);
		var z1 = Math.sin(lat1);
		var zr1 = Math.cos(lat1);

		for(var lon = 1; lon <= longBands; lon++) {
			var lng = 2 * Math.PI * (lon - 1) / longBands;
			var x = Math.cos(lng);
			var y = Math.sin(lng);

			pointArray.push(vec4(x * zr0 * radius + offset[0], y * zr0 * radius + offset[1], z0 * radius + offset[2], 1.0));
			pointArray.push(vec4(x * zr1 * radius + offset[0], y * zr1 * radius + offset[1], z1 * radius + offset[2], 1.0));
		}
	}
}

window.onload = function() {
	var canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL(canvas);

	if(!gl) alert("WebGL isn't available");

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	aspect = canvas.width / canvas.height;

    initMercury();
    initVenus();
    initEarth();
	initMars();
    initJupiter();
    initSaturn();
    initSun();
	render();

	canvas.addEventListener('click', function() {
		
	});

	canvas.addEventListener('keydown', function(e) {
        if(e.keyCode == 32) {
            if(!topView) {
                topView = true;
                up = vec3(0.0, 0.0, 1.0);
                eye = vec3(0.0, 10.0, 0.0);
            } else {
                topView = false;
                up = vec3(0.0, 1.0, 0.0);
                eye = vec3(0.0, 0.0, -10.0);
            }
        }

		if(e.keyCode == 37) {
			at[0] += 0.2;
		}

        if(e.keyCode == 38) {
            if(topView) {
                eye[1] -= 0.2;
            } else {
                eye[2] += 0.2;
            }
        }

		if(e.keyCode == 39) {
			at[0] -= 0.2;
		}

        if(e.keyCode == 40) {
            if(topView) {
                eye[1] += 0.2;
            } else {
                eye[2] -= 0.2;
            }
        }


	});

	    canvas.addEventListener("mousedown", function (e) {
        var pos = getMousePos(e, this);
        var x = pos[0];
        var y = pos[1];

        if (e.button == 0) {
            startMotion(x, y);
        } else if (e.button == 1) {
            startScale(x, y);
        }

       // render();
    });

    canvas.addEventListener("mousemove", function (e) {
        var pos = getMousePos(e, this);
        var x = pos[0];
        var y = pos[1];

        var curPos = [];
        var dx, dy, dz;

        /* compute position on hemisphere */
        trackball_ptov(x, y, curPos);

        if (theTrackingMove) {
            /* compute the change in position 
			on the hemisphere */
            dx = (curPos[0] - theLastPos[0]) / 3.0;
            dy = (curPos[1] - theLastPos[1]) / 3.0;
            dz = (curPos[2] - theLastPos[2]) / 3.0;
            if (dx || dy || dz) {
                /* compute theta and cross product */
                theAngle = 90.0 * Math.sqrt(dx * dx + dy * dy + dz * dz) / 180.0 * Math.PI;
                theAxis = cross(theLastPos, curPos);

                var q = trackball_vtoq(theAngle, theAxis);

                if (theInit) {
                    theCurtQuat = q;
                    theInit = false;
                } else {
                    theCurtQuat = multiplyQuat(q, theCurtQuat);
                }

                /* update position */
                theLastPos[0] = curPos[0];
                theLastPos[1] = curPos[1];
                theLastPos[2] = curPos[2];
            }

           // render();
        }

        if (theScalingMove) {
            if (theCurtX != x || theCurtY != y) {

                theScale += (theCurtY * 1.0 - y) / 2.0 * 1.3 * theScale; // 2.0 - the windows height
                if (theScale <= 0.0) {
                    theScale = 0.00000001;
                }

                theCurtX = x;
                theCurtY = y;
            }

          //  render();
        }

    });

    canvas.addEventListener("mouseup", function (e) {
        var pos = getMousePos(e, this);
        var x = pos[0];
        var y = pos[1];

        if (e.button == 0) {
            stopMotion(x, y);
        } else if (e.button == 1) {
            stopScale(x, y);
        }
    });

    document.getElementById('track_planet').addEventListener('change' , function() {
        trackedPlanet = parseInt(this.value);
    });

    document.getElementById('speed').addEventListener('change', function() {
        speed = parseInt(this.value);
        if(speed > 5) {
            speed = 5;
        }

        if(speed < 0) {
            speed = 0;
        }
        EARTH_BASE_ORBIT_SPEED = 0.3 * speed;
    });

}

function curPlanetLocation(m, v) {
    v = vec4(v[0], v[1], v[2], 0.0)
    var o =     vec4(-v[0]*m[0][0] + v[1]*m[1][0] + v[2]*m[2][0] + v[3]*m[3][0],
                     -v[0]*m[0][1] + v[1]*m[1][1] + v[2]*m[2][1] + v[3]*m[3][1],
                     -v[0]*m[0][2] + v[1]*m[1][2] + v[2]*m[2][2] + v[3]*m[3][2],
                    -v[0]*m[0][3] + v[1]*m[1][3] + v[2]*m[2][3] + v[3]*m[3][3]);
    o = vec3(o[0], [1], o[2]);
    return o;
}


function trackball_ptov(x, y, v) {
    var d, a;

    /* project x,y onto a hemisphere centered within width, height, note z is up here*/
    v[0] = x;
    v[1] = y;
    d = v[0] * v[0] + v[1] * v[1];
    if (d > 1) {
        v[2] = 0.0;
    } else {
        v[2] = Math.sqrt(1.0 - d);
    }

    a = 1.0 / Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] *= a;
    v[1] *= a;
    v[2] *= a;
}

function trackball_vtoq(angle, axis) {
    var c = Math.cos(angle / 2.0);
    var s = Math.sin(angle / 2.0);
    var a = 1.0 / Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);

    var quat = [];

    quat[0] = c;
    quat[1] = axis[0] * a * s;
    quat[2] = axis[1] * a * s;
    quat[3] = axis[2] * a * s;

    return quat;
}

function multiplyQuat(a, b) {
    var quat = [];

    quat[0] = a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3];
    quat[1] = a[0] * b[1] + b[0] * a[1] + a[2] * b[3] - b[2] * a[3];
    quat[2] = a[0] * b[2] - a[1] * b[3] + b[0] * a[2] + b[1] * a[3];
    quat[3] = a[0] * b[3] + a[1] * b[2] - b[1] * a[2] + b[0] * a[3];

    return quat;
}

function buildRotationMatrix(q) {
    var m = mat4(1 - 2 * q[2] * q[2] - 2 * q[3] * q[3], 2 * q[1] * q[2] + 2 * q[0] * q[3], 2 * q[1] * q[3] - 2 * q[0] * q[2], 0,
				2 * q[1] * q[2] - 2 * q[0] * q[3], 1 - 2 * q[1] * q[1] - 2 * q[3] * q[3], 2 * q[2] * q[3] + 2 * q[0] * q[1], 0,
				2 * q[1] * q[3] + 2 * q[0] * q[2], 2 * q[2] * q[3] - 2 * q[0] * q[1], 1 - 2 * q[1] * q[1] - 2 * q[2] * q[2], 0,
				0, 0, 0, 1);

    m = transpose(m);

    return m;
}

function getMousePos(e, canvas) {
    var event = e || window.event;
    var client_x_r = event.clientX - canvas.offsetLeft;
    var client_y_r = event.clientY - canvas.offsetTop;
    var clip_x = -1 + 2 * client_x_r / canvas.width;
    var clip_y = -1 + 2 * (canvas.height - client_y_r) / canvas.height;
    var t = vec2(clip_x, clip_y);

    return t;
}

function startMotion(x, y) {
    theTrackingMove = true;
    theStartX = x;
    theStartY = y;
    theCurtX = x;
    theCurtY = y;
    trackball_ptov(x, y, theLastPos);
}


function stopMotion(x, y) {
    theTrackingMove = false;

    /* check if position has changed */
    if (theStartX == x && theStartY == y) {
        theAngle = 0.0;
    }
}

function startScale(x, y) {
    theScalingMove = true;
    theCurtX = x;
    theCurtY = y;
}

function stopScale(x, y) {
    theScalingMove = false;
}

function updateAt() {
    switch(trackedPlanet) {
        case 0:
            eye[2] = -10;
            at = vec3(0.0, 0.0, 0.0);
            break;
        case 1:
            eye[2] = -10;
            at = mercuryCurPos;
            break;
        case 2:
            eye[2] = -10;
            at = venusCurPos;
            break;
        case 3:
            eye[2] = -10;
            at = earthCurPos;
            break;
        case 4:
            eye[2] = -10;
            at = marsCurPos;
            break;
        case 5:
            eye[2] = -50;
            at = jupiterCurPos;
            break;
        case 6:
            eye[2] = -60;
            at = saturnCurPos;
            break;
        default:
            break;
    }
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	var p = perspective(45.0, aspect, 0.1, 1000.0);
	var t = translate(0, 0.0, 0.0);
	var s = scale(theScale, theScale, theScale);
	var quat = buildRotationMatrix(theCurtQuat);
    updateAt();
	var mv = lookAt(eye, at, vec3(0.0, 1.0, 0.0));
	mv = mult(mv, t);
	mv = mult(mv, s);
	mv = mult(mv, quat);

    drawMercury(p, mv);
    drawVenus(p, mv);
    drawEarth(p, mv);
	drawMars(p, mv);
	drawJupiter(p, mv);
    drawSaturn(p, mv);
    drawSun(p, mv);
	requestAnimFrame(render);
}