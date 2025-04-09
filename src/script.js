import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {} //put everything we need so that its inside an object
debugObject.createSphere = () => {
    // to create spheres randomly
    //console.log('create sphere')
    createSphere(
        0.5 * Math.random(), 
        {
            x:(Math.random()-0.5)*3, // as positive as negative is Math,random-0.5 i.e -0.5 to + 0.5 
            y:3, 
            z:(Math.random()-0.5)*3})
}
debugObject.createBox = () => {
    // to create spheres randomly
    //console.log('create sphere')
    createBox(
        Math.random(),
        Math.random(),
        Math.random(), 
        {
            x:(Math.random()-0.5)*3, // as positive as negative is Math,random-0.5 i.e -0.5 to + 0.5 
            y:3, 
            z:(Math.random()-0.5)*3})
}
debugObject.reset = () => {
    //removes everything from scene 
    //console.log('reset'); 
    for(const object of objectsToUpdate) {
        object.body.removeEventListener('collide', playHitSound)//also remove the event listener
        world.removeBody(object.body) // remove body
        scene.remove(object.mesh)//remove mesh 
    }

    objectsToUpdate.splice(0, objectsToUpdate.length) // this is to empty the array objectsToUpdate

}

gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')
//gui.add(anObject, '')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3');

const playHitSound = (collision) => {

    //get the strength of the collissiom
    //console.log(collision.contact.getImpactVelocityAlongNormal())

    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength>1.5) {
      //add some randomness to the sound so each collission has different volumes
      hitSound.volume = Math.random() 
      //when there are multiple collissions, when we call hitSound.play() while the sound is playing, nothing happens because it is already playing
      hitSound.currentTime = 0 // moving the bar to beginniung of music
      hitSound.play()
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/2/px.png',
    '/textures/environmentMaps/2/nx.png',
    '/textures/environmentMaps/2/py.png',
    '/textures/environmentMaps/2/ny.png',
    '/textures/environmentMaps/2/pz.png',
    '/textures/environmentMaps/2/nz.png'
])

/**
 * 
 * Random Color
 */
function getRandomColor(){
    //var colorArray = ['red', 'green', 'yellow', 'blue', 'orange', 'pink'];
    var colorArray = ['#D84922', '#15AB53', '#f6b604', '#1404f6', '#f65904', '#f60485'];
    const colorIndex = Math.floor(Math.random()* colorArray.length); 
    const color = colorArray[colorIndex]; 
    //console.log(color); 
    return color;
  }

/** Physics world */
const world = new CANNON.World();

world.broadphase = new CANNON.SAPBroadphase(world) // for performance
world.allowSleep = true // if an object is not moving, let it sleep 
world.gravity.set(0, -9.82, 0); //vec3 in cannon js - y axis and -ve as going down 
//materials
/** this is when you have 2 materials
const concreteMaterial = new CANNON.Material('concrete')
const plasticMaterial = new CANNON.Material('plastic')
//contact material - what happens when concrete meets plastic? collision physics... 
const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    concreteMaterial,
    plasticMaterial,
    {
        friction: 0.1, //when the materials meet 
        restitution: 0.7 //more bounce, greater the value 
    }
)
world.addContactMaterial(concretePlasticContactMaterial); 
*/
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1, //when the materials meet 
        restitution: 0.7 //more bounce greater the value
    }
)
world.addContactMaterial(defaultContactMaterial); 
//world.defaultContactMaterial = defaultContactMaterial; 

/** we've removed the sphere 
// in cannon js we create bodies
const sphereShape = new CANNON.Sphere(0.5); //radius
const sphereBody = new CANNON.Body({
    mass: 1, 
    position: new CANNON.Vec3(0, 3, 0), 
    shape: sphereShape,
    material: defaultMaterial
}); 
sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0)) //vec3 - from 150 x to 0, 0, 0 
//add body to thte world
world.addBody(sphereBody); 
*/

// floor
const floorShape = new CANNON.Plane(); 
const floorBody = new CANNON.Body()
floorBody.mass = 0 // this obj is static and won't move
floorBody.material = defaultMaterial
floorBody.addShape(floorShape) // add new shape
//now usually the plane faces the camera when added to the scene, so we need to rotate in the x-axis
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), // in x-axis
    Math.PI * 0.5 // quarter of a circle rotation
    )
world.addBody(floorBody)




/**
 * Test sphere
 
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere)
*/
/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: 'white',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils 
 */
const objectsToUpdate = [] //an array of objects that will contain the mesh and body, that need to be updated

const sphereGeometry = new THREE.SphereGeometry(1,20,20)
const sphereMaterial = new THREE.MeshStandardMaterial({  
    metalness: 0.3, 
    roughness: 0.4, 
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})

const createSphere = (radius, position) => {
    //three js mesh 
    const mesh = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({  
        color: getRandomColor(),
        metalness: 0.3, 
        roughness: 0.4, 
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    }))
    mesh.scale.set(radius,radius,radius)//scale the mesh 
    //mesh.color.set = getRandomColor()
    mesh.castShadow = true
    mesh.position.copy(position) // taking the position from the position parameter
    scene.add(mesh)

    //cannon js body
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape, //comes from const shape
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound) // this is listening to collision to play hitSound
    world.addBody(body)

    // save in objects to save, push an object 
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    })
    
}

createSphere(0.5, {x:0, y:3, z:0});
//createSphere(0.5, {x:2, y:3, z:2});
//createSphere(0.5, {x:3, y:3, z:2});

//create boxes 
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3, 
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})
const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(boxGeometry, new THREE.MeshStandardMaterial({  
        color: getRandomColor(),
        metalness: 0.3, 
        roughness: 0.4, 
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    }));
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true, 
    mesh.position.copy(position) // taking the position from the position parameter
    scene.add(mesh)

    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape, //comes from const shape
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound) // this is listening to collision to play hitSound
    world.addBody(body)

    // save in objects to save, push an object 
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    })


}

createBox(0.5, 1, 2, {x: 3, y: 2, z: 0});

//console.log(objectsToUpdate) // an array containing the mesh and the body 


/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime // how much time since the last tick
    oldElapsedTime = elapsedTime
    //console.log(deltaTime)

    //Update Physics world

    //wind on the x axis on each frame on the sphere body 
    //sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position) // focus on trhe x axis / where in the world are we applying force - ie centre of the object 
    
    world.step(1 / 60, deltaTime, 3) //( fixed time stamp 60 fps, time past since last step, how many iterations can the world apply to catch up with delay )

    // after updating the physics world, loop through this 'objectsToUpdate' array and update the mesh positions according to the body positions 
    for(const object of objectsToUpdate){
        //object.mesh.position = object.body.position
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion) // this is for the box rotation -quaternion instead of rotation 


    }


    //console.log(sphereBody.position.y) // this logs the changing physics world body - keeps falling as there is notjing to stop it like a floor 
    
    //take coordinates and apply them to sphere in three js
    //sphere.position.x = sphereBody.position.x
    //sphere.position.y = sphereBody.position.y
    //sphere.position.z = sphereBody.position.z

    //sphere.position.copy(sphereBody.position)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()