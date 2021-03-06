var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		// Load our textures
		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

        // Enable The editor
        // ige.addComponent(IgeEditorComponent);

        // Implement our game methods
		this.implement(ClientNetworkEvents);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Load the textures we want to use
		this.textures = {
			ship: new IgeTexture('./assets/Pirate_Ship_Top_Down_64x64.png'),
			orb: new IgeTexture('./assets/Orb.js'),
			coinBronze: new IgeTexture('./assets/coin_bronze.png'),
			coinSilver: new IgeTexture('./assets/coin_silver.png'),
			coinGold: new IgeTexture('./assets/coin_gold.png')
		};

		ige.on('texturesLoaded', function () {
			// Ask the engine to start
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {

					self.mainScene = new IgeScene2d()
						.id('mainScene');

					// Create a background scene
					self.scene0 = new IgeScene2d()
						.id('scene0')
						.depth(-1)
						.backgroundPattern(new IgeTexture('./assets/background.png'))
						.mount(self.mainScene);

					// Create a foreground scene
					self.scene1 = new IgeScene2d()
						.id('scene1')
						.depth(1)
						.mount(self.mainScene);

					self.uiScene = new IgeScene2d()
						.id('uiScene')
						.depth(10)
						.ignoreCamera(true)
						.mount(self.mainScene);

					// Create the main viewport and set the scene
					// it will "look" at as the new scene1 we just
					// created above
					self.vp1 = new IgeViewport()
						.id('vp1')
						.autoSize(true)	// auto resizes with the window
						.scene(self.mainScene)
						.minimumVisibleArea(800, 800) // width in pixels and height in pixels will always be seen. Can abuse if stretched to extremes
						.drawBounds(false)
						.mount(ige);

					// Load the tilemap's textures
					// Collisions are handled by the server
					ige.addComponent(IgeTiledComponent)
						.tiled.loadJson(Green_Islands_75x75, function (layerArray, layersById) {

						// Loop through each layer we have and mount it to a scene
						for (i = 0; i < layerArray.length; i++) {
							// Check if the layer is a tile layer
							if (layerArray[i].type === 'tilelayer') {
								// Tiled calculates tile width from left-most point to right-most
								// IGE calculates the tile width as the length of one side of the tile square.
								layerArray[i]
									.autoSection(20)
									.drawBounds(false)
									.drawBoundsData(false)
									.mount(self.scene0);
							}

							// Check if the layer is an "object" layer
							if (layerArray[i].type === 'objectlayer') {
								//layerArray[i].mount(self.backScene);
							}
						}
					});

					// Define our player controls
					ige.input.mapAction('left', ige.input.key.a);
					ige.input.mapAction('right', ige.input.key.d);
					ige.input.mapAction('thrust', ige.input.key.w);
					ige.input.mapAction('fire', ige.input.mouse.button1);
					ige.input.mapAction('enter', ige.input.key.enter);

					self.handleMainPanMenu(self);
				}
			});
		});
	},

	handleMainPanMenu: function (self) {
		//display the menu and pan
		document.getElementById('nameArea').style.display = 'block';

		// give a key for the button
		window.addEventListener("keyup", function (e) {
			if (e.keyCode == "13" && !ige.client._myPlayerId) {
				document.getElementById('enterBtn').click();
			}
		}, false);


		ige.client.vp1.camera.translateTo(2400, 2400, 0);

		self.panCameraToPoint(15 * 1000);

		self.panController = new IgeInterval(function () {
			self.panCameraToPoint(10 * 1000);
		}, 7000);
	},

	connectAndStartGame: function () {
		var self = this;
		ige.network.start('http://localhost:3000', function () {
			// Setup the network command listeners
			ige.network.define('playerEntity', self._onPlayerEntity); // defined in ./gameClasses/ClientNetworkEvents.js

			// Setup the network stream handler
			ige.network.addComponent(IgeStreamComponent).stream.renderLatency(80); // render the simulation 160 milliseconds in the past

			ige.network.send('playerEntity', name);
		});

		var nameInputArea = document.getElementById('inputName');

		var name;
		nameInputArea.value ? name = nameInputArea.value : name = "Player";

		document.getElementById('nameArea').style.display = 'none';
		document.getElementById('scoreboard').style.display = 'block';

		ige.client.panController.cancel();
	},

	panCameraToPoint: function (easing, x, y) {
		ige.client.vp1.camera._translate.tween().stopAll();

		var lowerBound = 500;
		var upperBound = 4000;

		if (easing == undefined) easing = 0;
		if (x == undefined) x = getRandomInt(lowerBound, upperBound);
		if (y == undefined) y = getRandomInt(lowerBound, upperBound);

		ige.client.vp1.camera.panTo(new IgePoint3d(x, y, 0), easing);
	},

	addToScoreList: function (id, score, username) {
		var text = username + ": " + score;

		if(document.getElementById(id)) {
			document.getElementById(id).innerHTML = text;
		} else {
			var ul = document.getElementById("scores");
			var li = document.createElement("li");

			li.setAttribute("id", id);
			li.appendChild(document.createTextNode(text));

			ul.appendChild(li);
		}
	}
});

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }