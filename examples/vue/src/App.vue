<template>
  <p>
    <router-link to="/">Home</router-link>
    <router-link to="/error">Error</router-link>
  </p>
  <Suspense>
    <template #default>
      <router-view />
    </template>
    <template #fallback>
      <h1 style="background-color: red">Loading....</h1>
    </template>
  </Suspense>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
