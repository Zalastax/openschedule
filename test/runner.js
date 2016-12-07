require('ts-node/register')


var Mocha = require('mocha')

console.log(2)

var mocha = new Mocha()


console.log(3)
mocha.addFile(process.argv[2])

mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);  // exit with non-zero status if there were failures
  })
})
