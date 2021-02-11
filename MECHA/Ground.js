
/// The Ground class
/**
 * @author Gervilla JuanL
 * 
 * @param aWidth - The width of the ground
 * @param aDeep - The deep of the ground
 * @param aMaterial - The material of the ground
 */

class Ground extends THREE.Object3D {

  constructor (aWidth, aDeep, aMaterial) {
    super();
    
    this.width = aWidth;
    this.deep = aDeep;
    this.material = aMaterial;
    
    this.ground = null;

    this.raycaster = new THREE.Raycaster ();  // To select boxes
  
    this.ground = new THREE.Mesh (
      new THREE.BoxGeometry (this.width, 0.2, this.deep, 1, 1, 1),
      this.material);
    this.ground.applyMatrix (new THREE.Matrix4().makeTranslation (0,-0.1,0));
    this.ground.receiveShadow = true;
    this.ground.autoUpdateMatrix = false;
    this.add (this.ground);
  }
  
  /// It returns the position of the mouse in normalized coordinates ([-1,1],[-1,1])
  /**
   * @param event - Mouse information
   * @return A Vector2 with the normalized mouse position
   */
  getMouse (event) {
    var mouse = new THREE.Vector2 ();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = 1 - 2 * (event.clientY / window.innerHeight);
    return mouse;
  }
  
  /// It returns the point on the ground where the mouse has clicked
  /**
   * @param event - The mouse information
   * @return The Vector2 with the ground point clicked, or null
   */
  getPointOnGround (event) {
    var mouse = this.getMouse (event);
    this.raycaster.setFromCamera (mouse, scene.getCamera());
    var surfaces = [this.ground];
    var pickedObjects = this.raycaster.intersectObjects (surfaces);
    if (pickedObjects.length > 0) {
      return new THREE.Vector2 (pickedObjects[0].point.x, pickedObjects[0].point.z);
    } else
      return null;
  }
}
