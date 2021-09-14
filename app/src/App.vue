<template>
  <v-app id="app">
    <v-card>
      <v-tabs fixed-tabs class="raised" style="z-index: 2">
        <v-tab to="/search">Search</v-tab>
        <v-tab to="/browser">Browser</v-tab>
        <v-tab to="/tags">Tags</v-tab>
      </v-tabs>
    </v-card>
    <router-view />
  </v-app>
</template>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}

html {
  overflow-y: auto !important;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.d-headline {
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
  letter-spacing: normal;
  font-family: Roboto, sans-serif;
  white-space: nowrap;
  margin: 0;

  @media screen and (max-width: 700px) {
    font-size: 18px;
  }
}
</style>
