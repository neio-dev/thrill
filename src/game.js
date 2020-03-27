/**
 * @module Game
 */

/* eslint-disable */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
class Observable {
  /**
   * Reactive class
   * @abstract
   */
  constructor() {
    this._listeners = [];
  }

  /**
   * Make object properties reactive
   * should be called after properties initialization to make them reactive
   */
  initProperties() {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(this)) {
      const value = this[key];
      // eslint-disable-next-line no-continue
      if (['_listeners', 'dispatch'].includes(key)) continue;
      Object.defineProperty(this, key, {
        get: () => this[`_${key}`],
        set: newValue => {
          this[`_${key}`] = newValue;
          this.dispatch();
        }
      });

      if (value instanceof Observable) {
        this[key].onChange(this.dispatch.bind(this));
      }
    }
  }

  /**
   * Add callback to be called when a reactive property is changed
   */
  onChange(listener) {
    this._listeners.push(listener);
  }

  /**
   * Execute all callback listeners of an object when a reactive value is changed
   */
  dispatch() {
    // eslint-disable-next-line no-restricted-syntax
    for (const listener of this._listeners) {
      if (typeof listener === 'function') listener(this);
    }
  }
}

class Positionable extends Observable {
  /**
   * Minimum is 0. Maximum is square root of class Board maxTiles - 1
   * example : maxTiles = 49, maximum is 7 - 1 = 6
   * @abstract
   * @extends Observable
   * @param {Int} x x axis value
   * @param {Int} y y axis value
   */
  constructor(x, y) {
    super();
    this._x = x;
    this._y = y;
  }

  setTile(x, y) {
    this._x = x;
    this._y = y;
  }
}

class Tile extends Positionable {
  /**
   * @abstract
   * @extends Positionable
   * @param {Int} x x axis
   * @param {Int} y y axis
   */
  constructor(x, y) {
    super(x, y);
    this._hasPlayer = 0;
    this.reachable = 1;
  }

  /**
   * Return an array of x Axis in index 0 and y Axis in index 1
   */
  getPos() {
    return [this._x, this._y];
  }

  /**
   * Bool, return true if tile is an obstacle
   */
  isObstacle() {
    if (this instanceof Obstacle) {
      return true;
    }
    return false;
  }

  /**
   * Bool, return true if tile is empty
   */
  isEmpty() {
    if (this instanceof EmptyTile) {
      return true;
    }
    return false;
  }

  /**
   * Bool, return true if tile has player in it
   */
  hasPlayer() {
    // eslint-disable-next-line no-restricted-syntax
    for (const player of Game.players) {
      if (this._x === player.char._x && this._y === player.char._y) {
        return true;
      }
    }
    return false;
  }

  // Bool, return true if tile has item in it
  hasItem() {
    if (this._hasItem[0] === 1) {
      return true;
    }
    return false;
  }
}

/**
 * Empty tile, can either stay empty, have a player or an item
 * @extends Tile
 */
class EmptyTile extends Tile {
  constructor(x, y) {
    super(x, y);
    this._type = 'Empty';
    this._hasItem = [0];
  }

  set reachable(newVal) {
    this._reachable = newVal;
  }

  get reachable() {
    return this._reachable;
  }

  set hasPlayer(newVal) {
    this._hasPlayer = newVal;
  }

  get hasPlayer() {
    return this._hasPlayer;
  }
}

// eslint-disable-next-line no-unused-vars
class Escape extends Tile {
  constructor(x, y) {
    super(x, y);
    this._type = 'Escape';
  }
}

/**
 * Tile that cannot be reached
 * @class Obstacle
 * @extends Tile
 * @abstract
 */
class Obstacle extends Tile {
  constructor(x, y) {
    super(x, y);
    this._type = 'Obstacle';
    this._reachable = 0;
  }
}

/**
 * Setting model Barrel for an Obstacle
 * @extends Obstacle
 */

class Barrel extends Obstacle {
  constructor(x, y) {
    super(x, y);
    this._model = 'Barrel';
  }
}

/**
 * Setting model Barbed Wire for an Obstacle
 * @extends Obstacle
 */

class BarbedWire extends Obstacle {
  constructor(x, y) {
    super(x, y);
    this._model = 'BarbedWire';
  }
}

/**
 * Setting model Woodbox for an Obstacle
 * @extends Obstacle
 */
