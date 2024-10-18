import {
    MeshPhongMaterial,
    LineBasicMaterial,
    BufferGeometry,
    BufferAttribute,
    Mesh,
    InstancedMesh,
    Line,
    LineSegments,
    Color,
    Vector3,
} from "three"; 
import type {MeshPhongMaterialParameters,LineBasicMaterialParameters,TypedArray,Matrix4,Matrix4Tuple} from "three" 
import type {Geometry,Geom3, Poly3 ,Geom2, Path2} from '@jscad/modeling/src/geometries/types';
import type {Vec3,Vec2} from '@jscad/modeling/src/maths/types'
export interface csgObj {
    polygons:TypedArray
    list:TypedArray,
    vertices:TypedArray;
    indices?:TypedArray; 
    normals?:TypedArray;
    color?:TypedArray;
    colors?:TypedArray;
    isTransparent?:boolean;
    opacity? :any;
    transforms?:Matrix4Tuple;
    type?:any;
}  
const flatShading = false
const materials:Record<string,any> = {
  mesh: {
    def: new MeshPhongMaterial({ color: 0x0084d1, flatShading }),
    make: (params:MeshPhongMaterialParameters) => new MeshPhongMaterial({ ...params,flatShading }),
  },
  line: {
    def: new LineBasicMaterial({ color: 0x0000ff }),
    make: (params:LineBasicMaterialParameters) => new LineBasicMaterial(params),
  },
  lines: null,
}
materials.lines = materials.line
materials.instance = materials.mesh // todo support instances for lines
export function CSG2Three(obj:csgObj , { smooth = false }) {
    //const obj = CSG2Vertices(csg)
    const { vertices, indices, normals, color, colors, isTransparent = false, opacity } = obj
    let { transforms } = obj
    const objType = obj.type || 'mesh'

    const materialDef = materials[objType]
    if (!materialDef) {
      console.error(`material not found for type ${objType}`, obj)
      return
    }
    let material = materialDef.def
    const isInstanced = obj.type === 'instance'
    if ((color || colors) && !isInstanced) {
      const c = color || colors
      const opts:{color?:Color,vertexColors:boolean,opacity:any,transparent:boolean} = {       
        vertexColors: !!colors,
        opacity: c![3] === undefined ? 1 : c![3],
        transparent: (color && c![3] !== 1 && c![3] !== undefined) || isTransparent,
      }
      if (opacity) opts.opacity = opacity
      if (!colors) opts.color =  new Color(color![0], color![1], color![2])
      material = materialDef.make(opts)
      if (opacity) {
        material.transparent = true
        material.opacity = opacity
      }
    }

    let geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(vertices, 3))
    if (indices) geo.setIndex(new BufferAttribute(indices, 1))
    if (normals) geo.setAttribute('normal', new BufferAttribute(normals, 3))
    if(smooth) geo = toCreasedNormals( geo, Math.PI / 10)
    if (colors) geo.setAttribute('color', new BufferAttribute(colors, isTransparent ? 4 : 3))

    let mesh:any
    //mesh = new Mesh(geo, material)
   
    switch (objType) {
      case 'mesh':
        mesh = new Mesh(geo, material)
        break
      case 'instance':
        const { list } = obj
        console.log(list)
        /*
        mesh = new InstancedMesh(geo, materials.mesh.make({ color: 0x0084d1 }), list.length)
        list.forEach((item, i) => {
          copyTransformToArray(item.transforms, mesh.instanceMatrix.array, i * 16)
        })
        transforms = undefined
        */
        break
      case 'line':
        mesh = new Line(geo, material)
        break
      case 'lines':
        // https://threejs.org/docs/#api/en/materials/LineBasicMaterial
        mesh = new LineSegments(geo, material)
        break
    }
        
    if (transforms && !isInstanced) mesh.applyMatrix4({ elements: transforms }as Matrix4)
    return mesh
  }
