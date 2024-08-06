 

Project structure
-----------------

Every three.js project needs at least one HTML file to define the webpage, and a JavaScript file to run your three.js code. The structure and naming choices below aren't required, but will be used throughout this guide for consistency.

*   _index.html_ `<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>My first three.js app</title> <style> body { margin: 0; } </style> </head> <body> <script type="module" src="/main.js"></script> </body> </html>`
*   _main.js_ `import * as THREE from 'three'; ...`
*   _public/_
    *   The _public/_ folder is sometimes also called a "static" folder, because the files it contains are pushed to the website unchanged. Usually textures, audio, and 3D models will go here.

Now that we've set up the basic project structure, we need a way to run the project locally and access it through a web browser. Installation and local development can be accomplished with npm and a build tool, or by importing three.js from a CDN. Both options are explained in the sections below.

Option 1: Install with NPM and a build tool
-------------------------------------------

### Development

Installing from the [npm package registry](https://www.npmjs.com/) and using a [build tool](https://eloquentjavascript.net/10_modules.html#h_zWTXAU93DC) is the recommended approach for most users — the more dependencies your project needs, the more likely you are to run into problems that the static hosting cannot easily resolve. With a build tool, importing local JavaScript files and npm packages should work out of the box, without import maps.

1.  Install [Node.js](https://nodejs.org/). We'll need it to load manage dependencies and to run our build tool.
2.  Install three.js and a build tool, [Vite](https://vitejs.dev/), using a [terminal](https://www.joshwcomeau.com/javascript/terminal-for-js-devs/) in your project folder. Vite will be used during development, but it isn't part of the final webpage. If you prefer to use another build tool, that's fine — we support modern build tools that can import [ES Modules](https://eloquentjavascript.net/10_modules.html#h_zWTXAU93DC).
    
    `# three.js npm install --save three # vite npm install --save-dev vite`
3.  From your terminal, run: `npx vite`
4.  If everything went well, you'll see a URL like _http://localhost:5173_ appear in your terminal, and can open that URL to see your web application.

The page will be blank — you're ready to [create a scene](#manual/introduction/Creating-a-scene).

If you want to learn more about these tools before you continue, see:

*   [three.js journey: Local Server](https://threejs-journey.com/lessons/local-server)
*   [Vite: Command Line Interface](https://vitejs.dev/guide/cli.html)
*   [MDN: Package management basics](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Package_management)

### Production

Later, when you're ready to deploy your web application, you'll just need to tell Vite to run a production build — _npx vite build_. Everything used by the application will be compiled, optimized, and copied into the _dist/_ folder. The contents of that folder are ready to be hosted on your website.

Option 2: Import from a CDN
---------------------------

### Development

Installing without build tools will require some changes to the project structure given above.

1.  We imported code from 'three' (an npm package) in _main.js_, and web browsers don't know what that means. In _index.html_ we'll need to add an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) defining where to get the package. Put the code below inside the _<head></head>_ tag, after the styles.
    
    `<script type="importmap"> { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@<version>/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@<version>/examples/jsm/" } } </script>`
    
    Don't forget to replace _<version>_ with an actual version of three.js, like _"v0.149.0"_. The most recent version can be found on the [npm version list](https://www.npmjs.com/package/three?activeTab=versions).
    
2.  We'll also need to run a _local server_ to host these files at URL where the web browser can access them. While it's technically possible to double-click an HTML file and open it in your browser, important features that we'll later implement, do not work when the page is opened this way, for security reasons.
    
    Install [Node.js](https://nodejs.org/), then run [serve](https://www.npmjs.com/package/serve) to start a local server in the project's directory:
    
    `npx serve .`
3.  If everything went well, you'll see a URL like http://localhost:3000 appear in your terminal, and can open that URL to see your web application.

The page will be blank — you're ready to [create a scene](#manual/introduction/Creating-a-scene).

Many other local static servers are available — some use different languages instead of Node.js, and others are desktop applications. They all work basically the same way, and we've provided a few alternatives below.

More local servers

### Command Line

Command line local servers run from a terminal window. The associated programming language may need to be installed first.

*   _npx http-server_ (Node.js)
*   _npx five-server_ (Node.js)
*   _python -m SimpleHTTPServer_ (Python 2.x)
*   _python -m http.server_ (Python 3.x)
*   _php -S localhost:8000_ (PHP 5.4+)

### GUI

GUI local servers run as an application window on your computer, and may have a user interface.

*   [Servez](https://greggman.github.io/servez)

### Code Editor Plugins

Some code editors have plugins that spawn a simple server on demand.

*   [Five Server](https://marketplace.visualstudio.com/items?itemName=yandeu.five-server) for Visual Studio Code
*   [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for Visual Studio Code
*   [Live Server](https://atom.io/packages/atom-live-server) for Atom

### Production

When you're ready to deploy your web application, push the source files to your web hosting provider — no need to build or compile anything. The downside of that tradeoff is that you'll need to be careful to keep the import map updated with any dependencies (and dependencies of dependencies!) that your application requires. If the CDN hosting your dependencies goes down temporarily, your website will stop working too.

_**IMPORTANT:** Import all dependencies from the same version of three.js, and from the same CDN. Mixing files from different sources may cause duplicate code to be included, or even break the application in unexpected ways._

Addons
------

Out of the box, three.js includes the fundamentals of a 3D engine. Other three.js components — such as controls, loaders, and post-processing effects — are part of the [addons/](https://github.com/mrdoob/three.js/tree/dev/examples/jsm) directory. Addons do not need to be _installed_ separately, but do need to be _imported_ separately.

The example below shows how to import three.js with the [OrbitControls](https://threejs.org/docs/index.html#examples/en/controls/OrbitControls "OrbitControls") and [GLTFLoader](https://threejs.org/docs/index.html#examples/en/loaders/GLTFLoader "GLTFLoader") addons. Where necessary, this will also be mentioned in each addon's documentation or examples.

`import * as THREE from 'three'; import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; const controls = new OrbitControls( camera, renderer.domElement ); const loader = new GLTFLoader();`

Some excellent third-party projects are available for three.js, too. These need to be installed separately — see [Libraries and Plugins](#manual/introduction/Libraries-and-Plugins).

Next Steps
----------

You're now ready to [create a scene](#manual/introduction/Creating-a-scene).

![](https://threejs.org/files/ic_mode_edit_black_24dp.svg)