<script setup lang="ts">
/**
 * ### 사용방법
 * ```html
 * <TouchDimming v-slot:="{element}"" class-name="button-active">
 *   <img :ref="{element}" ...>
 * </TouchDimming>
 *````
 *
 * ### 유의사항
 * - Vue 3.5.0 버전
 *
 * svg 를 slot 으로 사용할 경우 vue 의 css scope 를 상속하지 못하는 현상이 생긴다.
 * 예제)
 * ```html
 * <div ...>
 *   <span ...>
 *   <TouchDimming v-slot="{element}" class-name="button-active">
 *     <svg ...>
 *   </TouchDimming>
 * </div>
 * ```
 * 정상 적일 경우 svg 에서는 새로운 scope 가 생겨도 부모의 scope 를 그대로 사용하게 된다.
 * ```html
 * <div data-v-3f2155fe ...>
 *   <span data-v-3f2155fe ..>
 *   <svg data-v-3f2155fe data-v-8ae9c2f5 ...>
 * </div>
 * ```
 * 하지만 TouchDimming headless 를 사용 할경우 svg 에서는 부모의 scope 를 상속받지 않는 현상이 있다.
 * ```html
 * <div data-v-3f2155fe ...>
 *   <span data-v-3f2155fe ..>
 *   <svg data-v-8ae9c2f5 ...>  <!-- TouchDimming 의 slot 으로 들어간 component -->
 * </div>
 * ```
 */
import {dimmingRef} from "../lib/touchDimming.ts";

type Props = {
  /**
   * dimming 시 부여되는 class name
   */
  className: string;
};
const props = defineProps<Props>();
defineSlots<{
  default(props: { element: ReturnType<typeof dimmingRef> }): any
}>();
</script>

<template>
  <slot
      :element="dimmingRef(props.className)"
  ></slot>
</template>

<style scoped lang="scss"></style>
