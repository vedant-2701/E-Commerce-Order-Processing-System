import "reflect-metadata";
import { injectable, container, singleton, inject, autoInjectable } from "tsyringe";

interface ITestLogger {
    log(message: string): void;
}

@injectable()
class TestLogger implements ITestLogger {
    log(message: string) {
        console.log(`[LOG] ${message}`);
    }
}

@autoInjectable()
class TestService {
    constructor(@inject('ITestLogger') private logger: ITestLogger) {}

    greet() {
        this.logger.log("Hello from TestService!");
    }
}

// No need to register TestLogger (auto-registered by @singleton)
container.register('ITestLogger', { useClass: TestLogger });
container.registerSingleton<TestService>(TestService);

// Resolve and test
const service = container.resolve(TestService);
service.greet();

console.log("✅ Dependency Injection is working!");


// import 'reflect-metadata';
// import { injectable, container, singleton, inject } from 'tsyringe';

// @singleton()    
// class TestLogger {
//   log(message: string) {
//     console.log(`[LOG] ${message}`);
//   }
// }

// @injectable()
// class TestService {
//   constructor(@inject(TestLogger) private logger: TestLogger) {}

//   greet() {
//     this.logger.log('Hello from TestService!');
//   }
// }

// // No need to register TestLogger (auto-registered by @singleton)
// // container.register(TestLogger, { useClass: TestLogger });
// // container.register(TestService, { useClass: TestService });

// // Resolve and test
// const service = container.resolve(TestService);
// service.greet();

// console.log('✅ Dependency Injection is working!');