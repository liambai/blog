import { Adapter } from '../use-cases';
export declare const CLASS_CONTENT = "littlefoot__content";
export declare const CLASS_WRAPPER = "littlefoot__wrapper";
export type HTMLAdapterSettings = Readonly<{
    allowDuplicates: boolean;
    anchorParentSelector: string;
    anchorPattern: RegExp;
    buttonTemplate: string;
    contentTemplate: string;
    footnoteSelector: string;
    numberResetSelector: string;
    scope: string;
}>;
export declare function setup({ allowDuplicates, anchorParentSelector, anchorPattern, buttonTemplate, contentTemplate, footnoteSelector, numberResetSelector, scope, }: HTMLAdapterSettings): Adapter<HTMLElement>;
