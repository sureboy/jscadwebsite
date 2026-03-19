<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import manifold from '$lib/manifold-3d';

  // 容器引用
  let container;

  // Three.js 核心变量
  let scene, camera, renderer, controls;
  let mesh; // 用于后续可能的更新

  // 动画帧 ID
  let animationId;

  // 初始化 Three.js 场景
  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // 基础光照
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x446688, 0.5);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    // 辅助网格
    const gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
    scene.add(gridHelper);
  }

  // 使用 Manifold 创建几何体并添加到场景
  async function createManifoldMesh() {
    try {
 
  // 确保 manifold 已准备就绪
  //console.log(manifold)
  //if (manifold.Manifold.ready) {
  //  await manifold.ready;
  //}
      const Manifold = await  manifold()
      console.log('创建 Manifold 几何体...',Manifold,Manifold.Manifold);
      //const  Manifold = new manifold.Manifold(new manifold.Mesh({}))
      // 1. 创建圆角立方体 (尺寸 2x2x2，圆角半径 0.3，分段数 32)
      Manifold.setup()
      const box = Manifold.Manifold.cube([2, 2, 2]);

      // 2. 创建球体 (半径 1.2，分段数 48)
      const sphere = Manifold.Manifold.sphere(1.2, 48);

      // 3. 平移球体
      const sphereTranslated = sphere.translate([0.8, 0.8, 0.8]);

      // 4. 布尔差集：立方体减去球体
      const result = box.subtract(sphereTranslated);

      console.log('布尔运算完成，提取网格数据...');

      // 5. 获取三角网格数据
      const meshData = result.getMesh();

      // 6. 提取顶点和索引
      const vertices = meshData.vertProperties; // Float32Array
      const indices = meshData.triVerts;        // Uint32Array

      console.log(`顶点数: ${vertices.length / 3}, 三角形数: ${indices.length / 3}`);

      // 7. 创建 Three.js BufferGeometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals(); // 计算法线，否则光照错误

      // 8. 创建材质
      const material = new THREE.MeshStandardMaterial({
        color: 0x3a6ea5,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide // 为了看到内部凹陷，启用双面渲染
      });

      // 9. 创建网格并添加到场景
      mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      scene.add(mesh);

      console.log('模型已添加到场景');
    } catch (error) {
      console.error('Manifold 运算失败:', error);
      // 出错时显示一个简单的线框立方体作为后备
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshStandardMaterial({ color: 0xff3333, wireframe: true });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }
  }

  // 动画循环
  function animate() {
    controls.update(); // 更新控制器（包含自动旋转）
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  }

  // 组件挂载后初始化
  onMount( () => {
    initThree();
    createManifoldMesh().then(()=>{
        animate();
    }); // 等待几何体创建完成
    

    // 处理窗口大小变化
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      // 可选：释放几何体和材质
      if (mesh) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    };
  });
</script>

<main>
  <div
    bind:this={container}
    class="canvas-container"
  ></div>
</main>

<style>
  .canvas-container {
    width: 100vh;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
</style>