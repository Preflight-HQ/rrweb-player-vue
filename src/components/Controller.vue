<template>
  <div class="rr-controller" v-if="showController">
    <div class="rr-timeline">
      <span class="rr-timeline__time">{{ formatTimeLocal(currentTime) }}</span>
      <div
        class="rr-progress"
        :class="{ disabled: speedState === 'skipping' }"
        ref="progress"
        @click="handleProgressClick"
      >
        <div
          class="rr-progress__step"
          ref="step"
          :style="{ width: percentage }"
        />
        <template v-for="(event, index) in customEvents">
          <div
            :key="index"
            :title="event.name"
            style="
              width: 10px;
              height: 5px;
              position: absolute;
              top: 2px;
              transform: translate(-50%, -50%);
            "
            :style="{ background: event.background, left: event.position }"
          />
        </template>

        <div class="rr-progress__handler" :style="{ left: percentage }" />
      </div>
      <span class="rr-timeline__time">{{
        formatTimeLocal(meta.totalTime)
      }}</span>
    </div>
    <div class="rr-controller__btns">
      <button @click="toggle">
        <template v-if="playerState === 'playing'">
          <svg
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="16"
            height="16"
          >
            <path
              d="M682.65984 128q53.00224 0 90.50112 37.49888t37.49888 90.50112l0
              512q0 53.00224-37.49888 90.50112t-90.50112
              37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
              37.49888-90.50112t90.50112-37.49888zM341.34016 128q53.00224 0
              90.50112 37.49888t37.49888 90.50112l0 512q0 53.00224-37.49888
              90.50112t-90.50112
              37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
              37.49888-90.50112t90.50112-37.49888zM341.34016 213.34016q-17.67424
              0-30.16704 12.4928t-12.4928 30.16704l0 512q0 17.67424 12.4928
              30.16704t30.16704 12.4928 30.16704-12.4928
              12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928zM682.65984
              213.34016q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 512q0
              17.67424 12.4928 30.16704t30.16704 12.4928 30.16704-12.4928
              12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928z"
            />
          </svg>
        </template>
        <template v-else>
          <svg
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="16"
            height="16"
          >
            <path
              d="M170.65984 896l0-768 640 384zM644.66944
              512l-388.66944-233.32864 0 466.65728z"
            />
          </svg>
        </template>
      </button>
      <template v-for="(s, index) in speedOption">
        <button
          :key="index"
          :class="{ active: s === speed && speedState !== 'skipping' }"
          @click="setSpeed(s)"
          :disabled="speedState === 'skipping'"
        >
          {{ s }}x
        </button>
      </template>
      <PlayerSwitch
        id="skip"
        :checked="skipInactive"
        @input="toggleSkipInactive"
        :disabled="speedState === 'skipping'"
        label="skip inactive"
      />
      <button @click="$emit('fullscreen')">
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="16"
          height="16"
        >
          <path
            d="M916 380c-26.4 0-48-21.6-48-48L868 223.2 613.6 477.6c-18.4
            18.4-48.8 18.4-68 0-18.4-18.4-18.4-48.8 0-68L800 156 692 156c-26.4
            0-48-21.6-48-48 0-26.4 21.6-48 48-48l224 0c26.4 0 48 21.6 48 48l0
            224C964 358.4 942.4 380 916 380zM231.2 860l108.8 0c26.4 0 48 21.6 48
            48s-21.6 48-48 48l-224 0c-26.4 0-48-21.6-48-48l0-224c0-26.4 21.6-48
            48-48 26.4 0 48 21.6 48 48L164 792l253.6-253.6c18.4-18.4 48.8-18.4
            68 0 18.4 18.4 18.4 48.8 0 68L231.2 860z"
            p-id="1286"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { EventType } from 'rrweb';
