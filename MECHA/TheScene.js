
/// The Model Facade class. The root node of the graph.
/**
 * @param renderer - The renderer to visualize the scene
 */
class TheScene extends THREE.Scene {
  
  constructor (renderer) {
    super();
    
    //Fondo espacial
    var loader = new THREE.TextureLoader();
    var bgTexture = loader.load("imgs/space.jpg",
        function ( texture ) {
            var img = texture.image;
        } );
    this.background = bgTexture;
    bgTexture.wrapS = THREE.MirroredRepeatWrapping;
    bgTexture.wrapT = THREE.MirroredRepeatWrapping;

    //Variables
    this.ambientLight = null;
    this.spotLight = null;
    this.camera = null;
    this.camaraGeneral = true;
    this.trackballControls = null;

    //Suelo y objetos
    this.groundSize = 500;
    this.groundHSize = this.groundSize * 1.15;
    this.MECHA = null;
    this.ground = null;
    this.casas = null;
    this.flota = null;

    //Aliens y flota
    this.numeroAliens = 7;
    this.dimensionAlien = this.groundSize/(3*this.numeroAliens - 1);
    this.flotaX = 0;
    this.flotaSpeed = 0.2;
    this.separacionAliens = this.dimensionAlien*1.5;
    this.velocidadProyectiles = 3;

    //Control de juego
    this.puntuacion = 0;
    this.vidaHumanidad = null;
    this.level=0;
    this.paused = false;

    //Sonidos
    this.ostTheme = new Audio('sounds/BattleTheme.ogg');
    this.ostTheme.loop = true;
    this.ostTheme.play();
  
    this.createLights ();
    this.createCamera (renderer);
    this.model = this.createModel ();
    this.add (this.model);
  }
  


  //Crea la camara
  createCamera (renderer) {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set (0, 700, -1);
    var look = new THREE.Vector3 (0,0,0);
    this.camera.lookAt(look);

    this.trackballControls = new THREE.TrackballControls (this.camera, renderer);
    this.trackballControls.rotateSpeed = 5;
    this.trackballControls.zoomSpeed = -2;
    this.trackballControls.panSpeed = 0.5;
    this.trackballControls.target = look;
    
    this.add(this.camera);
  }
  
  //Crea las luces
  createLights () {
    // add subtle ambient lighting
    this.ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
    this.add (this.ambientLight);
    
    // add spotlight for the shadows
    this.spotLight = new THREE.SpotLight( 0xffffff );
    this.spotLight.position.set( -this.groundSize/2, 120, -this.groundSize -15 );
    this.spotLight.castShadow = true;
    // the shadow resolution
    this.spotLight.shadow.mapSize.width=2048;
    this.spotLight.shadow.mapSize.height=2048;
    this.add (this.spotLight);
  }
  
  //Crea el modelo
  createModel () {
    var model = new THREE.Object3D();
    this.MECHA = new MECHA({}); 
    this.MECHA.position.z= -this.groundHSize/2 + 80;
    model.add (this.MECHA);
    
    //Crea el corte de espada del robot
    var loader = new THREE.TextureLoader();
    var textura = loader.load ("imgs/slash.png");
    this.cut = new THREE.Mesh (new THREE.BoxGeometry(80, 1, 80, 1, 1, 1),new THREE.MeshPhongMaterial ({map: textura, transparent: true, emissive: 0x6666FF}));
    this.cut.rotation.y = Math.PI;
    model.add(this.cut);

    //Crea el suelo
    var loader = new THREE.TextureLoader();
    var textura = loader.load ("imgs/border.png");
    this.ground = new Ground (this.groundSize*1.2, this.groundHSize, new THREE.MeshPhongMaterial ({map: textura, transparent: true, emissive: 0x0000FF}), 4);
    model.add (this.ground);

    this.flota = new THREE.Object3D();
    model.add (this.flota);

    //Generar primera fila de aliens
    for (var j = 0; j < 4; j++){
      for (var i = 0; i < this.numeroAliens; i++){
        this.crearAlien((i - this.numeroAliens/2)*this.separacionAliens + this.separacionAliens/2,this.groundHSize/2 - this.separacionAliens/2 - this.separacionAliens*j);
      }
    }

    this.proyectilesEnemigos = new THREE.Object3D();
    model.add (this.proyectilesEnemigos);
    this.proyectilesAliados = new THREE.Object3D();
    model.add (this.proyectilesAliados);

    //Crear casas
    this.casas = new THREE.Object3D();
    model.add (this.casas);
    this.crearCasas();
    this.vidaHumanidad = this.casas.children.length;
    
    //Crear boss
    this.boss = this.crearBoss();
    this.boss.position.z=this.groundHSize/2+80;
    this.boss.damage = 0;
    model.add(this.boss);

    return model;
  }

