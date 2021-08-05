
# rrweb player vue

Vue-based player for [rrweb](https://github.com/rrweb-io/rrweb)




## Installation

#### npm
```sh
npm install @preflight-hq/rrweb-player-vue
```
#### Yarn
```sh
yarn add @preflight-hq/rrweb-player-vue
```

## Basic usage

```vue
<template>
  <RrWebPlayer :events="events" />
</template>

<script>
import RrWebPlayer from '@preflight-hq/rrweb-player-vue'
export default {
  components: {
    RrWebPlayer
  },
  data: () => ({
    events: []
  })
}
</script>

```


## Props

| Name | Type     | Default                |
| :-------- | :------- | :------------------------- |
| events | `Array` | `[]` |
| width | `number` | `1024` |
| height | `number` | `576` |
| skipInactive | `boolean` | `true` |
| autoplay | `boolean` | `true` |
| speedOption | `number[]` | `[1, 2, 4, 8]` |
| speed | `number` | `speedOption[0]` |
| showController | `boolean` | `true` |
| tags | `Object` | `{}` |

## Events

| Name |
| :-------- |
| ui-update-current-time