class Woodbox extends Obstacle {
  constructor(x, y) {
    super(x, y);
    this._model = 'Woodbox';
  }
}

class Board {
  /**
   * Create a board containing all tiles
   * @param {Int} maxTiles Should be a square number 25, 36, 49, 64, 81..
   */
  constructor(maxTiles) {
    // Limit max tiles possibility, should be a square number
    this.squareNumbers = [25, 36, 49, 64, 81, 100];
    this.squareNumbers.forEach((number, index) => {
      if (maxTiles < number && maxTiles > this.squareNumbers[index - 1]) {
        console.error(
          `${maxTiles} isn't a square number.
            Changed value to nearest superior value. (${number})
            Possible values are ${this.squareNumbers}`
        );
        maxTiles = number;
        return maxTiles;
      }
      return maxTiles;
    });
    this.tiles = [];
    this.lineOfTiles = Math.floor(Math.sqrt(maxTiles));
    for (let y = 0; y < this.lineOfTiles; ++y) {
      for (let x = 0; x < this.lineOfTiles; ++x) {
        const randomTileGenerator = Math.random();
        if (randomTileGenerator < 0.9) {
          this.tiles.push(new EmptyTile(x, y));
        } else {
          const randomObstacleGenerator = Math.random();
          if (randomObstacleGenerator < 0.33) {
            this.tiles.push(new Barrel(x, y));
          } else if (randomObstacleGenerator < 0.66) {
            this.tiles.push(new BarbedWire(x, y));
          } else if (randomObstacleGenerator <= 1) {
            this.tiles.push(new Woodbox(x, y));
          }
        }
      }
    }
  }

  /**
   * Return tile object of given x Axis and Y Axis
   * @param {Int} x
   * @param {Int} y
   */
  getTile(x, y) {
    // eslint-disable-next-line no-restricted-syntax
    for (const elem of this.tiles) {
      if (elem._x === x && elem._y === y) {
        return elem;
      }
    }
    return false;
  }

  /**
   * Bool, return true if an adjacent tile of given tile has a player on it
   * @param {Int} playerTile  Should be index of Board class tiles[]
   */
  isPlayerNear(playerTile) {
    let playerNear = false;
    const tile = this.tiles[playerTile];
    const adjacentTiles = [];
    adjacentTiles.push(this.getTile(tile._x + 1, tile._y));
    adjacentTiles.push(this.getTile(tile._x - 1, tile._y));
    adjacentTiles.push(this.getTile(tile._x, tile._y + 1));
    adjacentTiles.push(this.getTile(tile._x, tile._y - 1));
    // eslint-disable-next-line no-restricted-syntax
    for (const adjacentTile of adjacentTiles) {
      if (adjacentTile !== undefined) {
        if (adjacentTile._hasPlayer === 1) {
          playerNear = true;
          return playerNear;
        }
      }
    }
    return playerNear;
  }
}

class Movable extends Positionable {
  /**
   * Objects moving in the board
   * @abstract
   * @extends Positionable
   * @param {Int} x x axis
   * @param {Int} y y axis
   */
  constructor(x, y) {
    super(x, y);
    this.steps = [];
  }

  move(x, y) {
    if (this._x !== x) {
      this.movementPoint -= Math.abs(x - this._x);
    } else if (this._y !== y) {
      this.movementPoint -= Math.abs(y - this._y);
    }
    this.setTile(x, y);
  }
}

class Character extends Movable {
  /**
   * Create a character used by a player
   * as a pawn in a board game
   * @param {Int} x x axis of the char
   * @param {Int} y y axis of the char
   */
  constructor(x, y) {
    super(x, y);
    this._equipedItem = {};
    this.onFight = 0;
    this.initProperties();
    this.onFight = 0;
    this._equipedItem = {
      name: 'Poings',
      amount: 15
    };
  }

  get movementPoint() {
    return this._movementPoint;
  }

  set movementPoint(newVal) {
    this._movementPoint = newVal;
  }

  get equipedItem() {
    return this._equipedItem;
  }

  set equipedItem(newVal) {
    this._equipedItem = Game.items[newVal];
  }

  /**
   * Return the number of the character tile
   * The number is an index of tiles array from the Board class
   */
  getTile() {
    return this._x + this._y * Math.floor(Math.sqrt(Game.board.tiles.length));
  }

