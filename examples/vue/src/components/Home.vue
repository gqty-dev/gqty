<script setup lang="ts">
import { useQuery } from '../graphql/gqty';
const { query } = useQuery();
</script>

<template>
  <div v-for="dog in query.dogs" :key="dog.id">
    {{ dog.id }}
    {{ dog.name }}
    {{ 'Owner: ' + (dog.owner?.name ?? 'No owner 😔') }}
  </div>
</template>
