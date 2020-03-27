import Game from './game.js';
import Display from './display.js';

class EventManager {
  constructor() {
    // Intro

    // Display the game mode selection screen using Display module
    $(document).on('click', '.intro--newgame', () => {
      Display.gameModeSelection();
    });

    // Display the character selection screen using Display module
    $(document).on('click', '.intro--gameMode__box:eq(1)', () => {
      Display.characterSelection('versus');
    });

    // Select character using Display and Game module
    [0, 1].forEach(elem => {
      $(document).on(
        'click',
        `.intro--characterSelection__player:eq(${elem})`,
        clickedElement => {
          if (
            event.target.classList.contains('intro--characterSelection__char')
          ) {
            Game.playerModel[elem] = Display.characterSelector(
              elem,
              clickedElement
            );
            console.info(Game.playerModel);
            if (
              Game.playerModel[0] !== undefined &&
              Game.playerModel.length > 1
            ) {
              Display.startButton();
            }
          }
        }
      );
    });

    // Display and init the game
    $(document).on('click', '.intro--characterSelection__startButton', () => {
      Game.itemSpawn();
      Game.playerSpawn();
      Display.init();
      for (const player of Game.players) {
        player.char.onChange(() => Display.refresh());
      }
      Game.onChange(() => Display.refresh());
      Game.onChange(() => Display.winning(this));
    });

    // eslint-disable-next-line func-names
    $(document).on('click', 'td', function() {
      const tileNumber = $(this)
        .find('.block')[0]
        .classList[1].split('tile-')[1];
      const tilePos = Game.board.tiles[tileNumber].getPos();
      if (Game.board.tiles[tileNumber]._reachable === 1) {
        Game.players[Game.activePlayer].char.move(
          parseFloat(tilePos[0]),
          parseFloat(tilePos[1])
        );
        Game.checkPlayersProximity();
        // if(Game.board.tiles[tileNumber]._hasItem[1]){
        //     Game.players[Game.activePlayer].char
        //       .checkItem(Game.board.tiles[tileNumber]._hasItem[1], Game.board.tiles[tileNumber]);
        // }
      }
    });

    $(document).on('click', '#action2', () => {
      switch (Game.players[0].char.onFight) {
        case 0:
          Game.nextTurn();
          break;
        case 1:
          Game.nextTurn('defend');
          break;
        default:
          // console.info(Game.players[0].char._onFight);
          break;
      }
    });

    $(document).on('click', '#action1', () => {
      switch (Game.players[0].char.onFight) {
        case 0: {
          const playerTile =
            Game.board.tiles[Game.players[Game.activePlayer].char.getTile()];
          const tileNumber =
            playerTile._x + playerTile._y * Game.board.lineOfTiles;
          if (Game.board.tiles[tileNumber]._hasItem[0] === 1) {
            Game.players[Game.activePlayer].char.checkItem(
              Game.board.tiles[tileNumber]._hasItem[1],
              Game.board.tiles[tileNumber]
            );
          }
          break;
        }
        case 1:
          Game.nextTurn('attack');
          break;
        default:
          // console.info(Game.players[0].char._onFight);
          break;
      }
    });

    // Display the character selection screen using Display module
    $(document).on('click', '.interface--winner__newgame', () => {
      location.reload();
    });
  }
}

const Event = new EventManager();

export { Event as default };
