import modeling from '@jscad/modeling'; 
import type {Geometry} from '@jscad/modeling/src/geometries/types';


export  class solidBase    {
    cube  = modeling.primitives.cube
    /*
    cube  = modeling.primitives.cube
    arc  = modeling.primitives.arc
    circle  = modeling.primitives.circle
    cuboid  = modeling.primitives.cuboid
    cylinder  = modeling.primitives.cylinder
    cylinderElliptic  = modeling.primitives.cylinderElliptic
    ellipse  = modeling.primitives.ellipse
    ellipsoid  = modeling.primitives.ellipsoid
    geodesicSphere  = modeling.primitives.geodesicSphere
    line  = modeling.primitives.line
    polygon  = modeling.primitives.polygon
    polyhedron  = modeling.primitives.polyhedron
    rectangle  = modeling.primitives.rectangle
    roundedCuboid  = modeling.primitives.roundedCuboid
    roundedCylinder  = modeling.primitives.roundedCylinder
    roundedRectangle  = modeling.primitives.roundedRectangle
    sphere  = modeling.primitives.sphere
    square  = modeling.primitives.square
    star  = modeling.primitives.star
    torus  = modeling.primitives.torus
    triangle  = modeling.primitives.triangle


    intersect  = modeling.booleans.intersect
    subtract  = modeling.booleans.subtract
    union  = modeling.booleans.union
    scission  = modeling.booleans.scission

    colorize  = modeling.colors.colorize
    colorNameToRgb  = modeling.colors.colorNameToRgb
    hexToRgb  = modeling.colors.hexToRgb
    hslToRgb  = modeling.colors.hslToRgb
    hsvToRgb  = modeling.colors.hsvToRgb
    hueToColorComponent  = modeling.colors.hueToColorComponent
    rgbToHex  = modeling.colors.rgbToHex
    rgbToHsl  = modeling.colors.rgbToHsl
    rgbToHsv  = modeling.colors.rgbToHsv
*/

    primitives  = modeling.primitives
    colors  = modeling.colors
    booleans  = modeling.booleans
    

    curves  = modeling.curves
    geometries  = modeling.geometries

    maths  = modeling.maths
    measurements  = modeling.measurements

    text  = modeling.text
    utils  = modeling.utils
    expansions  = modeling.expansions
    extrusions  = modeling.extrusions

    hulls  = modeling.hulls
    modifiers  = modeling.modifiers
    transforms  = modeling.transforms 

    //static  Ttransforms  = modeling.transforms 

    main(){
        let l:Geometry[] = []
        return l
    }
 
}

export const solidLogo = class extends solidBase {
    
    main=()=>{
      return [this.cube({size:200,center:[0,0,20]})]
    }
  }

