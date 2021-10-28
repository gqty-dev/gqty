import { computed, ref } from 'vue';

export default function (bool: boolean) {
  const bla = ref(bool);

  const myCrazyObjectRef = ref({
    test: 'test',
    testSub: {
      sub: 'sub',
    },
  });
  const testLoading = computed(() => bla.value);

  return {
    bla,
    myCrazyObjectRef,
    testLoading,
  };
}
