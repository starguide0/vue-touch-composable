import { onUnmounted, Ref, watch } from 'vue';
import uuid from './uuid';

/**
 * gecko79 에서 long touch 시 pseudo active 가 없어지지 않는 현상으로 인해 수동으로 element 에 클래스를 부여하는 함수
 *
 * @param el className 를 부여할 element
 * @param className class 를 붙이 클래스 네이밍
 */
const setTouchDimming = (el: Element, className: string) => {
  if (!(el instanceof Element)) return () => {};
  if (!className) {
    console.error('className 값이 정의되지 않았습니다.');
    return () => {};
  }

  const touchStartHandler = (evt: Event) => {
    if (evt.currentTarget instanceof Element) {
      const el = evt.currentTarget;
      if (el) el.classList.add(className);
    }
  };

  const touchEndHandler = (evt: Event) => {
    if (evt.currentTarget instanceof Element) {
      const el = evt.currentTarget;
      if (el) el.classList.remove(className);
    }
  };

  el.addEventListener('touchstart', touchStartHandler);
  el.addEventListener('touchend', touchEndHandler);
  return () => {
    el.removeEventListener('touchstart', touchStartHandler);
    el.removeEventListener('touchend', touchEndHandler);
  };
};

/**
 * element 가 v-if 에 의해서 동적으로 생성되어 ref 에 할당됨을 watch 하여 dim 처리한다.
 * @param elements ref 된 elements
 * @param className dimming 처리할 class name
 * @using
 * ```js
 * <script setup>
 *   const dimmingElement1 = ref();
 *   const dimmingElement2 = ref();
 *   useTouchDimming([dimmingElement1, dimmingElement2], 'dimming');
 * </script>
 * <template>
 *     <div ref="dimmingElement1">
 *       ...
 *     </div>
 *     <div>
 *       ...
 *     </div ref="dimmingElement2">
 *   </div>
 * </template>
 * ```
 */
export const useTouchDimming = (
  elements: Ref<Element>[],
  className: string,
) =>
  elements.map((vueElement) => {
    let cleanup: (() => void) | undefined;

    onUnmounted(() => {
      cleanup?.();
      cleanup = undefined;
    });

    return watch(vueElement, (domElement) => {
      if (domElement) cleanup = setTouchDimming(domElement, className);
      else cleanup?.();
    });
  });

/**
 * v-for 안에 ref 를 사용할 경우 동적으로 추가, 삭제 되는 element 에 대한 dim 처리
 * v-for 에서 사용하는 ref 참조는 어떤 상품이 빠졌는지 알수 없기 때문에 생성된 element 에 dataset.dimmingKey 를 부여하여
 * element 변경시 해당 dimmingKey 값의 존재 여부에 따라 cleanup 시도한다.
 *
 * @param elements v-for 에 정의된 ref
 * @param className dimming 처리할 class name
 * @using
 * ```js
 * <script setup>
 *   const dimmingElements = ref();
 *   useDynamicButtonDimming(dimmingElements, 'dimming');
 * </script>
 * <template>
 *   <div v-for="item in list">
 *     <div ref="dimmingElements">
 *       ...
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export const useDynamicTouchDimming = (
  elements: Ref<HTMLElement[]>,
  className: string,
) => {
  const cleanupList: Record<string, () => void> = {};

  onUnmounted(() => {
    Object.values(cleanupList).forEach((item) => item?.());
  });

  return watch(elements, (htmlElements) => {
    const survive = htmlElements.map((e) => e.dataset.dimmingKey);

    // 살아남지 못한 element 를 cleanup 함
    Object.entries(cleanupList)
      .filter(([key]) => !survive.includes(key))
      .forEach(([key, cleanup]) => {
        cleanup();
        delete cleanupList[key];
      });

    // dataset.key 가 없는 element 에 key 추가 및 dimming 설정(== 신규 element 에 key 추가)
    htmlElements
      .filter((element) => !element.dataset.dimmingKey)
      .forEach((element) => {
        const key = uuid();
        element.dataset.dimmingKey = key;
        cleanupList[key] = setTouchDimming(element, className);
      });
  }, { deep: true }); // Ref 참조 객체 안에 v-for 를 통해 동적 생성된 component 가 추가/삭제 watch 되기 위해 deep:true 해야 함
};

/**
 * ref 참조 함수 값을 모니터링하여 dimming event listener 를 추가 삭제하는 한다.
 *
 * @param className element 에 부여할 class 이름
 * @return ({HTMLElement|null})=>void<br> ref 참조 함수 처리 함수 반환
 * @using
 * ```html
 * <script setup>
 * const dimmingElement = dimmingRef('dimming');
 * </script>
 *
 * <template>
 * <!-- 주의사항: ref 에 bind(':') 해야 한다. -->
 * <button :ref=dimmingElement>button</button>
 * </template>
 * ```
 */
export const dimmingRef = (className: string) => {
  let cleanup: (() => void) | null = null;

  return (element: any) => {
    if (element === null) {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    } else if (!cleanup) {
      cleanup = setTouchDimming(element, className);
    }
  };
};
