<template>
  <div class="board">
    <template v-for="row in renderData">
      <div class="row" v-if="row.length > 0">
        <span 
          class="cell" 
          :class="cellClass(cell)"
          :style="cellColor(cell)"
          v-for="cell in row"> </span>
      </div>
    </template>
  </div>
</template>

<script>
import { SYMBOL } from './strings.js';
import { ref } from 'vue'

export default {
  name: 'TBoard',
  props: {
    renderData: Array,
    renderTxt: String,
  },
  setup(props) {
    const blockColor = ref('green');

    const cellClass = (cell) => {
      return {
        empty:   cell === SYMBOL.empty,
        borderY: cell === SYMBOL.borderY,
        borderX: cell === SYMBOL.borderX,
        block:   cell === SYMBOL.block,
        full:    cell === SYMBOL.full,        
      }
    };

    const cellColor = (cell) => { { backgroundColor: cell === SYMBOL.block ? blockColor : '' } };

    const newBlockEvent = () => blockColor.value = randomColor();

    const randomColor = () => { "#" + Math.floor(Math.random()*16777215).toString(16) };

    return {
      blockColor,

      cellClass,cellColor,
      newBlockEvent, randomColor
    }

  },
}
</script>

<style scoped>
.board {
  margin: 0;

  margin-left: -5px;
  margin-top: -5px;

  font-family: monospace;
  font-size: 28px;
  position: absolute;
  display: flex;

  flex-direction: column;
}

.row {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}

.cell {
  width: 12px;
  height: 12px;
  border: 1px solid black;
  margin: 2px;
  display: block;
  background-color: transparent;
  transition: background-color 1s cubic-bezier(0, 0, 0.1, 0.7);
}

.borderY {
  background-color: orange;
}

.borderX {
  background-color: red;
}

.block {
  border-radius: 7px;
  transition: background-color 0s;
  background-color: rgb(178, 234, 25);
}

.empty {
  border: 1px solid transparent;
  background-color: transparent;
}

.full {
  background-color: black;
  border-radius: 0;
}

</style>