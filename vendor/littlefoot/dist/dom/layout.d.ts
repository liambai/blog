export declare const CLASS_TOOLTIP = "littlefoot__tooltip";
export type Position = 'above' | 'below';
export declare function getLeftRelative(element: HTMLElement): number;
export declare function getLeftInPixels(content: HTMLElement, button: HTMLElement): number;
export declare function getAvailableHeight(footnote: HTMLElement, button: HTMLElement, maxHeight: number): number;
export declare function getMaxHeight(element: HTMLElement): number;
export declare function repositionPopover(popover: HTMLElement, button: HTMLElement, previous: Position): Position;
export declare function repositionTooltip(popover: HTMLElement, button: HTMLElement): void;
