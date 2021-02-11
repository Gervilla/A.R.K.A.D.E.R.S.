
/// Several functions, including the main

/// The scene graph
scene = null;

/// The object for the statistics
stats = initStats();

/// A boolean to know if the left button of the mouse is down
mouseDown = false;

GUIcontrols = null;

/// The current mode of the application
applicationMode = TheScene.NO_ACTION;



function createGUI (withStats) {
  GUIcontrols = new function() {
    this.xspeed=0;
    this.zspeed=0;
    this.lightIntensity = 0.5;
  }
  
  if (withStats)
    stats = initStats();
}

function initStats() {
  
  var stats = new Stats();
  
  stats.setMode(0); // 0: fps, 1: ms
  
  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  
  $("#Stats-output").append( stats.domElement );
  
  return stats;
}

/// It shows a feed-back message for the user
/**
 * @param str - The message
 */
function setMessage (str) {
  document.getElementById ("Messages").innerHTML = "<h2>"+str+"</h2>";
}

/// It processes the wheel rolling of the mouse
/**
 * @param event - Mouse information
 */
function onMouseWheel (event) {
  if (event.ctrlKey) {
    // The Trackballcontrol only works if Ctrl key is pressed
    scene.getCameraControls().enabled = true;
  } else {  
    scene.getCameraControls().enabled = false;
  }
}

/// It processes the window size changes
function onWindowResize () {
  scene.setCameraAspect (window.innerWidth / window.innerHeight);
  renderer.setSize (window.innerWidth, window.innerHeight);
}

function onKeyPress (event) { //MOVIMIENTO DEL MECHA, CAMARA Y PAUSA
  var keyCode = event.which;
  //console.log(keyCode);

  if (keyCode == 37) {
      GUIcontrols.xspeed = 4;
  } else if (keyCode == 39) {
      GUIcontrols.xspeed = -4;
  }

  if (keyCode == 86)
    this.scene.camaraGeneral = !this.scene.camaraGeneral;

  if (keyCode == 90){ //TEST
    if(this.scene.puntuacion < 1000){
      this.scene.puntuacion = 1001;
    }
    else{
      for( var i = this.scene.flota.children.length - 1; i >= 0; i--) {
        this.scene.flota.remove(this.scene.flota.children[i]);
      }
    }  
  }

  if (keyCode == 32) {
    this.scene.paused = !this.scene.paused;
    this.scene.pausarOstTheme(this.scene.paused);
  }
}

function onKeyUp (event) { //PARADA DEL MECHA
  var keyCode = event.which;

  if (keyCode == 38 && GUIcontrols.zspeed>0 || keyCode == 40 && GUIcontrols.zspeed<0) {
    GUIcontrols.zspeed = 0;
  }
  if (keyCode == 37 && GUIcontrols.xspeed>0 || keyCode == 39 && GUIcontrols.xspeed<0) {
    GUIcontrols.xspeed = 0;
  }
}

/// It creates and configures the WebGL renderer
/**
 * @return The renderer
 */
function createRenderer () {
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  return renderer;  
}


/// It renders every frame
function render() {
  requestAnimationFrame(render);
  
  stats.update();
  scene.getCameraControls().update ();
  scene.animate(GUIcontrols);
  
  renderer.render(scene, scene.getCamera());
}

/// The main function
$(function () {
  // create a render and set the size
  renderer = createRenderer();
  // add the output of the renderer to the html element
  $("#WebGL-output").append(renderer.domElement);
  // liseners
  window.addEventListener ("resize", onWindowResize);
  window.addEventListener ("keydown", onKeyPress);
  window.addEventListener ("keyup", onKeyUp);
  window.addEventListener ("mousewheel", onMouseWheel, true);   // For Chrome an others
  window.addEventListener ("DOMMouseScroll", onMouseWheel, true); // For Firefox
  
  // create a scene, that will hold all our elements such as objects, cameras and lights.
  scene = new TheScene (renderer.domElement);

  createGUI(true);

  render();
});