  /**
   * Return x and y axis in an array
   */
  getPos() {
    return [this._x, this._y];
  }

  /**
   * Change the character to another given position
   * @param {Int} x new x axis
   * @param {Int} y new y axis
   */
  setTile(x, y) {
    // eslint-disable-next-line max-len
    if (this._x !== undefined && this._y !== undefined)
      Game.board.getTile(this._x, this._y)._hasPlayer = 0;
    super.setTile(x, y);
    const newTile = Game.board.getTile(x, y);
    newTile._hasPlayer = 1;
    newTile.reachable = 0;
  }

  /**
   * Move character to another tile with setTile and actualise the movement points
   * using super.move(x,y)
   * @param {Int} x new x axis
   * @param {Int} y new y axis
   */
  move(x, y) {
    super.move(x, y);
    this.setTile(x, y);
  }

  /**
   * Check if player can equip this item
   * @param {Int} itemIndex item index in GameManager class items[]
   * @param {Int} itemTile tile where the item is
   */
  checkItem(itemIndex, itemTile) {
    const item = Game.items[itemIndex];
    const charType = [Survivor, Chaser];
    if (this instanceof charType[item.targetChar - 1]) {
      this.equipItem(item, itemTile);
    }
  }

  /**
   * Equip item and remove it from the tile
   * @param {Int} itemIndex item index in GameManager class items[]
   * @param {Int} itemTile tile where the item is
   */
  equipItem(newItem, itemTile) {
    const previousItem = this._equipedItem;
    const previousItemIndex = Game.getItemIndex(previousItem.name);
    this._equipedItem = newItem;
    if (previousItem.name === 'Poings') {
      // eslint-disable-next-line no-param-reassign
      itemTile._hasItem = [0];
    } else {
      // eslint-disable-next-line no-param-reassign
      itemTile._hasItem = [1, previousItemIndex];
    }
    return itemTile._hasItem;
  }
}

class Survivor extends Character {
  constructor(x, y) {
    super(x, y);
    this.model = ['Adam'];
    // eslint-disable-next-line prefer-destructuring
    this.name = this.model[0];
    this._movementPoint = 3;
    this.defaultMovePoints = this.movementPoint;
    this._health = 100;
  }
}

class Chaser extends Character {
  constructor(x, y) {
    super(x, y);
    this.model = ['Billy', 'Myers', 'Clown'];
    // eslint-disable-next-line prefer-destructuring
    this.name = this.model[0];
    this._movementPoint = 2;
    this.defaultMovePoints = this.movementPoint;
  }
}

// Logic

class Player {
  /**
   *
   * @param {Int} number number of player, either 1 or 2
   * @param {Int} desiredChar 1 = Survivor || 2 = Chaser
   * @param {Int|String} desiredModel Choose skin for the character
   */
  constructor(number, desiredChar, desiredModel) {
    this.number = number;
    if (desiredChar === 1) {
      this.char = new Survivor(4, 3);
    } else {
      this.char = new Chaser(4, 3);
    }
    if (desiredModel instanceof String) this.char.name = desiredModel;
    else this.char.name = this.char.model[desiredModel];
  }
}

class Item {
  /**
   *
   * @param {String} name Item name
   * @param {Int} type Must be index - Select a type from itemsType array
   * @param {Int} amount Can be amount of damages,
   * heal, tile distance or movement point boost according to type
   * @param {Int} targetChar Which type
   * of character can use this item (Either 1 = Survivor 2 = Chaser)
   */

  constructor(name, type, amount, targetChar) {
    this.itemsType = ['Damage', 'Healing', 'Mover', 'Boost'];
    this.name = name;
    this.type = this.itemsType[type];
    this.amount = amount;
    this.targetChar = targetChar;
    switch (type) {
      case 0:
        this.desc = `Occasionne ${this.amount} de dommages.`;
        break;
      case 1:
        this.desc = `Soigne ${this.amount} de points de vie.`;
        break;
      case 2:
        switch (targetChar) {
          case 1:
            this.desc = `Repousse de ${this.amount} case.`;
            break;
          case 2:
            this.desc = `Attire de ${this.amount} case.`;
            break;
          default:
            // console.error('Le personnage ciblé est incorrect');
            break;
        }
        break;
      case 3:
        this.desc = `Augmente de ${this.amount} les points de mouvement du personnage.`;
        break;
      default:
        break;
    }
    switch (targetChar) {
      case 1:
        this.descChar =
          "<span class='tooltiptext--survivor'>Pour Survivant.</span>";
        break;
      case 2:
        this.descChar = "<span class='tooltiptext--chaser'>Pour Chaser.</span>";
        break;
      default:
        break;
    }
  }
}

