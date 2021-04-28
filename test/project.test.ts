// tslint:disable-next-line no-implicit-dependencies
import { assert } from 'chai';
import path from 'path';


import { useEnvironment } from './helpers';

describe('Integration tests examples', function () {    
  describe('HardhatConfig extension', function () {
    useEnvironment('hardhat-project');

    it('Should add the newPath to the config', async function () {
      await this.hre.run('compile');
      console.log(this.hre.config.paths);
    });
  });
});


// describe('Unit tests examples', function () {
//   describe('ExampleHardhatRuntimeEnvironmentField', function () {
//     describe('sayHello', function () {
//       it('Should say hello', function () {
//         const field = new ExampleHardhatRuntimeEnvironmentField();
//         assert.equal(field.sayHello(), 'hello');
//       });
//     });
//   });
// });
