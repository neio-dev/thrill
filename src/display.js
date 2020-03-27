
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-cycle */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

/**
 * @module Display
 */


import Game from './game.js';
import Event from './event.js';
import Test from './test.js';

class DisplayManager {
  /**
   * Call different display states
   * @class DisplayManager
   */
  constructor() {
    this.state = 'intro';
    // eslint-disable-next-line no-restricted-syntax

  }

  // eslint-disable-next-line class-methods-use-this
  /** Used to show intro screen */
  intro() {
    const $intro = $('.intro').css({
      background: 'url("./assets/img/intro.gif") no-repeat',
      'background-size': '100%',
    });
    $('<button></button>').text('Nouvelle partie').addClass('intro--newgame')
      .appendTo($intro);
    $('<img>').addClass('intro--leaves')
      .attr('src', './assets/img/intro-leaves.png').appendTo($intro);
    $('<img>').addClass('intro--title')
      .attr('src', './assets/img/intro-title.png').appendTo($intro);
  }

  /** Used to show game mode selection screen */
  gameModeSelection() {
    const $intro = $('.intro');
    $('.intro--leaves').css('animation-play-state', 'running');
    $('<h1></h1>').text('Select game mode').addClass('intro--gameMode__tip').appendTo($intro);
    const $gameMode = $('<div></div>').addClass('intro--gameMode').prependTo($intro);
    $('<div></div>').addClass('intro--gameMode__box').css('background', 'url("./assets/img/intro--survival.png") 0 0 no-repeat').appendTo($gameMode);
    $('<div></div>').addClass('intro--gameMode__box').css('background', 'url("./assets/img/intro--versus.png") 0 0 no-repeat').appendTo($gameMode);
    const $gameModeBoxes = $('.intro--gameMode__box, .intro--gameMode__tip');
    this.slideShow($gameModeBoxes, 1000);
  }

  /** Used to show character selection screen */
  characterSelection(mode) {
    // Removing previous screen
    const $previousScreen = $('.intro--gameMode__box, .intro--gameMode__tip');
    this.slideHide($previousScreen);

    const $intro = $('.intro');
    const $charSelTip = $('<h1></h1>').text('Select character').addClass('intro--characterSelection__tip').appendTo($intro);
    this.slideShow($charSelTip, 1000);
    const $charSel = $('<div></div>').addClass('intro--characterSelection').appendTo($intro);
    [1, 2].forEach(
      (elem) => {
        const $charSelPlayer = $('<div></div>').addClass('intro--characterSelection__player').appendTo($charSel);
        $('<h1></h1>').text(`P${elem}`).appendTo($charSelPlayer);
        const $charSelChars = $('<div></div>').addClass('intro--characterSelection__chars').appendTo($charSelPlayer);
        const possibleChar = Game.getCharModels(mode);
        for (const char of possibleChar) {
          $('<div></div>').addClass('intro--characterSelection__char').css('background-image',
            `url('./assets/chars/${char.toLowerCase()}.png')`).appendTo($charSelChars);
        }
        const $charSelector = $('<div></div>').addClass('intro--characterSelection__charPreview').appendTo($charSelPlayer);
        if (elem === 2) {$charSelector.css({
          transform: 'scaleX(-1)',
          left: '40%',
        });
        }
      },
    );
  }

  /** Used to get visual feedback when selecting character */
  characterSelector(char, clickedElement) {
    $(`.intro--characterSelection__player:eq(${char}) > .intro--characterSelection__chars > .intro--characterSelection__char`).addClass('out');
    $(`.intro--characterSelection__player:eq(${char}) > .intro--characterSelection__chars > .intro--characterSelection__char`).removeClass('selected');
    clickedElement.target.classList.remove('out');
    clickedElement.target.classList.add('selected');
    const $background = $(`.intro--characterSelection__player:eq(${char}) > .intro--characterSelection__chars > .selected`).css('background-image');
    const cleanup = '/"|\'|)/g';
    const $char = $background.split('/').pop().replace("cleanup", '').split('.png')[0];
    $(`.intro--characterSelection__player:eq(${char}) > .intro--characterSelection__charPreview`).css('background-image', 'none');
    $(`.intro--characterSelection__player:eq(${char}) > .intro--characterSelection__charPreview`).css('background-image', $background);
    return $char;
  }

  startButton() {
    const $intro = $('.intro');
    $('.intro--characterSelection__startButton').remove();
    $('<button>').text('START').addClass('intro--characterSelection__startButton').appendTo($intro);
  }

