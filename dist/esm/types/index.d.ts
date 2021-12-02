/**
 * This is an incomplete TypeScript translation of the forked module.
 * Instead of doing declarations, I chose to translate this to
 * better keep track of the peer dependencies and clearly indicate
 * what is needed.
 *
 * This isn't a well-written module, but in this state it is functional.
 */
import firebase from 'firebase/app';
import { Selection, Plugin, Transaction, EditorState } from 'prosemirror-state';
import { Node, Mark } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
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
declare type ViewConstructor = (arg0: {
    stateConfig: StateConfig;
    updateCollab: UpdateCollab;
    selections?: Record<string | number, Selection>;
}) => EditorView;
declare type ProgressFunction = (level: number) => any;
interface ConstructorParameters {
    firebaseRef: firebase.database.Reference;
    stateConfig: StateConfig;
    view: ViewConstructor;
    clientID?: string;
    progress?: ProgressFunction;
    stateLimit?: number;
}
export declare class FirebaseEditor {
    changesRef: any;
    checkpointRef: any;
    selectionsRef: any;
    selfSelectionRef: any;
    selections: {
        [K: string]: Selection;
    };
    view: any;
    stateLimit: number;
    constructor({ firebaseRef, stateConfig, view: constructView, clientID: selfClientID, progress, stateLimit, }: ConstructorParameters);
    construct(firebaseRef: firebase.database.Reference, stateConfig: StateConfig, constructView: ViewConstructor, selfClientID: string, progress?: ProgressFunction): void;
    destroy(): Promise<void>;
    catch(): void;
}
export declare class StatePreviewEditor extends FirebaseEditor {
    activeState: number;
    constructor(params: ConstructorParameters);
    construct(firebaseRef: firebase.database.Reference, stateConfig: StateConfig, constructView: ViewConstructor, selfClientID: string, progress: ProgressFunction): void;
    currentlyUsedState(): number;
    nextState(): number;
    previousState(): number;
    incrementState(n: number | undefined): number;
    decrementState(n: number | undefined): number;
}
export {};
