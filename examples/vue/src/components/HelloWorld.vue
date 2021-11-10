<script setup lang="ts">
import { useQuery, useMetaState } from '../graphql/gqty';
const { query, isLoading } = useQuery();
</script>

<template>
  <h1 v-if="isLoading" style="background-color: red">Loading....</h1>
  <div v-for="dog in query.dogs" :key="dog.id">
    {{ dog.id }}
    {{ dog.name }}
    {{ 'Owner: ' + (dog.owner?.name ?? 'No owner 😔') }}
  </div>
</template>