  //Crea las casas
  crearCasas(){
    for (var i = 0; i < 5; i++){
      var casa = new THREE.Mesh (new THREE.BoxGeometry (this.groundSize/15, this.groundSize/15, this.groundSize/16), new THREE.MeshPhongMaterial ({map: new THREE.TextureLoader().load("imgs/wall.jpg") }));
      casa.position.z = -this.groundHSize/2 + 15;
      casa.position.x = this.groundSize/4 + (-this.groundSize/4 * i/2);
      casa.position.y = -20;

      var tejado = new THREE.Mesh (new THREE.CylinderGeometry (0, this.groundSize/15, this.groundSize/18, 4, 1, true), new THREE.MeshPhongMaterial ({map: new THREE.TextureLoader().load("imgs/tejas.jpg") }));
      tejado.geometry.applyMatrix (new THREE.Matrix4().makeRotationY (Math.PI/4));
      tejado.geometry.applyMatrix (new THREE.Matrix4().makeRotationX (Math.PI/2));
      tejado.position.z = -this.groundHSize/2 + 40;
      tejado.position.x = this.groundSize/4 + (-this.groundSize/4 * i/2);
      tejado.position.y = -20;

      this.casas.add(tejado);
      this.casas.add(casa);
    }
  }

  //Crea un alien cargando el archivo del alien
  crearAlien(xp,zp){
    var that = this;
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('objs/');
    mtlLoader.load(
      'enemy.mtl', 
      function( materials ) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath('objs/');
        // load a resource
        loader.load(
          // resource URL
          'enemy.obj',
          // called when resource is loaded
          function ( object ) {
            object.position.x=xp;
            object.position.z=zp;
            scene.flota.add(object);
          }
        );
      }
    );
  }

  //Crea el jefe final
  crearBoss(){
    var head = new THREE.Mesh (new THREE.SphereGeometry (70, 32, 32), new THREE.MeshPhongMaterial ({map: new THREE.TextureLoader().load("imgs/face.jpg") }));

    var nose  = new THREE.Mesh (new THREE.SphereGeometry (15, 16, 16), new THREE.MeshPhongMaterial ({color: 0xff0000, specular: 0xff8888, shininess: 50}));
    nose.geometry.applyMatrix (new THREE.Matrix4().makeTranslation (0, 15, 80));

    head.add(nose);
    head.rotation.z=Math.PI;
    head.rotation.x=Math.PI+Math.PI/4;
    return head;
  }

  //Pausa la musica del juego
  pausarOstTheme(pausado){
    if (pausado)
      this.ostTheme.pause();
    else if(this.level != 2 && this.vidaHumanidad > 0)
      this.ostTheme.play();
  }

  //Calcula la distancia para usarla en colisiones
  distanciaEntrePuntos(x1, z1, x2, z2){
    var dx = x1 - x2;
    var dz = z1 - z2;
    return Math.sqrt( dx * dx  + dz * dz );
  }
  
  //Controla el movimiento del MECHA
  controlMECHA(controls){
    this.MECHA.position.x += controls.xspeed;
    this.MECHA.rotation.x = 0;
    this.MECHA.rotation.z = (-controls.xspeed)*Math.PI/40;
    this.MECHA.rotation.x = Math.PI/4;
    this.camera.rotation.y -= this.MECHA.position.x/10000;
  }
  
  //Crea un nuevo proyectil enemigo
  nuevoProyectil(xp, zp){
    var newProyectil = new THREE.Mesh (new THREE.SphereGeometry (this.dimensionAlien/4, 8, 8), new THREE.MeshPhongMaterial ({color: 0xff5600, specular: 0xffffff, shininess: 100}));
    newProyectil.position.x = xp;
    newProyectil.position.z = zp;
    newProyectil.puntuacion = 0;
    newProyectil.direction= - Math.PI/2;
    newProyectil.choca = true;
    var AlienLaserSFX = new Audio('sounds/AlienLaser2.mp3');
    AlienLaserSFX.play();

    this.proyectilesEnemigos.add(newProyectil);
    return newProyectil;
  }

  //El MECHA devuelve un proyectil enemigo transformandolo en bueno si lo tiene cerca
  devolverProyectil(proyectil){
	    var dist = this.distanciaEntrePuntos(this.MECHA.position.x, this.MECHA.position.z, proyectil.position.x ,proyectil.position.z);
	    if(dist<40){
        var newProyectil = new THREE.Mesh (new THREE.SphereGeometry (this.dimensionAlien/4, 8, 8), new THREE.MeshPhongMaterial ({color: 0x00FF00, specular: 0x00FF00, shininess: 100}));
        newProyectil.position.x=proyectil.position.x;
        newProyectil.position.z=proyectil.position.z;
        newProyectil.puntuacion=proyectil.puntuacion + 0.1;
        newProyectil.direction=Math.atan2(proyectil.position.z - this.MECHA.position.z,proyectil.position.x - this.MECHA.position.x);
        this.proyectilesAliados.add(newProyectil);

        var ReboteSFX = new Audio('sounds/Rebote.mp3');
        ReboteSFX.play();

        this.proyectilesAliados.remove(proyectil);
        this.proyectilesEnemigos.remove(proyectil);
        this.cut.opacity = 1;
        this.cut.position.x=this.MECHA.position.x;
        this.cut.position.z=this.MECHA.position.z+40;
	  	}	
  }
  
  //Realiza el impacto de un proyectil aliado con el boss y este devuelve uno enemigo
  bossImpact(proyectil){
    var dist = this.distanciaEntrePuntos(this.boss.position.x, this.boss.position.z, proyectil.position.x ,proyectil.position.z);
	    if(dist<70){
        var newProyectil = this.nuevoProyectil(proyectil.position.x,proyectil.position.z);
  			newProyectil.direction=Math.atan2(proyectil.position.z - this.boss.position.z-70,proyectil.position.x - this.boss.position.x);
  			this.proyectilesEnemigos.add(newProyectil);

        var ReboteSFX = new Audio('sounds/BossHit.mp3');
        ReboteSFX.play();

        this.proyectilesAliados.remove(proyectil);
        this.boss.damage++;
	  	}	
  }

  //Calcula las colisiones de los proyectiles alidos con los aliens
  reboteDeCaja(proyectil,alien){
    var ax = alien.position.x+this.flota.position.x;
    var az = alien.position.z;

    if((proyectil.position.x > ax-this.dimensionAlien/2 && proyectil.position.x < ax+this.dimensionAlien/2)
      && (proyectil.position.z > az-this.dimensionAlien/4 && proyectil.position.z < az+this.dimensionAlien/4))
    {
      this.flota.remove(alien);

      while((proyectil.position.x > ax-this.dimensionAlien/2 && proyectil.position.x< ax+this.dimensionAlien/2)
        && (proyectil.position.z > az-this.dimensionAlien/4 && proyectil.position.z< az+this.dimensionAlien/4))
      {
        proyectil.position.x -= Math.cos(proyectil.direction);
        proyectil.position.z -= Math.sin(proyectil.direction);
      }
      if(proyectil.position.x >= ax-this.dimensionAlien/2 && proyectil.position.x<= ax+this.dimensionAlien/2){
        proyectil.direction = 2*Math.PI-proyectil.direction;
      }
      else if(proyectil.position.z >= az-this.dimensionAlien/4 && proyectil.position.z<= az+this.dimensionAlien/4){
        proyectil.direction = Math.PI-proyectil.direction;
      }
      else{
        proyectil.direction = proyectil.direction+Math.PI;
      }

      var AlienExplosionSFX = new Audio('sounds/AlienExplosion.mp3');
      AlienExplosionSFX.play();
      proyectil.puntuacion++;
    }
  }

  //Rebota el proyectil con las paredes
  rebotePared(proyectil){
    if( Math.sign(Math.sin(proyectil.direction)) == Math.sign(proyectil.position.z)){ 
      if(proyectil.position.z > this.groundHSize/2){
        proyectil.direction=2*Math.PI-proyectil.direction;
      }
    }
    if( Math.sign(Math.cos(proyectil.direction)) == Math.sign(proyectil.position.x)){ 
      if(proyectil.position.x > this.groundSize/2 || proyectil.position.x < -this.groundSize/2){
        proyectil.direction=Math.PI-proyectil.direction;
      }
    }
  }

  //Mueve los proyectiles
  moverProyectiles(){
    //Mover proyectiles Enemigos
    for (var i = 0; i < this.proyectilesEnemigos.children.length; i++) {
      this.proyectilesEnemigos.children[i].position.z += this.velocidadProyectiles * Math.sin(this.proyectilesEnemigos.children[i].direction);
      this.proyectilesEnemigos.children[i].position.x += this.velocidadProyectiles * Math.cos(this.proyectilesEnemigos.children[i].direction);
      if(this.level!=0){ //Si no estamos en la fase inicial (estamos en el jefe), haz que los proyectiles enemigos reboten
        this.rebotePared(this.proyectilesEnemigos.children[i]);
      }

      if(this.proyectilesEnemigos.children[i].position.z < -this.groundHSize/2 + 15
	    && this.proyectilesEnemigos.children[i].choca){ //Comprueba si choca con alguna casa
      	for (var j = 0; j < this.casas.children.length; j++){
	      	if(this.proyectilesEnemigos.children[i].position.x > this.casas.children[j].position.x-this.groundSize/15 
	      	&& this.proyectilesEnemigos.children[i].position.x < this.casas.children[j].position.x+this.groundSize/15){ //Si choca con una casa la destruye
	      		this.casas.remove(this.casas.children[j]);
            this.vidaHumanidad = this.casas.children.length;
            this.aplicarPuntuacion(0);
	      		this.proyectilesEnemigos.remove(this.proyectilesEnemigos.children[i]);
            var ExplosionCasaSFX = new Audio('sounds/ExplosionCasa.mp3');
            ExplosionCasaSFX.play();
            return;
	    	  }
	    	else //Si no choca, significa que no esta en la zona de las casas, y evitamos realizar mas comprobaciones futuras
	    		this.proyectilesEnemigos.children[i].choca = false;
      	}
      }

      if (this.proyectilesEnemigos.children[i].position.z < -this.groundHSize/2) { //Comprueba si un proyectil enemigo se sale por debajo
        this.aplicarPuntuacion(0);
        this.proyectilesEnemigos.remove(this.proyectilesEnemigos.children[i]);
        if(this.level==0){
          var BalaPerdidaSFX = new Audio('sounds/BalaPerdida.mp3');
          BalaPerdidaSFX.play();
        }
        else{
          var BalaPerdidaSFX = new Audio('sounds/BossMiss.mp3');
          BalaPerdidaSFX.play();
        }
      }

      else{ //Si no, el MECHA intenta devolver el proyectil
        this.devolverProyectil(this.proyectilesEnemigos.children[i]);
      }
    }
    //Mover proyectiles Aliados
    for (var i = 0; i < this.proyectilesAliados.children.length; i++) {
      var spd=this.velocidadProyectiles+this.proyectilesAliados.children[i].puntuacion;
      this.proyectilesAliados.children[i].position.z += spd * Math.sin(this.proyectilesAliados.children[i].direction);
      this.proyectilesAliados.children[i].position.x += spd * Math.cos(this.proyectilesAliados.children[i].direction);
      //Colisión con paredes de proyectil
      if(this.proyectilesAliados.children[i].position.z < -this.groundHSize/2){ //Comprueba si un proyectil aliado se sale por debajo
      	//this.proyectilesAliados.children[i].direction=2*Math.PI-this.proyectilesAliados.children[i].direction; //Esto solo sirve para romper el juego
        this.aplicarPuntuacion(this.proyectilesAliados.children[i].puntuacion);
        var PuntuacionSFX = new Audio('sounds/puntos3.mp3');
        PuntuacionSFX.play();
        this.proyectilesAliados.remove(this.proyectilesAliados.children[i]);
      }

      this.rebotePared(this.proyectilesAliados.children[i]);
      this.devolverProyectil(this.proyectilesAliados.children[i]);
      if (this.level != 0){ //Comprueba si colisionan con el boss
        this.bossImpact(this.proyectilesAliados.children[i]);
      }
      for (var j = 0; j < this.flota.children.length; j++) { //Comprueba si colisionan con algun alien
        this.reboteDeCaja(this.proyectilesAliados.children[i],this.flota.children[j]);
      }
    }
  }

  //Mueve la flota de aliens
  moverFlota () {
    //Mover aliens
    this.flota.position.x += this.flotaSpeed;
    this.flotaSpeed = 0.2*45/(5+this.flota.children.length)*Math.sign(this.flotaSpeed);
    if(Math.random()*120 <=  1){
      var shooter = this.flota.children[Math.floor( Math.random()*this.flota.children.length )];
      this.nuevoProyectil(shooter.position.x+this.flota.position.x,shooter.position.z);
    }
    
    //Cambia el sentido de los aliens y los baja si alcanzan un borde
    if (this.flota.position.x >= this.groundSize/4 || this.flota.position.x <= -this.groundSize/4){
      for (var i = 0; i < this.flota.children.length; i++) {
        this.flota.position.x = this.groundSize/4*Math.sign(this.flota.position.x);
        this.flota.children[i].position.z -= this.separacionAliens; //Baja los aliens
        if(this.flota.children[i].position.z < -this.groundHSize/2 + 15){ //Si llega un alien a las casas se pierde la partida
          this.vidaHumanidad = 0;
        }
      }
      this.flotaSpeed = -this.flotaSpeed; //Cambia el sentido de la flota
      if (this.puntuacion <= 1000){ //Si no tienes suficiente puntuacion, crea mas aliens  
        for (var i = 0; i < this.numeroAliens; i++){
          this.crearAlien((i - this.numeroAliens/2)*this.separacionAliens + this.separacionAliens/2,this.groundHSize/2 - this.separacionAliens/2)
        }
        var AlienSFX = new Audio('sounds/Alien.mp3');
        AlienSFX.play();
      }
    }     
  }

  aparicionDelBoss(){
    for( var i = this.proyectilesAliados.children.length - 1; i >= 0; i--) {
      this.proyectilesAliados.remove(this.proyectilesAliados.children[i]);
    }
    this.ostTheme.pause();
    this.ostTheme = new Audio('sounds/FinalBoss.ogg');
    this.ostTheme.loop = true;
    this.level=1;
    this.ostTheme.play();
  }

  faseBoss(){
    if(this.boss.position.z > this.groundHSize/2-80){ //Si no ha hecho su entrada magistral, la hace
      this.boss.position.z--;
    }
    else{ //El boss esta preparado para el ataque
      this.boss.position.x+=this.flotaSpeed;
      if (this.boss.position.x >= this.groundSize/4 || this.boss.position.x <= -this.groundSize/4){
        this.flotaSpeed=-this.flotaSpeed;
      }
      if(this.proyectilesAliados.children.length + this.proyectilesEnemigos.children.length < 2+ Math.floor(this.boss.damage/5)){
        this.nuevoProyectil(this.boss.position.x,this.boss.position.z);
      }
      if(this.boss.damage>=35){
        this.level=2;
        this.ostTheme.pause();
        var WinSFX = new Audio('sounds/Victory.mp3');
        WinSFX.play();
      }
    }
    if(this.puntuacion<0){
      this.vidaHumanidad=0;
    }
  }

  //Aplica la puntuacion de un proyectil
  aplicarPuntuacion(nuevosPuntos){
    if(nuevosPuntos != 0)
      this.puntuacion += nuevosPuntos * 10;
    else
      this.puntuacion -= 100;
  }

  //Ajusta el MECHA a los bordes de juego
  cuadrarMargen(){
    if (this.MECHA.position.x > this.groundSize/2)
      this.MECHA.position.x = this.groundSize/2;
    if (this.MECHA.position.x < -this.groundSize/2)
      this.MECHA.position.x = -this.groundSize/2;
  }


  //ANIMATE!!!
  animate (controls) {
    if (!this.paused){ //Si no esta pausado el juego...
      if(this.level!=2){ //Si no hemos ganado...
        if (this.vidaHumanidad > 0){ //Si sigue existiendo la humanidad...
          this.spotLight.intensity = controls.lightIntensity;

          this.controlMECHA(controls);
          this.cuadrarMargen();
          if(this.level==0){ //Si estamos en el nivel inicial...
            this.moverFlota();
            if(this.puntuacion>=1000 && this.flota.children.length == 0){ //Si no hay aliens y la puntuacion es superior a 1000, aparece el boss
              this.aparicionDelBoss();
            }
          }
          else{ //Estamos en el boss
            this.faseBoss();
          }

          this.cut.position.z=this.groundHSize*2;
          this.moverProyectiles();
          setMessage ("Humanidad: " + this.vidaHumanidad * 10 + "% \n Puntos: " + this.puntuacion);
        }
        else if(this.vidaHumanidad==0){
          var OverSFX = new Audio('sounds/GameOver.mp3');
          OverSFX.play();
          this.vidaHumanidad=-1;
        }
        else{
          this.ostTheme.pause();
          setMessage ("La humanidad ha perecido...");
        }
      }
      else{
        this.boss.remove(this.boss.children[0]);
        setMessage ("La humanidad ha sobrevivido...");
      }
    }
  }

  //Devuelve la camara
  getCamera () {
    if (this.camaraGeneral)
      return this.camera;
    else
      return this.MECHA.fps;
  }
  
  /// It returns the camera controls
  /**
   * @return The camera controls
   */
  getCameraControls () {
    return this.trackballControls;
  }
  
  /// It updates the aspect ratio of the camera
  /**
   * @param anAspectRatio - The new aspect ratio for the camera
   */
  setCameraAspect (anAspectRatio) {
    this.camera.aspect = anAspectRatio;
    this.camera.updateProjectionMatrix();
  }
  
}
  
  // Application modes
  TheScene.NO_ACTION = 0;