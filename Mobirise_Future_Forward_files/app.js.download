/**
 * addon structure:
 *     -- wowslider: main directory
 *       | -- assest: contains images used by wowslider (default params)
 *       | -- wowslider: component directory
 *            - component.js: component
 *            - template.html: template
 *       | -- wowslider-effect: contains js-effects used by wowslider
 *            - effects.js: placeholder, during publishing will be rewritten by actual script
 *           | -- effects: directory with slider animations, each effect in its own subdirectory (for example \blur\scropt.js)
 *       | -- wowslider-init: contains wowslider initialization logic and stylesheets
 *            - script.js: wowslider init
 *           | -- themes: directory with themes styles(each subdirectory contains theme, with files used by theme)
 *       | -- wowslider-plugin: contains wowslider plugin
 *            - wowslider.js: wowslider
 *         - app.js  - app script
 *         - core.js - core script
 *
 */
defineM("wowslider",function(m,c){var k=c.getAddonDir("wowslider"),l=[];c.regExtension({name:"plugin-wow",global:{wowSliderGetThemeImages:function(){var a=c.getPages(),d=[];l=[];for(var b in a)a[b].components.map(function(a){"wowslider"==a._name&&d.push(a._params.theme)});d.map(function(a){c.dirList(k+"/plugins/wowslider-init/themes/"+a,function(b){b=b.map(function(b){return k+"/plugins/wowslider-init/themes/"+a+"/"+b});l.push({theme:a,imgList:b})},{names:["*.png"],recursive:!1,filter:1})})},wowSliderResizeImage:function(a,
d,b){var e={width:a.width,height:a.height,keepAspectRatio:!0,shrinkLarge:!1,stretchSmall:!0,fillColor:"#ffffff"};"2"==a.responsive&&(e.height=e.height/e.width*1600,e.width=1600);m.extend(e,"true"==c.projectSettings.imageResize?{format:"jpg",quality:90}:{format:/\.(png|gif|bmp|svg|ico)$/.test(a.slides[d].src)?"png":"jpg"});c.transformImage(a.slides[d].src,e,function(b){c.addImageToAssets?c.addImageToAssets(b).then(function(b){a.slides[d].image=b}):a.slides[d].image=b});e={width:85,height:48,format:"png",
keepAspectRatio:!0,shrinkLarge:!1,stretchSmall:!0,fillColor:"#ffffff"};b&&c.transformImage(a.slides[d].src,e,function(b){c.addImageToAssets?c.addImageToAssets(b).then(function(b){a.slides[d].tooltip=b}):a.slides[d].tooltip=b});return!0},wowSliderSetTheme:function(a){c.addCoreResource(k+"/plugins/wowslider-init/themes/"+a+"/style.css",!1)},wowSliderSetEffect:function(a){c.addCoreResource(k+"/plugins/wowslider-effect/effects/"+a+"/script.js",!0)}},filters:{publishHTML:function(a,d){function b(){return c.projectSettings.cookiesAlert&&
("2"===c.projectSettings.cookiesAlertType||"3"===c.projectSettings.cookiesAlertType)}var e=[],f=[],g="",h="";d.components.map(function(a){"wowslider"==a._name&&(e.push(a._params.theme),f.push(a._params.animType))});e.map(function(a){g+='<link rel="stylesheet" '+(b()?"data-href":"href")+'="assets/wowslider-init/'+a+'/style.css">'});f.map(function(a){h+="<"+(b()?'script type="text/plain"':"script")+" "+(b()?"data-src":"src")+'="assets/wowslider-effect/'+a+'/script.js">\x3c/script>'});g+="\n</head>";
a=a.replace("</head>",g);h+="\n</body>";return a=a.replace("</body>",h)},publishFiles:function(a,d){var b=!1,c;for(c in d.pages)d.pages[c].components.map(function(a){"wowslider"==a._name&&(b=!0)});if(!b)return a;a=a.filter(function(a){return-1==a.dest.indexOf("assets/wowslider-effect")});var f=[],g=[];for(c in d.pages)d.pages[c].components.map(function(a){"wowslider"==a._name&&(f.push(a._params.animType),g.push(a._params.theme))});f.map(function(b){var c={dest:"assets/wowslider-effect/"+b+"/script.js",
srcList:[]};c.srcList.push({src:k+"/plugins/wowslider-effect/effects/"+b+"/script.js"});a.push(c)});g.map(function(b){var c={dest:"assets/wowslider-init/"+b+"/style.css",srcList:[]};c.srcList.push({src:k+"/plugins/wowslider-init/themes/"+b+"/style.css"});a.push(c)});var h=[];0<l.length&&l.map(function(a){var b=a.theme;a.imgList.map(function(a){h.push({dest:"assets/wowslider-init/"+b+"/"+a.split("/").pop(),srcList:[{src:a}]})})});return a=a.concat(h)},changeComponentParams:function(a,d,b,e){function f(a){a.slides.map(function(b,
d){c.wowSliderResizeImage(a,d)})}switch(d){case "customSize":b.customSize?(b.height=b.customHeight,b.width=b.customWidth):(d=b.size.split("x"),b.width=d[0],b.height=d[1]);f(b);break;case "customHeight":case "customWidth":b.height=b.customHeight;b.width=b.customWidth;f(b);break;case "responsive":b.responsive=a;f(b);break;case "animType":c.wowSliderSetEffect(a);break;case "theme":c.wowSliderSetTheme(a);break;case "size":d=a.split("x"),b.width=d[0],b.height=d[1],f(b)}return a}},events:{preparedComponentParams:function(){var a=
c.$componentsParams,d=c.$componentsParams.attr("data-component-id");"wowslider"==c.getComponent(d)._name&&a.find(".remove-item").css({"margin-bottom":"30px"})},loadedComponent:function(a,d,b,e){"wowslider"===a._name&&(e?c.wowSliderGetThemeImages():(c.wowSliderSetTheme(a._params.theme),c.wowSliderSetEffect(a._params.animType)))}}})},["jQuery","mbrApp"]);
