<script setup lang="ts">
import { useQuery, useMetaState } from '../graphql/gqty';
const { query } = useQuery();
const { errors, isLoading } = useMetaState();
</script>

<template>
  <h1 v-if="isLoading" style="background-color: red">Loading....</h1>
  {{ query.__typename }}
  {{ query.thirdTry }}
  {{ errors }}
</template>
