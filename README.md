# 소개

해당 이슈는 firefox long touch 시 pseudo active 가 사라지지 않는 현상를 대응하기 위한 라이브러리 이다.[firefox 에서는 해당 이슈가 123 버전에서 해소되었다.](https://bugzilla.mozilla.org/show_bug.cgi?id=1724759)하지만 이전 firefox 버전에서 해당 이슈가 있기 때문에 vue 에서는 해당 라이브러리를 통해서 해당 이슈를 해결 할수 있다.

## 사용방법
### 유형1) 다수 정적인 element dimming 처리

vue 의 여러 ref 의 element 를 얻어와 `onMounted`, `watch` 를 추가 하였다.

```vue
// 사용방법
<script setup lang="ts">
  import {ref} from "@vue/reactivity";
  import {useTouchDimming} from "./touchDimming";

  const openElement = ref();
  const closeElement = ref();

  useTouchDimming([openElement, closeElement], 'button-active');
</script>
<template>
  ...
  <div ref="openElement">
    ...
  </div>
  <div ref="closeElement">
    ...
  </div>
</template>
```

### 유형2) v-for 에 의해 생성된 element dimming 처리

상품 옵션 같은 경우 동적으로 N 개가 생길 수 있기 때문에 유형 1 처럼 미리 element ref 값을 줄수가 없다. 이에 v-for 를 통해 동적으로 생성될 수 있는 ref 값은 [v-for ref 사용 방법](https://ko.vuejs.org/guide/essentials/template-refs#refs-inside-v-for)을 이용한 별도 함수로 구현하였다.

v-for 에 ref 를 사용하는 방법에는 한가지 특징이 있는데 v-for 에 element 가 추가 되었을 경우 watch 에 모든 element 의 요소값이 호출된다. 반대로 삭제될 경우 목록에 나타나지 않는다. 그래서 dimming 해야할 element 는 3가지 유형이 생긴다.

- 새로 생긴 element
- 이전에 있던 element
- 삭제된 element

이 3개의 상태를 구분하기 위해 element 에 data-set 에 key 로 UUID 를 할당하고 해당 element 에 등록한 리스너의 cleanup 함수를 전체적으로 관리할 클로저를 두어 위 3가지 조건을 구분하였다.

```vue
// 사용방법
<script setup lang="ts">
  import {useDynamicTouchDimming} from "./touchDimming";
  import {ref} from "@vue/reactivity";

  const imagesElement = ref([]);
  useDynamicTouchDimming(imagesElement, 'button-active');
  
  const items = [...];
</script>
<template>
  ...
  <div
      v-for="(selectItem, itemIndex) in items"
  >
    ...
    <div ref="imagesElement">
      ...
    </div>
    ...
  </div>
</template>
```

### 유형3) 하나의 element diming 처리 방법

유형1에서 단축한형태로 element 에 ref 를 직접 적용하듯이 사용하나 주의해야할 부분은 element 의 [ref 는 함수](https://ko.vuejs.org/guide/essentials/template-refs#function-refs)로 참조해야한다.

```vue
// 사용 방법
<script setup lang="ts">
  import {dimmingRef} from "./touchDimming";

  const dimmingElement = dimmingRef('button-active');
</script>
<!-- ref 앞에 ':' 를 붙여 사용해야 함. -->
<div :ref="dimmingElement">
...
</div>
```
### 유형4) Element wrap

div 를 통해 wrap 을 하려고 했으나 div 영역이 잡혀 image 태그가 slot 에 할당 될 경우 기존 class 로 정의된 css 가 맞지 않는 현상 생김
```vue
<TouchDimming v-slot:="{element}" class-name="button-active">
  <img :ref="{element}">
</TouchDimming>
```
유의사항 slot 에 svg 는 사용할 경우 부모의 css scope 를 받지 못하는 현상이 있음(확인 버전 : vue 3.5.0)
