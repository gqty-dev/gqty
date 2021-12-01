<script setup lang="ts">
import { useQuery } from '../graphql/gqty';
const { query } = useQuery();
</script>

<template>
  {{ query.__typename }}
  {{ query.thirdTry }}
</template>
