if (process.platform === 'win32') {
  require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
  }).on('SIGINT', () => process.emit('SIGINT'));
}
process.on('SIGINT', process.exit);
