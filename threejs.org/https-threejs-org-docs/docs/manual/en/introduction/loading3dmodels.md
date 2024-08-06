 

3D models are available in hundreds of file formats, each with different purposes, assorted features, and varying complexity. Although [three.js provides many loaders](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/loaders), choosing the right format and workflow will save time and frustration later on. Some formats are difficult to work with, inefficient for realtime experiences, or simply not fully supported at this time.

This guide provides a workflow recommended for most users, and suggestions for what to try if things don't go as expected.

Before we start
---------------

If you're new to running a local server, begin with [installation](#manual/introduction/Installation) first. Many common errors viewing 3D models can be avoided by hosting files correctly.

Recommended workflow
--------------------

Where possible, we recommend using glTF (GL Transmission Format). Both .GLB and .GLTF versions of the format are well supported. Because glTF is focused on runtime asset delivery, it is compact to transmit and fast to load. Features include meshes, materials, textures, skins, skeletons, morph targets, animations, lights, and cameras.

Public-domain glTF files are available on sites like [Sketchfab](https://sketchfab.com/models?features=downloadable&sort_by=-likeCount&type=models), or various tools include glTF export:

*   [Blender](https://www.blender.org/) by the Blender Foundation
*   [Substance Painter](https://www.allegorithmic.com/products/substance-painter) by Allegorithmic
*   [Modo](https://www.foundry.com/products/modo) by Foundry
*   [Toolbag](https://www.marmoset.co/toolbag/) by Marmoset
*   [Houdini](https://www.sidefx.com/products/houdini/) by SideFX
*   [Cinema 4D](https://labs.maxon.net/?p=3360) by MAXON
*   [COLLADA2GLTF](https://github.com/KhronosGroup/COLLADA2GLTF) by the Khronos Group
*   [FBX2GLTF](https://github.com/facebookincubator/FBX2glTF) by Facebook
*   [OBJ2GLTF](https://github.com/AnalyticalGraphicsInc/obj2gltf) by Analytical Graphics Inc
*   …and [many more](http://github.khronos.org/glTF-Project-Explorer/)

If your preferred tools do not support glTF, consider requesting glTF export from the authors, or posting on [the glTF roadmap thread](https://github.com/KhronosGroup/glTF/issues/1051).

When glTF is not an option, popular formats such as FBX, OBJ, or COLLADA are also available and regularly maintained.

Loading
-------

Only a few loaders (e.g. [ObjectLoader](https://threejs.org/docs/index.html#api/en/loaders/ObjectLoader "ObjectLoader")) are included by default with three.js — others should be added to your app individually.

`import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';`

Once you've imported a loader, you're ready to add a model to your scene. Syntax varies among different loaders — when using another format, check the examples and documentation for that loader. For glTF, usage with global scripts would be:

`const loader = new GLTFLoader(); loader.load( 'path/to/model.glb', function ( gltf ) { scene.add( gltf.scene ); }, undefined, function ( error ) { console.error( error ); } );`

See [GLTFLoader documentation](https://threejs.org/docs/index.html#examples/en/loaders/GLTFLoader "GLTFLoader") for further details.

Troubleshooting
---------------

You've spent hours modeling an artisanal masterpiece, you load it into the webpage, and — oh no! 😭 It's distorted, miscolored, or missing entirely. Start with these troubleshooting steps:

1.  Check the JavaScript console for errors, and make sure you've used an `onError` callback when calling `.load()` to log the result.
2.  View the model in another application. For glTF, drag-and-drop viewers are available for [three.js](https://gltf-viewer.donmccurdy.com/) and [babylon.js](https://sandbox.babylonjs.com/). If the model appears correctly in one or more applications, [file a bug against three.js](https://github.com/mrdoob/three.js/issues/new). If the model cannot be shown in any application, we strongly encourage filing a bug with the application used to create the model.
3.  Try scaling the model up or down by a factor of 1000. Many models are scaled differently, and large models may not appear if the camera is inside the model.
4.  Try to add and position a light source. The model may be hidden in the dark.
5.  Look for failed texture requests in the network tab, like `"C:\\Path\To\Model\texture.jpg"`. Use paths relative to your model instead, such as `images/texture.jpg` — this may require editing the model file in a text editor.

Asking for help
---------------

If you've gone through the troubleshooting process above and your model still isn't working, the right approach to asking for help will get you to a solution faster. Post a question on the [three.js forum](https://discourse.threejs.org/) and, whenever possible, include your model (or a simpler model with the same problem) in any formats you have available. Include enough information for someone else to reproduce the issue quickly — ideally, a live demo.

![](https://threejs.org/files/ic_mode_edit_black_24dp.svg)