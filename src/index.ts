/**
 * This is an incomplete TypeScript translation of the forked module.
 * Instead of doing declarations, I chose to translate this to
 * better keep track of the peer dependencies and clearly indicate
 * what is needed.
 *
 * This isn't a well-written module, but in this state it is functional.
 */

/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
// eslint-disable-next-line import/no-extraneous-dependencies
import firebase from 'firebase/app';
import { Selection, Plugin, Transaction, EditorState } from 'prosemirror-state';
import { Node, Mark } from 'prosemirror-model';
import { Step } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { collab, sendableSteps, receiveTransaction } from 'prosemirror-collab';

const {
  compressStepsLossy,
  compressStateJSON,
  uncompressStateJSON,
  compressSelectionJSON,
  uncompressSelectionJSON,
  compressStepJSON,
  uncompressStepJSON,
} = require('prosemirror-compress');

const TIMESTAMP = { '.sv': 'timestamp' };

interface StateConfig {
  schema?: any | null | undefined;
  doc?: Node<any> | null | undefined;
  selection?: Selection<any> | null | undefined;
  storedMarks?: Mark[] | null | undefined;
  plugins?: Array<Plugin<any, any>> | null | undefined;
}

interface UpdateCollab {
  (transaction: Transaction, newState: EditorState): any;
}

type ViewConstructor = (arg0: {
  stateConfig: StateConfig,
  updateCollab: UpdateCollab,
  selections?: Record<string | number, Selection> }) => EditorView;

type ProgressFunction = (level: number) => any;

interface ConstructorParameters {
  firebaseRef: firebase.database.Reference;
  stateConfig: StateConfig;
  view: ViewConstructor;
  clientID?: string;
  progress?: ProgressFunction;
  stateLimit?: number;
}

export class FirebaseEditor {
  changesRef: any;

  checkpointRef: any;

  selectionsRef: any;

  selfSelectionRef: any;

  selections: {
    [K: string]: Selection;
  };

  view: any;

  stateLimit: number;

  constructor({
    firebaseRef,
    stateConfig,
    view: constructView,
    clientID: selfClientID = firebaseRef.push().key!,
    progress = (level: number) => {},
    stateLimit = -1,
  }: ConstructorParameters) {
    this.stateLimit = stateLimit >= 0 ? stateLimit : -1;
    this.selections = {}; // Property 'selections' has no initializer and is not definitely assigned in the constructor.ts(2564)
    this.construct(firebaseRef, stateConfig, constructView, selfClientID, progress);
  }