  /**
   * Show an element with slide down animation
   * @param {ObJect} elem
   * @param {Int} timer Niliseconds value before the animation starts
   */
  slideShow(elem, timer) {
    setTimeout(() => {
      elem.css({
        animation: 'slidedown-show 1s forwards',
        'animation-play-state': 'running',
      });
    }, timer);
  }

  /**
   * Hide an element with slide up animation
   * @param {ObJect} elem
   */
  slideHide(elem) {
    elem.css({
      animation: 'slideup-hide 1s forwards',
      'animation-play-state': 'running',
    });
  }

  /**
   * Display winner screen
   * @param {Int} player select winner
   */
  winning() {
    if (!Game.winner) return;
    const $interface = $('.interface');
    $interface.empty();
    $interface.css('pointer-events', 'all');
    const $winningWrapper = $('<div></div>').addClass('interface--winner').appendTo($interface);
    $('<h1></h1>').text(`PLAYER ${Game.winner} WINS`).addClass('interface--winner__text').appendTo($winningWrapper);
    $('<button></button>').text('NEW GAME').addClass('interface--winner__newgame').appendTo($winningWrapper);
    $('<button></button>').text('SHARE YOUR VICTORY').addClass('interface--winner__link').appendTo($winningWrapper);
  }

  /**
   * Init the board with all games value
   */
  init() {
    const $intro = $('.intro');
    this.slideHide($intro, 1000);
    setTimeout(() => {
      $intro.remove();
    }, 105);
    $('table').css('animation-play-state', 'running');
    const $gameBoard = $('tbody');

    // Calculating number of rows and line
    // Ex: if board contains 49 tiles, get square root of 49 = 7.
    const numberRowCol = Math.floor(Math.sqrt(Game.board.tiles.length));

    for (let y = 0; y < numberRowCol; ++y) {
      const $row = $('<tr></tr>').css({
        transform: `translateY(${19 * y}px)`,
      }).addClass(`row-${y}`).appendTo($gameBoard);
      for (let x = 0; x < numberRowCol; ++x) {
        const tileNumber = x + numberRowCol * y;
        const $col = $('<td></td>').css({
          transform: `translateX(${19 * x}px)`,
        }).addClass(`col-${x}`).appendTo($row);
        const $tile = $('<div></div>').addClass('block').addClass(`tile-${tileNumber}`).appendTo($col);
        const $block = $('<div></div>').addClass(`block--${Game.board.tiles[tileNumber]._type.toLowerCase()}`).appendTo($tile);
        if (Game.board.tiles[tileNumber].isEmpty()) {
          if (Game.board.tiles[tileNumber]._hasItem[0] === 1) {
            if (Game.board.tiles[tileNumber].hasPlayer === 0) {
              const $item = $('<div></div>').addClass('item').css('background', `url(./assets/items/${Game.items[Game.board.tiles[tileNumber]._hasItem[1]].name.toLowerCase()}.png) 0px 0px no-repeat`).appendTo($block);
              $('<div></div>').addClass('tooltiptext').html(`<h1>${Game.items[Game.board.tiles[tileNumber]._hasItem[1]].name}</h1><br /><p>${Game.items[Game.board.tiles[tileNumber]._hasItem[1]].desc}</p><br />${Game.items[Game.board.tiles[tileNumber]._hasItem[1]].descChar}`).appendTo($item);
            }
          } else {
            // $block.find('.item').css('opacity', '0');
          }
        }

        Game.getPossibleMoves();

        if (Game.board.tiles[tileNumber].isObstacle()) {
          $block.addClass(`block--obstacle__${Game.board.tiles[tileNumber]._model.toLowerCase()}`);
        }
        if (Game.board.tiles[tileNumber].reachable === 1) {
          $(`.tile-${tileNumber}`).addClass('block--possibleMove');
        } else {
          $(`.tile-${tileNumber}`).removeClass('block--possibleMove');
        }
      }
    }

    $(`.tile-${Game.players[0].char.getTile()}`).find('div:eq(0)').removeAttr('class').addClass('block--player')
      .addClass(`block--player__${Game.players[0].char.name.toLowerCase()}`);
    $(`.tile-${Game.players[1].char.getTile()}`).find('div:eq(0)').removeAttr('class').addClass('block--player')
      .addClass(`block--player__${Game.players[1].char.name.toLowerCase()}`);

    Display.interface();
  }

  static showDamages() {
    // let $;
  }

