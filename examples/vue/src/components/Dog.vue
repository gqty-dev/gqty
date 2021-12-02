<script setup lang="ts">
import { Maybe, Human } from '../graphql/gqty';
import { useVModels } from '@vueuse/core';

interface DogProps {
  name: string;
  owner?: Maybe<Human>;
}

const props = withDefaults(defineProps<DogProps>(), {
  name: '',
  owner: null,
});

const emit = defineEmits<{
  (e: 'update', name: string): void;
  (e: 'update', owner: Maybe<Human>): void;
}>();

const { name, owner } = useVModels(props, emit);
</script>

<template>
  <div>
    <label for="dog">Dog:</label>
    <input v-model="name" id="dog" />

    <template v-if="owner">
      <label for="owner">Owner:</label>
      <input v-model="owner.name" id="owner" />
    </template>
    <span v-else>no owner 😢</span>
  </div>
</template>

<style scoped></style>