import type { Replayer } from 'rrweb';
import type { playerMetaData } from 'rrweb/typings/types';
import type {
  PlayerMachineState,
  SpeedMachineState,
} from 'rrweb/typings/replay/machine';
import { formatTime } from '@/utils';
import PlayerSwitch from '@/components/PlayerSwitch.vue';
import Vue, { PropType } from 'vue';
type CustomEvent = {
  name: string;
  background: string;
  position: string;
};
export default /*#__PURE__*/Vue.extend({
  name: 'RRWebPlayerController',
  components: {
    PlayerSwitch
  },
  props: {
    replayer: {
      type: Object as PropType<Replayer>,
      required: true,
    },
    skipInactive: {
      type: Boolean,
      required: true,
    },
    autoPlay: {
      type: Boolean,
      required: true,
    },
    speedOption: {
      type: Array as PropType<number[]>,
      required: true
    },
    speed: {
      type: Number,
      required: true,
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
    currentTime: 0,
    timer: 0,
    playerState: 'playing' as 'playing' | 'paused' | 'live',
    speedState: 'normal' as 'normal' | 'skipping',
    finished: false,
    meta: {} as playerMetaData,
    percentage: '',
  }),
  computed: {
    progress() {
      return this.$refs.progress as Element;
    },
    step() {
      return this.$refs.step;
    },
    customEvents() {
      const { context } = this.replayer.service.state;
      const totalEvents = context.events.length;
      const start = context.events[0].timestamp;
      const end = context.events[totalEvents - 1].timestamp;
      const customEvents: CustomEvent[] = [];

      // calculate tag position.
      const position = (
        startTime: number,
        endTime: number,
        tagTime: number,
      ) => {
        const sessionDuration = endTime - startTime;
        const eventDuration = endTime - tagTime;
        const eventPosition = 100 - (eventDuration / sessionDuration) * 100;

        return eventPosition.toFixed(2);
      };

      // loop through all the events and find out custom event.
      context.events.forEach((event) => {
        /**
         * we are only interested in custom event and calculate it's position
         * to place it in player's timeline.
         */
        if (event.type === EventType.Custom) {
          const customEvent = {
            name: event.data.tag,
            background: this.tags[event.data.tag] || 'rgb(73, 80, 246)',
            position: `${position(start, end, event.timestamp)}%`,
          };
          customEvents.push(customEvent);
        }
      });
      return customEvents;
    },
  },
  methods: {
    formatTimeLocal(ms: number) {
      return formatTime(ms)
    },
    loopTimer() {
      this.stopTimer();

      const update = () => {
        this.currentTime = this.replayer.getCurrentTime();

        if (this.currentTime < this.meta.totalTime) {
          this.timer = requestAnimationFrame(update);
        }
      }

      this.timer = requestAnimationFrame(update);
    },
    stopTimer() {
      if (this.timer) {
        cancelAnimationFrame(this.timer);
        this.timer = 0;
      }
    },
    toggle() {
      switch (this.playerState) {
        case 'playing':
          this.pause();
          break;
        case 'paused':
          this.play();
          break;
        default:
          break;
      }
    },
    play() {
      if (this.playerState !== 'paused') {
        return;
      }
      if (this.finished) {
        this.replayer.play();
        this.finished = false;
      } else {
        this.replayer.play(this.currentTime);
      }
    },

    pause() {
      if (this.playerState !== 'playing') {
        return;
      }
      this.replayer.pause();
    },

    goto(timeOffset: number) {
      this.currentTime = timeOffset;
      const isPlaying = this.playerState === 'playing';
      this.replayer.pause();
      this.replayer.play(timeOffset);
      if (!isPlaying) {
        this.replayer.pause();
      }
    },

    handleProgressClick(event: MouseEvent) {
      if (!this.progress) return
      if (this.speedState === 'skipping') {
        return;
      }
      const progressRect = this.progress.getBoundingClientRect();
      const x = event.clientX - progressRect.left;
      let percent = x / progressRect.width;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }
      const timeOffset = this.meta.totalTime * percent;
      this.goto(timeOffset);
    },

    setSpeed(newSpeed: number) {
      let needFreeze = this.playerState === 'playing';
      this.$emit('update:speed', newSpeed);
      if (needFreeze) {
        this.replayer.pause();
      }
      this.replayer.setConfig({ speed: this.speed });
      if (needFreeze) {
        this.replayer.play(this.currentTime);
      }
    },

    toggleSkipInactive() {
      this.$emit('update:skip-inactive', !this.skipInactive);
    },
  },
  watch: {
    currentTime(value) {
      this.$emit('ui-update-current-time', { payload: value });
      //
      const percent = Math.min(1, this.currentTime / this.meta.totalTime);
      this.percentage = `${100 * percent}%`;
      this.$emit('ui-update-progress', { payload: percent });
      //
    },
    playerState(value) {
      this.$emit('ui-update-player-state', { payload: value });
    }
  },
  mounted() {
    this.meta = this.replayer.getMetaData();
    this.playerState = this.replayer.service.state.value;
    this.speedState = this.replayer.speedService.state.value;
    this.replayer.on(
      'state-change',
      // @ts-ignore
      (states: { player?: PlayerMachineState; speed?: SpeedMachineState }) => {
        const { player, speed } = states;
        if (player?.value && this.playerState !== player.value) {
          this.playerState = player.value;
          switch (this.playerState) {
            case 'playing':
              this.loopTimer();
              break;
            case 'paused':
              this.stopTimer();
              break;
            default:
              break;
          }
        }
        if (speed?.value && this.speedState !== speed.value) {
          this.speedState = speed.value;
        }
      },
    );
    this.replayer.on('finish', () => {
      this.finished = true;
    });

    if (this.autoPlay) {
      this.replayer.play();
    }
  },
  updated() {
    if (this.skipInactive !== this.replayer.config.skipInactive) {
      this.replayer.setConfig({ skipInactive: this.skipInactive });
    }
  },
  destroyed() {
    this.replayer.pause();
    this.stopTimer();
  }
});
</script>
<style>
  .rr-controller {
    width: 100%;
    height: 80px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 0 0 5px 5px;
  }

  .rr-timeline {
    width: 80%;
    display: flex;
    align-items: center;
  }

  .rr-timeline__time {
    display: inline-block;
    width: 100px;
    text-align: center;
    color: #11103e;
  }

  .rr-progress {
    flex: 1;
    height: 12px;
    background: #eee;
    position: relative;
    border-radius: 3px;
    cursor: pointer;
    box-sizing: border-box;
    border-top: solid 4px #fff;
    border-bottom: solid 4px #fff;
  }

  .rr-progress.disabled {
    cursor: not-allowed;
  }

  .rr-progress__step {
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: #e0e1fe;
  }

  .rr-progress__handler {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    position: absolute;
    top: 2px;
    transform: translate(-50%, -50%);
    background: rgb(73, 80, 246);
  }

  .rr-controller__btns {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
  }

  .rr-controller__btns button {
    width: 32px;
    height: 32px;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }

  .rr-controller__btns button:active {
    background: #e0e1fe;
  }

  .rr-controller__btns button.active {
    color: #fff;
    background: rgb(73, 80, 246);
  }

  .rr-controller__btns button:disabled {
    cursor: not-allowed;
  }
</style>
