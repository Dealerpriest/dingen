module.exports = {
  // We lower the memorylimit so it's possible to build on a tiny VM
  chainWebpack: config => {
    config.plugin('fork-ts-checker')
    .tap(args => {
      args[0].memoryLimit = 512;
      return args;
    })
  }
}