class GameManager extends Observable {
  /**
   * Used for default variables
   * @abstract
   * @extends Observable
   */
  constructor() {
    super();
    this.turn = 1;
    this.initProperties();
    this.playerModel = [];
    this.players = [new Player(1, 1), new Player(2, 2)];
    this.playersAction = [];
    // Define active player based on character selection
    // Survivor is always starting first
    this.players[0].char instanceof Survivor
      ? (this.activePlayer = 0)
      : (this.activePlayer = 1);
    this.totalTurn = 0;
    // Define turns required before survivor escape
    this.escapeTurn = 9;
    this.board = new Board(64);
  }

  // eslint-disable-next-line class-methods-use-this
  /**
   * Return possible models for a game mode
   * Used in character selection
   * @param {String} mode can either be Survival or Versus
   */
  // eslint-disable-next-line class-methods-use-this
  getCharModels(mode) {
    if (mode === 'survival') {
      const chaser = new Chaser(0, 0);
      const survivor = new Survivor(0, 0);
      const models = [[...chaser.model], [...survivor.model]];
      return models;
    }
    const chaser = new Chaser(0, 0);
    const models = [...chaser.model];
    return models;
  }

  /**
   * Spawn both players accross the map in random positions
   */
  // eslint-disable-next-line consistent-return
  playerSpawn() {
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, elem] of this.players.entries()) {
      elem.char.name = this.playerModel[index];
      let randomTile = Math.floor(Math.random() * this.board.tiles.length);
      // Prevent player from spawning on a player or an obstacle
      while (
        this.board.tiles[randomTile] instanceof Obstacle ||
        this.board.tiles[randomTile].hasPlayer === 1
      ) {
        randomTile = Math.floor(Math.random() * this.board.tiles.length);
      }

      this.board.tiles[randomTile]._hasItem = [0];
      elem.char.setTile(
        this.board.tiles[randomTile].getPos()[0],
        this.board.tiles[randomTile].getPos()[1]
      );
      this.board.tiles[randomTile]._reachable = 0;
      this.board.tiles[randomTile].hasPlayer = 1;

      // Player can't spawn near another player (One tile from)
      if (this.board.isPlayerNear(this.players[0].char.getTile())) {
        return this.playerSpawn();
      }
      // console.info(elem);
    }
  }

  /**
   * Spawn random items from GameManager items[]
   */

  itemSpawn() {
    // Remove existant items
    // eslint-disable-next-line no-restricted-syntax
    for (const tile of this.board.tiles) {
      if (tile._hasItem && tile._hasItem[0] === 1) {
        tile._hasItem = [0];
      }
    }

    for (let i = 0; i < 4; ++i) {
      let randomTile = Math.floor(Math.random() * this.board.tiles.length);
      while (
        this.board.tiles[randomTile] instanceof Obstacle ||
        this.board.tiles[randomTile]._hasPlayer === 1 ||
        this.board.tiles[randomTile]._hasItem[0] === 1
      ) {
        randomTile = Math.floor(Math.random() * this.board.tiles.length);
      }
      const randomItem = Math.floor(Math.random() * this.items.length);
      this.board.tiles[randomTile]._hasItem = [1, randomItem];
      console.log(this);
    }
  }

  /**
   * Get an action for the fight state
   * @param {String} action  attack || defend
   */
  nextTurn(action) {
    // IF not in fight
    // reset moves
    // IF fight state
    // pushes actions and call nextFightTurn
    if (this.players[0].char.onFight === 0) {
      this.players[this.activePlayer].char.movementPoint = this.players[
        this.activePlayer
      ].char.defaultMovePoints;
    } else {
      const playerAction = {
        player: this.activePlayer,
        action
      };
      this.playersAction.push(playerAction);
      if (this.playersAction.length > 1) {
        this.nextFightTurn();
      }
    }

    // Change active player each end turn
    this.activePlayer === 0 ? (this.activePlayer = 1) : (this.activePlayer = 0);

    // Increase total Game turn each time both players turn ended
    if (this.turn % 2 === 0 && this.totalTurn < this.escapeTurn) {
      this.nextGameTurn();
    }
    this.turn += 1;
  }

  /**
   * When both players have finished their turns,
   * Increment the total game variable
   * Used to control item respawn or event on given number of turn
   */
  nextGameTurn() {
    this.totalTurn = this.turn / 2;
    // Respawn item pool each 3 turns
    if (!this.onFightState()) {
      if (this.totalTurn % 3 === 0) this.itemSpawn();
    }
  }

  /**
   * Show possible moves for active player
   */
  getPossibleMoves() {
    this.removePossibleMoves();
    this.possibleBottomMovesTiles = [];
    this.possibleTopMovesTiles = [];
    this.possibleLeftMovesTiles = [];
    this.possibleRightMovesTiles = [];
    this.possibleMovesIterator = [
      this.possibleBottomMovesTiles,
      this.possibleRightMovesTiles,
      this.possibleLeftMovesTiles,
      this.possibleTopMovesTiles
    ];

    for (const elem of this.possibleMovesIterator) {
      // Check if previous tiles are obstructed.
      // Ignored during first iteration
      for (
        let i = 1;
        i <= this.players[this.activePlayer].char.movementPoint;
        i++
      ) {
        let shouldBreak = false;
        for (
          let j = 1;
          j <= this.players[this.activePlayer].char.movementPoint;
          j++
        ) {
          if (
            elem[i - j] instanceof Obstacle ||
            (elem[i - j] instanceof EmptyTile && elem[i - j].hasPlayer === 1)
          )
            shouldBreak = true;
        }
        if (shouldBreak) continue;

        // Add reachable tiles to each arrays
        switch (elem) {
          case this.possibleBottomMovesTiles:
            elem[i] = this.board.getTile(
              this.players[this.activePlayer].char._x,
              this.players[this.activePlayer].char._y + i
            );
            break;
          case this.possibleTopMovesTiles:
            elem[i] = this.board.getTile(
              this.players[this.activePlayer].char._x,
              this.players[this.activePlayer].char._y - i
            );
            break;
          case this.possibleLeftMovesTiles:
            elem[i] = this.board.getTile(
              this.players[this.activePlayer].char._x - i,
              this.players[this.activePlayer].char._y
            );
            break;
          case this.possibleRightMovesTiles:
            elem[i] = this.board.getTile(
              this.players[this.activePlayer].char._x + i,
              this.players[this.activePlayer].char._y
            );
            break;
          default:
            break;
        }
      }
    }

    // Unite previous arrays inside one for clarity
    this.possibleMovesTiles = [
      ...this.possibleBottomMovesTiles,
      ...this.possibleLeftMovesTiles,
      ...this.possibleRightMovesTiles,
      ...this.possibleTopMovesTiles
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const tile of this.possibleMovesTiles) {
      // Check if tile is defined and empty
      if (tile instanceof EmptyTile && tile.hasPlayer !== 1) {
        tile.reachable = 1;
      }
    }
  }

  /** Reset possible moves */
  removePossibleMoves() {
    // eslint-disable-next-line no-restricted-syntax
    for (const tile in this.board.tiles) {
      if (this.board.tiles[tile].reachable === 1) {
        this.board.tiles[tile].reachable = 0;
      }
    }
  }

  /** Check if player can enter in fight */
  checkPlayersProximity() {
    const selChar = this.players[0].char;
    const selChar2 = this.players[1].char;
    this.selCharProx = [
      selChar._x + 1,
      selChar._x - 1,
      selChar._y - 1,
      selChar._y + 1
    ];
    if (selChar._x === selChar2._x) {
      if (
        selChar2._y === this.selCharProx[2] ||
        selChar2._y === this.selCharProx[3]
      ) {
        this.fight();
      }
    } else if (selChar._y === selChar2._y) {
      if (
        selChar2._x === this.selCharProx[0] ||
        selChar2._x === this.selCharProx[1]
      ) {
        this.fight();
      }
    }
  }

  /**
   *
   * @param {String} itemQuery Name of an item
   */
  // eslint-disable-next-line consistent-return
  getItemIndex(itemQuery) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, item] of this.items.entries()) {
      if (item.name === itemQuery) return index;
    }
  }
}

