import {
	DirectionalLight,
	HemisphereLight,
	AmbientLight,
	PerspectiveCamera,
	OrthographicCamera,
	BufferGeometry,
	Scene,
	WebGLRenderer, 
	Box3,
	Vector3,
	Group,
    Object3D,
	Mesh,
	MeshPhongMaterial,
	AxesHelper,  
	GridHelper,
} from "three"; 
//import { WebGPURenderer } from '';
//import {	
//  WebGPURenderer
//} from "three/webgpu"
//import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {STLExporter} from "three/addons/exporters/STLExporter.js" ;
//const cube = new Mesh();
//const loader = new STLLoader()

const scene = new Scene();
const group = new Group();
const LightGroup = new Group();
const helpGroup = new Group();
const hemisphereLight = new HemisphereLight(
	0xffffbb, // 天空颜色
	0xffffbb, // 地面颜色
	0.6 // 强度
  );
scene.add(hemisphereLight,);
const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
LightGroup.add(directionalLight);

// 2. 环境光 - 填充阴影，避免完全黑暗的区域
const ambientLight = new AmbientLight(0x404040, 0.3);
LightGroup.add(ambientLight);

// 3. 补光 - 从相反方向提供柔和光线
const fillLight = new DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, 5, -5);
LightGroup.add(fillLight);

// 4. 边缘光/轮廓光 - 增强物体轮廓
const rimLight = new DirectionalLight(0xffffff, 0.4);
rimLight.position.set(0, 5, -10);
LightGroup.add(rimLight);

let DefaultSolidSize = 20
const axes = new AxesHelper(DefaultSolidSize);
const grid = new GridHelper(DefaultSolidSize*2)

 
helpGroup.add(axes,grid);
export const HelperGroupChange = (changeKey:number)=>{
	helpGroup.children.forEach((v,i)=>{
		v.visible = (changeKey & (1<<i)) !== 0
	})
	return changeKey
 
}
const  HelperGroupUpdate = (size:number,)=>{
	if (size === DefaultSolidSize)return;
	const scale = size/DefaultSolidSize
	//DefaultSolidSize = size
	//console.log(DefaultSolidSize)
	//const axesh = helpGroup.children[0]
	if (helpGroup.children.at(0)?.visible){
		helpGroup.children[0].scale.set(scale,scale,scale)
		//helpGroup.children[0] = new AxesHelper(DefaultSolidSize);
	}
	if (helpGroup.children.at(1)?.visible){
		helpGroup.children[1].scale.set(scale,scale,scale)
		//helpGroup.children[1].clear()
		//helpGroup.children[1] = new GridHelper(DefaultSolidSize*2);
	}
}
scene.background = null; 

//const cameraP = new PerspectiveCamera(40, 1, 0.1, 2000);// new PerspectiveCamera(50, 1, 0.1, 2000); 
//const camerak = new OrthographicCamera(0,0,0,0,0.1,2000);
let camera:OrthographicCamera|PerspectiveCamera =new PerspectiveCamera(40, 1, 0.1, 2000); ; 
let renderer:WebGLRenderer;
let OrbControls:OrbitControls;
let _el: HTMLCanvasElement;
/*
const directionalLight = new DirectionalLight( 0xffffff, 0.2 );
directionalLight.position.set(0, 1, 0)  

const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
//hemisphereLight.position.set(1, 1, 1);
const axes = new AxesHelper(20);
LightGroup.add(directionalLight,axes,hemisphereLight)
*/
scene.add(helpGroup);
scene.add(group);
scene.add(LightGroup);
const getSceneSize = (obj:Object3D)=>{
	const fobj = new Box3().setFromObject(obj);
	return fobj.getSize(new Vector3());
	 
};
const getSize = (obj?:Object3D)=>{
	if (!obj){
		return 10
	}
	//const sceneSize = getSceneSize(obj);
	return getSceneSize(obj).length() || 10;
};
const ExporterSTL =new STLExporter();
export const Exporter  = ()=> ExporterSTL.parse(group,{binary: true});
//let viewDistance = 1;
let QviewDistance = 15;
let isOrthographic = false;
let cameraFov:number = 1;// =cameraP.fov;
const perspectiveViews:any  = {
	front:  { position: new  Vector3(0, 0, 1), up: new Vector3(0, 1, 0) },
	back:   { position: new Vector3(0, 0, -1),  up: new Vector3(0, 1, 0) },
	left:   { position: new Vector3(-1, 0, 0),  up: new Vector3(0, 1, 0) },
	right:  { position: new Vector3(1, 0, 0),  up: new Vector3(0, 1, 0) },
	top:    { position: new Vector3(0, 1, 0),  up: new Vector3(0, 0, -1) },
	bottom: { position: new Vector3(0, -1, 0),  up: new Vector3(0, 0, 1) },
	//isometric: { position: new Vector3(8, 8, 8),  up: new Vector3(0, 1, 0) }
};

