# Heavy Duty Angular Applications Framework

## Service

### Description

An Angular service file is a TypeScript file that encapsulates data and logic that isn't associated with a specific view and that you want to share across components. A service class definition is decorated with `@Injectable()`. This decorator tells Angular that the class participates in the dependency injection system.

### When to Use

Use Angular services when you need to share common functionality or data across multiple components, directives, or other services. 

### Requirements

- Angular project setup
- Knowledge of TypeScript
- Understanding of Angular's Dependency Injection system

### Characteristics

- Services are singleton objects. Angular creates a single, shared instance of service and injects into any class that asks for it.
- Services can be used for cross-component communication.
- Services can be used to organize and share code across your app.

### Common Things

- Services often wrap the logic to interact with databases, handle HTTP requests, or provide some sort of shared business logic.
- Services use the `@Injectable` decorator from Angular core.
- Services can be injected into components, directives, or other services using Angular's dependency injection system.

### Basic Template

Here's a basic template for creating an Angular service file:

```typescript
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class YourService {
  private readonly _firestore = inject(Firestore);

  constructor() {}

  // Define your methods here
}
```

### Example: Car Service

Let's create a service for managing cars:

```typescript
import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

export interface CreateCarPayload {
  id: string;
  make: string;
  model: string;
  year: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private readonly _firestore = inject(Firestore);

  constructor() {}

  async createCar(payload: CreateCarPayload) {
    const carsRef = collection(this._firestore, `cars`);

    await addDoc(carsRef, {
      make: payload.make,
      model: payload.model,
      year: payload.year,
    });
  }

  // Define other methods for updating, deleting, and retrieving cars
}
```

In this example, we've created a `CarService` that has a method `createCar` for adding new cars to our Firestore database. The `CreateCarPayload` interface defines the shape of the data we expect when creating a new car.

## Action Directives

Action Directives are a powerful tool to encapsulate business logic related to specific actions in your application. They are especially useful in large-scale applications where the same action might be triggered from different parts of the application. 

### Description

These directives are essentially classes that extend the `ComponentStore` class from `@ngrx/component-store`. They provide a way to manage a portion of the state that is scoped to a specific component and its children. This state is isolated from the global state, which can be beneficial for performance reasons and also for encapsulating and organizing your code.

### When to Use

Use Action Directives when you want to encapsulate specific actions that interact with your application's state. These actions could be anything from creating a new entity, updating an entity, deleting an entity, or any other business logic that you want to encapsulate within a directive.

### Requirements

To create an Angular Action Directive, you need to have the following:

- Angular (obviously)
- `@ngrx/component-store` for state management
- An understanding of TypeScript and Angular Directives

### Characteristics

Action Directives have the following characteristics:

- They are decorated with the `@Directive` decorator.
- They extend the `ComponentStore` class.
- They have a ViewModel interface that defines the shape of the state.
- They have an `initialState` that defines the initial state.
- They have an `isRunning$` observable that tracks if the action is currently running.
- They have an `error$` observable that tracks any error that occurred while running the action.
- They have a `run` method that performs the action.
- They have several `@Output` properties that emit events when the action starts, ends, succeeds, or fails.

### Common Things

In all the provided examples, the directives have a similar structure. They all have a `ViewModel` interface and an `initialState`. They all have `isRunning$` and `error$` observables. They all have a `run` method that performs the action and updates the state. They all emit events when the action starts, ends, succeeds, or fails.

### Basic Template

Here is a basic template for an Angular Action Directive:

```typescript
import { Directive, EventEmitter, Output } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  isRunning: boolean;
  error: string | null;
}

const initialState: ViewModel = {
  isRunning: false,
  error: null,
};

@Directive({
  selector: '[appAction]',
  exportAs: 'appAction',
})
export class ActionDirective extends ComponentStore<ViewModel> {
  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() actionStarts = new EventEmitter();
  @Output() actionSuccess = new EventEmitter();
  @Output() actionError = new EventEmitter<string>();
  @Output() actionEnds = new EventEmitter();

  constructor() {
    super(initialState);
  }

  async run() {
    this.patchState({ isRunning: true });
    this.actionStarts.emit();

    try {
      // Perform the action here
      this.actionSuccess.emit();
    } catch (err) {
      this.patchState({ error: err });
      this.actionError.emit(err);
    } finally {
      this.patchState({ isRunning: false });
      this.actionEnds.emit();
    }
  }
}
```

You can replace `appAction` with the name of your action, and replace the `run` method with the logic for your action.

### Example

Here is a basic example of an Action Directive for creating a car:

