import pkg from '@jscad/modeling';
const {cube} = pkg.primitives;
 const solid1 = () => {
   
  const colors = null
  return cube({size:100}) 
}

 const main = ()  =>   {


 return [solid1()]
}

export default  main