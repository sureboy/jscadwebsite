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
    Object3D,
	AxesHelper
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
const axes = new AxesHelper(20);
scene.add(group,hemisphereLight,axes)

//let stopAnimate=true;
const renderhand = ()=>{
	renderer.render(scene, camera)
	OrbControls.update();
}
/*
const animate = (t:number) => {
	if (stopAnimate)return;
	requestAnimationFrame(animate);
	//console.log(t)
	//cube.rotation.x += 0.01;
	//scene.rotation.y += 0.005;
	//scene.rotation.x+=0.0025;
	renderhand()
	
	//renderer.render(scene, camera);
	//renderer.render(scene, camera)
	//OrbControls.update();
};
*/
const getSize = (obj:Object3D)=>{
	const fobj = new Box3().setFromObject(obj)
	const sceneSize = fobj.getSize(new Vector3())
	let size =   sceneSize.length();
	if (!size) size= getSize(axes)
	return size
}
  
export function onWindowResize(el: HTMLCanvasElement,changeCamera:boolean = true,orthographic:boolean=false) {
	if (!renderer)return;
	//if (group.children.length===0)return;
	//console.log(el.width,el.height,orthographic,changeCamera,group)
	if (orthographic){
		if (changeCamera){ 
			initOrb(el)
			//let  size = getSize(group);
			const k = el.width/el.height
			const s = getSize(group)/2;
			camera = new OrthographicCamera( -s *k,s*k,s,-s,0.1,2000)
			camera.position.set(s,s,s); 
			camera.lookAt(scene.position)
		}
	}else{
		
		if (changeCamera){
			initOrb(el)
			camera = new PerspectiveCamera(40, 1, 0.1, 2000);
			const  size = getSize(group);
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
const initOrb = (el:HTMLCanvasElement)=>{
	OrbControls = new OrbitControls(camera, el); 
	OrbControls.addEventListener("change",()=>{ 
		requestAnimationFrame(() => renderhand()); 	
	})
	/*
	OrbControls.addEventListener("start",(e)=>{ 
		if (stopAnimate){
			stopAnimate=false
			animate(0)
		}			
	})
	OrbControls.addEventListener("end",(e)=>{ 
		stopAnimate=true
	})	
	*/
}
 
const initRender = (el:HTMLCanvasElement,orthographic:boolean=false)=>{
	renderer = new WebGLRenderer({ antialias: true,alpha:true, canvas: el,preserveDrawingBuffer:true, });
	//camera =orthographic?(new OrthographicCamera(el.width/-2,el.width/2,el.height/2,el.height/-2,1,1000)):(new PerspectiveCamera(50, 1, 1, 1000)); 
	initOrb(el) 
 
	//onWindowResize(el,true,orthographic)
	
}
export const  startSceneOBJ = (el: HTMLCanvasElement)=>{
	if (el !== _el){
		_el = el
		initRender(el)
		 
	}	else{
		group.clear();
	}

	//group.add(hemisphereLight);
	//onWindowResize(el)	 

}
export const  addSceneOBJ = (el: HTMLCanvasElement,...m:Object3D[])=>{
	if (el !== _el){
		_el = el
		initRender(el)
	}	
 
	group.add(...m )
	//group.updateMatrix()
	return

}
 