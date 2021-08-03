<template>
  <div>
    <h1>TETRIS</h1>
    <div>
      <span>Destroyed: {{ destroyed }}</span>
    </div>
    <div class="zone">
      <TBoard v-bind:renderData="renderData" ref="board" />
    </div>

    <button @click="main()">{{ playBtnText }}</button>
  </div>
</template>

<script>
import TBoard from './TBoard.vue'

import * as fn from './lib.js';
import {STR, SYMBOL} from './strings.js';
import {BLOCKS} from './blocks.js';

export default {
  name: 'TTetris',
  props: {
    msg: String
  },
  components: {
    TBoard
  },
  data() {
    return {
      speed: 500,
      isOn: false,
      playBtnText: '123',
      timer: null,
      frame: 0,

      board: '',
      sizeX: 10, 
      sizeY: 23, 
      topY: 1,

      currentBlock: null,
      currentBlockData: null,
      allowRotation: true,

      level: null,
      levelOfBlock: [],

      renderData: [],
      renderTxt: '',
      destroyed: 0,

    }
  },
  created() {
      this.playBtnText = STR.PLAYBTN[false];
      console.clear();
  },
  mounted() {
  	document.addEventListener("keydown", this.userKeyDown);
  },
  unmounted() {
    document.removeEventListener("keydown", this.userKeyDown)
  },
  methods: {
    main() {
      this.isOn = !this.isOn;
      this.playBtnText = STR.PLAYBTN[this.isOn];

      if (this.isOn === false){
        clearInterval(this.timer);
        this.frame = 0;
        console.log('Game stopped');
        return;
      }

      console.log('Game started');

      this.timer = setInterval(() => {
        if (this.frame === 0) {
          this.level = this.levelOfBlock = fn.createEmptyLevel(this.sizeX, this.sizeY, this.topY, SYMBOL);
        }
        if(!this.isAnimation){
          this.runTick();
          this.board = this.frame;

          this.frame++;
          
          if (this.isOn === false){
            clearInterval(this.timer);
          }
        }
        
      }, this.speed); 
    },

    // kills interval, etc.
    pauseGame() {
      this.isOn = false;
      this.playBtnText = 'PAUSE';
      clearInterval(this.timer);
      console.log('GAME PAUSE'); // todo: add html
    },

    // kills interval, etc.
    stopGame() {
      this.isOn = false;
      this.frame = 0;
      clearInterval(this.timer);
      console.log('GAME !!'); // todo: add html
    },


    renderView() {
      let levelTxt = '', levelArray = [];
      
      for (let Y = this.topY; Y < this.sizeY; Y++) {
        
        levelArray[Y] = [];
        for (let X = 0; X <= this.sizeX + 1; X++) {
          if (!this.level[Y]){
            continue;
          }
          if (this.levelOfBlock[Y] === undefined){
            continue;
          }

          let cellView = this.level[Y][X];
          // draw level cell

          // draw current block
          if (this.levelOfBlock[Y] !== null && this.levelOfBlock[Y][X] === SYMBOL.blockMapFull) {
            cellView = SYMBOL.block;  
          } 
          
          levelTxt += cellView;
          levelArray[Y].push(cellView);
          
          if (X == this.sizeX + 1) {
            levelTxt += '<br>';
          }
        }
      }
      this.renderTxt  = levelTxt;

      let emptyRow = new Array(this.sizeX + 2);
      emptyRow = emptyRow.fill(SYMBOL.borderY);

      levelArray.unshift(emptyRow);
      this.renderData = levelArray.filter((el) => el != null);
      
      // console.clear();
      // console.log(levelTxt);
    },

    runTick() {
      
      if (!this.currentBlock) {
        const randomBlock = fn.pickRandomBlock(BLOCKS) 

        this.levelOfBlock = fn.createEmptyLevel(this.sizeX, this.sizeY, this.topY, SYMBOL)
        this.levelOfBlock = fn.addNewBlockToLOB(randomBlock.data, this.levelOfBlock, this.sizeX, this.topY)
        
        this.currentBlock = randomBlock.name

        this.$refs.board.newBlockEvent();

        //console.log('New Block of type: ' + randomBlock.name)

        if (fn.hasOverlaps(this.level, this.levelOfBlock, SYMBOL, this.sizeY, this.sizeX, this.topY)) {
          //gameover coz we have overlaps on top
          this.stopGame()
        }
      }

      if (this.moveCurrentBlockDown()) { 
        this.renderView();
      }

      if (this.maybeDestroyLines()) { 
        this.renderView();
      }

      return true
    },

    moveCurrentBlockDown() {
      if (!this.currentBlock) {
        return false;
      } 
      
      this.allowRotation = false;

      // shift data one row down on levelOfBlock
      let emptyRow = new Array(this.sizeX + 2);
      emptyRow = emptyRow.fill(SYMBOL.borderY).fill(SYMBOL.empty, 1, this.sizeX + 1) 
      
      let levelOfBlockShifted = JSON.parse(JSON.stringify(this.levelOfBlock));//[...this.levelOfBlock];
      levelOfBlockShifted.pop();
      levelOfBlockShifted.unshift(emptyRow);
      levelOfBlockShifted = levelOfBlockShifted.filter((el) => el != null)
     
      if (fn.hasOverlaps(this.level, levelOfBlockShifted, SYMBOL, this.sizeY, this.sizeX, this.topY)) {
        this.level = fn.transferBlockToLevel(this.level, this.levelOfBlock, SYMBOL, this.sizeY, this.sizeX, this.topY);
        
        // clear currentBlock, levelOfBlock
        this.currentBlock = null;
        this.levelOfBlock = [];

        return false;
      }
      
      this.levelOfBlock = levelOfBlockShifted;

      this.allowRotation = true;

      return true;
    },

    // check lines, destroy them, animate
    maybeDestroyLines() {
      const linesToDestroy = fn.getFullLines(this.level, SYMBOL, this.sizeY, this.sizeX, this.topY);
      
      if (!linesToDestroy.length) {
        return false;
      }

      console.log('Lines to be removed: ' + linesToDestroy.length, linesToDestroy)
      
      this.isAnimation = true;

      this.level = fn.removeLineFromLevel(this.level, SYMBOL, linesToDestroy, this.sizeY, this.sizeX, this.topY);
      
      this.isAnimation = false;

      this.destroyed += linesToDestroy.length;

      return true;
    },

    // left/-1 right/1 null/0
    moveBlock(direction) {
      let levelOfBlockMOVE = [...this.levelOfBlock];
      
      // shift data
      // get edges of level to see if there are block cells
      const edge = fn.getLevelBordersData(this.levelOfBlock, this.sizeY, this.sizeX, this.topY);

      // if block cells are on the edge - dont move block
      if (edge['left'].includes(SYMBOL.blockMapFull) || edge['right'].includes(SYMBOL.blockMapFull)) {
        return false;
      }
      
      for (let y = this.topY; y < this.sizeY; y++) {
        levelOfBlockMOVE[y] = fn.arrShift(levelOfBlockMOVE[y], direction, SYMBOL, this.sizeX);
      }
      
      // checkCollision
      if (fn.hasOverlaps(this.level, levelOfBlockMOVE, SYMBOL, this.sizeY, this.sizeX, this.topY)) {
        return false;
      } 
      
      // update levelOfBlock if possible
      this.levelOfBlock = levelOfBlockMOVE;
      
      return true;
    },

    rotateBlock(blockData, direction = 'left') { // TODO: add direction?
      if (blockData === undefined){
        return false
      }

      const rotatedBlock = fn.rotateMatrixLeft(blockData);
      
      //find lowest and leftest point in levelOfBlock - use is as y coord
      const h = rotatedBlock.length,
            w = rotatedBlock[0].length;
      
      let lowestY = 0, lowestX = this.sizeX - 1 - w; 
      
      ({lowestX, lowestY} = fn.getCurrentBlockPos(this.currentBlock, this.levelOfBlock, lowestY, lowestX, SYMBOL, this.sizeY, this.sizeX, this.topY));

      if (lowestY <= h){
        console.log(`Can't rotate - no available space`);
        return false
      }

      this.currentBlockData = rotatedBlock;
        
      //clear levelOfBlock
      this.levelOfBlock = fn.createEmptyLevel(this.sizeX, this.sizeY, this.topY, SYMBOL)

      //paste at y coord torated src block using block height
      const y1Pos = lowestY - h;
      const y2Pos = lowestY - 1;

      const x1Pos = lowestX;
      const x2Pos = lowestX - 1 + w;

      for (let y = y1Pos; y <= y2Pos; y++) {
        for (let x = x1Pos; x <= x2Pos; x++) {
          this.levelOfBlock[y][x] = rotatedBlock[y - y1Pos][x - x1Pos]
        }
      }  

      return true
    },

    userKeyDown(e) {
      // console.log(e)
      if(this.level === null || this.levelOfBlock === null) {
        return
      }

      let r = false;
      
      if (e.code === 'ArrowRight') {
        r = this.moveBlock('right');
        if (r) this.renderView();

      } else if (e.code === 'ArrowLeft') {
        r = this.moveBlock('left')
        if (r) this.renderView();

      } else if (e.code === 'ArrowUp' && this.allowRotation) { // e.code === 'Space'
        r = this.rotateBlock(this.currentBlockData || BLOCKS[this.currentBlock])
        //if (r) this.renderView(); // TODO: 1 bug - when rotating too often block gets up
        //TODO: 2 bug - extra line blinks below horiz border

      } else if (e.code === 'ArrowDown') {
        for (let times = 1; times <= 3; times++) {  // TODO: maybe optimize
          r = this.moveCurrentBlockDown()
          if (r) this.renderView()
        }
      }
      else if (e.code === 'Space') {
        for (let times = 1; times <= this.sizeY; times++) {  // TODO: maybe optimize
          r = this.moveCurrentBlockDown()
          if (r) this.renderView()
        }
      } 
    }
  
  }

  
  
}
</script>

<style scoped>
.zone {
  width: 190px;
  height: 400px;
  margin: 10px auto;
  margin-bottom: 20px;
  padding: 0;
}
</style>