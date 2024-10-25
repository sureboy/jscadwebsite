import {
	//BoxGeometry,
	DirectionalLight,
	HemisphereLight,
 
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	//WebGPURenderer,
	Box3,
	Vector3,
 
    Object3D
} from "three"; 
//import {	
//  WebGPURenderer
//} from "three/webgpu"
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//const cube = new Mesh(geometry, material);
const loader = new STLLoader()

const scene = new Scene();
scene.background = null; 
const camera = new PerspectiveCamera(50, 1, 0.1, 2000); 
let renderer:WebGLRenderer;
let OrbControls:OrbitControls;
let _el: HTMLCanvasElement;
const directionalLight = new DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(0, 1, 0)  
const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(1, 1, 1);
let stopAnimate=false;
const animate = (t:number) => {
	if (stopAnimate)return;
	requestAnimationFrame(animate);
	//console.log(t)
	//cube.rotation.x += 0.01;
	//scene.rotation.y += 0.005;
	//scene.rotation.x+=0.0025;
	renderer.render(scene, camera)
	//renderer.render(scene, camera);
	OrbControls.update();
};
  
export function onWindowResize(el: HTMLCanvasElement) {
	//let w = el.width>el.height?el.height:el.width
	//if (!renderer){
		//if (!window.navigator.gpu)
	//	renderer = new WebGLRenderer({ antialias: true,alpha:true, canvas: el,preserveDrawingBuffer:false, });
		//else 
		//renderer = new WebGPURenderer({ antialias: true,alpha:true, canvas: el,  });
		//renderer.render(scene, camera)
	//	animate();
	//}
	if (!renderer)return;
	camera.aspect = el.width/el.height
	camera.updateProjectionMatrix()
	renderer.setSize(el.width,el.height)	
	renderer.render(scene, camera)
}
export const createSceneOBJ = (el: HTMLCanvasElement,m:Object3D[] ) => { 
	if (el !== _el){
		renderer = new WebGLRenderer({ antialias: true,alpha:true, canvas: el,preserveDrawingBuffer:false, });
		OrbControls = new OrbitControls(camera, el);
		stopAnimate = true
		_el = el
		OrbControls.enableDamping = true
	}	
	scene.clear();
	scene.add(hemisphereLight);
	scene.add(directionalLight); 
	scene.add(...m )
	const sceneSize = new Box3().setFromObject(scene).getSize(new Vector3())
	const size = sceneSize.length();
	const fov =  camera.fov*(Math.PI /180); 
	camera.position.z = size /1.5/Math.tan(fov/2); 

	onWindowResize(el)	 
	if (stopAnimate){
		stopAnimate=false
		animate(0);
	}


	//directionalLight.position.z=  camera.position.z 
	//console.log(size,sceneSize)
			 	 
 
 
};