const orthographicViews = {
	front:  { position: new Vector3(0, 0, QviewDistance), up: new Vector3(0, 1, 0) },
	back:   { position: new Vector3(0, 0, -QviewDistance), up: new Vector3(0, 1, 0) },
	left:   { position: new Vector3(-QviewDistance, 0, 0), up: new Vector3(0, 1, 0) },
	right:  { position: new Vector3(QviewDistance, 0, 0), up: new Vector3(0, 1, 0) },
	top:    { position: new Vector3(0, QviewDistance, 0), up: new Vector3(0, 0, -1) },
	bottom: { position: new Vector3(0, -QviewDistance, 0), up: new Vector3(0, 0, 1) },
	//isometric: { position: new Vector3(10, 10, 10), up: new Vector3(0, 1, 0) }
};
export function switchView(direction:string) {
	const views = isOrthographic ? orthographicViews : perspectiveViews;
	const view = views[direction];
	console.log(direction,view);
	if (view) {
		// 直接设置相机位置和朝向
		camera.position.copy( isOrthographic?view.position:getSizeVector(group,view.position.clone()) );
		camera.up.copy(view.up);
		camera.lookAt(0, 0, 0);
		//if (!isOrthographic){cameraP.aspect = el.width/el.height	;}
		// 更新控制器
		OrbControls.target.set(0, 0, 0);
		OrbControls.update();
	}
}
function getSizeVector  (obj: Object3D,position:Vector3){
	const p = new Vector3(position[0]&1^1,position[1]&1^1,position[1]&1^1);
	const  sizeM = getSceneSize(obj);
	const size = sizeM.multiply(p).length();
	//console.log("pz",size,position);
	HelperGroupUpdate(size/2);
	const fov =  cameraFov*(Math.PI /180); 	 
	const z = size /2/Math.tan(fov/2); 
	return position.multiplyScalar(z);
};

export function onWindowResize(el: HTMLCanvasElement, changeCamera:string = "Perspective" ) {
	if (!renderer){
		return;
	}
	//if (group.children.length===0)return;
	//console.log(el.width,el.height,orthographic,changeCamera,group)
 
	if (changeCamera ==="Orthographic"){  
		isOrthographic=true;
		const k = el.width/el.height;
		const s = getSize(group)/2;
		if (camera){
			camera.clear();
		}
		camera = new OrthographicCamera(0,0,0,0,0.1,2000); 
		camera.left = -s *k;
		camera.right = s*k;
		camera.top = s;
		camera.bottom = -s;
		camera.position.set(0,0,-s); 
		QviewDistance = s;
		
		initOrb(el); 
	}else if (changeCamera==="Perspective"){
		isOrthographic=false;
		if (camera){
			camera.clear();
		}
		camera =new PerspectiveCamera(40, 1, 0.1, 2000);
		const  size = getSize(group);
		cameraFov = camera.fov;
		const fov =  camera.fov*(Math.PI /180); 	 
		camera.position.z = size /2/Math.tan(fov/2); 	
		//viewDistance =  camera.position.z;	
		camera.aspect = el.width/el.height	;
		initOrb(el)	;	
	} 
	camera.updateProjectionMatrix();
	renderer.setSize(el.width,el.height);	
	renderer.render(scene, camera);
	switchView("front");
}
const AnimationFrame = ()=>{
	requestAnimationFrame(() => {
		renderer.render(scene, camera);
		//OrbControls.update();
	}); 	
};
const initOrb = (el:HTMLCanvasElement)=>{
	if (OrbControls){
		OrbControls.object = camera;
		OrbControls.removeEventListener("change",AnimationFrame);
		//return;
		//OrbControls.dispose()
	}else{
		OrbControls = new OrbitControls(camera, el); 
	}
	
	OrbControls.addEventListener("change",AnimationFrame);

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
};
 
const initRender = (el:HTMLCanvasElement,orthographic:boolean=false)=>{
	renderer = new WebGLRenderer({ antialias: true,alpha:true, canvas: el,preserveDrawingBuffer:true, });
	//camera =orthographic?(new OrthographicCamera(el.width/-2,el.width/2,el.height/2,el.height/-2,1,1000)):(new PerspectiveCamera(50, 1, 1, 1000)); 
	//renderTarget = new WebGLRenderTarget( el.width,el.height );
	//renderer.setRenderTarget(renderTarget)
	
	initOrb(el) ;
 
	//onWindowResize(el,true,orthographic)
	
};
export const  startSceneOBJTF = (el: HTMLCanvasElement,...object: Object3D[])=>{
	if (el !== _el){
		_el = el
		initRender(el)
		 
	}	else{
		group.clear();
		/*
		const al = 0.3
		const directionalLight1 = new DirectionalLight( 0xffffff, al );
		directionalLight1.position.set(-1, -1, -1)  
		const directionalLight2 = new DirectionalLight( 0xffffff, al );
		directionalLight2.position.set(1, 1, 1)  
		group.add(...object)
		
		*/
	}

	//group.add(hemisphereLight);
	//onWindowResize(el)	 

}
 
export const  startSceneOBJ = (el: HTMLCanvasElement)=>{
	if (el !== _el){
		_el = el;
		initRender(el);
		 
	}	else{
		group.clear();
		//cube.clear();
		//group.add(hemisphereLight,axes)
	}

	//group.add(hemisphereLight);
	//onWindowResize(el)	 

}
const materialSTL = new MeshPhongMaterial({
	color: 0x0078d4,
	specular: 0x111111,
	shininess: 200
});
export const addSceneSTL = (el:HTMLCanvasElement,m:BufferGeometry) =>{
	if (el !== _el){
		_el = el;
		initRender(el);
	}	
	group.add(new Mesh(m,materialSTL));
	onWindowResize(el);
	return;
};
export const  addSceneOBJ = (el: HTMLCanvasElement,...m:Object3D[])=>{
	if (el !== _el){
		_el = el
		initRender(el)
	}	
	//console.log(m)
 
	group.add(...m )
	
	
	//group.updateMatrix()
	return

}
 