```typescript
import { Directive, EventEmitter, Output } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { CarService } from './car.service'; // Assuming you have a CarService that handles API calls

interface ViewModel {
  isRunning: boolean;
  error: string | null;
}

const initialState: ViewModel = {
  isRunning: false,
  error: null,
};

@Directive({
  selector: '[appCreateCarAction]',
  exportAs: 'createCarAction',
})
export class CreateCarActionDirective extends ComponentStore<ViewModel> {
  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() createCarStarts = new EventEmitter();
  @Output() createCarSuccess = new EventEmitter();
  @Output() createCarError = new EventEmitter<string>();
  @Output() createCarEnds = new EventEmitter();

  constructor(private carService: CarService) {
    super(initialState);
  }

  async run(carData: any) { // Replace 'any' with the type of your car data
    this.patchState({ isRunning: true });
    this.createCarStarts.emit();

    try {
      await this.carService.createCar(carData); // Assuming your CarService has a createCar method
      this.createCarSuccess.emit();
    } catch (err) {
      this.patchState({ error: err });
      this.createCarError.emit(err);
    } finally {
      this.patchState({ isRunning: false });
      this.createCarEnds.emit();
    }
  }
}
```

This directive can be used in a component to create a car. When the `run` method is called with the car data, it will call the `createCar` method of the `CarService` to create the car. It will emit events when the action starts, ends, succeeds, or fails, and it will update the `isRunning` and `error` properties of the state.

## Stores

### Description

An Angular store file is a TypeScript file that encapsulates state management logic for a specific feature in your application. It uses the `ComponentStore` class from the `@ngrx/component-store` package to manage state in a reactive, efficient, and scalable way. The state can represent a single document (like a user profile or a specific post) or multiple documents (like a list of users or posts).

### When to Use

Use Angular stores when you need to manage complex state in your application that goes beyond what can be easily managed with component state alone. This can include state for a single document, multiple documents, or even derived state that depends on multiple other states.

### Requirements

- Angular project setup
- Knowledge of TypeScript
- Understanding of RxJS and reactive programming
- Familiarity with the `@ngrx/component-store` package

### Characteristics

- Stores are classes that extend `ComponentStore`.
- Stores define a state interface and an initial state.
- Stores define selectors to select slices of state.
- Stores define updaters to synchronously update state.
- Stores define effects to handle asynchronous operations and side effects.

### Common Things

- Stores often manage state related to API calls, including loading states, error states, and the data itself.
- Stores use the `@Injectable` decorator from Angular core.
- Stores can be provided in the root injector or in a specific component's injector.

I apologize for the confusion earlier. Here are the corrected templates and examples for both single and multiple document stores:

### Single Document Store

#### Basic Template

```typescript
import { inject, Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { DocumentApiService } from '../services';

interface ViewModel {
  document: Document | null;
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  document: null,
  error: null,
  isLoading: false,
};

@Injectable()
export class DocumentStore extends ComponentStore<ViewModel> {
  private readonly _apiService = inject(DocumentApiService);

  readonly document$ = this.select(({ document }) => document);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  private readonly _loadDocument = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: true });

      return this._apiService.getDocument().pipe(
        tapResponse(
          (document) => this.patchState({ document, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadDocument();
  }
}
```

#### Example: Car Store (Single Document)

```typescript
import { inject, Injectable } from '@angular/core';
import { Car } from '../models';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CarService } from '../services';

interface ViewModel {
  car: Car | null;
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  car: null,
  error: null,
  isLoading: false,
};

@Injectable()
export class CarStore extends ComponentStore<ViewModel> {
  private readonly _carService = inject(CarService);

  readonly car$ = this.select(({ car }) => car);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  private readonly _loadCar = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: true });

      return this._carService.getCar().pipe(
        tapResponse(
          (car) => this.patchState({ car, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadCar();
  }
}
```

### Multiple Document Store

#### Basic Template

```typescript
import { inject, Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { DocumentApiService } from '../services';

interface ViewModel {
  documents: Document[];
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  documents: [],
  error: null,
  isLoading: false,
};

@Injectable()
export class DocumentsStore extends ComponentStore<ViewModel> {
  private readonly _apiService = inject(DocumentApiService);

  readonly documents$ = this.select(({ documents }) => documents);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  private readonly _loadDocuments = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: true });

      return this._apiService.getDocuments().pipe(
        tapResponse(
          (documents) => this.patchState({ documents, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadDocuments();
  }
}
```

#### Example: Cars Store (Multiple Documents)

```typescript
import { inject, Injectable } from '@angular/core';
import { Car } from '../models';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CarService } from '../services';

interface ViewModel {
  cars: Car[];
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  cars: [],
  error: null,
  isLoading: false,
};

@Injectable()
export class CarsStore extends ComponentStore<ViewModel> {
  private readonly _carService = inject(CarService);

  readonly cars$ = this.select(({ cars }) => cars);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  private readonly _loadCars = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: true });

      return this._carService.getCars().pipe(
        tapResponse(
          (cars) => this.patchState({ cars, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadCars();
  }
}
```

In these examples, the single document store (`CarStore`) manages state for a single car, while the multiple document store (`CarsStore`) manages state for a list of cars. Both stores use the `CarService` to fetch data from the server.