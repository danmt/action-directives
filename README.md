# Heavy Duty Angular Applications Framework

## Action Directives

Angular Action Directives are a powerful tool to encapsulate business logic related to specific actions in your application. They are especially useful in large-scale applications where the same action might be triggered from different parts of the application. 

### Description

These directives are essentially classes that extend the `ComponentStore` class from `@ngrx/component-store`. They provide a way to manage a portion of the state that is scoped to a specific component and its children. This state is isolated from the global state, which can be beneficial for performance reasons and also for encapsulating and organizing your code.

### When to Use

Use Angular Action Directives when you want to encapsulate specific actions that interact with your application's state. These actions could be anything from creating a new entity, updating an entity, deleting an entity, or any other business logic that you want to encapsulate within a directive.

### Requirements

To create an Angular Action Directive, you need to have the following:

- Angular (obviously)
- `@ngrx/component-store` for state management
- An understanding of TypeScript and Angular Directives

### Characteristics

Angular Action Directives have the following characteristics:

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