  construct(firebaseRef: firebase.database.Reference, stateConfig: StateConfig, constructView: ViewConstructor, selfClientID: string, progress: ProgressFunction = (level: number) => {}) {
    progress(0 / 2);
    // eslint-disable-next-line
    const this_ = this;
    const checkpointRef = this.checkpointRef = firebaseRef.child('checkpoint');
    const changesRef = this.changesRef = firebaseRef.child('changes');
    const selectionsRef = this.selectionsRef = firebaseRef.child('selections');
    const selfSelectionRef = this.selfSelectionRef = selectionsRef.child(selfClientID);
    selfSelectionRef.onDisconnect().remove();
    const selections: {
      [K: string]: Selection;
    } = this.selections = {};
    const selfChanges: {
      [K: number]: any;
    } = {};
    let selection: any;

    const constructEditor = checkpointRef.once('value').then(
      (snapshot) => {
        progress(1 / 2);
        // eslint-disable-next-line prefer-const
        let { d, k: latestKey = -1 } = snapshot.val() || {};
        latestKey = Number(latestKey);
        stateConfig.doc = d && Node.fromJSON(stateConfig.schema, uncompressStateJSON({ d }).doc);
        stateConfig.plugins = (stateConfig.plugins || [])
          .concat(collab({ clientID: selfClientID }));

        function compressedStepJSONToStep(compressedStepJSON: any) {
          return Step.fromJSON(stateConfig.schema, uncompressStepJSON(compressedStepJSON));
        }

        function updateCollab({ docChanged, mapping }: any, newState: EditorState) {
          if (docChanged) {
            for (const clientID in selections) {
              if ({}.hasOwnProperty.call(selections, clientID)) {
                selections[clientID] = selections[clientID].map(newState.doc, mapping);
              }
            }
          }

          const sendable = sendableSteps(newState);
          if (sendable) {
            const { steps, clientID } = sendable;
            changesRef.child(latestKey + 1).transaction(
              // eslint-disable-next-line consistent-return
              (existingBatchedSteps) => {
                if (!existingBatchedSteps) {
                  selfChanges[latestKey + 1] = steps;
                  return {
                    s: compressStepsLossy(steps).map(
                      (step: Step) => compressStepJSON(step.toJSON()),
                    ),
                    c: clientID,
                    t: TIMESTAMP,
                  };
                }
              },
              (error, committed, dataSnapshot) => {
                const { key } = dataSnapshot || {};
                if (error || !key) {
                  console.error('updateCollab', error, sendable, key);
                } else if (committed && Number(key) % 100 === 0 && Number(key) > 0) {
                  // eslint-disable-next-line @typescript-eslint/no-shadow
                  const { d } = compressStateJSON(newState.toJSON());
                  checkpointRef.set({ d, k: key, t: TIMESTAMP });
                }
              },
              false,
            );
          }

          const selectionChanged = !newState.selection.eq(selection);
          if (selectionChanged) {
            selection = newState.selection;
            selfSelectionRef.set(compressSelectionJSON(selection.toJSON()));
          }
        }

        return changesRef.startAt(null, String(latestKey + 1)).once('value').then(
          // eslint-disable-next-line @typescript-eslint/no-shadow
          (snapshot) => {
            progress(2 / 2);
            const view = this_.view = constructView({ stateConfig, updateCollab, selections });
            // This should not be here, it is probably a compatibility
            // assignment.
            const editor = (view as any).editor || view;

            const changes = snapshot.val();
            if (changes) {
              const steps = [];
              const stepClientIDs = [];
              const placeholderClientId = `_oldClient${Math.random()}`;
              const keys = Object.keys(changes).map(Number);
              latestKey = Math.max(...keys);
              for (const key of keys) {
                const compressedStepsJSON = changes[key].s;
                steps.push(...compressedStepsJSON.map(compressedStepJSONToStep));
                stepClientIDs.push(
                  ...new Array(compressedStepsJSON.length).fill(placeholderClientId),
                );
              }
              editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs));
            }

            // This is shadowed.
            // eslint-disable-next-line @typescript-eslint/no-shadow
            function updateClientSelection(snapshot: any) {
              const clientID = snapshot.key;
              if (clientID !== selfClientID) {
                const compressedSelection = snapshot.val();
                if (compressedSelection) {
                  try {
                    selections[clientID] = Selection.fromJSON(
                      editor.state.doc, uncompressSelectionJSON(compressedSelection),
                    );
                  } catch (error) {
                    console.warn('updateClientSelection', error);
                  }
                } else {
                  delete selections[clientID];
                }
                editor.dispatch(editor.state.tr);
              }
            }
            selectionsRef.on('child_added', updateClientSelection);
            selectionsRef.on('child_changed', updateClientSelection);
            selectionsRef.on('child_removed', updateClientSelection);

            changesRef.startAt(null, String(latestKey + 1)).on(
              'child_added',
              // eslint-disable-next-line @typescript-eslint/no-shadow
              (snapshot) => {
                latestKey = Number(snapshot.key);
                const { s: compressedStepsJSON, c: clientID } = snapshot.val();
                const steps = (
                  clientID === selfClientID
                    ? selfChanges[latestKey]
                    : compressedStepsJSON.map(compressedStepJSONToStep));
                const stepClientIDs = new Array(steps.length).fill(clientID);
                editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs));
                delete selfChanges[latestKey];
              },
            );
            // This could once again be a compatibility detail.
            // I will not proceed to fix this as it may break
            // some things.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return { destroy: this_.destroy.bind(this_), ...this_ };
          },
        );
      },
    );

    this.defineAsync(constructEditor);
  }

  defineAsync(constructEditor: any) {
    Object.defineProperties(this, {
      then: { value: constructEditor.then.bind(constructEditor) },
      catch: { value: constructEditor.catch.bind(constructEditor) },
    });
  }

  async destroy() {
    (this as unknown as Promise<any>).catch((_) => _).then(() => {
      this.changesRef.off();
      this.selectionsRef.off();
      this.selfSelectionRef.off();
      this.selfSelectionRef.remove();
      this.view.destroy();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  catch(): void {
    throw new Error('Method not implemented.');
  }
}

export class StatePreviewEditor extends FirebaseEditor {
  activeState: number;

  constructor(params: ConstructorParameters) {
    super(params);
    this.activeState = -1;
  }

  construct(firebaseRef: firebase.database.Reference, stateConfig: StateConfig, constructView: ViewConstructor, selfClientID: string, progress: ProgressFunction): void {
    progress(0 / 2);
    const currentState = this.stateLimit;
    const setActiveState = (state: number) => { this.activeState = state; };
    // eslint-disable-next-line
    const this_ = this;
    const checkpointRef = this.checkpointRef = firebaseRef.child('checkpoint');
    const changesRef = this.changesRef = firebaseRef.child('changes');
    const selectionsRef = this.selectionsRef = firebaseRef.child('selections');
    const selfSelectionRef = this.selfSelectionRef = selectionsRef.child(selfClientID);
    selfSelectionRef.onDisconnect().remove();
    const selections: {
      [K: string]: Selection;
    } = this.selections = {};
    const selfChanges: {
      [K: number]: any;
    } = {};
    let selection: any;

    let checkpointQuery = this.stateLimit >= 0 ? checkpointRef.orderByChild('k').endAt(currentState).limitToLast(1) : checkpointRef;
    const constructEditor = checkpointQuery.once('value').then(
      (snapshot) => {
        progress(1 / 2);
        // eslint-disable-next-line prefer-const
        let { d, k: latestKey = -1 } = snapshot.val() || {};
        latestKey = Number(latestKey);
        if (latestKey >= 0)
          setActiveState(latestKey);
        stateConfig.doc = d && Node.fromJSON(stateConfig.schema, uncompressStateJSON({ d }).doc);
        stateConfig.plugins = (stateConfig.plugins || [])
          .concat(collab({ clientID: selfClientID }));

        function compressedStepJSONToStep(compressedStepJSON: any) {
          return Step.fromJSON(stateConfig.schema, uncompressStepJSON(compressedStepJSON));
        }

        function updateCollab({ docChanged, mapping }: any, newState: EditorState) {
          if (docChanged) {
            for (const clientID in selections) {
              if ({}.hasOwnProperty.call(selections, clientID)) {
                selections[clientID] = selections[clientID].map(newState.doc, mapping);
              }
            }
          }
          // stripped update functionality, only local changes
          const selectionChanged = !newState.selection.eq(selection);
          if (selectionChanged) {
            selection = newState.selection;
            //! selfSelectionRef.set(compressSelectionJSON(selection.toJSON()));
          }
        }

        function queryBuilder(stateLimit: number) {
          if (stateLimit > 0)
            return changesRef.startAt(null, String(latestKey + 1)).endAt(null, String(stateLimit));
          return changesRef.startAt(null, String(latestKey + 1))
        }
        
        return queryBuilder(currentState).once('value').then(
          // eslint-disable-next-line @typescript-eslint/no-shadow
          (snapshot) => {
            progress(2 / 2);
            const view = this_.view = constructView({ stateConfig, updateCollab, selections });
            // This should not be here, it is probably a compatibility
            // assignment.
            const editor = (view as any).editor || view;

            const changes = snapshot.val();
            if (changes) {
              const steps = [];
              const stepClientIDs = [];
              const placeholderClientId = `_oldClient${Math.random()}`;
              const keys = Object.keys(changes).map(Number);
              latestKey = Math.max(...keys);
              if (latestKey >= 0)
                setActiveState(latestKey);
              for (const key of keys) {
                const compressedStepsJSON = changes[key].s;
                steps.push(...compressedStepsJSON.map(compressedStepJSONToStep));
                stepClientIDs.push(
                  ...new Array(compressedStepsJSON.length).fill(placeholderClientId),
                );
              }
              editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs));
            }

            // This could once again be a compatibility detail.
            // I will not proceed to fix this as it may break
            // some things.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return { destroy: this_.destroy.bind(this_), ...this_ };
          },
        );
      },
    );

    this.defineAsync(constructEditor);
  }

  defineAsync(constructEditor: any) {
    Object.defineProperties(this, {
      then: { value: constructEditor.then.bind(constructEditor) },
      catch: { value: constructEditor.catch.bind(constructEditor) },
    });
  }

  currentlyUsedState = (): number => {
    return this.activeState;
  }

  nextState = (): number => {
    return this.activeState + 1;
  }

  previousState = (): number => {
    const prev = this.activeState - 1;
    return prev <= 0 ? 1 : prev; // there is no such thing as state 0.
  }

  incrementState = (n: number | undefined): number => {
    if (n === undefined)
      return this.activeState;
    return this.activeState + n;
  }

  decrementState = (n: number | undefined): number => {
    if (n === undefined)
      return 1;
    const dec = this.activeState - n;
    return dec <= 0 ? 1 : dec; // there is no such thing as state 0.
  }
}