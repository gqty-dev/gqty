<script setup lang="ts">
import { useQuery } from '../graphql/gqty';
const { query, isLoading } = useQuery();
</script>

<template>
  <span v-if="isLoading">Loading....</span>
  <div v-else v-for="dog in query.dogs" :key="dog.id">
    {{ dog.id }}
    {{ dog.name }}
    {{ 'Owner: ' + (dog.owner?.name ?? 'No owner 😔') }}
  </div>
</template>