// eslint-disable-next-line no-unused-vars
class SurvivalGameManager extends GameManager {
  /**
   * @extends GameManager
   * Created when game mode is selected
   * In survival, one player is chaser and the other one is survivor
   * Chaser has to kill the survivor
   * Survivor need to survive x amounts of turn to escape
   */
  constructor() {
    super();
    this.players = [new Player(1, 1, 0), new Player(2, 2, 1)];
    this.items = [
      new Item('Machette', 0, 20, 2),
      new Item('Hachoir', 0, 10, 2),
      new Item('Piege', 0, 15, 2),
      new Item('Grappin', 2, 1, 2),
      new Item('Skate', 3, 1, 1),
      new Item('Lance-pierre', 2, 1, 1),
      new Item('Bandages', 1, 10, 1)
    ];
    this.mode = 'survival';
  }
}

class VersusGameManager extends GameManager {
  /**
   * @extends GameManager
   * Created when game mode is selected
   * In versus, both players are chaser and have to fight to death
   */
  constructor() {
    super();
    this.players = [new Player(1, 2, 0), new Player(2, 2, 2)];
    // eslint-disable-next-line no-restricted-syntax
    for (const player of this.players) {
      player.char._movementPoint = 3;
      player.char.defaultMovePoints = 3;
      player.char._health = 100;
    }
    this.items = [
      new Item('Machette', 0, 35, 2),
      new Item('Hachoir', 0, 25, 2),
      new Item('Grappin', 0, 30, 2),
      new Item('Gants', 0, 20, 2)
    ];
    this.winner = 0;
    this.mode = 'versus';
  }