  /** Remove actual board visual elements */
  remove() {
    const $gameBoard = $('tbody tr');
    $gameBoard.remove();
  }

  /** Construct interface based on GameMode */
  interface() {
    // Basic interface writing
    const $wrapper = $('.interface');
    $wrapper.empty();
    $('<div></div>').addClass('interface--element interface--fight__blason').prependTo($wrapper);
    $('<div></div>').addClass('interface--element interface--button__music').prependTo($wrapper);
    const $totalTurnBar = $('<div></div>').addClass('interface--element interface--bar__totalturn').prependTo($wrapper);
    $('<p></p>').addClass('totalTurn').appendTo($totalTurnBar);
    $('<div></div>').addClass('interface--bar__totalturn__fill').appendTo($totalTurnBar);
    $('<div></div>').addClass('interface--button__action1').attr('id', 'action1').prependTo($wrapper);
    $('<div></div>').addClass('interface--button__action2').attr('id', 'action2').prependTo($wrapper);
    Game.players.forEach(
      (player) => {
        const $interfacePlayer = $('<div></div>').addClass(`interface--player interface--player__${player.number}`).appendTo($wrapper);
        $('<div></div>').addClass(`interface--element interface--player__${player.number}__char`).appendTo($interfacePlayer);
        $('<div></div>').addClass(`interface--element interface--equipedItem interface--player__${player.number}__equipedItem`).appendTo($interfacePlayer);
        const $healthbar = $('<div></div>').addClass('interface--element interface--healthbar').appendTo($interfacePlayer);
        $('<div></div>').addClass('interface--healthbar__overlay').appendTo($healthbar);
        if (player.number === 2) $healthbar.css('transform', 'scaleX(-1)');
      },
    );

    if (Game.mode === 'versus') {
      const activeFight = Game.players[0].char.onFight;
      switch (activeFight) {
      // in fight loop
        case 1:
          $('.interface--button__action1').css('background', 'url(./assets/img/button-attack.png) no-repeat').css('left', '49%');
          $('.interface--button__action2').css('background', 'url(./assets/img/button-block.png) no-repeat');
          $('.interface--fight-blason:eq(0)').css('visibility', 'visible');
          Game.board.tiles.forEach((tile) => {
            if (!tile._hasPlayer) {
              $(`.tile-${tile.getPos()[0] + tile.getPos()[1] * Math.floor(Math.sqrt(Game.board.tiles.length))}:eq(0)`).css('filter', 'grayscale(100)');
            }
          });
          break;

        // out of fight
        case 0:
          $('#action1').css('background', 'url(./assets/img/button-equip.png) no-repeat');
          $('#action2').css('background', 'url(./assets/img/button-turn.png) no-repeat');
          break;

        default:
          break;
      }
    } else {
      $('.interface--bar__totalturn').css('visibility', 'visible');
      $('.totalTurn').text(`Tour : ${Game.totalTurn}/${Game.escapeTurn}`);
      $('.interface--bar__totalturn__fill').width(`${(Game.totalTurn / Game.escapeTurn) * 100}%`);
    }

    /**
     * Show the player which one is active
     */
    switch (Game.activePlayer) {
      case 0:
        $('.interface--player__1').removeClass('interface--inactive');
        $('.interface--player__2').addClass('interface--inactive');
        break;

      case 1:
        $('.interface--player__2').removeClass('interface--inactive');
        $('.interface--player__1').addClass('interface--inactive');
        break;

      default:
        break;
    }

    for (let i = 0; i < Game.players.length; ++i) {
      if (Game.players[i].desiredChar === 0) {
        $(`.interface--player__${i + 1}__char:eq(0)`).addClass('interface--player__char__survivor');
      } else {
        $(`.interface--player__${i + 1}__char:eq(0)`).addClass('interface--player__char__chaser');
      }
      $(`.interface--player__${i + 1}__char:eq(0)`).addClass(`block--player__${Game.players[i].char.name.toLowerCase()}`);
      $(`.interface--player__${i + 1}__equipedItem:eq(0)`).css('background', `url(./assets/items/${Game.players[i].char.equipedItem.name.toLowerCase()}.png) center center no-repeat, black`);
      $(`.interface--player__${i + 1} .interface--healthbar__overlay`).css({
        width: `${Game.players[i].char._health}%`,
      }).text(`${Game.players[i].char._health}/100`);
    }
  }

  /** Refresh visual elements of board */
  refresh() {
    Display.remove();
    Display.init();
  }
}

const Display = new DisplayManager();
Display.intro();


export { Display as default };
