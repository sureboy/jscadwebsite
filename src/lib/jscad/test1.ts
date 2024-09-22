import pkg from '@jscad/modeling';
const {cube} = pkg.primitives;

//
// solid 1 : 264 points, 88 faces, 0 colors
//
const solid1 = () => {
   
  const colors = null
  return cube({center:[10,20,10]}) 
}

const main = () => {
 return [solid1()]
}

export default  main
