<template>
  <div class="rr-player" ref="player" :style="playerStyle">
    <div class="rr-player__frame" ref="frame" :style="style" />
    <template v-if="Object.values(replayer).length">
      <Controller
        ref="controller"
        :replayer="replayer"
        :skip-inactive.sync="computedSkipInactive"
        :show-controller="showController"
        :auto-play="autoPlay"
        :speed-option="speedOption"
        :tags="tags"
        :speed.sync="computedSpeed"
        @fullscreen="toggleFullScreen"
        @ui-update-current-time="$emit('ui-update-current-time', $event.payload)"
        @ui-update-player-state="$emit('ui-update-player-state', $event.payload)"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Replayer, unpack } from 'rrweb';
import type { eventWithTime } from 'rrweb/typings/types';
import {
  inlineCss,
  openFullscreen,
  exitFullscreen,
  isFullscreen,
  onFullscreenChange,
} from '@/utils';
import Controller from './Controller.vue';
import Vue, { PropType } from 'vue';
export default /*#__PURE__*/Vue.extend({
  name: 'RRWebPlayer',
  components: {
    Controller,
  },
  props: {
    width: {
      type: Number,
      required: false
    },
    height: {
      type: Number,
      required: false
    },
    events: {
      type: Array as PropType<eventWithTime[]>,
      default: () => [],
    },
    skipInactive: {
      type: Boolean,
      required: false,
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
    speedOption: {
      type: Array as PropType<number[]>,
      default: () => [1, 2, 4, 8],
    },
    speed: {
      type: Number,
      required: false,
    },
    showController: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
  },
  data: () => ({
    _width: 0,
    _height: 0,
    controllerHeight: 80,
    replayer: {} as Replayer,
    fullscreenListener: () => {},
    controller: {} as typeof Controller,
    defaultSpeed: 1,
    defaultSkipInactive: true,
    defaultWidth: 1024,
    defaultHeight: 576
  }),

  computed: {
    style(): ReturnType<typeof inlineCss> {
      return inlineCss({
        width: `${this.computedWidth}px`,
        height: `${this.computedHeight}px`,
      });
    },
    playerStyle(): ReturnType<typeof inlineCss> {
      return inlineCss({
        width: `${this.computedWidth}px`,
        height: `${
          this.computedHeight + (this.showController ? this.controllerHeight : 0)
        }px`,
      });
    },
    player() {
      return this.$refs.player as HTMLElement
    },
    controllerRef() {
      return this.$refs.controller as InstanceType<typeof Controller>
    },
    frame() {
      return this.$refs.frame as HTMLElement
    },
    computedSpeed: {
      get() {
        return this.speed || this.defaultSpeed
      },
      set(value: number) {
        if (this.speed) {
          this.$emit('update:speed', value)
        } else {
          this.defaultSpeed = value
        }
      }
    },
    computedSkipInactive: {
      get() {
        return this.skipInactive === undefined ? this.defaultSkipInactive : this.skipInactive
      },
      set(value: boolean) {
        if (this.skipInactive !== undefined) {
          this.$emit('update:skip-inactive', value)
        } else {
          this.defaultSkipInactive = value
        }
      }
    },
    computedWidth: {
      get() {
        return this.width || this.defaultWidth
      },
      set(value: number) {
        if (this.width) {
          this.$emit('update:width', value)
        } else {
          this.defaultWidth = value
        }
      }
    },
    computedHeight: {
      get() {
        return this.height || this.defaultHeight
      },
      set(value: number) {
        if (this.height) {
          this.$emit('update:height', value)
        } else {
          this.defaultHeight = value
        }
      }
    },
    replayerInitialized() {
      return this.replayer instanceof Replayer
    }
  },

  methods: {
    updateScale(
      el: HTMLElement,
      frameDimension: { width: number; height: number },
    ) {
      const widthScale = this.computedWidth / frameDimension.width;
      const heightScale = this.computedHeight / frameDimension.height;
      el.style.transform =
        `scale(${Math.min(widthScale, heightScale, 1)})` +
        'translate(-50%, -50%)';
    },
    toggleFullScreen() {
      if (this.player) {
        isFullscreen() ? exitFullscreen() : openFullscreen(this.player);
      }
    },
  },
  mounted() {
    if (
      this.speedOption !== undefined &&
      !Array.isArray(this.speedOption)
    ) {
      throw new Error('speedOption must be array');
    }
    this.speedOption.forEach((item: any) => {
      if (typeof item !== 'number') {
        throw new Error('item of speedOption must be number');
      }
    });
    this.defaultSpeed = this.speedOption[0]
    if (this.speedOption.indexOf(this.computedSpeed) < 0) {
      throw new Error(`speed must be one of speedOption,
        current config:
        {
          ...
          speed: ${this.computedSpeed},
          speedOption: [${this.speedOption.toString()}]
          ...
        }
        `);
    }
    this.replayer = new Replayer(this.events, {
      speed: this.computedSpeed,
      root: this.frame,
      unpackFn: unpack,
    });
    this.$nextTick(() => {
      this.replayer.on(
        'resize',
        // @ts-ignore
        (dimension: { width: number; height: number }) => {
          this.updateScale(this.replayer.wrapper, dimension);
        },
      );
    })
    this.fullscreenListener = onFullscreenChange(() => {
      if (isFullscreen()) {
        setTimeout(() => {
          this._width = this.computedWidth;
          this._height = this.computedHeight;
          this.computedWidth = this.player.offsetWidth
          this.computedHeight = this.player.offsetHeight
          this.updateScale(this.replayer.wrapper, {
            width: this.replayer.iframe.offsetWidth,
            height: this.replayer.iframe.offsetHeight,
          });
        }, 0);
      } else {
        this.computedWidth = this._width
        this.computedHeight = this._height
        this.updateScale(this.replayer.wrapper, {
          width: this.replayer.iframe.offsetWidth,
          height: this.replayer.iframe.offsetHeight,
        });
      }
    });
  },
  destroyed() {
    this.fullscreenListener && this.fullscreenListener();
  },
  watch: {
    computedSpeed: {
      handler(newValue) {
        if (!this.replayerInitialized) return
        this.replayer.setConfig({ speed: newValue })
      },
      immediate: true
    },
    computedSkipInactive: {
      handler(newValue) {
        if (!this.replayerInitialized) return
        this.replayer.setConfig({ skipInactive: newValue })
      },
      immediate: true
    }
  }
});
</script>
<style>
@import "node_modules/rrweb/dist/rrweb.min.css";
.rr-player {
  position: relative;
  background: white;
  float: left;
  border-radius: 5px;
  box-shadow: 0 24px 48px rgba(17, 16, 62, 0.12);
}

.rr-player__frame {
  overflow: hidden;
}

.replayer-wrapper {
  float: left;
  clear: both;
  transform-origin: top left;
  left: 50%;
  top: 50%;
}

.replayer-wrapper > iframe {
  border: none;
}
</style>
