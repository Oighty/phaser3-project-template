import Phaser from 'phaser';
import GridEngine from 'grid-engine';
// import arenaTiles from './assets/game/maps/arena_tiles.png';
// import arenaMap from './assets/game/maps/arena_map.json';
import arenaTiles from './assets/game/maps/arena_tiles_32.png';
import arenaMap from './assets/game/maps/arena_map_32.json';
// import bodySpriteSheet from './assets/game/sprites/WHITE_ELF_BASIC_BODY_1.png';
// import faceSpriteSheet from './assets/game/sprites/WHITE_ELF_FACE_1.png';
// import hairSpriteSheet from './assets/game/sprites/PIXIE_BLUE_HAIR.png';
import combinedSpriteSheet from './assets/game/sprites/WHITE_ELF_COMBINED.png';

class Arena extends Phaser.Scene
{
    constructor ()
    {
        super('Arena');
    }

    preload ()
    {
        // this.load.image('logo', logoImg);

        // Load tile images
        this.load.image('arena-tiles', arenaTiles);

        // Load tilemap
        this.load.tilemapTiledJSON('arena-map', arenaMap);

        // Load sprites
        this.load.spritesheet('player', combinedSpriteSheet, { frameWidth: 24, frameHeight: 32, startFrame: 0, endFrame: 15});
        // this.load.spritesheet('body', bodySpriteSheet, { frameWidth: 24, frameHeight: 32, startFrame: 0, endFrame: 15});
        // this.load.spritesheet('face', faceSpriteSheet, { frameWidth: 24, frameHeight: 32, startFrame: 0, endFrame: 15});
        // this.load.spritesheet('hair', hairSpriteSheet, { frameWidth: 24, frameHeight: 32, startFrame: 0, endFrame: 15});
        
    }
      
    create ()
    {
        // Set tile dimensions
        this.tileWidth = 32;
        this.tileHeight = 32;

        // Create map
        const map = this.make.tilemap({ key: 'arena-map' });
        const tileset = map.addTilesetImage('arena-tiles', 'arena-tiles');
        map.createStaticLayer('base', tileset);

        // Create sprites
        // const body = this.add.sprite(0, 0, 'body');
        // const face = this.add.sprite(0, 0, 'face');
        // const hair = this.add.sprite(0, 0, 'hair');

        // this.player = this.physics.add.container(0, 0, [body, face, hair]);

        this.player = this.physics.add.sprite(0, 0, 'player');
        this.player.setScale(2);

        this.createWalkingAnimation('up', 0, 3);
        this.createWalkingAnimation('up-right', 4, 7);
        this.createWalkingAnimation('up-left', 12, 15);
        this.createWalkingAnimation('right', 4, 7);
        this.createWalkingAnimation('down', 8, 11);
        this.createWalkingAnimation('down-right', 4, 7);
        this.createWalkingAnimation('down-left', 12, 15);
        this.createWalkingAnimation('left', 12, 15);

        // Configure grid engine
        const gridEngineConfig = {
            characters: [{
                id: 'player',
                sprite: this.player,
                startPosition: {
                    x: 48 - 1,
                    y: 80 - 1
                },
                speed: 8
            }],
            numberOfDirections: 8
        };
        this.gridEngine.create(map, gridEngineConfig);

        // Configure animations on grid engine
        this.gridEngine.movementStarted().subscribe(({ direction }) => {
            this.player.anims.play(direction);
        });

        this.gridEngine.movementStopped().subscribe(({ direction }) => {
            this.player.anims.stop();
            this.player.setFrame(this.getStopFrame(direction));
        });

        this.gridEngine.directionChanged().subscribe(({ direction }) => {
            this.player.setFrame(this.getStopFrame(direction));
        });

        // Set camera to follow player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }    
    
    createWalkingAnimation(direction, startFrame, endFrame) {
        this.anims.create({
            key: direction,
            frames: this.anims.generateFrameNumbers('player', {
              start: startFrame,
              end: endFrame,
            }),
            frameRate: 8,
            repeat: -1
          });
    }

    getStopFrame(direction) {
        switch (direction) {
            case 'up':
                return 0;
            case 'up-right':
                return 4;
            case 'up-left':
                return 12;
            case 'right':
                return 4;
            case 'down':
                return 8;
            case 'down-right':
                return 4;
            case 'down-left':
                return 12;
            case 'left':
                return 12;
        }
    }

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        // const cursors = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });
    
        if (cursors.left.isDown && cursors.up.isDown) {
            this.gridEngine.move('player', 'up-left');
        } else if (cursors.left.isDown && cursors.down.isDown) {
            this.gridEngine.move('player', 'down-left');
        } else if (cursors.right.isDown && cursors.up.isDown) {
            this.gridEngine.move('player', 'up-right');
        } else if (cursors.right.isDown && cursors.down.isDown) {
            this.gridEngine.move('player', 'down-right');
        } else if (cursors.left.isDown) {
            this.gridEngine.move('player', 'left');
        } else if (cursors.right.isDown) {
            this.gridEngine.move('player', 'right');
        } else if (cursors.up.isDown) {
            this.gridEngine.move('player', 'up');
        } else if (cursors.down.isDown) {
            this.gridEngine.move('player', 'down');
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1024,
    height: 1024,
    scene: Arena,
    physics: {
        default: 'arcade',
    },
    plugins: {
        scene: [
            {
                key: 'gridEngine',
                plugin: GridEngine,
                mapping: 'gridEngine'
            }
        ]
    }
};

const game = new Phaser.Game(config);