  /**
   * Initiate the fight state
   */
  fight() {
    // eslint-disable-next-line no-restricted-syntax
    for (const player of this.players) {
      player.char._movementPoint = 0;
      this.removePossibleMoves();
      player.char.onFight = 1;
    }
  }

  /** Bool, return true if players are in fight state */
  onFightState() {
    if (this.players[0].char.onFight === 1) {
      return true;
    }
    return false;
  }

  /**
   * Take both actions (attack/defend) done during previous turn and execute them
   */
  nextFightTurn() {
    const previousHealthFirstPlayer = this.players[this.playersAction[0].player]
      .char._health;
    if (this.players[this.playersAction[1].player].char._health > 0) {
      if (this.players[this.playersAction[0].player].char._health > 0) {
        if (this.playersAction[0].action === 'attack') {
          if (this.playersAction[1].action === 'defend') {
            this.players[this.playersAction[1].player].char._health -=
              this.players[this.playersAction[0].player].char._equipedItem
                .amount / 2;
          } else {
            this.players[1].char._health -= this.players[0].char._equipedItem.amount;
            this.players[0].char._health -= this.players[1].char._equipedItem.amount;
          }
        } else if (this.playersAction[1].action === 'attack') {
          this.players[this.playersAction[0].player].char._health -=
            this.players[this.playersAction[1].player].char._equipedItem
              .amount / 2;
        }
      }
      this.players[this.playersAction[0].player].char._health = Math.floor(
        this.players[this.playersAction[0].player].char._health
      );
      this.players[this.playersAction[1].player].char._health = Math.floor(
        this.players[this.playersAction[1].player].char._health
      );
    }

    // prevent health from going under 0
    // eslint-disable-next-line no-restricted-syntax
    for (const player of this.players) {
      if (player.char._health < 0) {
        player.char._health = 0;
      }
    }

    // If both players die at the same time.
    // first attacker wins
    if (
      this.players[this.playersAction[1].player].char._health === 0 &&
      this.players[this.playersAction[0].player].char._health === 0
    ) {
      this.players[
        this.playersAction[0].player
      ].char._health = previousHealthFirstPlayer;
    }

    if (this.players[this.playersAction[1].player].char._health === 0) {
      this.winner = this.playersAction[0].player + 1;
    } else if (this.players[this.playersAction[0].player].char._health === 0) {
      this.winner = this.playersAction[1].player + 1;
    }

    // Removing actions each turn after they've been used
    this.playersAction.length = 0;
  }
}

const Game = new VersusGameManager();
export { Game as default };
