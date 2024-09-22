//export const ssr = false
/** @type {import('./$types').PageLoad} */

export async function load() {
   // let u = new URL(url)
    //let p = u.pathname+"/"+u.searchParams.get("q")
    //console.log(url.pathname)
   // const res = await gositeFetch({url:u.pathname+u.search, form:{} });
    //const res = await getAllCollections();
    const defaultReturn = {products:[{ 
      img : "[[(index . 0).Img]]",
      sub:"[[(index . 0).Sub]]",
      url:"[[(index . 0).Url]]", 
    },
    {
      img : "[[(index . 1).Img]]",
      sub:"[[(index . 1).Sub]]",
      url:"[[(index . 1).Url]]", 
    },
    {
      path:"[[(index . 2).Path]]",
      sub:"[[(index . 2).Sub]]",
      pid:"[[(index . 2).Pid]]",
      stl:"[[(index . 2).Stl]]",
      img : "[[(index . 2).Img]]",
      title:"[[(index . 2).Title]]",
      images :"[[range $idx, $hobby :=  (index . 2).Image]]<img src=\"[[$hobby]]\" alt=\"\" title=\"\" />[[end]]",
    },
   
  ]}
  return defaultReturn;
   
  }