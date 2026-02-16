// // src/test-di.ts
// import "reflect-metadata";
// import { injectable, container, singleton, inject } from "tsyringe";

// interface ITestLogger {
//     log(message: string): void;
// }

// @singleton()
// class TestLogger implements ITestLogger {
//     log(message: string) {
//         console.log(`[LOG] ${message}`);
//     }
// }

// @singleton()
// class TestService {
//     constructor(@inject('ITestLogger') private logger: TestLogger) {}

//     greet() {
//         this.logger.log("Hello from TestService!");
//     }
// }

// // No need to register TestLogger (auto-registered by @singleton)
// container.register('ITestLogger', { useClass: TestLogger });
// container.registerSingleton(TestService);

// // Resolve and test
// const service = container.resolve(TestService);
// service.greet();

// console.log("✅ Dependency Injection is working!");


// src/test-di.ts
import 'reflect-metadata';
import { injectable, container, singleton, inject } from 'tsyringe';

@singleton()    
class TestLogger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

@injectable()
class TestService {
  constructor(@inject(TestLogger) private logger: TestLogger) {}

  greet() {
    this.logger.log('Hello from TestService!');
  }
}

// No need to register TestLogger (auto-registered by @singleton)
// container.register(TestLogger, { useClass: TestLogger });
// container.register(TestService, { useClass: TestService });

// Resolve and test
const service = container.resolve(TestService);
service.greet();

console.log('✅ Dependency Injection is working!');