// shortcut for setMatrixAt for InstancedMesh
function copyTransformToArray(te:TypedArray, array:TypedArray , offset = 0) {
  array[offset] = te[0]
  array[offset + 1] = te[1]
  array[offset + 2] = te[2]
  array[offset + 3] = te[3]

  array[offset + 4] = te[4]
  array[offset + 5] = te[5]
  array[offset + 6] = te[6]
  array[offset + 7] = te[7]

  array[offset + 8] = te[8]
  array[offset + 9] = te[9]
  array[offset + 10] = te[10]
  array[offset + 11] = te[11]

  array[offset + 12] = te[12]
  array[offset + 13] = te[13]
  array[offset + 14] = te[14]
  array[offset + 15] = te[15]

  return array
}

 
 
  function toCreasedNormals(  geometry:BufferGeometry, creaseAngle = Math.PI / 3 /* 60 degrees */) {
    const creaseDot = Math.cos(creaseAngle)
    const hashMultiplier = (1 + 1e-10) * 1e2
  
    // reusable vectors
    const verts = [new Vector3(), new Vector3(), new Vector3()]
    const tempVec1 = new Vector3()
    const tempVec2 = new Vector3()
    const tempNorm = new Vector3()
    const tempNorm2 = new Vector3()
  
    // hashes a vector
    function hashVertex(v:Vector3) {
      const x = ~~(v.x * hashMultiplier)
      const y = ~~(v.y * hashMultiplier)
      const z = ~~(v.z * hashMultiplier)
      return `${x},${y},${z}`
    }
  
    // BufferGeometry.toNonIndexed() warns if the geometry is non-indexed
    // and returns the original geometry
    const resultGeometry = geometry.index ? geometry.toNonIndexed() : geometry
    const posAttr = resultGeometry.attributes.position
    const vertexMap:Record<string,any>= {}
  
    // find all the normals shared by commonly located vertices
    for (let i = 0, l = posAttr.count / 3; i < l; i++) {
      const i3 = 3 * i
      const a = verts[0].fromBufferAttribute(posAttr, i3 + 0)
      const b = verts[1].fromBufferAttribute(posAttr, i3 + 1)
      const c = verts[2].fromBufferAttribute(posAttr, i3 + 2)
  
      tempVec1.subVectors(c, b)
      tempVec2.subVectors(a, b)
  
      // add the normal to the map for all vertices
      const normal = new Vector3().crossVectors(tempVec1, tempVec2).normalize()
      for (let n = 0; n < 3; n++) {
        const vert = verts[n]
        const hash = hashVertex(vert)
        if (!(hash in vertexMap)) {
          vertexMap[hash] = []
        }
  
        vertexMap[hash].push(normal)
      }
    }
  
    // average normals from all vertices that share a common location if they are within the
    // provided crease threshold
    const normalArray = new Float32Array(posAttr.count * 3)
    const normAttr = new BufferAttribute(normalArray, 3, false)
    for (let i = 0, l = posAttr.count / 3; i < l; i++) {
      // get the face normal for this vertex
      const i3 = 3 * i
      const a = verts[0].fromBufferAttribute(posAttr, i3 + 0)
      const b = verts[1].fromBufferAttribute(posAttr, i3 + 1)
      const c = verts[2].fromBufferAttribute(posAttr, i3 + 2)
  
      tempVec1.subVectors(c, b)
      tempVec2.subVectors(a, b)
  
      tempNorm.crossVectors(tempVec1, tempVec2).normalize()
  
      // average all normals that meet the threshold and set the normal value
      for (let n = 0; n < 3; n++) {
        const vert = verts[n]
        const hash = hashVertex(vert)
        const otherNormals = vertexMap[hash]
        tempNorm2.set(0, 0, 0)
  
        for (let k = 0, lk = otherNormals.length; k < lk; k++) {
          const otherNorm = otherNormals[k]
          if (tempNorm.dot(otherNorm) > creaseDot) {
            tempNorm2.add(otherNorm)
          }
        }
  
        tempNorm2.normalize()
        normAttr.setXYZ(i3 + n, tempNorm2.x, tempNorm2.y, tempNorm2.z)
      }
    }
  
    resultGeometry.setAttribute('normal', normAttr)
    return resultGeometry
  }
  export function CSGSides2LineSegmentsVertices (csg:Geom2) {
    const vLen = csg.sides.length * 6
    //const {transforms} = csg
    const vertices = new Float32Array(vLen)
    csg.sides.forEach((side, idx) => {
      const i = idx * 6
      setPoints(vertices, side[0], i)
      setPoints(vertices, side[1], i + 3)
    })
    return { type: 'lines', vertices, transforms:csg.transforms } as csgObj
  }
  export function CSG2LineVertices (csg:Path2) {
    let vLen = csg.points.length * 3
    if (csg.isClosed) vLen += 3
     
    const vertices = new Float32Array(vLen)
  
    csg.points.forEach((p, idx) => setPoints(vertices, p, idx * 3))
  
    if (csg.isClosed) {
      setPoints(vertices, csg.points[0], vertices.length - 3)
    }
    return { type: 'line', vertices ,transforms:csg.transforms} as csgObj
  }
  const setPoints = (points:TypedArray, p:Vec2|Vec3, i:number) => {
    points[i++] = p[0]
    points[i++] = p[1]
    points[i++] = p[2] || 0
  }
  export function CSG2Vertices (csg:Geom3) {
    console.log(csg)
    let vLen = 0; let iLen = 0
    for (const poly of csg.polygons) {
      const len = poly.vertices.length
      vLen += len * 3
      iLen += 3 * (len - 2)
    }
    const vertices = new Float32Array(vLen)
    const normals = new Float32Array(vLen)
    const indices = vLen > 65535 ? new Uint32Array(iLen) : new Uint16Array(iLen)
  
    let vertOffset = 0
    let indOffset = 0
    let posOffset = 0
    let first = 0
    for (const poly of csg.polygons) {
      const arr = poly.vertices
      const normal = calculateNormal(arr)
      const len = arr.length
      first = posOffset
      vertices.set(arr[0], vertOffset)
      normals.set(normal, vertOffset)
      vertOffset += 3
      vertices.set(arr[1], vertOffset)
      normals.set(normal, vertOffset)
      vertOffset += 3
      posOffset += 2
      for (let i = 2; i < len; i++) {
        vertices.set(arr[i], vertOffset)
        normals.set(normal, vertOffset)
  
        indices[indOffset++] = first
        indices[indOffset++] = first + i -1
        indices[indOffset++] = first + i
        vertOffset += 3
        posOffset += 1
      }
    }
    return { type: 'mesh', vertices, indices, normals ,transforms:csg.transforms} as csgObj
  }
  
  const calculateNormal = (vertices:any) => {
    const v0 = vertices[0]
    const v1 = vertices[1]
    const v2 = vertices[2]
  
    const Ax = v1[0] - v0[0]
    const Ay = v1[1] - v0[1]
    const Az = v1[2] - v0[2]
  
    const Bx = v2[0] - v0[0]
    const By = v2[1] - v0[1]
    const Bz = v2[2] - v0[2]
  
    const Nx = Ay * Bz - Az * By
    const Ny = Az * Bx - Ax * Bz
    const Nz = Ax * By - Ay * Bx
  
    const len = Math.hypot(Nx, Ny, Nz)
    return [Nx / len, Ny / len, Nz / len]
  }
   