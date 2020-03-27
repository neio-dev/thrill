/* eslint-disable class-methods-use-this */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle  */
import Display from './display.js';
import Game from './game.js';
import Event from './event.js';


class TestManager {
  /**
   *
   * @param {Int} iteration how many times it is tested
   */
  constructor(iteration) {
    this.iteration = iteration;
  }

  PlayerSpawnNearPlayer() {
    let x = 0;
    while (x < this.iteration) {
      if (
        (Game.players[0].char._x === Game.players[1].char._x - 1
          && Game.players[0].char._y === Game.players[1].char._y)
        || (Game.players[0].char._x === Game.players[1].char._x + 1
          && Game.players[0].char._y === Game.players[1].char._y)
        || (Game.players[0].char._x === Game.players[1].char._x
          && Game.players[0].char._y === Game.players[1].char._y + 1)
        || (Game.players[0].char._x === Game.players[1].char._x
          && Game.players[0].char._y === Game.players[1].char._y - 1)
      ) {
        console.log(Game.players[0].char.getPos());
        console.log(Game.players[1].char.getPos());
        console.error('Mauvais spawn');
        break;
      }
      console.info('Spawn de joueurs réussi ');
      x += 1;
      Game.playerSpawn();
    }
  }

  PlayerSpawnOnPlayer() {
    let x = 0;
    while (x < this.iteration) {
      if (Game.board.tiles[Game.players[0].char.getTile()]
        === Game.board.tiles[Game.players[1].char.getTile()]) {
        console.error('Mauvais spawn (Joueur sur Obstacle)');
        break;
      }
      console.info('Spawn de joueur réussi');
      x += 1;
      Game.playerSpawn();
    }
  }

  PlayerSpawnOnObstacle() {
    let x = 0;
    while (x < this.iteration) {
      // eslint-disable-next-line no-restricted-syntax
      if (Game.board.tiles[Game.players[0].char.getTile()].isObstacle()
      || Game.board.tiles[Game.players[1].char.getTile()].isObstacle()) {
        console.error('Mauvais spawn (Joueur sur Obstacle)');
        break;
      }
      console.info('Spawn de joueur réussi');
      x += 1;
      Game.playerSpawn();
    }
  }
}


const Test = new TestManager(100);

export { Test as default };
