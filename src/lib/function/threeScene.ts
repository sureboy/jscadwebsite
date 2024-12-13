import {
	DirectionalLight,
	HemisphereLight,
	PerspectiveCamera,
	OrthographicCamera,
	Scene,
	WebGLRenderer, 
	Box3,
	Vector3,
	Group,
    Object3D
} from "three"; 
//import {	
//  WebGPURenderer
//} from "three/webgpu"
//import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//const cube = new Mesh(geometry, material);
//const loader = new STLLoader()

const scene = new Scene();
const group = new Group();

scene.background = null; 

const cameraP = new PerspectiveCamera(50, 1, 0.1, 2000); 
const camerak = new OrthographicCamera()
let camera:any =cameraP ; 
let renderer:WebGLRenderer;
let OrbControls:OrbitControls;
let _el: HTMLCanvasElement;
const directionalLight = new DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(0, 1, 0)  
const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(1, 1, 1);

scene.add(group,hemisphereLight)

let stopAnimate=true;
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
  
export function onWindowResize(el: HTMLCanvasElement,changeCamera:boolean = true,orthographic:boolean=false) {
	if (!renderer)return;
	const fobj = new Box3().setFromObject(group)
	const sceneSize = fobj.getSize(new Vector3())
	console.log(el.width,el.height)
	if (orthographic){
		const k = el.width/el.height
		const s = 200
		camera = new OrthographicCamera( -s *k,s*k,s,-s,1,1000)
		if (changeCamera){
			camera.position.set(200,300,200);
			camera.lookAt(scene.position)			
		}
	}else{
		camera = cameraP
		if (changeCamera){
			const size = sceneSize.length();
			const fov =  camera.fov*(Math.PI /180); 	 
			camera.position.z = size /2/Math.tan(fov/2); 	
			camera.aspect = el.width/el.height
			
		}
	}
	OrbControls.object = camera
	camera.updateProjectionMatrix()
	renderer.setSize(el.width,el.height)	
	renderer.render(scene, camera)
}
const initRender = (el:HTMLCanvasElement,orthographic:boolean=false)=>{
	renderer = new WebGLRenderer({ antialias: true,alpha:true, canvas: el,preserveDrawingBuffer:true, });
	//camera =orthographic?(new OrthographicCamera(el.width/-2,el.width/2,el.height/2,el.height/-2,1,1000)):(new PerspectiveCamera(50, 1, 1, 1000)); 
	
	OrbControls = new OrbitControls(camera, el); 
	OrbControls.addEventListener("start",(e)=>{ 
		if (stopAnimate){
			stopAnimate=false
			animate(0)
		}			
	})
	OrbControls.addEventListener("end",(e)=>{ 
		stopAnimate=true
	})	
	onWindowResize(el,true,orthographic)
	
}
export const  startSceneOBJ = (el: HTMLCanvasElement)=>{
	if (el !== _el){
		_el = el
		initRender(el)
		 
	}	
	group.clear();
	//group.add(hemisphereLight);
	//onWindowResize(el)	 

}
export const  addSceneOBJ = (el: HTMLCanvasElement,...m:Object3D[])=>{
	if (el !== _el){
		_el = el
		initRender(el)
	}	
 
	group.add(...m )
	return

}
 