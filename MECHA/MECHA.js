
/// The robot class
/**
 * @author Gervilla JuanL
 * 
 * @param parameters = {
 *      robotHeight: <float>,
 *      robotWidth : <float>,
 *      material: <Material>
 * }
 */



class MECHA extends THREE.Object3D {
  
  constructor (parameters) {
    super();
    
    // If there are no parameters, the default values are used
    this.material    = (parameters.material === undefined ? new THREE.MeshPhongMaterial ({color: 0xd4af37, specular: 0xfbf804, shininess: 70}) : parameters.material);

    // With these variables, the position of the hook is set
    this.fps             = null;
    this.energy          = 100;
    
    this.base = this.createBase();
    this.add (this.base);
  }
  
  // Private methods
  
  /// It creates the base and adds the mast to the base

  createBase () {
    var base = new THREE.Mesh (new THREE.CylinderGeometry (0, 0, 0, 0, 0), this.material);
    base.geometry.applyMatrix (new THREE.Matrix4().makeTranslation (0, 0, 0));
    base.autoUpdateMatrix = false;

    base.add(this.createMECHA());
    return base;
  }


  createMECHA (){
    var that = new THREE.Object3D();
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('objs/');
    mtlLoader.load(
      'robot.mtl', 
      function( materials ) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('objs/');
        // load a resource
        loader.load(
          // resource URL
          'robot.obj',
          // called when resource is loaded
          function ( object ) {
            object.rotation.x = Math.PI/4;//.geometry.applyMatrix (new THREE.Matrix4().makeRotationY (Math.PI/2));
            that.add(object);
          }
        );
      }
    );
    this.fps = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000 );
    this.fps.position.set(0, 30, 10);
    this.fps.rotation.y = Math.PI;
    var look = new THREE.Vector3 (0,100,(500*1.15)/2+80);
    this.fps.lookAt(look);
    that.add(this.fps);

    that.add(this.createRWing1());
    that.add(this.createLWing1());
    that.add(this.createRWing2());
    that.add(this.createLWing2());

    return that;
  }

  createRWing1 (){
    var that = new THREE.Object3D();
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('objs/');
    mtlLoader.load(
      'wings.mtl', 
      function( materials ) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('objs/');
        // load a resource
        loader.load(
          // resource URL
          'wings.obj',
          // called when resource is loaded
          function ( object ) {
            object.rotation.x= Math.PI/2;
            object.rotation.y = 1.2*Math.PI/4;//.geometry.applyMatrix (new THREE.Matrix4().makeRotationY (Math.PI/2));
            //object.rotation.z = Math.PI/4;
            object.position.x = -15;
            object.position.y = +30;
            //object.
            that.add(object);
          }
        );
      }
    );
    return that;
  }
  createLWing1 (){
    var that = new THREE.Object3D();
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('objs/');
    mtlLoader.load(
      'wings.mtl', 
      function( materials ) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('objs/');
        // load a resource
        loader.load(
          // resource URL
          'wings.obj',
          // called when resource is loaded
          function ( object ) {
            object.scale.x=-1 ;
            object.rotation.x= Math.PI/2;
            object.rotation.y = -1.2*Math.PI/4;//.geometry.applyMatrix (new THREE.Matrix4().makeRotationY (Math.PI/2));
            //object.rotation.z = Math.PI/4;
            object.position.x = +15;
            object.position.y = +30;
            //object.
            that.add(object);
          }
        );
      }
    );
    return that;
  }
  createRWing2 (){
    var that = new THREE.Object3D();
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('objs/');
    mtlLoader.load(
      'wing2.mtl', 
      function( materials ) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('objs/');
        // load a resource
        loader.load(
          // resource URL
          'wing2.obj',
          // called when resource is loaded
          function ( object ) {
            object.rotation.x= Math.PI/4;
            object.rotation.y = Math.PI/4;//.geometry.applyMatrix (new THREE.Matrix4().makeRotationY (Math.PI/2));
            //object.rotation.z = Math.PI/4;
            object.position.x = -10;
            object.position.z = -10;
            object.position.y = +20;
            //object.
            that.add(object);
          }
        );
      }
    );
    return that;
  }

  createLWing2 (){
    var that = new THREE.Object3D();
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('objs/');
    mtlLoader.load(
      'wing2.mtl', 
      function( materials ) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('objs/');
        // load a resource
        loader.load(
          // resource URL
          'wing2.obj',
          // called when resource is loaded
          function ( object ) {
            object.scale.x=-1 ;
            object.rotation.x= Math.PI/4;
            object.rotation.y = -Math.PI/4;//.geometry.applyMatrix (new THREE.Matrix4().makeRotationY (Math.PI/2));
            //object.rotation.z = Math.PI/4;
            object.position.x = 10;
            object.position.z = -10;
            object.position.y = +20;
            //object.
            that.add(object);
          }
        );
      }
    );
    return that;
  }
}

// class variables
MECHA.WORLD = 0;
MECHA.LOCAL = 1;
