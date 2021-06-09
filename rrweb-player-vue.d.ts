import Vue, { PluginFunction, VueConstructor } from 'vue';

declare const RrwebPlayerVue: VueConstructor<Vue> & { install: PluginFunction<any>; };
export default RrwebPlayerVue;
