<script setup lang="ts">
import Dog from './Dog.vue';
import { useQuery } from '../graphql/gqty';
const { query } = useQuery();
</script>

<template>
  <Dog
    v-for="dog in query.dogs"
    :key="dog.id"
    v-model:name="dog.name"
    v-model:owner="dog.owner"
  />
</template>
