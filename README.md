X Alessio: qui ci sono tutti i comandi (le build delle platform per ora lasciale staare)

comando 1 - hai bisogno d’installare sass sul server (autocompilazione css e fogli di stile)

comando 2 - prima del serve (puoi usare anche ionic serve -—lab) sass dovrebbe aver installato le dipendenze (pM install e bower install) se così non fosse lanciali a mano


* cd into your project:
```
cd ionFullApp
```

1) Setup this project to use Sass:
```
ionic setup sass
```

* Develop in the browser with live reload:
```
2) ionic serve
```

* Add a platform (ios or Android):
```
ionic platform add ios [android]
```

Note: iOS development requires OS X currently
See the Android Platform Guide for full Android installation instructions:
https://cordova.apache.org/docs/en/edge/guide_platforms_android_index.md.html

* Build your app:
```
ionic build <PLATFORM>
```

* Simulate your app:
```
ionic emulate <PLATFORM>
```

* Run your app on a device:
```
ionic run <PLATFORM>
```

* Package an app using Ionic package service:
```
ionic package <MODE> <PLATFORM>
```

For more help use ```ionic --help``` or visit the Ionic docs: http://ionicframework.com/docs

* If you build for ios and find yourself having cordova plugin errors (like iOS unable to find plugins) do the following:

1. delete ./plugins/ios.json
2. then delete ./platforms/ios
3. run ionic platform add ios
4. ionic build ios.
Deleting ios.json helps to force it to recompile the plugins.



### To prepare the apk to upload to Google Play (see: http://ionicframework.com/docs/guide/publishing.html)
#### 1)
```
cordova build --release android
```
#### 2)
```
keytool -genkey -v -keystore ionFullApp-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```
#### 3)
```
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ionFullApp-key.keystore "$HOME"/ionFullApp/platforms/android/ant-build/CordovaApp-release-unsigned.apk alias_name
```
#### 4)
```
zipalign -v 4 "$HOME"/ionFullApp/platforms/android/ant-build/CordovaApp-release-unsigned.apk ionFullApp.apk
```
