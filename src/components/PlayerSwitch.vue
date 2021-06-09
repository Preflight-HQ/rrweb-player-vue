<template>
  <div class="rr-player-switch" :class="{ disabled }">
    <input type="checkbox" :id="id" :checked="checked" @change="$emit('input', $event)" :disabled="disabled" />
    <label :for="id" />
    <span class="label">{{label}}</span>
</div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'RRWebPlayerSwitch',
  model: {
    prop: 'checked',
    event: 'input'
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      required: true
    },
    id: {
      type: String,
      default: 'skip-inactive-checkbox'
    },
    label: {
      type: String,
      default: ''
    }
  }
})
</script>
<style>
  .rr-player-switch {
    height: 1em;
    display: flex;
    align-items: center;
  }

  .rr-player-switch.disabled {
    opacity: 0.5;
  }

  .label {
    margin: 0 8px;
  }

  .rr-player-switch input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .rr-player-switch label {
    width: 2em;
    height: 1em;
    position: relative;
    cursor: pointer;
    display: block;
  }

  .rr-player-switch.disabled label {
    cursor: not-allowed;
  }

  .rr-player-switch label:before {
    content: '';
    position: absolute;
    width: 2em;
    height: 1em;
    left: 0.1em;
    transition: background 0.1s ease;
    background: rgba(73, 80, 246, 0.5);
    border-radius: 50px;
  }

  .rr-player-switch label:after {
    content: '';
    position: absolute;
    width: 1em;
    height: 1em;
    border-radius: 50px;
    left: 0;
    transition: all 0.2s ease;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    background: #fcfff4;
    animation: switch-off 0.2s ease-out;
    z-index: 2;
  }

  .rr-player-switch input[type='checkbox']:checked + label:before {
    background: rgb(73, 80, 246);
  }

  .rr-player-switch input[type='checkbox']:checked + label:after {
    animation: switch-on 0.2s ease-out;
    left: 1.1em;
  }
</style>
